import { getDatabase, memoryDb } from '../db/mongodb.ts';
import type { ConversationDocument, MessageDocument, UserRole } from '../models/types.ts';
import { chatRealtimeService } from './chatRealtimeService.ts';
import { Logger } from '../utils/logger.ts';

export class ChatService {
  /**
   * Get or create a conversation between a buyer and a seller with optional product or order context.
   */
  public static async getOrCreateConversation(params: {
    buyerId: string;
    buyerName?: string;
    buyerAvatar?: string;
    sellerId: string;
    productId?: string;
    orderId?: string;
    initialMessage?: string;
  }): Promise<ConversationDocument> {
    const { buyerId, sellerId, productId, orderId, initialMessage } = params;
    const { db, isMongo } = await getDatabase();

    // 1. Fetch seller profile/details to populate conversation metadata
    let sellerName = 'ورشة الحرفي';
    let sellerAvatar = '';
    if (isMongo && db) {
      const seller = await db.collection('sellers').findOne({ id: sellerId });
      if (seller) {
        sellerName = seller.brandName || seller.name || sellerName;
        sellerAvatar = seller.avatar || '';
      }
    } else {
      const seller = memoryDb.sellers.find((s) => s.id === sellerId);
      if (seller) {
        sellerName = seller.brandName || seller.name || sellerName;
        sellerAvatar = seller.avatar || '';
      }
    }

    // 2. Fetch buyer details if not provided
    let buyerName = params.buyerName || 'مشتري سوق الصعيد';
    let buyerAvatar = params.buyerAvatar || '';
    if (isMongo && db) {
      const user = await db.collection('users').findOne({ id: buyerId });
      if (user) {
        buyerName = user.name || user.username || buyerName;
        buyerAvatar = user.avatar || user.profileImage?.secureUrl || buyerAvatar;
      }
    } else {
      const user = memoryDb.users.find((u) => u.id === buyerId);
      if (user) {
        buyerName = user.name || user.username || buyerName;
        buyerAvatar = user.avatar || user.profileImage?.secureUrl || buyerAvatar;
      }
    }

    // 3. Fetch product details if productId is supplied
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

    // 4. Fetch order details if orderId is supplied
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

    // 5. Look for existing conversation matching buyer + seller + product/order context
    const query: any = {
      buyerId,
      sellerId,
      status: { $ne: 'blocked' }
    };
    if (orderId) {
      query.orderId = orderId;
    } else if (productId) {
      query.productId = productId;
    }

    let existingConv: ConversationDocument | null = null;
    if (isMongo && db) {
      existingConv = (await db.collection('conversations').findOne(query)) as ConversationDocument | null;
    } else {
      existingConv = memoryDb.conversations.find((c) => {
        if (c.buyerId !== buyerId || c.sellerId !== sellerId || c.status === 'blocked') return false;
        if (orderId) return c.orderId === orderId;
        if (productId) return c.productId === productId;
        return true;
      }) || null;
    }

    if (existingConv) {
      // If initialMessage was supplied, send it
      if (initialMessage && initialMessage.trim()) {
        await this.sendMessage({
          conversationId: existingConv.id,
          senderId: buyerId,
          senderName: buyerName,
          senderRole: 'buyer',
          text: initialMessage.trim()
        });
      }
      return existingConv;
    }

    // 6. Create new conversation document
    const newConv: ConversationDocument = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      buyerId,
      buyerName,
      buyerAvatar,
      sellerId,
      sellerName,
      sellerAvatar,
      productId,
      productTitle,
      productImage,
      productPrice,
      orderId,
      orderNumber,
      orderStatus,
      lastMessageText: initialMessage || 'مرحباً، أود الاستفسار حول هذا العمل التراثي',
      lastMessageSenderId: buyerId,
      lastMessageSenderRole: 'buyer',
      lastMessageAt: new Date().toISOString(),
      buyerUnreadCount: 0,
      sellerUnreadCount: initialMessage ? 1 : 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isMongo && db) {
      await db.collection('conversations').insertOne(newConv as any);
    } else {
      memoryDb.conversations.unshift(newConv);
    }

    // If initialMessage was supplied, create the initial message document
    if (initialMessage && initialMessage.trim()) {
      const firstMsg: MessageDocument = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        conversationId: newConv.id,
        senderId: buyerId,
        senderName: buyerName,
        senderRole: 'buyer',
        receiverId: sellerId,
        text: initialMessage.trim(),
        messageType: productId ? 'product_reference' : 'text',
        isRead: false,
        createdAt: new Date().toISOString()
      };

      if (isMongo && db) {
        await db.collection('messages').insertOne(firstMsg as any);
      } else {
        memoryDb.messages.push(firstMsg);
      }

