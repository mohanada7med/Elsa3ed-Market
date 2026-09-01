import { Router } from 'express';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.ts';
import { ChatService } from '../services/chatService.ts';
import { chatRealtimeService } from '../services/chatRealtimeService.ts';
import { Logger } from '../utils/logger.ts';

const router = Router();

// Middleware: Require authentication for all chat routes
function requireAuth(req: AuthenticatedRequest, res: Response, next: Function) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      error: 'AUTHENTICATION_REQUIRED',
      message: 'يرجى تسجيل الدخول للوصول إلى خدمة المحادثة الحية'
    });
  }
  next();
}

/**
 * 1. GET /api/chat/stream
 * Real-time SSE channel for live message pushes and read receipts
 */
router.get('/stream', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  chatRealtimeService.registerClient(userId, res);
});

/**
 * 2. GET /api/chat/unread-count
 * Returns the total unread messages count for current user
 */
router.get('/unread-count', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const unreadCount = await ChatService.getUnreadCount(req.user!);
    return res.json({
      success: true,
      unreadCount
    });
  } catch (error: any) {
    Logger.error('[ChatAPI] Error getting unread count:', error);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'فشل استرجاع عدد الرسائل غير المقروءة'
    });
  }
});

/**
 * 3. GET /api/chat/conversations
 * Returns list of conversations for current user
 */
router.get('/conversations', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const conversations = await ChatService.getUserConversations(req.user!);
    return res.json({
      success: true,
      data: conversations
    });
  } catch (error: any) {
    Logger.error('[ChatAPI] Error fetching conversations:', error);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'فشل تحميل المحادثات'
    });
  }
});

/**
 * 4. POST /api/chat/conversations
 * Start or retrieve a conversation with a seller (business context: product or order)
 */
router.post('/conversations', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sellerId, productId, orderId, initialMessage } = req.body;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_SELLER_ID',
        message: 'معرف الورشة أو البائع مطلوب لبدء المحادثة'
      });
    }

    // Prevent user from creating conversation with themselves
    if (req.user!.sellerId === sellerId || req.user!.id === sellerId) {
      return res.status(400).json({
        success: false,
        error: 'SELF_CONVERSATION',
        message: 'لا يمكنك بدء محادثة مع حسابك الخاص'
      });
    }

    const conversation = await ChatService.getOrCreateConversation({
      buyerId: req.user!.id,
      buyerName: req.user!.name || req.user!.username,
      buyerAvatar: req.user!.avatar || req.user!.profileImage?.secureUrl,
      sellerId,
      productId,
      orderId,
      initialMessage
    });

    return res.json({
      success: true,
      data: conversation
    });
  } catch (error: any) {
    Logger.error('[ChatAPI] Error creating conversation:', error);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'فشل بدء المحادثة'
    });
  }
});

/**
 * 5. GET /api/chat/conversations/:id
 * Retrieve a specific conversation details
 */
router.get('/conversations/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const conversation = await ChatService.getConversationById(req.params.id, req.user!);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'المحادثة غير موجودة'
      });
    }
    return res.json({
      success: true,
      data: conversation
    });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN_ACCESS') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'ليس لديك صلاحية الوصول إلى هذه المحادثة'
      });
    }
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'فشل جلب بيانات المحادثة'
    });
  }
});

/**
 * 6. GET /api/chat/conversations/:id/messages
 * Retrieve messages in a conversation
 */
router.get('/conversations/:id/messages', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const before = req.query.before as string | undefined;

    const messages = await ChatService.getMessages(req.params.id, req.user!, limit, before);
    return res.json({
      success: true,
      data: messages
    });
  } catch (error: any) {
    if (error.message === 'FORBIDDEN_ACCESS') {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'ليس لديك صلاحية الوصول إلى هذه الرسائل'
      });
    }
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'فشل جلب الرسائل'
    });
  }
});

/**
 * 7. POST /api/chat/conversations/:id/messages
 * Send a message in a conversation
 */
router.post('/conversations/:id/messages', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { text, messageType } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: 'EMPTY_TEXT',
        message: 'نص الرسالة لا يمكن أن يكون فارغاً'
      });
    }

    const result = await ChatService.sendMessage({
      conversationId: req.params.id,
      senderId: req.user!.id,
      senderName: req.user!.name || req.user!.username || 'مستخدم',
      senderRole: req.user!.role,
      senderSellerId: req.user!.sellerId,
      text,
      messageType
    });

    return res.json({
      success: true,
      data: result.message,
      conversation: result.conversation
    });
  } catch (error: any) {
    if (error.message === 'CONVERSATION_NOT_FOUND') {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'المحادثة غير موجودة' });
    }
    if (error.message === 'CONVERSATION_BLOCKED') {
      return res.status(403).json({ success: false, error: 'BLOCKED', message: 'هذه المحادثة محظورة حالياً' });
    }
    if (error.message === 'FORBIDDEN_SENDER') {
      return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'غير مصرح لك بالإرسال في هذه المحادثة' });
    }
    if (error.message.includes('MESSAGE_TOO_LONG')) {
      return res.status(400).json({ success: false, error: 'TOO_LONG', message: 'الرسالة طويلة جداً (الحد الأقصى 2000 حرف)' });
    }
    Logger.error('[ChatAPI] Error sending message:', error);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'فشل إرسال الرسالة'
    });
  }
});

/**
 * 8. PATCH /api/chat/conversations/:id/read
 * Mark messages in conversation as read
 */
router.patch('/conversations/:id/read', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await ChatService.markConversationRead(req.params.id, req.user!);
    return res.json({
      success: true,
      readCount: result.readCount
    });
  } catch (error: any) {
    Logger.error('[ChatAPI] Error marking conversation read:', error);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'فشل تحديث حالة القراءة'
    });
  }
});

export default router;
