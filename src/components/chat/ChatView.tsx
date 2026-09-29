import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  Package,
  ShoppingBag,
  Check,
  CheckCheck,
  Search,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ChevronRight,
  User,
  Store,
  Headphones,
  Lock,
  ArrowUp,
  Plus,
  Trash2,
  Archive,
  Ban,
  Eraser,
  AlertTriangle,
  ShieldAlert,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import type { Conversation, ChatMessage } from '../../types.ts';

const BUYER_QUICK_INQUIRIES = [
  'عايز استفسر عن خامات القطعة وموعد الشحن',
  'هل متاح تنفيذ طلب مخصص أو تعديل في المقاسات؟',
  'متابعة حالة شحن وتوصيل طلبي',
  'استفسار بخصوص الدفع والضمان التراثي'
];

const SELLER_QUICK_INQUIRIES = [
  'استفسار بخصوص تحويل المستحقات والأرباح',
  'طلب اعتماد ومراجعة منتج حرفي جديد',
  'استفسار حول شحن وتوصيل طلب للزبون',
  'طلب مساعدة فنية في إعدادات متجر الورشة'
];

const ADMIN_QUICK_REPLIES = [
  'أهلاً بك، كيف يمكن لإدارة منصة وَه مساعدتك اليوم؟',
  'تم استلام استفسارك وجارٍ مراجعته مع الفريق المختص.',
  'طلبك قيد المتابعة حالياً وسيتم إفادتك خلال لحظات.',
  'شكراً لتواصلك مع إدارة منصة وَه، نحن هنا لمساعدتك.'
];

interface ChatViewProps {
  isSellerMode?: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({ isSellerMode = false }) => {
  const {
    currentUser,
    currentRole,
    activeConversationId,
    setActiveConversationId,
    navigateToProduct,
    navigateToOrder,
    refreshChatUnreadCount,
    addToast,
    confirmModal
  } = useApp();

  const isAdmin = currentRole === 'admin';
  const isSeller = isSellerMode || currentRole === 'seller';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isStartingNewChat, setIsStartingNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'buyers' | 'sellers' | 'orders'>('all');
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const fetchConversations = useCallback(async (silent = false) => {
    if (!currentUser?.id) return;
    if (!silent) setIsLoadingConvs(true);
    try {
      const data = await api.getConversations({
        id: currentUser.id,
        role: currentRole,
        sellerId: currentUser.sellerId || currentUser.id
      });
      setConversations(data);
    } catch (err: any) {
      if (!silent) console.error('[ChatView] فشل في تحميل المحادثات:', err);
    } finally {
      if (!silent) setIsLoadingConvs(false);
    }
  }, [currentUser, currentRole]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (conversations.length === 0) {
      if (!isLoadingConvs) setSelectedConv(null);
      return;
    }
    if (activeConversationId) {
      const target = conversations.find((c) => c.id === activeConversationId);
      if (target) {
        setSelectedConv(target);
        return;
      }
    }
    if (typeof window !== 'undefined' && window.innerWidth >= 768 && !selectedConv) {
      setSelectedConv(conversations[0]);
    }
  }, [conversations, activeConversationId, isLoadingConvs]);