      chatRealtimeService.broadcastNewMessage(firstMsg, newConv);
    }

    return newConv;
  }

  /**
   * Get list of conversations for a user (buyer or seller)
   */
  public static async getUserConversations(user: { id: string; role: UserRole; sellerId?: string }): Promise<ConversationDocument[]> {
    const { db, isMongo } = await getDatabase();
    const { id: userId, role, sellerId } = user;

    if (role === 'admin') {
      if (isMongo && db) {
        return (await db.collection('conversations')
          .find({})
          .sort({ updatedAt: -1 })
          .limit(100)
          .toArray()) as unknown as ConversationDocument[];
      }
      return [...memoryDb.conversations].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    const conditions: any[] = [{ buyerId: userId }];
    if (sellerId) {
      conditions.push({ sellerId });
    }
    // Also include if user is registered with sellerId or user ID matches
    conditions.push({ sellerId: userId });

    const query = { $or: conditions };

    if (isMongo && db) {
      return (await db.collection('conversations')
        .find(query)
        .sort({ updatedAt: -1 })
        .limit(100)
        .toArray()) as unknown as ConversationDocument[];
    }

    return memoryDb.conversations
      .filter((c) => c.buyerId === userId || (sellerId && c.sellerId === sellerId) || c.sellerId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * Get single conversation details, verifying user has access
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

    // Check authorization: user must be buyer, seller, or admin
    const isBuyer = conv.buyerId === user.id;
    const isSeller = (user.sellerId && conv.sellerId === user.sellerId) || conv.sellerId === user.id;
    const isAdmin = user.role === 'admin';

    if (!isBuyer && !isSeller && !isAdmin) {
      throw new Error('FORBIDDEN_ACCESS');
    }

    return conv;
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
   * Send a new message in a conversation
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

    // Determine receiver
    const isBuyerSender = conv.buyerId === senderId;
    const isSellerSender = (senderSellerId && conv.sellerId === senderSellerId) || conv.sellerId === senderId;
    const isAdminSender = senderRole === 'admin';

    if (!isBuyerSender && !isSellerSender && !isAdminSender) {
      throw new Error('FORBIDDEN_SENDER');
    }

    const receiverId = isBuyerSender ? conv.sellerId : conv.buyerId;
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

    // Calculate unread increments
    const buyerUnreadInc = isBuyerSender ? 0 : 1;
    const sellerUnreadInc = isSellerSender ? 0 : 1;

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

      // Create in-app notification for the recipient
      const notif = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: receiverId,
        title: `رسالة جديدة من ${senderName}`,
        message: trimmedText.length > 60 ? `${trimmedText.substring(0, 60)}...` : trimmedText,
        type: 'chat_message',
        data: { conversationId },
        isRead: false,
        createdAt: now
      };
      await db.collection('notifications').insertOne(notif).catch(() => {});
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

    const isBuyer = conv.buyerId === user.id;
    const isSeller = (user.sellerId && conv.sellerId === user.sellerId) || conv.sellerId === user.id;

    const now = new Date().toISOString();
    let readCount = 0;

    if (isMongo && db) {
      const updateResult = await db.collection('messages').updateMany(
        {
          conversationId,
          receiverId: isBuyer ? conv.buyerId : conv.sellerId,
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

      // Reset unread count on conversation
      const resetField = isBuyer ? { buyerUnreadCount: 0 } : { sellerUnreadCount: 0 };
      await db.collection('conversations').updateOne(
        { id: conversationId },
        { $set: resetField }
      );
    } else {
      for (const msg of memoryDb.messages) {
        if (msg.conversationId === conversationId && !msg.isRead && (isBuyer ? msg.receiverId === conv.buyerId : msg.receiverId === conv.sellerId)) {
          msg.isRead = true;
          msg.readAt = now;
          readCount++;
        }
      }
      if (isBuyer) {
        conv.buyerUnreadCount = 0;
      } else if (isSeller) {
        conv.sellerUnreadCount = 0;
      }
    }

    // Broadcast read event to the sender
    const otherUserId = isBuyer ? conv.sellerId : conv.buyerId;
    chatRealtimeService.broadcastMessagesRead(conversationId, user.id, otherUserId);

    return { success: true, readCount };
  }

  /**
   * Get aggregate unread count for user across all their conversations
   */
  public static async getUnreadCount(user: { id: string; role: UserRole; sellerId?: string }): Promise<number> {
    const convs = await this.getUserConversations(user);
    let totalUnread = 0;

    for (const c of convs) {
      if (c.buyerId === user.id) {
        totalUnread += c.buyerUnreadCount || 0;
      }
      if ((user.sellerId && c.sellerId === user.sellerId) || c.sellerId === user.id) {
        totalUnread += c.sellerUnreadCount || 0;
      }
    }

    return totalUnread;
  }
}
