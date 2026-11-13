import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { ConversationDocument, MessageDocument, UserRole } from '../models/types.ts';
import { chatRealtimeService } from './chatRealtimeService.ts';
import { createNotification, notifyAdmins, resolveSellerUserId } from './notificationService.ts';
import { Logger } from '../utils/logger.ts';

export class ChatService {
  private static async resolveSellerProfile(sellerIdentifier: string): Promise<{
    sellerId: string;
    sellerUserId: string;
    sellerName: string;
    sellerAvatar: string;
  } | null> {
    if (!sellerIdentifier || sellerIdentifier === 'admin') return null;
    const { db, isMongo } = await getDatabase();

    let sellerDoc: any = null;
    if (isMongo && db) {
      sellerDoc = await db.collection('sellers').findOne({
        $or: [{ id: sellerIdentifier }, { userId: sellerIdentifier }]
      });
    }
    if (!sellerDoc) {
      sellerDoc = memoryDb.sellers.find(
        (s) => s.id === sellerIdentifier || (s as any).userId === sellerIdentifier
      );
    }

    if (sellerDoc) {
      let avatar = sellerDoc.avatar || '';
      let resolvedUserId = sellerDoc.userId || '';
      if ((!avatar || !resolvedUserId) && isMongo && db) {
        const ownerUser = await db.collection('users').findOne({
          $or: [
            ...(resolvedUserId ? [{ id: resolvedUserId }] : []),
            { sellerId: sellerDoc.id }
          ]
        });
        if (ownerUser) {
          resolvedUserId = resolvedUserId || ownerUser.id;
          avatar = avatar || ownerUser.avatar || ownerUser.profileImage?.secureUrl || '';
        }
      }
      return {
        sellerId: sellerDoc.id,
        sellerUserId: resolvedUserId || sellerDoc.id,
        sellerName: sellerDoc.brandName || sellerDoc.name || 'ورشة حرفية',
        sellerAvatar: avatar
      };
    }

    // Fallback to users collection if seller document isn't created yet
    let userDoc: any = null;
    if (isMongo && db) {
      userDoc = await db.collection('users').findOne({
        $or: [{ id: sellerIdentifier }, { sellerId: sellerIdentifier }]
      });
    }
    if (!userDoc) {
      userDoc = memoryDb.users.find(
        (u) => u.id === sellerIdentifier || u.sellerId === sellerIdentifier
      );
    }
    if (userDoc) {
      return {
        sellerId: userDoc.sellerId || userDoc.id,
        sellerUserId: userDoc.id,
        sellerName: userDoc.name || userDoc.username || 'ورشة حرفية',
        sellerAvatar: userDoc.avatar || userDoc.profileImage?.secureUrl || ''
      };
    }

    return null;
  }

  private static async resolveBuyerProfile(
    buyerId: string,
    orderDoc?: any
  ): Promise<{ buyerId: string; buyerName: string; buyerAvatar: string }> {
    const { db, isMongo } = await getDatabase();
    let userDoc: any = null;

    if (isMongo && db) {
      userDoc = await db.collection('users').findOne({ id: buyerId });
    }
    if (!userDoc) {
      userDoc = memoryDb.users.find((u) => u.id === buyerId);
    }

    const fallbackName =
      orderDoc?.shippingAddress?.fullName || orderDoc?.buyerName || 'مشتري سوق وه';

    return {
      buyerId,
      buyerName: userDoc?.name || userDoc?.username || fallbackName,
      buyerAvatar: userDoc?.avatar || userDoc?.profileImage?.secureUrl || ''
    };
  }

