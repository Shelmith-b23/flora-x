import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  MessageSquare,
  Send,
  RefreshCw,
  User,
  Search,
  Phone,
  Mail,
  ExternalLink,
  ChevronLeft,
  Lock,
  ShoppingBag,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  CheckCheck,
  AlertCircle
} from 'lucide-react';

interface Message {
  id: string;
  conversationId: string;
  isOwn: boolean;
  body: string;
  senderName: string;
  senderRole?: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  floristId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  orderId?: string | null;
  status?: string;
}

interface MessagesViewProps {
  verificationStatus?: string;
  initialConvoId?: string | null;
  setActiveTab?: (tab: string) => void;
  onSelectOrder?: (orderId: string) => void;
}

export default function MessagesView({
  verificationStatus = 'approved',
  initialConvoId = null,
  setActiveTab,
  onSelectOrder
}: MessagesViewProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isRestricted = verificationStatus === 'suspended' || verificationStatus === 'rejected';

  // Load All Conversations
  const loadConversations = (keepActive = false) => {
    setLoading(true);
    axios
      .get('/api/v1/florist/conversations')
      .then((r) => {
        const convList: Conversation[] = r.data || [];
        setConversations(convList);

        if (convList.length > 0) {
          if (initialConvoId) {
            const found = convList.find((c) => c.id === initialConvoId);
            if (found) {
              setActiveConv(found);
              setShowMobileChat(true);
            } else if (!keepActive || !activeConv) {
              setActiveConv(convList[0]);
            }
          } else if (!keepActive || !activeConv) {
            setActiveConv(convList[0]);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load conversations:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadConversations();
  }, [initialConvoId]);

  // Load Messages for Active Conversation
  useEffect(() => {
    if (activeConv) {
      setMessagesLoading(true);
      setSendError(null);
      axios
        .get(`/api/v1/florist/conversations/${activeConv.id}/messages`)
        .then((r) => {
          setMessages(r.data || []);
          setMessagesLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load messages:', err);
          setMessagesLoading(false);
        });
    }
  }, [activeConv]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send Message
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !activeConv || sending) return;

    if (isRestricted) {
      setSendError('Your account is currently restricted. Communication is read-only.');
      return;
    }

    setSending(true);
    setSendError(null);

    try {
      const resp = await axios.post(
        `/api/v1/florist/conversations/${activeConv.id}/messages`,
        { body: newMessage.trim() }
      );

      const createdMsg = resp.data;
      setMessages((prev) => [...prev, createdMsg]);
      setNewMessage('');
      setSending(false);

      // Update last message in list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConv.id
            ? {
                ...c,
                lastMessage: createdMsg.body,
                lastMessageTime: createdMsg.timestamp,
                unread: false
              }
            : c
        )
      );
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setSendError(
        err.response?.data?.error ||
          'Failed to send message. Please verify authorization and try again.'
      );
      setSending(false);
    }
  };

  // Filter conversations
  const filteredConvos = conversations.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      c.customerName.toLowerCase().includes(q) ||
      c.customerEmail.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q) ||
      (c.orderId && c.orderId.toLowerCase().includes(q))
    );
  });

  const formatTime = (iso?: string) => {
    if (!iso) return '';
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString('en-KE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-4">
      {/* Account Restriction Notification */}
      {isRestricted && (
        <div className="bg-rose-950/90 text-rose-100 border border-rose-800 p-3.5 rounded-2xl flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center space-x-2.5">
            <Lock size={16} className="text-rose-400 shrink-0" />
            <span>
              Your florist account is currently restricted ({verificationStatus}). Customer message replies are disabled.
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-210px)] min-h-[500px]">
        {/* LEFT PANEL: CONVERSATIONS DIRECTORY */}
        <div
          className={`bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs flex flex-col h-full overflow-hidden ${
            showMobileChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header & Search */}
          <div className="space-y-3 pb-3 border-b border-stone-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare size={18} className="text-[#2D5A27]" />
                <h3 className="font-serif font-bold text-stone-900 text-sm">
                  Customer Direct Threads
                </h3>
              </div>
              <button
                onClick={() => loadConversations(true)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                title="Refresh Threads"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin text-[#2D5A27]' : ''} />
              </button>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search threads, customer, order..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] bg-[#FAF9F6]"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto space-y-2 pt-3 scrollbar-thin">
            {loading ? (
              <div className="py-12 text-center text-stone-400 text-xs space-y-2">
                <RefreshCw size={20} className="animate-spin text-[#2D5A27] mx-auto" />
                <p>Loading active threads...</p>
              </div>
            ) : filteredConvos.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs space-y-1">
                <p className="font-medium text-stone-600">No threads found</p>
                <p className="text-[11px]">
                  {searchQuery ? `No matches for "${searchQuery}"` : 'Customer inquiries will appear here.'}
                </p>
              </div>
            ) : (
              filteredConvos.map((c) => {
                const isActive = activeConv?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveConv(c);
                      setShowMobileChat(true);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-emerald-50/70 border-[#2D5A27]/40 shadow-2xs'
                        : 'border-stone-100 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif font-bold text-xs text-stone-900 truncate">
                        {c.customerName}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono shrink-0">
                        {formatTime(c.lastMessageTime)}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-500 truncate">{c.lastMessage}</p>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-100/60">
                      {c.orderId ? (
                        <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                          #{c.orderId}
                        </span>
                      ) : (
                        <span className="text-[9px] text-stone-400">Direct Chat</span>
                      )}

                      {c.unread && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: ACTIVE MESSAGING WORKSPACE */}
        <div
          className={`bg-white rounded-2xl border border-stone-200/80 shadow-xs md:col-span-2 flex flex-col h-full overflow-hidden ${
            showMobileChat ? 'flex' : 'hidden md:flex'
          }`}
        >
          {activeConv ? (
            <>
              {/* Active Header */}
              <div className="p-4 border-b border-stone-200/80 bg-[#FAF9F6] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden p-1.5 rounded-lg text-stone-500 hover:bg-stone-200/60"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="w-9 h-9 rounded-full bg-[#2D5A27] text-white font-serif font-bold text-xs flex items-center justify-center">
                    {activeConv.customerName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-sm">
                      {activeConv.customerName}
                    </h3>
                    <div className="flex items-center space-x-2 text-[10px] text-stone-500">
                      <a href={`mailto:${activeConv.customerEmail}`} className="hover:underline">
                        {activeConv.customerEmail}
                      </a>
                      {activeConv.customerPhone && (
                        <>
                          <span>•</span>
                          <a href={`tel:${activeConv.customerPhone}`} className="hover:underline">
                            {activeConv.customerPhone}
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Related Order Shortcut */}
                {activeConv.orderId && onSelectOrder && setActiveTab && (
                  <button
                    onClick={() => {
                      onSelectOrder(activeConv.orderId!);
                      setActiveTab('orders');
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-stone-200 hover:border-[#2D5A27] bg-white text-stone-700 hover:text-[#2D5A27] text-[11px] font-medium transition-colors shadow-2xs flex items-center space-x-1.5"
                  >
                    <ShoppingBag size={13} className="text-[#2D5A27]" />
                    <span className="hidden sm:inline">Order</span>
                    <span className="font-mono">#{activeConv.orderId}</span>
                    <ArrowUpRight size={12} />
                  </button>
                )}
              </div>

              {/* Message History Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50/40">
                {messagesLoading ? (
                  <div className="py-12 text-center text-stone-400 text-xs">
                    <RefreshCw size={20} className="animate-spin text-[#2D5A27] mx-auto mb-2" />
                    <span>Retrieving message transcript...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-16 text-center text-stone-400 text-xs space-y-2">
                    <MessageSquare size={32} className="mx-auto text-stone-300" />
                    <p>No messages in this thread yet.</p>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          m.isOwn
                            ? 'bg-[#2D5A27] text-white rounded-br-none'
                            : 'bg-white border border-stone-200 text-stone-800 rounded-bl-none'
                        }`}
                      >
                        <div className="flex items-center justify-between space-x-3 mb-1 text-[10px] opacity-80 border-b border-current/10 pb-1">
                          <span className="font-bold">{m.senderName || (m.isOwn ? 'Florist Atelier' : 'Client')}</span>
                          <span className="font-mono">{formatTime(m.timestamp)}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{m.body}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer Area */}
              <div className="p-3 border-t border-stone-200 bg-[#FAF9F6]">
                {sendError && (
                  <div className="mb-2 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <AlertCircle size={13} className="text-rose-600 shrink-0" />
                      <span>{sendError}</span>
                    </div>
                    <button
                      onClick={() => setSendError(null)}
                      className="text-rose-600 font-bold px-1"
                    >
                      ×
                    </button>
                  </div>
                )}

                <form
                  onSubmit={handleSend}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="text"
                    disabled={isRestricted || sending}
                    placeholder={
                      isRestricted
                        ? 'Account restricted (read-only mode)'
                        : 'Type your message to customer...'
                    }
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2D5A27] bg-white disabled:bg-stone-100 disabled:text-stone-400"
                  />
                  <button
                    type="submit"
                    disabled={isRestricted || sending || !newMessage.trim()}
                    className="bg-[#2D5A27] hover:bg-[#23471f] text-white rounded-xl px-4 py-2.5 flex items-center justify-center transition-colors shadow-xs disabled:bg-stone-300 disabled:cursor-not-allowed shrink-0"
                  >
                    {sending ? (
                      <RefreshCw size={15} className="animate-spin" />
                    ) : (
                      <Send size={15} />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="text-center py-24 text-stone-400 space-y-2 my-auto p-6">
              <MessageSquare size={40} className="mx-auto text-stone-300" />
              <h3 className="font-serif font-bold text-stone-700 text-sm">
                No Thread Selected
              </h3>
              <p className="text-xs max-w-xs mx-auto text-stone-500">
                Choose a conversation from the direct customer thread directory on the left.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
