import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  Send,
  Package,
  ShoppingBag,
  Check,
  CheckCheck,
  Search,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import type { Conversation, ChatMessage } from '../../types.ts';

const QUICK_INQUIRIES = [
  'القطعة دي موجودة بالمقاس اللي عاوزه؟',
  'تاخد وقت قد إيه على ما تجهز وتتشحن؟',
  'ينفع نغير الألوان أو نعدل في النقشة؟',
  'إيه الخامات الطبيعية اللي شغّالين بيها؟'
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
    addToast
  } = useApp();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'products' | 'orders'>('all');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // 1. جلب قائمة المحادثات
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
      if (!silent) {
        console.error('[ChatView] فشل في تحميل المحادثات:', err);
      }
    } finally {
      if (!silent) setIsLoadingConvs(false);
    }
  }, [currentUser, currentRole]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 2. اختيار المحادثة المحددة أو النشطة
  useEffect(() => {
    if (conversations.length === 0) {
      if (!isLoadingConvs) {
        setSelectedConv(null);
      }
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

  // 3. جلب الرسايل أول ما نفتح محادثة
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
      setTimeout(() => scrollToBottom('auto'), 100);

      // تعليم الرسايل كمقروءة
      await api.markConversationRead(convId, {
        id: currentUser.id,
        role: currentRole,
        sellerId: currentUser.sellerId || currentUser.id
      });
      refreshChatUnreadCount();

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === convId) {
            const isBuyer = c.buyerId === currentUser.id;
            return isBuyer ? { ...c, buyerUnreadCount: 0 } : { ...c, sellerUnreadCount: 0 };
          }
          return c;
        })
      );
    } catch (err: any) {
      console.error('[ChatView] حصل عطل في تحميل الرسايل:', err);
    } finally {
      if (!silent) setIsLoadingMessages(false);
    }
  }, [currentUser, currentRole, refreshChatUnreadCount, scrollToBottom]);

  useEffect(() => {
    if (selectedConv?.id) {
      loadMessages(selectedConv.id);
    } else {
      setMessages([]);
    }
  }, [selectedConv?.id, loadMessages]);

  // 4. استماع لحظي للرسايل الجديدة
  useEffect(() => {
    if (!currentUser?.id || typeof window === 'undefined') return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('saeed_auth_token') : null;
    const url = token ? `/api/chat/stream?token=${encodeURIComponent(token)}` : '/api/chat/stream';
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(url);

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
            setTimeout(() => scrollToBottom('smooth'), 50);

            if (newMsg.receiverId === currentUser.id) {
              api.markConversationRead(selectedConv.id, {
                id: currentUser.id,
                role: currentRole,
                sellerId: currentUser.sellerId || currentUser.id
              }).catch(() => { });
            }
          }
        } catch (err) {
          console.error('[ChatView] مشكلة في قراءة بيانات الشات:', err);
        }
      });

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
    } catch (err) {
      console.warn('[ChatView] مشكلة في فتح اتصال البث:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [currentUser?.id, currentRole, selectedConv, scrollToBottom]);

  // 5. إرسال الرسالة
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !selectedConv || isSending) return;

    setIsSending(true);
    setInputText('');

    try {
      const res = await api.sendMessage(
        selectedConv.id,
        { text },
        {
          id: currentUser.id,
          role: currentRole,
          sellerId: currentUser.sellerId || currentUser.id
        }
      );

      setMessages((prev) => {
        if (prev.some((m) => m.id === res.message.id)) return prev;
        return [...prev, res.message];
      });

      setConversations((prev) => {
        const next = prev.map((c) => (c.id === selectedConv.id ? res.conversation : c));
        return next.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });

      setTimeout(() => scrollToBottom('smooth'), 50);
      inputRef.current?.focus();
    } catch (err: any) {
      console.error('[ChatView] عطل في الإرسال:', err);
      addToast('مشكلة في الإرسال', err?.message || 'الرسالة موصلتش، جرّب تاني', 'error');
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

  // تصفية المحادثات
  const filteredConversations = conversations.filter((c) => {
    const isBuyer = c.buyerId === currentUser.id;
    const partnerName = isBuyer ? c.sellerName : c.buyerName;
    const matchesSearch =
      partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.productTitle && c.productTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.orderNumber && c.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.lastMessageText && c.lastMessageText.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'products') return Boolean(c.productId);
    if (filterType === 'orders') return Boolean(c.orderId);
    return true;
  });

  const isCurrentBuyer = selectedConv ? selectedConv.buyerId === currentUser.id : true;
  const partnerName = selectedConv ? (isCurrentBuyer ? selectedConv.sellerName : selectedConv.buyerName) : '';
  const partnerAvatar = selectedConv ? (isCurrentBuyer ? selectedConv.sellerAvatar : selectedConv.buyerAvatar) : '';

  return (
    <div id="chat-center-view" className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-6 animate-fadeIn" dir="rtl">
      {/* عنوان الصفحة والمقدمة */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-amber-600 dark:text-[#d6aa72]" />
            {isSellerMode ? 'رسايل ومحادثات الورشة' : 'دردشة حية ومباشرة مع الصنّاع والحرفيين'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            اتكلم علطول مع الحرفي واسأله عن المقاسات، الخامات، أو طلبك المخصوص
          </p>
        </div>

        <button
          onClick={() => fetchConversations()}
          className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          title="حدّث المحادثات"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* صندوق الشات الرئيسي */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col md:flex-row h-[calc(100vh-210px)] min-h-[550px] max-h-[750px]">

        {/* القايمة اليمين: المحادثات */}
        <div
          className={`w-full md:w-80 lg:w-96 border-l border-stone-200 dark:border-stone-800 flex flex-col bg-stone-50/50 dark:bg-stone-900/50 ${selectedConv ? 'hidden md:flex' : 'flex'
            }`}
        >
          {/* شريط البحث والفلترة */}
          <div className="p-3 border-b border-stone-200 dark:border-stone-800 space-y-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="دوّر في الرسايل أو أسماء الصنّاع..."
                className="w-full pl-3 pr-9 py-2 text-xs sm:text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-stone-900 dark:text-stone-100 placeholder-stone-400"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
            </div>

            {/* أزرار الفلترة */}
            <div className="flex gap-1 bg-stone-200/60 dark:bg-stone-800 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 py-1 px-2 rounded-lg transition-all text-center cursor-pointer ${filterType === 'all'
                  ? 'bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-300 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
              >
                الكل ({conversations.length})
              </button>
              <button
                onClick={() => setFilterType('products')}
                className={`flex-1 py-1 px-2 rounded-lg transition-all text-center cursor-pointer ${filterType === 'products'
                  ? 'bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-300 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
              >
                شغل ومنتجات
              </button>
              <button
                onClick={() => setFilterType('orders')}
                className={`flex-1 py-1 px-2 rounded-lg transition-all text-center cursor-pointer ${filterType === 'orders'
                  ? 'bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-300 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
              >
                الطلبيات
              </button>
            </div>
          </div>

          {/* لستة المحادثات */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800/60">
            {isLoadingConvs ? (
              <div className="p-8 text-center text-stone-400 space-y-2">
                <div className="inline-block w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs">بنحمّل المحادثات ثواني...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-stone-400 space-y-3">
                <MessageSquare className="w-10 h-10 mx-auto text-stone-300 dark:text-stone-600" />
                <p className="text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-300">
                  {searchQuery ? 'ملقيناش محادثة تطابق كلامك' : 'لسه مفيش أي رسايل سابقة'}
                </p>
                <p className="text-[11px] text-stone-400 max-w-[200px] mx-auto">
                  تقدر تفتح شات وتدردش مع أي صانع أو حرفي علطول من صفحة المنتج أو الطلب بتاعه
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isBuyer = conv.buyerId === currentUser.id;
                const otherName = isBuyer ? conv.sellerName : conv.buyerName;
                const otherAvatar = isBuyer ? conv.sellerAvatar : conv.buyerAvatar;
                const unread = isBuyer ? conv.buyerUnreadCount : conv.sellerUnreadCount;
                const isSelected = selectedConv?.id === conv.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedConv(conv);
                      setActiveConversationId(conv.id);
                    }}
                    className={`w-full text-right p-3 transition-colors flex items-start gap-3 relative cursor-pointer ${isSelected
                      ? 'bg-amber-50/80 dark:bg-amber-950/20 border-r-4 border-amber-600'
                      : 'hover:bg-stone-100/70 dark:hover:bg-stone-800/40'
                      }`}
                  >
                    {/* الصورة الشخصية */}
                    <div className="relative shrink-0">
                      {otherAvatar ? (
                        <img
                          src={otherAvatar}
                          alt={otherName}
                          className="w-11 h-11 rounded-full object-cover border border-stone-200 dark:border-stone-700"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center text-sm">
                          {otherName ? otherName.slice(0, 2) : 'ص'}
                        </div>
                      )}
                      {unread > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                          {unread}
                        </span>
                      )}
                    </div>

                    {/* تفاصيل المحادثة */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">
                          {otherName}
                        </span>
                        <span className="text-[10px] text-stone-400 shrink-0 mr-1">
                          {conv.lastMessageAt
                            ? new Date(conv.lastMessageAt).toLocaleDateString('ar-EG', {
                              month: 'short',
                              day: 'numeric'
                            })
                            : ''}
                        </span>
                      </div>

                      {/* شارة السياق (منتج أو طلب) */}
                      {conv.productTitle && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-[#d6aa72] mb-0.5 truncate">
                          <ShoppingBag className="w-3 h-3 shrink-0" />
                          <span className="truncate">{conv.productTitle}</span>
                        </div>
                      )}

                      {conv.orderNumber && (
                        <div className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 mb-0.5 truncate">
                          <Package className="w-3 h-3 shrink-0" />
                          <span>طلب رقم: {conv.orderNumber}</span>
                        </div>
                      )}

                      {/* آخر رسالة */}
                      <p
                        className={`text-xs truncate ${unread > 0
                          ? 'font-bold text-stone-900 dark:text-stone-100'
                          : 'text-stone-500 dark:text-stone-400'
                          }`}
                      >
                        {conv.lastMessageText || 'دردشة جديدة'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* الجزء الأيسر: شاشة الشات المفتوحة */}
        <div className={`flex-1 flex flex-col bg-white dark:bg-stone-900 ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
          {selectedConv ? (
            <>
              {/* ترويسة الشات */}
              <div className="p-3 sm:p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-stone-900">
                <div className="flex items-center gap-3">
                  {/* زرار الرجوع للموبايل */}
                  <button
                    onClick={() => {
                      setSelectedConv(null);
                      setActiveConversationId(null);
                    }}
                    className="md:hidden p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
                    title="ارجع لقائمة الرسايل"
                    aria-label="ارجع لقائمة الرسايل"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* الصورة والحالة */}
                  <div className="relative">
                    {partnerAvatar ? (
                      <img
                        src={partnerAvatar}
                        alt={partnerName}
                        className="w-10 h-10 rounded-full object-cover border border-stone-200 dark:border-stone-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center text-sm">
                        {partnerName.slice(0, 2)}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-stone-900 rounded-full"></span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                        {partnerName}
                      </h2>
                      {isCurrentBuyer && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded-full font-medium">
                          <ShieldCheck className="w-3 h-3" />
                          حرفي شاطر ومعتمد
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-400">
                      {isCurrentBuyer ? 'ورشة أصيلة من سوق الصعيد' : 'زبون مسجل'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedConv.productId && (
                    <button
                      onClick={() => navigateToProduct(selectedConv.productId!)}
                      className="text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">شوف القطعة دي</span>
                    </button>
                  )}

                  {selectedConv.orderId && (
                    <button
                      onClick={() => navigateToOrder(selectedConv.orderId!)}
                      className="text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">تفاصيل الطلبية</span>
                    </button>
                  )}
                </div>
              </div>

              {/* شريط معلومات المنتج أو الطلب المتعلق بالمحادثة */}
              {(selectedConv.productTitle || selectedConv.orderNumber) && (
                <div className="bg-amber-50/60 dark:bg-stone-800/40 border-b border-amber-200/40 dark:border-stone-800 p-2.5 px-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {selectedConv.productImage && (
                      <img
                        src={selectedConv.productImage}
                        alt={selectedConv.productTitle}
                        className="w-9 h-9 rounded-lg object-cover border border-stone-200 dark:border-stone-700 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      {selectedConv.productTitle && (
                        <p className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                          الكلام عن: {selectedConv.productTitle}
                          {selectedConv.productPrice && (
                            <span className="text-amber-700 dark:text-[#d6aa72] font-bold mr-2">
                              {selectedConv.productPrice} جنيه
                            </span>
                          )}
                        </p>
                      )}
                      {selectedConv.orderNumber && (
                        <p className="font-semibold text-stone-900 dark:text-stone-100">
                          بخصوص طلبية: <span className="font-mono text-blue-600">#{selectedConv.orderNumber}</span>
                          {selectedConv.orderStatus && (
                            <span className="mr-2 text-[10px] px-1.5 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                              {selectedConv.orderStatus}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] text-stone-400 shrink-0 mr-2 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    شات مرتبط بالطلبية
                  </span>
                </div>
              )}

              {/* مساحة عرض الرسايل */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/30 dark:bg-stone-900/30">
                {isLoadingMessages ? (
                  <div className="p-8 text-center text-stone-400 space-y-2">
                    <div className="inline-block w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs">بنحضّر الرسايل ثانية واحدة...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-8 text-center text-stone-400 space-y-3">
                    <Sparkles className="w-8 h-8 mx-auto text-amber-500/60" />
                    <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                      صبّح أو مسّي على {partnerName} وابدأ كلامك
                    </p>
                    <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                      اسأله براحتك عن أصل الشغل اليدوي، المقاسات المضبوطة، إمكانية تعديل الألوان، أو ميعاد التسليم والشحن لبلدك.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.senderId === currentUser.id;
                    const prevMsg = idx > 0 ? messages[idx - 1] : null;
                    const showTime =
                      !prevMsg ||
                      new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 5 * 60 * 1000;

                    return (
                      <React.Fragment key={msg.id}>
                        {showTime && (
                          <div className="text-center my-2">
                            <span className="text-[10px] text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">
                              {new Date(msg.createdAt).toLocaleTimeString('ar-EG', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}

                        <div className={`flex items-end gap-2 ${isMe ? 'justify-start' : 'justify-end'}`}>
                          {/* فقاعة الرسالة */}
                          <div
                            className={`max-w-[78%] sm:max-w-[65%] rounded-2xl p-3 shadow-xs text-xs sm:text-sm leading-relaxed ${isMe
                              ? 'bg-amber-600 text-white rounded-br-xs'
                              : 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-stone-700/80 rounded-bl-xs'
                              }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                            <div
                              className={`flex items-center gap-1 justify-end text-[10px] mt-1 ${isMe ? 'text-[#d5a56d]' : 'text-stone-400'
                                }`}
                            >
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString('ar-EG', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {isMe && (
                                <span title={msg.isRead ? 'اتقرأت' : 'وصلت'}>
                                  {msg.isRead ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-[#d5a56d]" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 text-amber-300/80" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* أسئلة مقترحة سريعة */}
              {isCurrentBuyer && messages.length <= 2 && (
                <div className="px-3 py-2 bg-stone-50 dark:bg-stone-800/60 border-t border-stone-200/60 dark:border-stone-800 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
                  <span className="text-[10px] text-stone-400 shrink-0 font-medium">أسئلة سريعة:</span>
                  {QUICK_INQUIRIES.map((inq, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(inq)}
                      className="bg-white dark:bg-stone-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-stone-700 dark:text-stone-200 hover:text-amber-800 border border-stone-200 dark:border-stone-600 px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-colors cursor-pointer"
                    >
                      {inq}
                    </button>
                  ))}
                </div>
              )}

              {/* مكان كتابة الرسالة */}
              <div className="p-3 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-end gap-2"
                >
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="اكتب رسالتك للحرفي هنا... (ودوس Enter عشان تبعت)"
                      rows={1}
                      maxLength={2000}
                      className="w-full resize-none py-2.5 px-3.5 bg-stone-100 dark:bg-stone-800 border border-transparent focus:border-amber-500 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 max-h-32 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    className="p-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-xs transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                    title="ابعت"
                  >
                    {isSending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* حالة عدم اختيار محادثة */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-stone-50/40 dark:bg-stone-900/40">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-[#d6aa72] flex items-center justify-center mb-4 shadow-xs">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-1">
                اختر محادثة من القايمة عشان تبدأ كلام
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm leading-relaxed">
                تواصل علطول مع ورش وشيوخ صنايعية الصعيد عشان تعرف تفاصيل الشغل، الخامات، ومتابعة الطلبيات أولاً بأول
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};