  /**
   * Get or create a conversation:
   * - Buyer <-> Seller ('direct') for shipping & order coordination or product inquiries
   * - Buyer <-> Admin ('buyer_support') or Seller <-> Admin ('seller_support')
   */
  public static async getOrCreateConversation(params: {
    buyerId?: string;
    buyerName?: string;
    buyerAvatar?: string;
    sellerId?: string;
    productId?: string;
    orderId?: string;
    initialMessage?: string;
    currentUser: { id: string; role: UserRole; name?: string; username?: string; avatar?: string; sellerId?: string };
  }): Promise<ConversationDocument> {
    const { productId, orderId, initialMessage, currentUser } = params;
    const { db, isMongo } = await getDatabase();

    // 1. Fetch product details if productId is supplied
    let productDoc: any = null;
    let productTitle: string | undefined;
    let productImage: string | undefined;
    let productPrice: number | undefined;
    if (productId) {
      if (isMongo && db) {
        productDoc = await db.collection('products').findOne({ id: productId });
      } else {
        productDoc = memoryDb.products.find((p) => p.id === productId);
      }
      if (productDoc) {
        productTitle = productDoc.title;
        productImage = productDoc.images?.[0];
        productPrice = productDoc.price;
      }
    }

    // 2. Fetch order details if orderId is supplied
    let orderDoc: any = null;
    let orderNumber: string | undefined;
    let orderStatus: any | undefined;
    if (orderId) {
      if (isMongo && db) {
        orderDoc = await db.collection('orders').findOne({ id: orderId });
      } else {
        orderDoc = memoryDb.orders.find((o) => o.id === orderId);
      }
      if (orderDoc) {
        orderNumber = orderDoc.orderNumber || orderDoc.id;
        orderStatus = orderDoc.status;
      }
    }

    let finalBuyerId = '';
    let finalBuyerName = '';
    let finalBuyerAvatar = '';
    let finalSellerId = '';
    let finalSellerUserId = '';
    let finalSellerName = '';
    let finalSellerAvatar = '';
    let convType: 'buyer_support' | 'seller_support' | 'direct' = 'buyer_support';
    let partRole: 'buyer' | 'seller' = 'buyer';
    let partId = '';
    let partName = '';

    // ==========================================
    // ROUTE CONVERSATION ACCORDING TO USER ROLE
    // ==========================================
    if (currentUser.role === 'buyer') {
      finalBuyerId = currentUser.id;
      finalBuyerName = currentUser.name || currentUser.username || 'مشتري سوق وه';
      finalBuyerAvatar = currentUser.avatar || '';

      if (isMongo && db) {
        const u = await db.collection('users').findOne({ id: currentUser.id });
        if (u) {
          finalBuyerName = u.name || u.username || finalBuyerName;
          finalBuyerAvatar = u.avatar || u.profileImage?.secureUrl || finalBuyerAvatar;
        }
      }

      const requestedSeller =
        params.sellerId && params.sellerId !== 'admin'
          ? params.sellerId
          : (productDoc?.sellerId && params.sellerId !== 'admin' ? productDoc.sellerId : undefined);

      if (requestedSeller && requestedSeller !== 'admin') {
        const sellerProfile = await this.resolveSellerProfile(requestedSeller);
        if (!sellerProfile) {
          throw new Error('TARGET_NOT_FOUND');
        }
        if (sellerProfile.sellerUserId === currentUser.id) {
          throw new Error('SELF_CHAT_NOT_ALLOWED');
        }
        finalSellerId = sellerProfile.sellerId;
        finalSellerUserId = sellerProfile.sellerUserId;
        finalSellerName = sellerProfile.sellerName;
        finalSellerAvatar = sellerProfile.sellerAvatar;
        convType = 'direct';
        partRole = 'seller';
        partId = finalSellerId;
        partName = finalSellerName;
      } else {
        finalSellerId = 'admin';
        finalSellerUserId = 'admin';
        finalSellerName = 'إدارة منصة وه (الدعم الفني)';
        finalSellerAvatar = '';
        convType = 'buyer_support';
        partRole = 'buyer';
        partId = currentUser.id;
        partName = finalBuyerName;
      }
    } else if (currentUser.role === 'seller') {
      const mySellerProfile = await this.resolveSellerProfile(currentUser.sellerId || currentUser.id);
      finalSellerId = mySellerProfile?.sellerId || currentUser.sellerId || currentUser.id;
      finalSellerUserId = mySellerProfile?.sellerUserId || currentUser.id;
      finalSellerName = mySellerProfile?.sellerName || currentUser.name || currentUser.username || 'ورشة الحرفي';
      finalSellerAvatar = mySellerProfile?.sellerAvatar || currentUser.avatar || '';

      const requestedBuyerId =
        params.buyerId && params.buyerId !== 'admin'
          ? params.buyerId
          : (orderDoc?.buyerId && params.buyerId !== 'admin' ? orderDoc.buyerId : undefined);

      if (requestedBuyerId && requestedBuyerId !== 'admin') {
        if (requestedBuyerId === currentUser.id) {
          throw new Error('SELF_CHAT_NOT_ALLOWED');
        }
        if (orderDoc) {
          const sellerIds = Array.from(new Set([currentUser.id, finalSellerId, currentUser.sellerId].filter(Boolean)));
          const ownsOrder =
            orderDoc.sellerIds?.some((sid: string) => sellerIds.includes(sid)) ||
            orderDoc.items?.some((it: any) => sellerIds.includes(it.sellerId));
          if (!ownsOrder || (orderDoc.buyerId && orderDoc.buyerId !== requestedBuyerId)) {
            throw new Error('FORBIDDEN_DIRECT_CHAT');
          }
        }
        const buyerProfile = await this.resolveBuyerProfile(requestedBuyerId, orderDoc);
        finalBuyerId = buyerProfile.buyerId;
        finalBuyerName = buyerProfile.buyerName;
        finalBuyerAvatar = buyerProfile.buyerAvatar;
        convType = 'direct';
        partRole = 'buyer';
        partId = finalBuyerId;
        partName = finalBuyerName;
      } else {
        finalBuyerId = 'admin';
        finalBuyerName = 'إدارة منصة وه (الدعم الفني)';
        finalBuyerAvatar = '';
        convType = 'seller_support';
        partRole = 'seller';
        partId = finalSellerId;
        partName = finalSellerName;
      }
    } else if (currentUser.role === 'admin') {
      const targetSellerId = params.sellerId && params.sellerId !== 'admin' ? params.sellerId : undefined;
      const targetBuyerId = params.buyerId && params.buyerId !== 'admin' ? params.buyerId : undefined;

      if (targetSellerId) {
        const sellerProfile = await this.resolveSellerProfile(targetSellerId);
        finalBuyerId = 'admin';
        finalBuyerName = 'إدارة منصة وه (الدعم الفني)';
        finalSellerId = sellerProfile?.sellerId || targetSellerId;
        finalSellerUserId = sellerProfile?.sellerUserId || targetSellerId;
        finalSellerName = sellerProfile?.sellerName || 'ورشة الحرفي';
        finalSellerAvatar = sellerProfile?.sellerAvatar || '';
        convType = 'seller_support';
        partRole = 'seller';
        partId = finalSellerId;
        partName = finalSellerName;
      } else if (targetBuyerId) {
        const buyerProfile = await this.resolveBuyerProfile(targetBuyerId, orderDoc);
        finalSellerId = 'admin';
        finalSellerUserId = 'admin';
        finalSellerName = 'إدارة منصة وه (الدعم الفني)';
        finalBuyerId = buyerProfile.buyerId;
        finalBuyerName = buyerProfile.buyerName;
        finalBuyerAvatar = buyerProfile.buyerAvatar;
        convType = 'buyer_support';
        partRole = 'buyer';
        partId = targetBuyerId;
        partName = finalBuyerName;
      } else {
        finalBuyerId = currentUser.id;
        finalBuyerName = currentUser.name || 'إدارة المنصة';
        finalSellerId = 'admin';
        finalSellerUserId = 'admin';
        finalSellerName = 'إدارة منصة وه (الدعم الفني)';
        convType = 'buyer_support';
        partRole = 'buyer';
        partId = currentUser.id;
        partName = finalBuyerName;
      }
    } else {
      throw new Error('FORBIDDEN_ROLE');
    }

    // 3. Reuse existing active conversation between these two exact participants
    const candidateSellerIds =
      finalSellerId === 'admin'
        ? ['admin']
        : Array.from(new Set([finalSellerId, finalSellerUserId].filter(Boolean)));

    let existingConv: ConversationDocument | null = null;
    let duplicateIds: string[] = [];

    if (isMongo && db) {
      const allMatching = (await db.collection('conversations')
        .find({
          buyerId: finalBuyerId,
          sellerId: { $in: candidateSellerIds },
          status: { $ne: 'blocked' }
        })
        .sort({ updatedAt: -1, createdAt: -1 })
        .toArray()) as unknown as ConversationDocument[];

      if (allMatching.length > 0) {
        existingConv = allMatching[0];
        if (allMatching.length > 1) {
          duplicateIds = allMatching.slice(1).map((c) => c.id);
        }
      }
    } else {
      const allMatching = memoryDb.conversations
        .filter(
          (c) =>
            c.buyerId === finalBuyerId &&
            candidateSellerIds.includes(c.sellerId) &&
            c.status !== 'blocked'
        )
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      if (allMatching.length > 0) {
        existingConv = allMatching[0];
        if (allMatching.length > 1) {
          duplicateIds = allMatching.slice(1).map((c) => c.id);
        }
      }
    }

    if (existingConv) {
      if (duplicateIds.length > 0) {
        if (isMongo && db) {
          await db.collection('messages').updateMany(
            { conversationId: { $in: duplicateIds } },
            { $set: { conversationId: existingConv.id } }
          );
          await db.collection('conversations').deleteMany({ id: { $in: duplicateIds } });
        } else {
          for (const msg of memoryDb.messages) {
            if (duplicateIds.includes(msg.conversationId)) {
              msg.conversationId = existingConv.id;
            }
          }
          memoryDb.conversations = memoryDb.conversations.filter((c) => !duplicateIds.includes(c.id));
        }
      }

      const updateFields: any = {
        sellerId: finalSellerId,
        sellerUserId: finalSellerUserId || undefined,
        conversationType: convType,
        updatedAt: new Date().toISOString()
      };
      if (productId) {
        updateFields.productId = productId;
        updateFields.productTitle = productTitle;
        updateFields.productImage = productImage;
        updateFields.productPrice = productPrice;
      }
      if (orderId) {
        updateFields.orderId = orderId;
        updateFields.orderNumber = orderNumber;
        updateFields.orderStatus = orderStatus;
      }
      if (partName) {
        updateFields.participantName = partName;
      }
      if (finalBuyerName && existingConv.buyerId !== 'admin') {
        updateFields.buyerName = finalBuyerName;
        if (finalBuyerAvatar) updateFields.buyerAvatar = finalBuyerAvatar;
      }
      if (finalSellerName && existingConv.sellerId !== 'admin') {
        updateFields.sellerName = finalSellerName;
        if (finalSellerAvatar) updateFields.sellerAvatar = finalSellerAvatar;
      }

      if (isMongo && db) {
        await db.collection('conversations').updateOne({ id: existingConv.id }, { $set: updateFields });
      }
      Object.assign(existingConv, updateFields);

      if (initialMessage && initialMessage.trim()) {
        const sent = await this.sendMessage({
          conversationId: existingConv.id,
          senderId: currentUser.id,
          senderName:
            currentUser.role === 'seller'
              ? finalSellerName
              : (currentUser.name || currentUser.username || 'مستخدم'),
          senderRole: currentUser.role,
          senderSellerId: currentUser.sellerId || finalSellerId,
          text: initialMessage.trim()
        });
        return sent.conversation;
      }

      return existingConv;
    }

    // 4. Create new conversation document
    const now = new Date().toISOString();
    const defaultPreview =
      convType === 'direct'
        ? (orderNumber ? `تنسيق طلب وشحن #${orderNumber}` : 'بدء محادثة مباشرة بين البائع والمشتري')
        : 'مرحباً، أود التواصل مع إدارة المنصة والدعم الفني';

    const newConv: ConversationDocument = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      buyerId: finalBuyerId,
      buyerName: finalBuyerName,
      buyerAvatar: finalBuyerAvatar,
      sellerId: finalSellerId,
      sellerUserId: finalSellerUserId || undefined,
      sellerName: finalSellerName,
      sellerAvatar: finalSellerAvatar,
      conversationType: convType,
      participantRole: partRole,
      participantId: partId,
      participantName: partName,
      productId,
      productTitle,
      productImage,
      productPrice,
      orderId,
      orderNumber,
      orderStatus,
      lastMessageText: initialMessage?.trim() || defaultPreview,
      lastMessageSenderId: currentUser.id,
      lastMessageSenderRole: currentUser.role,
      lastMessageAt: now,
      buyerUnreadCount:
        initialMessage?.trim()
          ? (currentUser.role === 'seller' && convType === 'direct' ? 1 : currentUser.role === 'seller' && convType === 'seller_support' ? 1 : 0)
          : 0,
      sellerUnreadCount:
        initialMessage?.trim()
          ? (currentUser.role === 'buyer' ? 1 : currentUser.role === 'admin' && convType === 'seller_support' ? 1 : 0)
          : 0,
      status: 'active',
      createdAt: now,
      updatedAt: now
    };