  const loadMessages = useCallback(async (convId: string, silent = false) => {
    if (!currentUser?.id || !convId) return;
    if (!silent) setIsLoadingMessages(true);
    try {
      const msgs = await api.getMessages(convId, {
        id: currentUser.id,
        role: currentRole,
        sellerId: currentUser.sellerId || currentUser.id
      });
      setMessages(msgs);

      await api.markConversationRead(convId, {
        id: currentUser.id,
        role: currentRole,
        sellerId: currentUser.sellerId || currentUser.id
      });
      refreshChatUnreadCount();

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === convId) {
            if (isAdmin) {
              return c.buyerId === 'admin' ? { ...c, buyerUnreadCount: 0 } : { ...c, sellerUnreadCount: 0 };
            }
            return isSeller ? { ...c, sellerUnreadCount: 0 } : { ...c, buyerUnreadCount: 0 };
          }
          return c;
        })
      );
    } catch (err: any) {
      console.error('[ChatView] عطل في تحميل الرسائل:', err);
    } finally {
      if (!silent) setIsLoadingMessages(false);
    }
  }, [currentUser, currentRole, isAdmin, isSeller, refreshChatUnreadCount]);

  useEffect(() => {
    if (selectedConv?.id) {
      loadMessages(selectedConv.id);
    } else {
      setMessages([]);
    }
  }, [selectedConv?.id, loadMessages]);

  useEffect(() => {
    if (!currentUser?.id || typeof window === 'undefined') return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('saeed_auth_token') : null;
    const url = token ? `/api/chat/stream?token=${encodeURIComponent(token)}` : '/api/chat/stream';
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(url);

      // 1. استقبال رسالة جديدة
      eventSource.addEventListener('chat:new_message', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          const newMsg: ChatMessage = data.message;
          const updatedConv: Conversation = data.conversation;

          if (updatedConv) {
            setConversations((prev) => {
              const idx = prev.findIndex((c) => c.id === updatedConv.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = updatedConv;
                return next.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
              }
              return [updatedConv, ...prev];
            });
          }

          if (selectedConv && newMsg.conversationId === selectedConv.id) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });

            if (newMsg.senderId !== currentUser.id) {
              api.markConversationRead(selectedConv.id, {
                id: currentUser.id,
                role: currentRole,
                sellerId: currentUser.sellerId || currentUser.id
              }).catch(() => { });
            }
          }
        } catch (err) {
          console.error('[ChatView] خطأ أثناء استقبال البث:', err);
        }
      });

      // 2. تحديث قراءة الرسائل
      eventSource.addEventListener('chat:message_read', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          if (selectedConv && data.conversationId === selectedConv.id) {
            setMessages((prev) =>
              prev.map((m) => (m.senderId === currentUser.id ? { ...m, isRead: true, readAt: data.readAt } : m))
            );
          }
        } catch { }
      });

      // 3. حذف محادثة نهائياً بواسطة الإدارة
      eventSource.addEventListener('chat:conversation_deleted', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          const { conversationId } = data;
          setConversations((prev) => prev.filter((c) => c.id !== conversationId));
          setSelectedConv((curr) => {
            if (curr?.id === conversationId) {
              setActiveConversationId(null);
              return null;
            }
            return curr;
          });
        } catch (err) {
          console.error('[ChatView] عطل في معالجة حذف المحادثة:', err);
        }
      });

      // 4. حذف رسالة فردية نهائياً بواسطة الإدارة
      eventSource.addEventListener('chat:message_deleted', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          const { messageId } = data;
          setMessages((prev) => prev.filter((m) => m.id !== messageId));
        } catch (err) {
          console.error('[ChatView] عطل في معالجة حذف الرسالة:', err);
        }
      });

      // 5. إفراغ سجل المحادثة بواسطة الإدارة
      eventSource.addEventListener('chat:conversation_cleared', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          const { conversationId } = data;
          if (selectedConv && selectedConv.id === conversationId) {
            setMessages([]);
          }
          setConversations((prev) =>
            prev.map((c) => (c.id === conversationId ? { ...c, lastMessageText: 'تم مسح سجل الرسائل بواسطة الإدارة' } : c))
          );
        } catch (err) {
          console.error('[ChatView] عطل في معالجة إفراغ المحادثة:', err);
        }
      });

      // 6. تحديث بيانات أو حالة المحادثة
      eventSource.addEventListener('chat:conversation_updated', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          const { conversation } = data;
          if (conversation) {
            setConversations((prev) =>
              prev.map((c) => (c.id === conversation.id ? conversation : c))
            );
            setSelectedConv((curr) => (curr?.id === conversation.id ? conversation : curr));
          }
        } catch (err) {
          console.error('[ChatView] عطل في تحديث المحادثة:', err);
        }
      });

      // 7. مسح كافة المحادثات من المنصة
      eventSource.addEventListener('chat:all_deleted', () => {
        setConversations([]);
        setSelectedConv(null);
        setActiveConversationId(null);
        setMessages([]);
      });

    } catch (err) {
      console.warn('[ChatView] تعذر فتح البث المباشر:', err);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [currentUser?.id, currentRole, selectedConv, setActiveConversationId]);

  // حذف محادثة نهائياً من قاعدة البيانات (صلاحية الأدمن)
  const handleDeleteConversation = (e: React.MouseEvent, convId: string, partnerName: string) => {
    e.stopPropagation();
    confirmModal({
      title: 'حذف المحادثة نهائياً من قاعدة البيانات',
      message: `تحذير: سيتم حذف محادثة "${partnerName}" وكافة الرسائل التابعة لها نهائياً من قاعدة البيانات (MongoDB). هذا الإجراء غير قابل للتراجع. هل أنت متأكد؟`,
      confirmText: 'نعم، احذف المحادثة من الداتا بيز',
      danger: true,
      onConfirm: async () => {
        try {
          await api.deleteConversation(convId, { id: currentUser?.id, role: currentRole });
          setConversations((prev) => prev.filter((c) => c.id !== convId));
          if (selectedConv?.id === convId) {
            setSelectedConv(null);
            setActiveConversationId(null);
            setMessages([]);
          }
          addToast('إدارة المحادثات', 'تم حذف المحادثة وسجلها نهائياً من قاعدة البيانات بنجاح', 'success');
        } catch (err: any) {
          addToast('خطأ في الحذف', err.message || 'تعذر حذف المحادثة من قاعدة البيانات', 'error');
        }
      }
    });
  };

  // مسح جميع الشاتات والمحادثات بالكامل من قاعدة البيانات (صلاحية الأدمن)
  const handleWipeAllConversations = () => {
    confirmModal({
      title: 'مسح شامل لكافة المحادثات من قاعدة البيانات',
      message: 'تحذير شديد الخطورة: سيتم حذف كافة المحادثات والرسائل لجميع الزبائن والورش من قاعدة البيانات نهائياً وتفريغ سجل المراسلات بالكامل! هل أنت متأكد من تنفيذ هذا المسح الشامل؟',
      confirmText: 'نعم، امسح كل الشاتات نهائياً',
      danger: true,
      onConfirm: async () => {
        try {
          await api.deleteAllConversations({ id: currentUser?.id, role: currentRole });
          setConversations([]);
          setSelectedConv(null);
          setActiveConversationId(null);
          setMessages([]);
          addToast('إدارة المحادثات', 'تم مسح وتفريغ كافة المحادثات من قاعدة البيانات بنجاح', 'success');
        } catch (err: any) {
          addToast('خطأ', err.message || 'فشل مسح المحادثات', 'error');
        }
      }
    });
  };

  // إفراغ سجل رسائل المحادثة الحالية (صلاحية الأدمن)
  const handleClearActiveConversation = () => {
    if (!selectedConv) return;
    confirmModal({
      title: 'إفراغ سجل المحادثة بالكامل',
      message: 'هل تريد حذف جميع الرسائل السابقة داخل هذه المحادثة من قاعدة البيانات مع الإبقاء على نافذة المحادثة قائمة؟',
      confirmText: 'نعم، إفراغ الرسائل',
      danger: true,
      onConfirm: async () => {
        try {
          await api.clearConversationMessages(selectedConv.id, { id: currentUser?.id, role: currentRole });
          setMessages([]);
          setConversations((prev) =>
            prev.map((c) => (c.id === selectedConv.id ? { ...c, lastMessageText: 'تم مسح سجل الرسائل بواسطة الإدارة' } : c))
          );
          addToast('إدارة المحادثات', 'تم مسح جميع رسائل المحادثة بنجاح', 'success');
        } catch (err: any) {
          addToast('خطأ', err.message || 'تعذر إفراغ المحادثة', 'error');
        }
      }
    });
  };

  // حذف رسالة فردية محددة نهائياً من قاعدة البيانات (صلاحية الأدمن)
  const handleDeleteMessage = (messageId: string) => {
    confirmModal({
      title: 'حذف الرسالة نهائياً',
      message: 'هل أنت متأكد من حذف هذه الرسالة نهائياً من قاعدة البيانات؟',
      confirmText: 'نعم، احذف الرسالة',
      danger: true,
      onConfirm: async () => {
        try {
          await api.deleteChatMessage(messageId, { id: currentUser?.id, role: currentRole });
          setMessages((prev) => prev.filter((m) => m.id !== messageId));
          addToast('إدارة المحادثات', 'تم حذف الرسالة بنجاح من قاعدة البيانات', 'success');
        } catch (err: any) {
          addToast('خطأ', err.message || 'تعذر حذف الرسالة', 'error');
        }
      }
    });
  };

  // تحديث حالة المحادثة (نشطة / مؤرشفة / محظورة) (صلاحية الأدمن)
  const handleUpdateStatus = async (status: 'active' | 'archived' | 'blocked') => {
    if (!selectedConv) return;
    try {
      const updated = await api.updateConversationStatus(selectedConv.id, status, {
        id: currentUser?.id,
        role: currentRole
      });
      setSelectedConv(updated);
      setConversations((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setAdminMenuOpen(false);
      const label = status === 'active' ? 'نشطة' : status === 'archived' ? 'مؤرشفة' : 'محظورة';
      addToast('حالة المحادثة', `تم تغيير حالة المحادثة إلى (${label}) بنجاح`, 'success');
    } catch (err: any) {
      addToast('خطأ', err.message || 'تعذر تغيير حالة المحادثة', 'error');
    }
  };

  const handleStartNewAdminChat = async (initialTopic?: string) => {
    if (!currentUser?.id || isStartingNewChat) return;

    // إذا كان للمستخدم محادثة سابقة مع الإدارة، نحددها ونفتحها مباشرة لنواصل فيها
    if (!isAdmin && conversations.length > 0) {
      const existing = conversations[0];
      setSelectedConv(existing);
      setActiveConversationId(existing.id);
      inputRef.current?.focus();
      return;
    }

    setIsStartingNewChat(true);
    try {
      const msg = initialTopic || (isAdmin ? 'مرحباً، أود بدء محادثة دعم فني' : 'السلام عليكم، أود التواصل مع إدارة منصة وَه');
      const conv = await api.getOrCreateConversation(
        { sellerId: 'admin', initialMessage: msg },
        { id: currentUser.id, role: currentRole, sellerId: currentUser.sellerId || currentUser.id }
      );
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === conv.id);
        if (exists) return prev;
        return [conv, ...prev];
      });
      setSelectedConv(conv);
      setActiveConversationId(conv.id);
      addToast('محادثة الدعم الفني', 'تم فتح محادثة التواصل المباشر مع إدارة المنصة', 'success');
    } catch (err: any) {
      addToast('عطل في بدء المحادثة', err?.message || 'تعذر بدء المحادثة حالياً', 'error');
    } finally {
      setIsStartingNewChat(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !selectedConv || isSending) return;

    setIsSending(true);
    setInputText('');

    try {
      const res = await api.sendMessage(
        selectedConv.id,
        { text },
        { id: currentUser.id, role: currentRole, sellerId: currentUser.sellerId || currentUser.id }
      );

      setMessages((prev) => {
        if (prev.some((m) => m.id === res.message.id)) return prev;
        return [...prev, res.message];
      });

      setConversations((prev) => {
        const next = prev.map((c) => (c.id === selectedConv.id ? res.conversation : c));
        return next.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });

      inputRef.current?.focus();
    } catch (err: any) {
      addToast('مشكلة في الإرسال', err?.message || 'الرسالة لم تصل، حاول مجدداً', 'error');
      setInputText(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const partnerName = isAdmin
      ? (c.buyerId === 'admin' ? c.sellerName : c.buyerName)
      : (isSeller ? c.buyerName : c.sellerName);

    const matchesSearch =
      partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.productTitle && c.productTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.orderNumber && c.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.lastMessageText && c.lastMessageText.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterType === 'buyers') return c.sellerId === 'admin' || c.conversationType === 'buyer_support';
    if (filterType === 'sellers') return c.buyerId === 'admin' || c.conversationType === 'seller_support';
    if (filterType === 'orders') return Boolean(c.orderId);
    return true;
  });

  let displayPartnerName = 'إدارة منصة وَه';
  let displayPartnerAvatar = '';
  let displayPartnerRoleLabel = 'الدعم الرسمي';
  let isPartnerAdmin = false;

  if (selectedConv) {
    if (isAdmin) {
      if (selectedConv.buyerId === 'admin') {
        displayPartnerName = selectedConv.sellerName || 'ورشة الحرفي';
        displayPartnerAvatar = selectedConv.sellerAvatar || '';
        displayPartnerRoleLabel = 'ورشة حرفية';
      } else {
        displayPartnerName = selectedConv.buyerName || 'عميل المنصة';
        displayPartnerAvatar = selectedConv.buyerAvatar || '';
        displayPartnerRoleLabel = 'مشتري';
      }
    } else {
      displayPartnerName = 'إدارة منصة وَه';
      displayPartnerAvatar = '';
      displayPartnerRoleLabel = 'الدعم الفني المعتمد';
      isPartnerAdmin = true;
    }
  }

  const activeQuickInquiries = isAdmin
    ? ADMIN_QUICK_REPLIES
    : (isSeller ? SELLER_QUICK_INQUIRIES : BUYER_QUICK_INQUIRIES);

  return (
    <div
      id="chat-center-view"
      className="w-full h-[100dvh] md:h-[calc(100vh-2rem)] md:max-w-7xl md:mx-auto md:p-3 flex flex-col font-sans select-none text-stone-850 dark:text-stone-100"
      dir="rtl"
    >
      <div className="w-full h-full bg-[#FFF9EE] dark:bg-[#1B1009] border border-amber-900/15 dark:border-amber-900/40 md:rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative transition-colors duration-200">

        {/* الشريط الجانبي لقائمة المحادثات */}
        <aside
          className={`w-full md:w-80 lg:w-96 shrink-0 flex flex-col bg-[#f5ede3] dark:bg-[#1f1813] border-l border-amber-900/10 dark:border-amber-950/60 h-full transition-colors duration-200 ${selectedConv ? 'hidden md:flex' : 'flex'
            }`}
        >
          <div className="p-3.5 sm:p-4 border-b border-amber-900/10 dark:border-amber-900/30 space-y-3 bg-[#ede2d5]/70 dark:bg-[#241c16]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 p-0.5 shadow-md shadow-amber-600/20">
                  <div className="w-full h-full bg-[#faf6f0] dark:bg-[#1b1512] rounded-[10px] flex items-center justify-center text-amber-700 dark:text-amber-400">
                    <Headphones className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h2 className="text-sm font-black text-stone-900 dark:text-amber-100">مراسلات وَه</h2>
                  <p className="text-[10px] text-amber-800/60 dark:text-amber-200/50 font-medium">تواصل مباشر ومحمي</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {!isAdmin && (
                  <button
                    onClick={() => handleStartNewAdminChat()}
                    disabled={isStartingNewChat}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white dark:text-[#1b1512] font-black text-xs transition shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{conversations.length > 0 ? 'متابعة الدعم' : 'محادثة جديدة'}</span>
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={handleWipeAllConversations}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 transition cursor-pointer shadow-xs active:scale-95"
                    title="مسح كافة المحادثات نهائياً من قاعدة البيانات"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => fetchConversations()}
                  className="p-2 rounded-xl bg-white/70 dark:bg-[#2d221a] hover:bg-white dark:hover:bg-[#382b21] active:rotate-180 duration-300 text-stone-700 dark:text-amber-200/80 border border-amber-900/10 dark:border-amber-900/30 transition cursor-pointer shadow-xs"
                  title="تحديث"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، الطلب، أو المنتج..."
                className="w-full bg-white dark:bg-[#18120e] text-xs text-stone-900 dark:text-amber-100 placeholder-stone-400 dark:placeholder-amber-200/30 pl-3 pr-9 py-2.5 rounded-xl border border-amber-900/15 dark:border-amber-900/40 focus:border-amber-600 dark:focus:border-amber-500/70 focus:outline-none transition shadow-2xs"
              />
              <Search className="w-4 h-4 text-amber-700/50 dark:text-amber-400/50 absolute right-3 top-3" />
            </div>

            <div className="flex items-center gap-1 p-1 bg-white/60 dark:bg-[#18120e] rounded-xl border border-amber-900/10 dark:border-amber-950/60 text-xs font-bold shadow-2xs">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${filterType === 'all'
                  ? 'bg-amber-700 dark:bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-amber-200/50 hover:text-stone-900 dark:hover:text-amber-100'
                  }`}
              >
                الكل
              </button>
              {isAdmin && (
                <>
                  <button
                    onClick={() => setFilterType('buyers')}
                    className={`flex-1 py-1.5 rounded-lg text-center transition ${filterType === 'buyers'
                      ? 'bg-amber-700 dark:bg-amber-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-amber-200/50 hover:text-stone-900 dark:hover:text-amber-100'
                      }`}
                  >
                    المشترين
                  </button>
                  <button
                    onClick={() => setFilterType('sellers')}
                    className={`flex-1 py-1.5 rounded-lg text-center transition ${filterType === 'sellers'
                      ? 'bg-amber-700 dark:bg-amber-600 text-white shadow-xs'
                      : 'text-stone-600 dark:text-amber-200/50 hover:text-stone-900 dark:hover:text-amber-100'
                      }`}
                  >
                    الورش
                  </button>
                </>
              )}
              <button
                onClick={() => setFilterType('orders')}
                className={`flex-1 py-1.5 rounded-lg text-center transition ${filterType === 'orders'
                  ? 'bg-amber-700 dark:bg-amber-600 text-white shadow-xs'
                  : 'text-stone-600 dark:text-amber-200/50 hover:text-stone-900 dark:hover:text-amber-100'
                  }`}
              >
                طلبات
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {isLoadingConvs ? (
              <div className="h-64 flex flex-col items-center justify-center gap-2 text-stone-400 dark:text-amber-200/40 text-xs">
                <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                <span>جاري تحميل المحادثات...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center gap-2 text-stone-400 dark:text-amber-200/40 text-xs text-center p-4">
                <MessageSquare className="w-7 h-7 text-stone-300 dark:text-amber-900/50" />
                <p>لا توجد رسائل سابقة</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                let otherName = 'إدارة منصة وَه';
                let otherAvatar = '';
                let unread = 0;

                if (isAdmin) {
                  if (conv.buyerId === 'admin') {
                    otherName = conv.sellerName || 'ورشة الحرفي';
                    otherAvatar = conv.sellerAvatar || '';
                    unread = conv.buyerUnreadCount || 0;
                  } else {
                    otherName = conv.buyerName || 'مشتري المنصة';
                    otherAvatar = conv.buyerAvatar || '';
                    unread = conv.sellerUnreadCount || 0;
                  }
                } else {
                  unread = isSeller ? (conv.sellerUnreadCount || 0) : (conv.buyerUnreadCount || 0);
                }

                const isSelected = selectedConv?.id === conv.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedConv(conv);
                      setActiveConversationId(conv.id);
                    }}
                    className={`w-full text-right p-3 rounded-2xl transition flex items-start gap-3 relative cursor-pointer active:scale-[0.99] ${isSelected
                      ? 'bg-amber-100/90 dark:bg-[#2d231c] border-2 border-amber-600/70 dark:border-amber-500/50 shadow-sm'
                      : 'bg-white dark:bg-[#251d17] hover:bg-stone-50 dark:hover:bg-[#2b211a] border border-amber-900/10 dark:border-amber-900/20 shadow-2xs'
                      }`}
                  >
                    <div className="relative shrink-0 mt-0.5">
                      {otherAvatar ? (
                        <img src={otherAvatar} alt={otherName} className="w-11 h-11 rounded-xl object-cover border border-amber-900/20 dark:border-amber-900/40" />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-[#1b1512] border border-amber-300/60 dark:border-amber-700/30 flex items-center justify-center text-amber-800 dark:text-amber-400 font-black">
                          {isAdmin ? <User className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                        </div>
                      )}
                      {unread > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-amber-600 dark:bg-amber-500 text-white dark:text-stone-950 font-black text-[10px] rounded-full flex items-center justify-center ring-2 ring-[#f5ede3] dark:ring-[#1f1813]">
                          {unread}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-amber-50 truncate">{otherName}</span>
                          {conv.status === 'blocked' && (
                            <span className="text-[9px] bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800/40 px-1.5 py-0.2 rounded font-bold shrink-0">
                              محظورة
                            </span>
                          )}
                          {conv.status === 'archived' && (
                            <span className="text-[9px] bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-1.5 py-0.2 rounded font-bold shrink-0">
                              مؤرشفة
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] text-stone-400 dark:text-amber-200/40 font-mono">
                            {conv.lastMessageAt
                              ? new Date(conv.lastMessageAt).toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' })
                              : ''}
                          </span>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteConversation(e, conv.id, otherName)}
                              className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-500/15 rounded-md transition cursor-pointer"
                              title="حذف المحادثة نهائياً من قاعدة البيانات"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mb-1 flex-wrap">
                        {conv.productTitle && (
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-500/10 text-amber-900 dark:text-amber-300 border border-amber-300/50 dark:border-amber-500/20 px-1.5 py-0.5 rounded truncate max-w-[140px] font-medium">
                            {conv.productTitle}
                          </span>
                        )}
                        {conv.orderNumber && (
                          <span className="text-[10px] bg-stone-100 dark:bg-[#362920] text-stone-700 dark:text-amber-200 border border-stone-200 dark:border-amber-800/30 px-1.5 py-0.5 rounded font-mono font-medium">
                            #{conv.orderNumber}
                          </span>
                        )}
                      </div>

                      <p className={`text-xs truncate ${unread > 0 ? 'text-amber-900 dark:text-amber-200 font-bold' : 'text-stone-500 dark:text-amber-200/50'}`}>
                        {conv.lastMessageText || 'محادثة دعم جديدة'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* مساحة عرض المحادثة المفتوحة */}
        <main className={`flex-1 min-w-0 flex flex-col bg-[#faf7f2] dark:bg-[#1B1009] h-full transition-colors duration-200 ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
          {selectedConv ? (
            <>
              <div className="px-3 py-2.5 sm:px-4 sm:py-3 border-b border-amber-900/10 dark:border-amber-900/30 flex items-center justify-between bg-[#f2e9dc]/90 dark:bg-[#211a14]/95 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => {
                      setSelectedConv(null);
                      setActiveConversationId(null);
                    }}
                    className="md:hidden p-2 -mr-1 text-stone-700 dark:text-amber-200 hover:text-black dark:hover:text-white rounded-xl active:bg-amber-900/10 dark:active:bg-amber-900/30 cursor-pointer"
                    aria-label="الرجوع للقائمة"
                  >
                    <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  <div className="relative">
                    {displayPartnerAvatar ? (
                      <img src={displayPartnerAvatar} alt={displayPartnerName} className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-amber-500/40" />
                    ) : (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white dark:text-stone-950 font-black flex items-center justify-center text-xs shadow-md">
                        <img src="/mascot/logo.png" alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#f2e9dc] dark:border-[#211a14] rounded-full" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-xs sm:text-sm text-stone-900 dark:text-amber-50">{displayPartnerName}</h3>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-300/60 dark:border-amber-500/30 font-bold">
                        {displayPartnerRoleLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-stone-500 dark:text-amber-200/50">
                      <Lock className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                      <span>قناة رسمية مشفرة</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedConv.productId && (
                    <button
                      onClick={() => navigateToProduct(selectedConv.productId!)}
                      className="text-[11px] bg-white dark:bg-[#2d221a] hover:bg-stone-50 dark:hover:bg-[#382b21] text-amber-900 dark:text-amber-200 border border-amber-900/15 dark:border-amber-700/40 px-2.5 py-1.5 rounded-xl flex items-center gap-1 font-bold active:scale-95 transition shadow-2xs cursor-pointer"
                    >
                      <ShoppingBag className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span className="hidden sm:inline">القطعة</span>
                    </button>
                  )}
                  {selectedConv.orderId && (
                    <button
                      onClick={() => navigateToOrder(selectedConv.orderId!)}
                      className="text-[11px] bg-white dark:bg-[#2d221a] hover:bg-stone-50 dark:hover:bg-[#382b21] text-amber-900 dark:text-amber-200 border border-amber-900/15 dark:border-amber-700/40 px-2.5 py-1.5 rounded-xl flex items-center gap-1 font-bold active:scale-95 transition shadow-2xs cursor-pointer"
                    >
                      <Package className="w-3 h-3 text-amber-400" />
                      <span className="hidden sm:inline">الطلب</span>
                    </button>
                  )}

                  {isAdmin && (
                    <div className="relative flex items-center gap-1 border-r border-amber-900/15 dark:border-amber-700/30 pr-1.5 mr-0.5">
                      {/* زر إفراغ سجل المحادثة */}
                      <button
                        type="button"
                        onClick={handleClearActiveConversation}
                        className="text-[11px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/30 px-2 py-1.5 rounded-xl flex items-center gap-1 font-bold active:scale-95 transition shadow-2xs cursor-pointer"
                        title="إفراغ سجل رسائل المحادثة"
                      >
                        <Eraser className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span className="hidden md:inline">إفراغ</span>
                      </button>

                      {/* زر حذف المحادثة نهائياً من قاعدة البيانات */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteConversation(e, selectedConv.id, displayPartnerName)}
                        className="text-[11px] bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30 px-2 py-1.5 rounded-xl flex items-center gap-1 font-bold active:scale-95 transition shadow-2xs cursor-pointer"
                        title="حذف المحادثة نهائياً من قاعدة البيانات"
                      >
                        <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                        <span className="hidden md:inline">حذف</span>
                      </button>

                      {/* قائمة التحكم بالحالة للأدمن */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                          className={`text-[11px] border px-2 py-1.5 rounded-xl flex items-center gap-1 font-bold active:scale-95 transition shadow-2xs cursor-pointer ${
                            selectedConv.status === 'blocked'
                              ? 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30'
                              : selectedConv.status === 'archived'
                              ? 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-400/30'
                              : 'bg-white dark:bg-[#2d221a] hover:bg-stone-50 dark:hover:bg-[#382b21] text-stone-700 dark:text-amber-200 border-amber-900/15 dark:border-amber-700/40'
                          }`}
                          title="خيارات وحالة المحادثة"
                        >
                          {selectedConv.status === 'blocked' ? (
                            <Ban className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                          ) : selectedConv.status === 'archived' ? (
                            <Archive className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
                          ) : (
                            <MoreVertical className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {adminMenuOpen && (
                          <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-[#231a14] border border-amber-900/20 dark:border-amber-700/40 rounded-2xl shadow-xl z-50 p-1.5 space-y-1 text-xs">
                            <div className="px-2 py-1 text-[10px] font-black text-amber-800 dark:text-amber-400 border-b border-amber-900/10 dark:border-amber-800/20">
                              تحكم الإدارة في الشات
                            </div>

                            <button
                              onClick={() => handleUpdateStatus('active')}
                              className={`w-full text-right px-2.5 py-1.5 rounded-xl flex items-center gap-2 font-bold transition cursor-pointer ${
                                selectedConv.status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                  : 'hover:bg-stone-100 dark:hover:bg-[#2e221b] text-stone-700 dark:text-stone-300'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>تنشيط المحادثة</span>
                            </button>

                            <button
                              onClick={() => handleUpdateStatus('archived')}
                              className={`w-full text-right px-2.5 py-1.5 rounded-xl flex items-center gap-2 font-bold transition cursor-pointer ${
                                selectedConv.status === 'archived'
                                  ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300'
                                  : 'hover:bg-stone-100 dark:hover:bg-[#2e221b] text-stone-700 dark:text-stone-300'
                              }`}
                            >
                              <Archive className="w-3.5 h-3.5 text-amber-600" />
                              <span>أرشفة المحادثة</span>
                            </button>

                            <button
                              onClick={() => handleUpdateStatus('blocked')}
                              className={`w-full text-right px-2.5 py-1.5 rounded-xl flex items-center gap-2 font-bold transition cursor-pointer ${
                                selectedConv.status === 'blocked'
                                  ? 'bg-red-500/10 text-red-700 dark:text-red-400'
                                  : 'hover:bg-stone-100 dark:hover:bg-[#2e221b] text-red-600 dark:text-red-400'
                              }`}
                            >
                              <Ban className="w-3.5 h-3.5 text-red-600" />
                              <span>حظر المحادثة</span>
                            </button>

                            <div className="border-t border-amber-900/10 dark:border-amber-800/20 pt-1">
                              <button
                                onClick={() => {
                                  setAdminMenuOpen(false);
                                  handleClearActiveConversation();
                                }}
                                className="w-full text-right px-2.5 py-1.5 rounded-xl flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-500/10 transition cursor-pointer"
                              >
                                <Eraser className="w-3.5 h-3.5" />
                                <span>إفراغ الرسائل</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  setAdminMenuOpen(false);
                                  handleDeleteConversation(e, selectedConv.id, displayPartnerName);
                                }}
                                className="w-full text-right px-2.5 py-1.5 rounded-xl flex items-center gap-2 font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>حذف من الداتا بيز</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedConv.status === 'blocked' && (
                <div className="px-3 py-2 bg-red-500/10 border-b border-red-500/20 text-red-700 dark:text-red-400 flex items-center justify-between text-xs shrink-0">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                    <span className="font-bold">هذه المحادثة محظورة حالياً. لا يمكن إرسال رسائل جديدة فيها.</span>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus('active')}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[11px] transition shadow-xs cursor-pointer"
                    >
                      فك الحظر الآن
                    </button>
                  )}
                </div>
              )}

              {(selectedConv.productTitle || selectedConv.orderNumber) && (
                <div className="px-3 py-2 bg-[#eae0d2]/70 dark:bg-[#251d17] border-b border-amber-900/10 dark:border-amber-900/30 flex items-center justify-between gap-2 text-xs shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {selectedConv.productImage && (
                      <img
                        src={selectedConv.productImage}
                        alt={selectedConv.productTitle}
                        className="w-8 h-8 rounded-lg object-cover border border-amber-500/30 shrink-0"
                      />
                    )}
                    <div className="min-w-0 truncate">
                      {selectedConv.productTitle && (
                        <p className="font-bold text-stone-800 dark:text-amber-100 truncate text-[11px] sm:text-xs">
                          القطعة: <span className="text-amber-700 dark:text-amber-400">{selectedConv.productTitle}</span>
                        </p>
                      )}
                      {selectedConv.orderNumber && (
                        <p className="text-[10px] text-stone-500 dark:text-amber-200/60 font-mono">
                          طلب رقم: #{selectedConv.orderNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedConv.productPrice && (
                    <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded font-black text-[10px] sm:text-[11px] shrink-0 border border-amber-300/60 dark:border-amber-500/30">
                      {selectedConv.productPrice} ج.م
                    </span>
                  )}
                </div>
              )}

              {/* حاوية الرسائل */}
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-[#faf7f2] dark:bg-[#1B1009]">
                <div className="w-full px-3 py-4 sm:px-5 sm:py-5 space-y-3">

                  {isLoadingMessages ? (
                    <div className="h-full min-h-[200px] flex flex-col items-center justify-center gap-2 text-stone-400 dark:text-amber-200/40 text-xs">
                      <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                      <span>جاري تحميل الرسائل...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full min-h-[200px] flex flex-col items-center justify-center gap-2 text-stone-500 dark:text-amber-200/40 text-xs p-4 text-center">
                      <Sparkles className="w-7 h-7 text-amber-600 dark:text-amber-500/50 mb-1" />
                      <p className="font-bold text-stone-800 dark:text-amber-100 text-sm">
                        مرحباً بك في المحادثة
                      </p>
                      <p className="text-stone-500 dark:text-amber-200/50 text-[11px]">
                        اكتب استفسارك لإدارة منصة وَه في الأسفل
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.senderId === currentUser.id;
                      const prevMsg = idx > 0 ? messages[idx - 1] : null;
                      const showTime =
                        !prevMsg ||
                        new Date(msg.createdAt).getTime() -
                        new Date(prevMsg.createdAt).getTime() >
                        5 * 60 * 1000;

                      return (
                        <React.Fragment key={msg.id}>
                          {/* التاريخ */}
                          {showTime && (
                            <div className="flex justify-center my-3">
                              <span className="inline-flex items-center text-center text-[10px] text-stone-500 dark:text-amber-200/60 bg-[#ede4d7] dark:bg-[#251d17] px-3.5 py-1 rounded-full border border-amber-900/10 dark:border-amber-900/20 font-medium shadow-2xs">
                                {new Date(msg.createdAt).toLocaleDateString('ar-EG', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </span>
                            </div>
                          )}

                          {/* صف الرسالة */}
                          {isMe ? (
                            /* رسالتي أنا (مرسلة) -> محاذاة لليمين */
                            <div className="flex items-center justify-start w-full my-1.5 group" dir="rtl">
                              <div
                                className="
                                  min-w-0
                                  w-auto
                                  max-w-[85%]
                                  sm:max-w-[75%]
                                  rounded-2xl
                                  rounded-br-xs
                                  px-4
                                  py-2.5
                                  text-xs
                                  sm:text-sm
                                  leading-relaxed
                                  bg-gradient-to-l
                                  from-amber-700
                                  via-amber-800
                                  to-amber-900
                                  text-white
                                  shadow-sm
                                  border
                                  border-amber-600/30
                                "
                              >
                                {/* نص الرسالة */}
                                <div
                                  dir="rtl"
                                  className="w-full whitespace-pre-wrap break-words text-right select-text leading-relaxed"
                                >
                                  {msg.text}
                                </div>

                                {/* الوقت وحالة القراءة */}
                                <div className="flex items-center gap-1.5 justify-end text-[10px] mt-1 text-amber-200/90 font-mono font-medium">
                                  <span>
                                    {new Date(msg.createdAt).toLocaleTimeString('ar-EG', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                  <span className="shrink-0">
                                    {msg.isRead ? (
                                      <CheckCheck className="w-3.5 h-3.5 text-yellow-300" />
                                    ) : (
                                      <Check className="w-3.5 h-3.5 text-amber-200" />
                                    )}
                                  </span>
                                </div>
                              </div>

                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="opacity-70 sm:opacity-0 group-hover:opacity-100 p-1.5 mr-1 text-stone-400 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition cursor-pointer shrink-0 self-center"
                                  title="حذف هذه الرسالة نهائياً من قاعدة البيانات"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ) : (
                            /* رسالة الطرف الآخر (مستلمة) -> محاذاة لليسار مع الأفاتار على أقصى اليسار */
                            <div className="flex items-center gap-2.5 w-full my-1.5 group" dir="ltr">
                              {/* الأفاتار على أقصى اليسار بجانب الرسالة */}
                              <div
                                className="
                                  w-8
                                  h-8
                                  rounded-xl
                                  bg-gradient-to-tr
                                  from-amber-600
                                  to-amber-500
                                  text-white
                                  dark:text-stone-950
                                  flex
                                  items-center
                                  justify-center
                                  text-xs
                                  font-black
                                  shrink-0
                                  shadow-sm
                                  mb-0.5
                                "
                              >
                                {msg.senderRole === 'admin' ? (
                                  <ShieldCheck className="w-4 h-4" />
                                ) : (
                                  msg.senderName?.slice(0, 1) || '؟'
                                )}
                              </div>

                              {/* فقاعة الرسالة بجانب الأفاتار من اليمين ولا تتخطى الحدود */}
                              <div
                                dir="rtl"
                                className="
                                  min-w-0
                                  w-auto
                                  max-w-[85%]
                                  sm:max-w-[75%]
                                  rounded-2xl
                                  rounded-bl-xs
                                  px-4
                                  py-2.5
                                  text-xs
                                  sm:text-sm
                                  leading-relaxed
                                  bg-white
                                  dark:bg-[#251d17]
                                  text-stone-900
                                  dark:text-amber-50
                                  border
                                  border-amber-900/10
                                  dark:border-amber-900/40
                                  shadow-sm
                                "
                              >
                                {/* اسم المرسل */}
                                <div className="text-[11px] font-black text-amber-700 dark:text-amber-400 mb-1 text-right">
                                  {msg.senderRole === 'admin'
                                    ? 'إدارة منصة وَه'
                                    : msg.senderName || 'مستخدم'}
                                </div>

                                {/* نص الرسالة */}
                                <div
                                  dir="rtl"
                                  className="w-full whitespace-pre-wrap break-words text-right select-text leading-relaxed"
                                >
                                  {msg.text}
                                </div>

                                {/* الوقت */}
                                <div className="flex items-center gap-1 justify-end text-[10px] mt-1 text-stone-400 dark:text-amber-200/50 font-mono">
                                  <span>
                                    {new Date(msg.createdAt).toLocaleTimeString('ar-EG', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </div>

                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="opacity-70 sm:opacity-0 group-hover:opacity-100 p-1.5 ml-1 text-stone-400 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition cursor-pointer shrink-0 self-center"
                                  title="حذف هذه الرسالة نهائياً من قاعدة البيانات"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}

                </div>
              </div>              {/* شريط الاقتراحات السريعة */}
              <div className="px-2.5 py-1.5 bg-[#f0e7db] dark:bg-[#1f1813] border-t border-amber-900/10 dark:border-amber-900/30 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                {activeQuickInquiries.map((inq, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(inq)}
                    disabled={selectedConv.status === 'blocked' && !isAdmin}
                    className="bg-white dark:bg-[#2a2019] hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-stone-700 dark:text-amber-200/80 border border-amber-900/10 dark:border-amber-800/40 px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap active:scale-95 transition cursor-pointer shadow-2xs"
                  >
                    {inq}
                  </button>
                ))}
              </div>

              {/* شريط الإدخال والإرسال */}
              <div className="p-2 sm:p-3 bg-[#f2e9dc] dark:bg-[#211a14] border-t border-amber-900/10 dark:border-amber-900/30 pb-safe shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-end gap-2 bg-white dark:bg-[#1B1009] border border-amber-900/15 dark:border-amber-800/40 focus-within:border-amber-600 dark:focus-within:border-amber-500 rounded-2xl p-1.5 transition shadow-2xs"
                >
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={selectedConv.status === 'blocked' && !isAdmin}
                    placeholder={
                      selectedConv.status === 'blocked' && !isAdmin
                        ? 'هذه المحادثة محظورة حالياً من قِبل الإدارة'
                        : 'اكتب رسالتك هنا...'
                    }
                    rows={1}
                    className="flex-1 resize-none bg-transparent py-2 px-3 text-xs sm:text-sm text-stone-900 dark:text-amber-50 placeholder-stone-400 dark:placeholder-amber-200/30 focus:outline-none max-h-24 leading-normal disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={(selectedConv.status === 'blocked' && !isAdmin) || !inputText.trim() || isSending}
                    className="w-10 h-10 bg-gradient-to-tr from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 disabled:opacity-30 disabled:cursor-not-allowed text-white dark:text-[#1B1009] font-black rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 active:scale-90 shadow-sm"
                    title="إرسال"
                  >
                    <ArrowUp className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-500/10 border border-amber-300/50 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 flex items-center justify-center shadow-md">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-stone-900 dark:text-amber-50">مركز محادثات منصة وَه</h3>
                <p className="text-xs text-stone-500 dark:text-amber-200/60 max-w-sm leading-relaxed">
                  اختر محادثة من القائمة الجانبية للاطلاع على تفاصيل الطلبية ومتابعة الردود الفورية
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};