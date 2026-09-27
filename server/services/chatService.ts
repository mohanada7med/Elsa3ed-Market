import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { ConversationDocument, MessageDocument, UserRole } from '../models/types.ts';
import { chatRealtimeService } from './chatRealtimeService.ts';
import { Logger } from '../utils/logger.ts';

export class ChatService {
  /**
   * Get or create a support conversation with Platform Admin.
   * Direct Buyer <-> Seller messaging is strictly prohibited!
   * - If user is Buyer: creates/gets conversation with 'admin' (Platform Support).
   * - If user is Seller: creates/gets conversation with 'admin' (Platform Support).
   * - If user is Admin: can start/get conversation with a target Buyer or Seller.
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
    let productTitle: string | undefined;
    let productImage: string | undefined;
    let productPrice: number | undefined;
    if (productId) {
      if (isMongo && db) {
        const prod = await db.collection('products').findOne({ id: productId });
        if (prod) {
          productTitle = prod.title;
          productImage = prod.images?.[0];
          productPrice = prod.price;
        }
      } else {
        const prod = memoryDb.products.find((p) => p.id === productId);
        if (prod) {
          productTitle = prod.title;
          productImage = prod.images?.[0];
          productPrice = prod.price;
        }
      }
    }

    // 2. Fetch order details if orderId is supplied
    let orderNumber: string | undefined;
    let orderStatus: any | undefined;
    if (orderId) {
      if (isMongo && db) {
        const ord = await db.collection('orders').findOne({ id: orderId });
        if (ord) {
          orderNumber = ord.orderNumber || ord.id;
          orderStatus = ord.status;
        }
      } else {
        const ord = memoryDb.orders.find((o) => o.id === orderId);
        if (ord) {
          orderNumber = ord.orderNumber || ord.id;
          orderStatus = ord.status;
        }
      }
    }

    let finalBuyerId = '';
    let finalBuyerName = '';
    let finalBuyerAvatar = '';
    let finalSellerId = '';
    let finalSellerName = '';
    let finalSellerAvatar = '';
    let convType: 'buyer_support' | 'seller_support' = 'buyer_support';
    let partRole: 'buyer' | 'seller' = 'buyer';
    let partId = '';
    let partName = '';

    // ==========================================
    // ROUTE CONVERSATION ACCORDING TO USER ROLE
    // ==========================================
    if (currentUser.role === 'buyer') {
      // Buyer chatting with Admin Support
      finalBuyerId = currentUser.id;
      finalBuyerName = currentUser.name || currentUser.username || 'مشتري سوق وه';
      finalBuyerAvatar = currentUser.avatar || '';
      finalSellerId = 'admin';
      finalSellerName = 'إدارة منصة وه (الدعم الفني)';
      finalSellerAvatar = '';
      convType = 'buyer_support';
      partRole = 'buyer';
      partId = currentUser.id;
      partName = finalBuyerName;

      // Ensure buyer details are fresh from DB
      if (isMongo && db) {
        const u = await db.collection('users').findOne({ id: currentUser.id });
        if (u) {
          finalBuyerName = u.name || u.username || finalBuyerName;
          finalBuyerAvatar = u.avatar || u.profileImage?.secureUrl || finalBuyerAvatar;
          partName = finalBuyerName;
        }
      }
    } else if (currentUser.role === 'seller') {
      // Seller chatting with Admin Support
      finalSellerId = currentUser.sellerId || currentUser.id;
      finalSellerName = currentUser.name || currentUser.username || 'ورشة الحرفي';
      finalSellerAvatar = currentUser.avatar || '';
      finalBuyerId = 'admin';
      finalBuyerName = 'إدارة منصة وه (الدعم الفني)';
      finalBuyerAvatar = '';
      convType = 'seller_support';
      partRole = 'seller';
      partId = finalSellerId;
      partName = finalSellerName;

      // Ensure seller details are fresh from DB
      if (isMongo && db) {
        const sellerDoc = await db.collection('sellers').findOne({
          $or: [{ id: finalSellerId }, { userId: currentUser.id }]
        });
        if (sellerDoc) {
          finalSellerName = sellerDoc.brandName || sellerDoc.name || finalSellerName;
          finalSellerAvatar = sellerDoc.avatar || finalSellerAvatar;
          partName = finalSellerName;
        }
      }
    } else if (currentUser.role === 'admin') {
      // Admin initiating chat with a Buyer or Seller
      const targetSellerId = params.sellerId && params.sellerId !== 'admin' ? params.sellerId : undefined;
      const targetBuyerId = params.buyerId && params.buyerId !== 'admin' ? params.buyerId : undefined;

      if (targetSellerId) {
        finalBuyerId = 'admin';
        finalBuyerName = 'إدارة منصة وه (الدعم الفني)';
        finalSellerId = targetSellerId;
        finalSellerName = 'ورشة الحرفي';
        convType = 'seller_support';
        partRole = 'seller';
        partId = targetSellerId;

        if (isMongo && db) {
          const sellerDoc = await db.collection('sellers').findOne({ id: targetSellerId });
          if (sellerDoc) {
            finalSellerName = sellerDoc.brandName || sellerDoc.name || finalSellerName;
            finalSellerAvatar = sellerDoc.avatar || '';
          }
        }
        partName = finalSellerName;
      } else if (targetBuyerId) {
        finalSellerId = 'admin';
        finalSellerName = 'إدارة منصة وه (الدعم الفني)';
        finalBuyerId = targetBuyerId;
        finalBuyerName = 'مشتري سوق وه';
        convType = 'buyer_support';
        partRole = 'buyer';
        partId = targetBuyerId;

        if (isMongo && db) {
          const u = await db.collection('users').findOne({ id: targetBuyerId });
          if (u) {
            finalBuyerName = u.name || u.username || finalBuyerName;
            finalBuyerAvatar = u.avatar || u.profileImage?.secureUrl || '';
          }
        }
        partName = finalBuyerName;
      } else {
        // Fallback default support thread
        finalBuyerId = currentUser.id;
        finalBuyerName = currentUser.name || 'إدارة المنصة';
        finalSellerId = 'admin';
        finalSellerName = 'إدارة منصة وه (الدعم الفني)';
        convType = 'buyer_support';
        partRole = 'buyer';
        partId = currentUser.id;
        partName = finalBuyerName;
      }
    } else {
      throw new Error('FORBIDDEN_ROLE');
    }

    // 3. Query existing conversation between this participant and Admin
    // Always reuse the existing active support conversation so past messages are preserved and continued
    const query: any = {
      buyerId: finalBuyerId,
      sellerId: finalSellerId,
      status: { $ne: 'blocked' }
    };

    let existingConv: ConversationDocument | null = null;
    let duplicateIds: string[] = [];

    if (isMongo && db) {
      const allMatching = (await db.collection('conversations')
        .find(query)
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
        .filter((c) => c.buyerId === finalBuyerId && c.sellerId === finalSellerId && c.status !== 'blocked')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      if (allMatching.length > 0) {
        existingConv = allMatching[0];
        if (allMatching.length > 1) {
          duplicateIds = allMatching.slice(1).map((c) => c.id);
        }
      }
    }

    if (existingConv) {
      // If older duplicate conversation records exist, consolidate all messages into the single thread
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

      // Update context details if a product or order is specifically referenced in this contact
      const updateFields: any = {
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
      }
      if (finalSellerName && existingConv.sellerId !== 'admin') {
        updateFields.sellerName = finalSellerName;
      }

      if (isMongo && db) {
        await db.collection('conversations').updateOne({ id: existingConv.id }, { $set: updateFields });
      }
      Object.assign(existingConv, updateFields);

      // If an initial message was supplied, append it to the existing continuous conversation
      if (initialMessage && initialMessage.trim()) {
        await this.sendMessage({
          conversationId: existingConv.id,
          senderId: currentUser.id,
          senderName: currentUser.name || currentUser.username || 'مستخدم',
          senderRole: currentUser.role,
          senderSellerId: currentUser.sellerId,
          text: initialMessage.trim()
        });
      }

      return existingConv;
    }

    // 4. Create new conversation document
    const now = new Date().toISOString();
    const newConv: ConversationDocument = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      buyerId: finalBuyerId,
      buyerName: finalBuyerName,
      buyerAvatar: finalBuyerAvatar,
      sellerId: finalSellerId,
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
      lastMessageText: initialMessage || 'مرحباً، أود التواصل مع إدارة المنصة والدعم الفني',
      lastMessageSenderId: currentUser.id,
      lastMessageSenderRole: currentUser.role,
      lastMessageAt: now,
      buyerUnreadCount: currentUser.role === 'admin' ? 0 : (convType === 'seller_support' ? 1 : 0),
      sellerUnreadCount: currentUser.role === 'admin' ? 0 : (convType === 'buyer_support' ? 1 : 0),
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
      const receiverId = currentUser.role === 'admin'
        ? (convType === 'seller_support' ? finalSellerId : finalBuyerId)
        : 'admin';

      const firstMsg: MessageDocument = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        conversationId: newConv.id,
        senderId: currentUser.id,
        senderName: currentUser.name || currentUser.username || 'مستخدم',
        senderRole: currentUser.role,
        receiverId,
        text: initialMessage.trim(),
        messageType: productId ? 'product_reference' : 'text',
        isRead: false,
        createdAt: now
      };

      if (isMongo && db) {
        await db.collection('messages').insertOne(firstMsg as any);

        // Notify admins if sent by user
        if (receiverId === 'admin') {
          const adminDocs = await db.collection('users').find({ role: 'admin' }, { projection: { id: 1 } }).toArray();
          for (const a of adminDocs) {
            await db.collection('notifications').insertOne({
              id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              userId: a.id,
              title: `رسالة جديدة من ${firstMsg.senderName}`,
              message: firstMsg.text.length > 60 ? `${firstMsg.text.substring(0, 60)}...` : firstMsg.text,
              type: 'chat_message',
              data: { conversationId: newConv.id },
              isRead: false,
              createdAt: now
            }).catch(() => {});
          }
        }
      } else {
        memoryDb.messages.push(firstMsg);
      }

      chatRealtimeService.broadcastNewMessage(firstMsg, newConv);
    }

    return newConv;
  }

  /**
   * Get list of conversations for a user.
   * - Admin: sees ALL conversations (both from buyers and from sellers).
   * - Buyer: ONLY sees their own conversations with 'admin'.
   * - Seller: ONLY sees their workshop conversations with 'admin'.
   * Direct buyer <-> seller conversations are completely filtered out.
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

      // Consolidate duplicate threads per participant
      const seen = new Map<string, ConversationDocument>();
      const dupesToDelete: string[] = [];

      for (const conv of allConvs) {
        const key = conv.buyerId === 'admin' ? `seller_${conv.sellerId}` : `buyer_${conv.buyerId}`;
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
          memoryDb.conversations = memoryDb.conversations.filter(c => !dupesToDelete.includes(c.id));
        }
      }

      return Array.from(seen.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    if (role === 'seller') {
      const sellerIds = [userId, ...(sellerId ? [sellerId] : [])];
      const query = {
        sellerId: { $in: sellerIds },
        buyerId: 'admin'
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
          .filter((c) => sellerIds.includes(c.sellerId) && c.buyerId === 'admin')
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      }

      if (list.length > 1) {
        const primary = list[0];
        const dupes = list.slice(1).map((c) => c.id);
        if (isMongo && db) {
          await db.collection('messages').updateMany(
            { conversationId: { $in: dupes } },
            { $set: { conversationId: primary.id } }
          );
          await db.collection('conversations').deleteMany({ id: { $in: dupes } });
        } else {
          for (const m of memoryDb.messages) {
            if (dupes.includes(m.conversationId)) m.conversationId = primary.id;
          }
          memoryDb.conversations = memoryDb.conversations.filter((c) => !dupes.includes(c.id));
        }
        return [primary];
      }

      return list;
    }

    // Role is buyer (or default)
    const query = {
      buyerId: userId,
      sellerId: 'admin'
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
        .filter((c) => c.buyerId === userId && c.sellerId === 'admin')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    if (list.length > 1) {
      const primary = list[0];
      const dupes = list.slice(1).map((c) => c.id);
      if (isMongo && db) {
        await db.collection('messages').updateMany(
          { conversationId: { $in: dupes } },
          { $set: { conversationId: primary.id } }
        );
        await db.collection('conversations').deleteMany({ id: { $in: dupes } });
      } else {
        for (const m of memoryDb.messages) {
          if (dupes.includes(m.conversationId)) m.conversationId = primary.id;
        }
        memoryDb.conversations = memoryDb.conversations.filter((c) => !dupes.includes(c.id));
      }
      return [primary];
    }

    return list;
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

    // Check authorization:
    // Admin has access to all conversations.
    // Buyer can only access if they are the buyer and counterparty is admin.
    // Seller can only access if they are the seller and counterparty is admin.
    if (user.role === 'admin') {
      return conv;
    }

    if (user.role === 'buyer') {
      if (conv.buyerId === user.id && conv.sellerId === 'admin') {
        return conv;
      }
      throw new Error('FORBIDDEN_ACCESS');
    }

    if (user.role === 'seller') {
      const sellerIds = [user.id, ...(user.sellerId ? [user.sellerId] : [])];
      if (sellerIds.includes(conv.sellerId) && conv.buyerId === 'admin') {
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
    // Validate authorization
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
   * Send a new message in a conversation.
   * Strict enforcement: Buyer can only message Admin, Seller can only message Admin, Admin messages either.
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

    // Fetch conversation
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

    // Determine receiver and authorize sender
    let receiverId = '';
    let buyerUnreadInc = 0;
    let sellerUnreadInc = 0;

    if (senderRole === 'buyer') {
      if (conv.buyerId !== senderId || conv.sellerId !== 'admin') {
        throw new Error('FORBIDDEN_SENDER');
      }
      receiverId = 'admin';
      sellerUnreadInc = 1; // Admin unread counter
    } else if (senderRole === 'seller') {
      const sellerIds = [senderId, ...(senderSellerId ? [senderSellerId] : [])];
      if (!sellerIds.includes(conv.sellerId) || conv.buyerId !== 'admin') {
        throw new Error('FORBIDDEN_SENDER');
      }
      receiverId = 'admin';
      buyerUnreadInc = 1; // Admin unread counter
    } else if (senderRole === 'admin') {
      if (conv.buyerId === 'admin') {
        receiverId = conv.sellerId;
        sellerUnreadInc = 1; // Seller unread counter
      } else if (conv.sellerId === 'admin') {
        receiverId = conv.buyerId;
        buyerUnreadInc = 1; // Buyer unread counter
      } else {
        throw new Error('FORBIDDEN_SENDER');
      }
    } else {
      throw new Error('FORBIDDEN_SENDER');
    }

    const now = new Date().toISOString();
    const newMsg: MessageDocument = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      conversationId,
      senderId,
      senderName,
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

      // Create in-app notification
      if (receiverId === 'admin') {
        const adminDocs = await db.collection('users').find({ role: 'admin' }, { projection: { id: 1 } }).toArray();
        for (const a of adminDocs) {
          await db.collection('notifications').insertOne({
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            userId: a.id,
            title: `رسالة جديدة من ${senderName}`,
            message: trimmedText.length > 60 ? `${trimmedText.substring(0, 60)}...` : trimmedText,
            type: 'chat_message',
            data: { conversationId },
            isRead: false,
            createdAt: now
          }).catch(() => {});
        }
      } else {
        await db.collection('notifications').insertOne({
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId: receiverId,
          title: 'رسالة جديدة من إدارة منصة وه',
          message: trimmedText.length > 60 ? `${trimmedText.substring(0, 60)}...` : trimmedText,
          type: 'chat_message',
          data: { conversationId },
          isRead: false,
          createdAt: now
        }).catch(() => {});
      }
    } else {
      memoryDb.messages.push(newMsg);
    }

    // Dispatch real-time SSE broadcast
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

    let targetReceiverId = '';
    let resetField: Record<string, number> = {};

    if (user.role === 'admin') {
      targetReceiverId = 'admin';
      if (conv.buyerId === 'admin') {
        resetField = { buyerUnreadCount: 0 };
      } else {
        resetField = { sellerUnreadCount: 0 };
      }
    } else if (user.role === 'buyer') {
      targetReceiverId = user.id;
      resetField = { buyerUnreadCount: 0 };
    } else if (user.role === 'seller') {
      targetReceiverId = user.sellerId || user.id;
      resetField = { sellerUnreadCount: 0 };
    }

    if (isMongo && db) {
      const updateResult = await db.collection('messages').updateMany(
        {
          conversationId,
          receiverId: targetReceiverId,
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
        if (msg.conversationId === conversationId && !msg.isRead && msg.receiverId === targetReceiverId) {
          msg.isRead = true;
          msg.readAt = now;
          readCount++;
        }
      }
      if (resetField.buyerUnreadCount !== undefined) conv.buyerUnreadCount = 0;
      if (resetField.sellerUnreadCount !== undefined) conv.sellerUnreadCount = 0;
    }

    // Broadcast read event to the sender
    const notifyTarget = user.role === 'admin'
      ? (conv.buyerId === 'admin' ? conv.sellerId : conv.buyerId)
      : 'admin';

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
        if (c.buyerId === 'admin') {
          totalUnread += c.sellerUnreadCount || 0;
        }
      }
      return totalUnread;
    }

    // Role is buyer
    for (const c of convs) {
      if (c.sellerId === 'admin' && c.buyerId === user.id) {
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

    if (isMongo && db) {
      const conv = await db.collection('conversations').findOne({ id: conversationId });
      if (!conv) {
        throw new Error('CONVERSATION_NOT_FOUND');
      }
      buyerId = conv.buyerId;
      sellerId = conv.sellerId;

      await db.collection('conversations').deleteOne({ id: conversationId });
      await db.collection('messages').deleteMany({ conversationId });
    } else {
      const idx = memoryDb.conversations.findIndex((c) => c.id === conversationId);
      if (idx === -1) {
        throw new Error('CONVERSATION_NOT_FOUND');
      }
      buyerId = memoryDb.conversations[idx].buyerId;
      sellerId = memoryDb.conversations[idx].sellerId;

      memoryDb.conversations.splice(idx, 1);
      memoryDb.messages = memoryDb.messages.filter((m) => m.conversationId !== conversationId);
    }

    chatRealtimeService.broadcastConversationDeleted(conversationId, buyerId, sellerId);
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

    if (isMongo && db) {
      const conv = await db.collection('conversations').findOne({ id: conversationId });
      if (!conv) {
        throw new Error('CONVERSATION_NOT_FOUND');
      }
      buyerId = conv.buyerId;
      sellerId = conv.sellerId;

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

      memoryDb.messages = memoryDb.messages.filter((m) => m.conversationId !== conversationId);
      conv.lastMessageText = 'تم مسح سجل الرسائل بواسطة الإدارة';
      conv.lastMessageAt = new Date().toISOString();
      conv.buyerUnreadCount = 0;
      conv.sellerUnreadCount = 0;
      conv.updatedAt = new Date().toISOString();
    }

    chatRealtimeService.broadcastConversationCleared(conversationId, buyerId, sellerId);
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