    if (isMongo && db) {
      await db.collection('conversations').insertOne(newConv as any);
    } else {
      memoryDb.conversations.unshift(newConv);
    }

    // 5. If initial message was supplied, insert message and broadcast
    if (initialMessage && initialMessage.trim()) {
      let receiverId = 'admin';
      if (convType === 'direct') {
        receiverId = currentUser.role === 'buyer' ? (finalSellerUserId || finalSellerId) : finalBuyerId;
      } else if (currentUser.role === 'admin') {
        receiverId = convType === 'seller_support' ? (finalSellerUserId || finalSellerId) : finalBuyerId;
      } else {
        receiverId = 'admin';
      }

      const senderDisplayName =
        currentUser.role === 'seller'
          ? finalSellerName
          : (currentUser.name || currentUser.username || 'مستخدم');

      const firstMsg: MessageDocument = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        conversationId: newConv.id,
        senderId: currentUser.id,
        senderName: senderDisplayName,
        senderRole: currentUser.role,
        receiverId,
        text: initialMessage.trim(),
        messageType: productId ? 'product_reference' : 'text',
        isRead: false,
        createdAt: now
      };

      if (isMongo && db) {
        await db.collection('messages').insertOne(firstMsg as any);
      } else {
        memoryDb.messages.push(firstMsg);
      }

      if (receiverId === 'admin') {
        await notifyAdmins({
          title: `رسالة جديدة من ${senderDisplayName}`,
          message: firstMsg.text.length > 60 ? `${firstMsg.text.substring(0, 60)}...` : firstMsg.text,
          type: 'system',
          link: 'messages',
          metadata: { conversationId: newConv.id }
        }).catch(() => {});
      } else {
        await createNotification({
          userId: receiverId,
          recipientId: receiverId,
          title:
            convType === 'direct'
              ? `رسالة جديدة من ${senderDisplayName}`
              : 'رسالة جديدة من إدارة منصة وه',
          message: firstMsg.text.length > 60 ? `${firstMsg.text.substring(0, 60)}...` : firstMsg.text,
          type: 'chat_message',
          link: currentUser.role === 'buyer' ? 'seller-messages' : 'messages',
          recipientRole: currentUser.role === 'buyer' ? 'seller' : 'buyer',
          metadata: { conversationId: newConv.id, orderId: newConv.orderId }
        }).catch(() => {});
      }

      chatRealtimeService.broadcastNewMessage(firstMsg, newConv);
    }

    return newConv;
  }

  /**
   * Get list of conversations for a user.
   * - Admin: sees support conversations (and direct threads separately without merging them).
   * - Buyer: sees their direct conversations with sellers AND support thread with 'admin'.
   * - Seller: sees their direct conversations with buyers AND support thread with 'admin'.
   */
  public static async getUserConversations(user: { id: string; role: UserRole; sellerId?: string }): Promise<ConversationDocument[]> {
    const { db, isMongo } = await getDatabase();
    const { id: userId, role, sellerId } = user;

    if (role === 'admin') {
      let allConvs: ConversationDocument[] = [];
      if (isMongo && db) {
        allConvs = (await db.collection('conversations')
          .find({})
          .sort({ updatedAt: -1, createdAt: -1 })
          .limit(200)
          .toArray()) as unknown as ConversationDocument[];
      } else {
        allConvs = [...memoryDb.conversations].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      }

      const seen = new Map<string, ConversationDocument>();
      const dupesToDelete: string[] = [];

      for (const conv of allConvs) {
        const key =
          conv.buyerId === 'admin'
            ? `seller_${conv.sellerId}`
            : conv.sellerId === 'admin'
            ? `buyer_${conv.buyerId}`
            : `direct_${conv.buyerId}_${conv.sellerId}`;

        if (!seen.has(key)) {
          seen.set(key, conv);
        } else {
          const primary = seen.get(key)!;
          dupesToDelete.push(conv.id);
          if (isMongo && db) {
            await db.collection('messages').updateMany(
              { conversationId: conv.id },
              { $set: { conversationId: primary.id } }
            );
          } else {
            for (const m of memoryDb.messages) {
              if (m.conversationId === conv.id) m.conversationId = primary.id;
            }
          }
        }
      }

      if (dupesToDelete.length > 0) {
        if (isMongo && db) {
          await db.collection('conversations').deleteMany({ id: { $in: dupesToDelete } });
        } else {
          memoryDb.conversations = memoryDb.conversations.filter((c) => !dupesToDelete.includes(c.id));
        }
      }

      return Array.from(seen.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    if (role === 'seller') {
      const sellerIds = Array.from(new Set([userId, ...(sellerId ? [sellerId] : [])]));
      const query = {
        sellerId: { $in: sellerIds }
      };

      let list: ConversationDocument[] = [];
      if (isMongo && db) {
        list = (await db.collection('conversations')
          .find(query)
          .sort({ updatedAt: -1, createdAt: -1 })
          .limit(100)
          .toArray()) as unknown as ConversationDocument[];
      } else {
        list = memoryDb.conversations
          .filter((c) => sellerIds.includes(c.sellerId))
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      }

      // Deduplicate per buyerId (including 'admin' support thread)
      const seenByBuyer = new Map<string, ConversationDocument>();
      const dupes: string[] = [];
      for (const conv of list) {
        if (!seenByBuyer.has(conv.buyerId)) {
          seenByBuyer.set(conv.buyerId, conv);
        } else {
          const primary = seenByBuyer.get(conv.buyerId)!;
          dupes.push(conv.id);
          if (isMongo && db) {
            await db.collection('messages').updateMany(
              { conversationId: conv.id },
              { $set: { conversationId: primary.id } }
            );
          } else {
            for (const m of memoryDb.messages) {
              if (m.conversationId === conv.id) m.conversationId = primary.id;
            }
          }
        }
      }
      if (dupes.length > 0) {
        if (isMongo && db) {
          await db.collection('conversations').deleteMany({ id: { $in: dupes } });
        } else {
          memoryDb.conversations = memoryDb.conversations.filter((c) => !dupes.includes(c.id));
        }
      }

      return Array.from(seenByBuyer.values()).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }

    // Role is buyer
    const query = {
      buyerId: userId
    };

    let list: ConversationDocument[] = [];
    if (isMongo && db) {
      list = (await db.collection('conversations')
        .find(query)
        .sort({ updatedAt: -1, createdAt: -1 })
        .limit(100)
        .toArray()) as unknown as ConversationDocument[];
    } else {
      list = memoryDb.conversations
        .filter((c) => c.buyerId === userId)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    const seenBySeller = new Map<string, ConversationDocument>();
    const dupes: string[] = [];
    for (const conv of list) {
      if (!seenBySeller.has(conv.sellerId)) {
        seenBySeller.set(conv.sellerId, conv);
      } else {
        const primary = seenBySeller.get(conv.sellerId)!;
        dupes.push(conv.id);
        if (isMongo && db) {
          await db.collection('messages').updateMany(
            { conversationId: conv.id },
            { $set: { conversationId: primary.id } }
          );
        } else {
          for (const m of memoryDb.messages) {
            if (m.conversationId === conv.id) m.conversationId = primary.id;
          }
        }
      }
    }
    if (dupes.length > 0) {
      if (isMongo && db) {
        await db.collection('conversations').deleteMany({ id: { $in: dupes } });
      } else {
        memoryDb.conversations = memoryDb.conversations.filter((c) => !dupes.includes(c.id));
      }
    }

    return Array.from(seenBySeller.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * Get single conversation details, strictly verifying authorization.
   */
  public static async getConversationById(
    conversationId: string,
    user: { id: string; role: UserRole; sellerId?: string }
  ): Promise<ConversationDocument | null> {
    const { db, isMongo } = await getDatabase();
    let conv: ConversationDocument | null = null;

    if (isMongo && db) {
      conv = (await db.collection('conversations').findOne({ id: conversationId })) as ConversationDocument | null;
    } else {
      conv = memoryDb.conversations.find((c) => c.id === conversationId) || null;
    }

    if (!conv) return null;

    if (user.role === 'admin') {
      return conv;
    }

    if (user.role === 'buyer') {
      if (conv.buyerId === user.id) {
        return conv;
      }
      throw new Error('FORBIDDEN_ACCESS');
    }

    if (user.role === 'seller') {
      const sellerIds = [user.id, ...(user.sellerId ? [user.sellerId] : [])];
      if (sellerIds.includes(conv.sellerId) || (conv.sellerUserId && conv.sellerUserId === user.id)) {
        return conv;
      }
      throw new Error('FORBIDDEN_ACCESS');
    }

    throw new Error('FORBIDDEN_ACCESS');
  }

  /**
   * Get paginated messages for a conversation
   */
  public static async getMessages(
    conversationId: string,
    user: { id: string; role: UserRole; sellerId?: string },
    limit: number = 50,
    beforeTime?: string
  ): Promise<MessageDocument[]> {
    await this.getConversationById(conversationId, user);

    const { db, isMongo } = await getDatabase();
    const query: any = { conversationId };
    if (beforeTime) {
      query.createdAt = { $lt: beforeTime };
    }

    if (isMongo && db) {
      const msgs = (await db.collection('messages')
        .find(query)
        .sort({ createdAt: -1 })
        .limit(Math.min(limit, 100))
        .toArray()) as unknown as MessageDocument[];
      return msgs.reverse();
    }

    let msgs = memoryDb.messages.filter((m) => m.conversationId === conversationId);
    if (beforeTime) {
      const beforeDate = new Date(beforeTime).getTime();
      msgs = msgs.filter((m) => new Date(m.createdAt).getTime() < beforeDate);
    }
    msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return msgs.slice(-limit);
  }

  /**
   * Send a new message in a conversation (Buyer <-> Seller direct OR Admin Support).
   */
  public static async sendMessage(params: {
    conversationId: string;
    senderId: string;
    senderName: string;
    senderRole: UserRole;
    senderSellerId?: string;
    text: string;
    messageType?: 'text' | 'image' | 'product_reference';
  }): Promise<{ message: MessageDocument; conversation: ConversationDocument }> {
    const { conversationId, senderId, senderName, senderRole, senderSellerId, text, messageType = 'text' } = params;

    const trimmedText = text?.trim();
    if (!trimmedText || trimmedText.length === 0) {
      throw new Error('INVALID_TEXT: Message text is required');
    }
    if (trimmedText.length > 2000) {
      throw new Error('MESSAGE_TOO_LONG: Maximum length is 2000 characters');
    }

    const { db, isMongo } = await getDatabase();

    let conv: ConversationDocument | null = null;
    if (isMongo && db) {
      conv = (await db.collection('conversations').findOne({ id: conversationId })) as ConversationDocument | null;
    } else {
      conv = memoryDb.conversations.find((c) => c.id === conversationId) || null;
    }

    if (!conv) {
      throw new Error('CONVERSATION_NOT_FOUND');
    }
    if (conv.status === 'blocked') {
      throw new Error('CONVERSATION_BLOCKED');
    }

    let receiverId = '';
    let buyerUnreadInc = 0;
    let sellerUnreadInc = 0;

    if (senderRole === 'buyer') {
      if (conv.buyerId !== senderId) {
        throw new Error('FORBIDDEN_SENDER');
      }
      if (conv.sellerId === 'admin') {
        receiverId = 'admin';
      } else {
        receiverId = conv.sellerUserId || (await resolveSellerUserId(conv.sellerId)) || conv.sellerId;
      }
      sellerUnreadInc = 1;
    } else if (senderRole === 'seller') {
      const sellerIds = [senderId, ...(senderSellerId ? [senderSellerId] : [])];
      if (!sellerIds.includes(conv.sellerId) && conv.sellerUserId !== senderId) {
        throw new Error('FORBIDDEN_SENDER');
      }
      receiverId = conv.buyerId === 'admin' ? 'admin' : conv.buyerId;
      buyerUnreadInc = 1;
    } else if (senderRole === 'admin') {
      if (conv.buyerId === 'admin') {
        receiverId = conv.sellerUserId || (await resolveSellerUserId(conv.sellerId)) || conv.sellerId;
        sellerUnreadInc = 1;
      } else if (conv.sellerId === 'admin') {
        receiverId = conv.buyerId;
        buyerUnreadInc = 1;
      } else {
        throw new Error('FORBIDDEN_SENDER');
      }
    } else {
      throw new Error('FORBIDDEN_SENDER');
    }

    const now = new Date().toISOString();
    const effectiveSenderName =
      senderRole === 'seller' && conv.sellerName ? conv.sellerName : senderName;

    const newMsg: MessageDocument = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      conversationId,
      senderId,
      senderName: effectiveSenderName,
      senderRole,
      receiverId,
      text: trimmedText,
      messageType,
      isRead: false,
      createdAt: now
    };

    conv.lastMessageText = trimmedText;
    conv.lastMessageSenderId = senderId;
    conv.lastMessageSenderRole = senderRole;
    conv.lastMessageAt = now;
    conv.buyerUnreadCount = (conv.buyerUnreadCount || 0) + buyerUnreadInc;
    conv.sellerUnreadCount = (conv.sellerUnreadCount || 0) + sellerUnreadInc;
    conv.updatedAt = now;

    if (isMongo && db) {
      await db.collection('messages').insertOne(newMsg as any);
      await db.collection('conversations').updateOne(
        { id: conversationId },
        {
          $set: {
            lastMessageText: conv.lastMessageText,
            lastMessageSenderId: conv.lastMessageSenderId,
            lastMessageSenderRole: conv.lastMessageSenderRole,
            lastMessageAt: conv.lastMessageAt,
            updatedAt: conv.updatedAt
          },
          $inc: {
            buyerUnreadCount: buyerUnreadInc,
            sellerUnreadCount: sellerUnreadInc
          }
        }
      );
    } else {
      memoryDb.messages.push(newMsg);
    }

    // Create persistent in-app notification
    if (receiverId === 'admin') {
      await notifyAdmins({
        title: `رسالة جديدة من ${effectiveSenderName}`,
        message: trimmedText.length > 60 ? `${trimmedText.substring(0, 60)}...` : trimmedText,
        type: 'system',
        link: 'messages',
        metadata: { conversationId }
      }).catch(() => {});
    } else {
      const targetRole = senderRole === 'buyer' ? 'seller' : 'buyer';
      const notifTitle =
        senderRole === 'admin'
          ? 'رسالة جديدة من إدارة منصة وه'
          : `رسالة جديدة من ${effectiveSenderName}`;
      await createNotification({
        userId: receiverId,
        recipientId: receiverId,
        title: notifTitle,
        message: trimmedText.length > 60 ? `${trimmedText.substring(0, 60)}...` : trimmedText,
        type: 'chat_message',
        link: targetRole === 'seller' ? 'seller-messages' : 'messages',
        recipientRole: targetRole,
        metadata: { conversationId, orderId: conv.orderId }
      }).catch(() => {});
    }

    // Dispatch real-time SSE broadcast (receiverId is already resolved to actual user ID or 'admin')
    chatRealtimeService.broadcastNewMessage(newMsg, conv);

    return { message: newMsg, conversation: conv };
  }

  /**
   * Mark all messages in a conversation as read by the current user
   */
  public static async markConversationRead(
    conversationId: string,
    user: { id: string; role: UserRole; sellerId?: string }
  ): Promise<{ success: boolean; readCount: number }> {
    const { db, isMongo } = await getDatabase();

    const conv = await this.getConversationById(conversationId, user);
    if (!conv) {
      return { success: false, readCount: 0 };
    }

    const now = new Date().toISOString();
    let readCount = 0;

    let targetReceiverIds: string[] = [];
    let resetField: Record<string, number> = {};

    if (user.role === 'admin') {
      targetReceiverIds = ['admin'];
      if (conv.buyerId === 'admin') {
        resetField = { buyerUnreadCount: 0 };
      } else {
        resetField = { sellerUnreadCount: 0 };
      }
    } else if (user.role === 'buyer') {
      targetReceiverIds = [user.id];
      resetField = { buyerUnreadCount: 0 };
    } else if (user.role === 'seller') {
      targetReceiverIds = Array.from(
        new Set([user.id, ...(user.sellerId ? [user.sellerId] : []), conv.sellerId].filter(Boolean))
      );
      resetField = { sellerUnreadCount: 0 };
    }

    if (isMongo && db) {
      const updateResult = await db.collection('messages').updateMany(
        {
          conversationId,
          receiverId: { $in: targetReceiverIds },
          isRead: false
        },
        {
          $set: {
            isRead: true,
            readAt: now
          }
        }
      );
      readCount = updateResult.modifiedCount;

      await db.collection('conversations').updateOne(
        { id: conversationId },
        { $set: resetField }
      );
    } else {
      for (const msg of memoryDb.messages) {
        if (msg.conversationId === conversationId && !msg.isRead && targetReceiverIds.includes(msg.receiverId)) {
          msg.isRead = true;
          msg.readAt = now;
          readCount++;
        }
      }
      if (resetField.buyerUnreadCount !== undefined) conv.buyerUnreadCount = 0;
      if (resetField.sellerUnreadCount !== undefined) conv.sellerUnreadCount = 0;
    }

    // Broadcast read event to the sender using their connected user ID
    let notifyTarget = 'admin';
    if (user.role === 'admin') {
      notifyTarget =
        conv.buyerId === 'admin'
          ? (conv.sellerUserId || (await resolveSellerUserId(conv.sellerId)) || conv.sellerId)
          : conv.buyerId;
    } else if (user.role === 'buyer') {
      notifyTarget =
        conv.sellerId === 'admin'
          ? 'admin'
          : (conv.sellerUserId || (await resolveSellerUserId(conv.sellerId)) || conv.sellerId);
    } else if (user.role === 'seller') {
      notifyTarget = conv.buyerId === 'admin' ? 'admin' : conv.buyerId;
    }

    chatRealtimeService.broadcastMessagesRead(conversationId, user.id, notifyTarget);

    return { success: true, readCount };
  }

  /**
   * Get aggregate unread count for user across all their conversations
   */
  public static async getUnreadCount(user: { id: string; role: UserRole; sellerId?: string }): Promise<number> {
    const convs = await this.getUserConversations(user);
    let totalUnread = 0;

    if (user.role === 'admin') {
      for (const c of convs) {
        if (c.sellerId === 'admin') {
          totalUnread += c.sellerUnreadCount || 0;
        } else if (c.buyerId === 'admin') {
          totalUnread += c.buyerUnreadCount || 0;
        }
      }
      return totalUnread;
    }

    if (user.role === 'seller') {
      for (const c of convs) {
        totalUnread += c.sellerUnreadCount || 0;
      }
      return totalUnread;
    }

    // Role is buyer
    for (const c of convs) {
      if (c.buyerId === user.id) {
        totalUnread += c.buyerUnreadCount || 0;
      }
    }

    return totalUnread;
  }

  /**
   * Admin Control: Permanently delete a conversation and all its messages from the database
   */
  public static async deleteConversation(
    conversationId: string,
    user: { id: string; role: UserRole }
  ): Promise<boolean> {
    if (user.role !== 'admin') {
      throw new Error('FORBIDDEN_ADMIN_ONLY');
    }

    const { db, isMongo } = await getDatabase();
    let buyerId = '';
    let sellerId = '';
    let sellerUserId = '';

    if (isMongo && db) {
      const conv = await db.collection('conversations').findOne({ id: conversationId });
      if (!conv) {
        throw new Error('CONVERSATION_NOT_FOUND');
      }
      buyerId = conv.buyerId;
      sellerId = conv.sellerId;
      sellerUserId = conv.sellerUserId || (await resolveSellerUserId(conv.sellerId)) || '';

      await db.collection('conversations').deleteOne({ id: conversationId });
      await db.collection('messages').deleteMany({ conversationId });
    } else {
      const idx = memoryDb.conversations.findIndex((c) => c.id === conversationId);
      if (idx === -1) {
        throw new Error('CONVERSATION_NOT_FOUND');
      }
      buyerId = memoryDb.conversations[idx].buyerId;
      sellerId = memoryDb.conversations[idx].sellerId;
      sellerUserId = memoryDb.conversations[idx].sellerUserId || (await resolveSellerUserId(sellerId)) || '';

      memoryDb.conversations.splice(idx, 1);
      memoryDb.messages = memoryDb.messages.filter((m) => m.conversationId !== conversationId);
    }

    chatRealtimeService.broadcastConversationDeleted(conversationId, buyerId, sellerId, sellerUserId || undefined);
    Logger.info(`[ChatService] Admin ${user.id} permanently deleted conversation ${conversationId}`);
    return true;
  }

  /**
   * Admin Control: Permanently delete a single message from the database
   */
  public static async deleteMessage(
    messageId: string,
    user: { id: string; role: UserRole }
  ): Promise<boolean> {
    if (user.role !== 'admin') {
      throw new Error('FORBIDDEN_ADMIN_ONLY');
    }

    const { db, isMongo } = await getDatabase();
    let convId = '';

    if (isMongo && db) {
      const msg = await db.collection('messages').findOne({ id: messageId });
      if (!msg) {
        throw new Error('MESSAGE_NOT_FOUND');
      }
      convId = msg.conversationId;

      await db.collection('messages').deleteOne({ id: messageId });

      const latestMsg = await db.collection('messages')
        .find({ conversationId: convId })
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray();

      if (latestMsg.length > 0) {
        await db.collection('conversations').updateOne(
          { id: convId },
          {
            $set: {
              lastMessageText: latestMsg[0].text,
              lastMessageSenderId: latestMsg[0].senderId,
              lastMessageSenderRole: latestMsg[0].senderRole,
              lastMessageAt: latestMsg[0].createdAt
            }
          }
        );
      } else {
        await db.collection('conversations').updateOne(
          { id: convId },
          {
            $set: {
              lastMessageText: 'لا توجد رسائل حالياً'
            }
          }
        );
      }
    } else {
      const idx = memoryDb.messages.findIndex((m) => m.id === messageId);
      if (idx === -1) {
        throw new Error('MESSAGE_NOT_FOUND');
      }
      convId = memoryDb.messages[idx].conversationId;
      memoryDb.messages.splice(idx, 1);

      const conv = memoryDb.conversations.find((c) => c.id === convId);
      if (conv) {
        const remaining = memoryDb.messages
          .filter((m) => m.conversationId === convId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (remaining.length > 0) {
          conv.lastMessageText = remaining[0].text;
          conv.lastMessageSenderId = remaining[0].senderId;
          conv.lastMessageSenderRole = remaining[0].senderRole;
          conv.lastMessageAt = remaining[0].createdAt;
        } else {
          conv.lastMessageText = 'لا توجد رسائل حالياً';
        }
      }
    }

    chatRealtimeService.broadcastMessageDeleted(convId, messageId);
    Logger.info(`[ChatService] Admin ${user.id} deleted message ${messageId}`);
    return true;
  }

  /**
   * Admin Control: Clear all messages inside a conversation without deleting the thread
   */
  public static async clearConversationMessages(
    conversationId: string,
    user: { id: string; role: UserRole }
  ): Promise<boolean> {
    if (user.role !== 'admin') {
      throw new Error('FORBIDDEN_ADMIN_ONLY');
    }

    const { db, isMongo } = await getDatabase();
    let buyerId = '';
    let sellerId = '';
    let sellerUserId = '';

    if (isMongo && db) {
      const conv = await db.collection('conversations').findOne({ id: conversationId });
      if (!conv) {
        throw new Error('CONVERSATION_NOT_FOUND');
      }
      buyerId = conv.buyerId;
      sellerId = conv.sellerId;
      sellerUserId = conv.sellerUserId || (await resolveSellerUserId(conv.sellerId)) || '';

      await db.collection('messages').deleteMany({ conversationId });
      await db.collection('conversations').updateOne(
        { id: conversationId },
        {
          $set: {
            lastMessageText: 'تم مسح سجل الرسائل بواسطة الإدارة',
            lastMessageAt: new Date().toISOString(),
            buyerUnreadCount: 0,
            sellerUnreadCount: 0,
            updatedAt: new Date().toISOString()
          }
        }
      );
    } else {
      const conv = memoryDb.conversations.find((c) => c.id === conversationId);
      if (!conv) {
        throw new Error('CONVERSATION_NOT_FOUND');
      }
      buyerId = conv.buyerId;
      sellerId = conv.sellerId;
      sellerUserId = conv.sellerUserId || (await resolveSellerUserId(conv.sellerId)) || '';

      memoryDb.messages = memoryDb.messages.filter((m) => m.conversationId !== conversationId);
      conv.lastMessageText = 'تم مسح سجل الرسائل بواسطة الإدارة';
      conv.lastMessageAt = new Date().toISOString();
      conv.buyerUnreadCount = 0;
      conv.sellerUnreadCount = 0;
      conv.updatedAt = new Date().toISOString();
    }

    chatRealtimeService.broadcastConversationCleared(conversationId, buyerId, sellerId, sellerUserId || undefined);
    Logger.info(`[ChatService] Admin ${user.id} cleared messages in conversation ${conversationId}`);
    return true;
  }

  /**
   * Admin Control: Update status of a conversation (active, archived, blocked)
   */
  public static async updateConversationStatus(
    conversationId: string,
    status: 'active' | 'archived' | 'blocked',
    user: { id: string; role: UserRole }
  ): Promise<ConversationDocument> {
    if (user.role !== 'admin') {
      throw new Error('FORBIDDEN_ADMIN_ONLY');
    }

    const { db, isMongo } = await getDatabase();
    const now = new Date().toISOString();
    let updatedConv: ConversationDocument | null = null;

    if (isMongo && db) {
      const res = await db.collection('conversations').findOneAndUpdate(
        { id: conversationId },
        { $set: { status, updatedAt: now } },
        { returnDocument: 'after' }
      );
      if (!res) {
        throw new Error('CONVERSATION_NOT_FOUND');
      }
      updatedConv = res as unknown as ConversationDocument;
    } else {
      const conv = memoryDb.conversations.find((c) => c.id === conversationId);
      if (!conv) {
        throw new Error('CONVERSATION_NOT_FOUND');
      }
      conv.status = status;
      conv.updatedAt = now;
      updatedConv = conv;
    }

    chatRealtimeService.broadcastConversationUpdate(updatedConv);
    Logger.info(`[ChatService] Admin ${user.id} updated conversation ${conversationId} status to ${status}`);
    return updatedConv;
  }

  /**
   * Admin Control: Bulk delete all conversations and messages from database
   */
  public static async deleteAllConversations(
    user: { id: string; role: UserRole }
  ): Promise<boolean> {
    if (user.role !== 'admin') {
      throw new Error('FORBIDDEN_ADMIN_ONLY');
    }

    const { db, isMongo } = await getDatabase();
    if (isMongo && db) {
      await db.collection('conversations').deleteMany({});
      await db.collection('messages').deleteMany({});
    } else {
      memoryDb.conversations = [];
      memoryDb.messages = [];
    }

    chatRealtimeService.notifyUser('admin', 'chat:all_deleted', { timestamp: new Date().toISOString() });
    Logger.info(`[ChatService] Admin ${user.id} wiped all conversations from database`);
    return true;
  }
}
