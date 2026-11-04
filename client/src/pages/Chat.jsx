import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  Send,
  MessageSquare,
  ArrowRightLeft,
  User as UserIcon,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export const Chat = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const querySwapId = searchParams.get('swapId');

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initialize Socket.io connection
  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_BASE_URL || window.location.origin, {
      withCredentials: true,
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Fetch all conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/api/messages/conversations');
        if (res.data.success) {
          setConversations(res.data.conversations);
          
          if (querySwapId) {
            const found = res.data.conversations.find(
              (c) => c.swapRequest?._id === querySwapId || c.swapRequest === querySwapId
            );
            if (found) {
              setActiveConversation(found);
            } else if (res.data.conversations.length > 0) {
              setActiveConversation(res.data.conversations[0]);
            }
          } else if (res.data.conversations.length > 0) {
            setActiveConversation(res.data.conversations[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [querySwapId]);

  // Load message history when active conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/api/messages/conversations/${activeConversation._id}`);
        if (res.data.success) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    fetchMessages();

    // Join Socket room
    if (socketRef.current) {
      socketRef.current.emit('join_conversation', activeConversation._id);

      const handleNewMessage = (newMsg) => {
        if (newMsg.conversation === activeConversation._id) {
          setMessages((prev) => [...prev, newMsg]);
        }
      };

      socketRef.current.on('new_message', handleNewMessage);

      return () => {
        socketRef.current.emit('leave_conversation', activeConversation._id);
        socketRef.current.off('new_message', handleNewMessage);
      };
    }
  }, [activeConversation]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await api.post(`/api/messages/conversations/${activeConversation._id}`, {
        text,
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.message]);
      }
    } catch (err) {
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (convo) => {
    if (!convo || !convo.participants) return null;
    return convo.participants.find((p) => p._id !== user?._id) || convo.participants[0];
  };

  return (
    <div className="min-h-screen bg-ivory-light py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-earth">
              Direct Negotiation
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest">
              Swap Messaging & Coordination
            </h1>
          </div>
          <Link
            to="/swaps"
            className="text-xs font-semibold text-forest hover:text-earth flex items-center space-x-1"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>View All Swaps</span>
          </Link>
        </div>

        {/* Chat Interface Container */}
        <div className="bg-white rounded-3xl border border-forest/10 shadow-float overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[620px]">
          
          {/* Left Sidebar: Conversations List */}
          <div className="md:col-span-4 border-r border-forest/10 flex flex-col bg-ivory-light">
            <div className="p-4 border-b border-forest/10 font-serif font-bold text-base text-charcoal">
              Conversations ({conversations.length})
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-forest/5">
              {loading ? (
                <div className="p-4 text-xs text-charcoal/60">Loading conversations...</div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-charcoal/60">
                  No conversations yet. When you propose or receive a swap, direct chat appears here!
                </div>
              ) : (
                conversations.map((convo) => {
                  const other = getOtherParticipant(convo);
                  const isSelected = activeConversation?._id === convo._id;

                  return (
                    <button
                      key={convo._id}
                      onClick={() => setActiveConversation(convo)}
                      className={`w-full text-left p-4 transition-colors flex items-start space-x-3 ${
                        isSelected ? 'bg-white border-l-4 border-forest shadow-sm' : 'hover:bg-ivory'
                      }`}
                    >
                      <img
                        src={other?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt={other?.name}
                        className="w-10 h-10 rounded-full object-cover border border-forest/15 flex-shrink-0"
                      />
                      <div className="overflow-hidden flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-charcoal truncate">{other?.name}</h4>
                          <span className="text-[10px] text-charcoal/40">
                            {new Date(convo.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {convo.listing && (
                          <p className="text-[11px] text-forest font-medium truncate mt-0.5">
                            Re: {convo.listing.title}
                          </p>
                        )}

                        <p className="text-[11px] text-charcoal/60 truncate mt-1">
                          {convo.lastMessage?.text || 'Conversation active'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Main Chat Area */}
          <div className="md:col-span-8 flex flex-col bg-white h-[620px]">
            
            {activeConversation ? (
              <>
                {/* Active Chat Header */}
                <div className="p-4 border-b border-forest/10 flex items-center justify-between bg-ivory">
                  <div className="flex items-center space-x-3">
                    <img
                      src={getOtherParticipant(activeConversation)?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt="Avatar"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-charcoal">
                        {getOtherParticipant(activeConversation)?.name}
                      </h3>
                      <p className="text-[10px] text-charcoal/60">
                        {getOtherParticipant(activeConversation)?.city} • Direct negotiation
                      </p>
                    </div>
                  </div>

                  {activeConversation.swapRequest && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-forest text-white">
                      Swap Linked
                    </span>
                  )}
                </div>

                {/* Swap Context Preview Banner */}
                {activeConversation.listing && (
                  <div className="px-4 py-2.5 bg-ivory-light border-b border-forest/10 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="font-semibold text-charcoal">Swap Item:</span>
                      <span className="text-forest truncate font-bold">{activeConversation.listing.title}</span>
                    </div>
                    <span className="text-[11px] font-bold text-forest whitespace-nowrap ml-2">
                      Est. ₹{activeConversation.listing.estimatedSwapValue?.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-ivory-light/40">
                  {messages.map((msg) => {
                    const isMe = msg.sender?._id === user?._id;

                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                            isMe
                              ? 'bg-forest text-white rounded-br-none'
                              : 'bg-white text-charcoal border border-forest/10 rounded-bl-none'
                          }`}
                        >
                          <p>{msg.text}</p>
                        </div>
                        <span className="text-[10px] text-charcoal/40 mt-1 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input Deck */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-forest/10 flex items-center space-x-2 bg-white">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type negotiation terms, size queries, or handover location..."
                    className="flex-1 text-xs bg-ivory border border-forest/20 rounded-full px-4 py-3 text-charcoal focus:outline-none focus:border-forest"
                  />
                  <button
                    type="submit"
                    disabled={sending || !inputText.trim()}
                    className="p-3 rounded-full bg-forest text-white hover:bg-forest-light transition-all disabled:opacity-40 shadow-sm flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-charcoal/60">
                <MessageSquare className="w-12 h-12 text-forest/30 mb-2" />
                <h3 className="font-serif text-lg font-bold text-charcoal">Select a Conversation</h3>
                <p className="text-xs max-w-xs mt-1">
                  Choose a negotiation thread from the left or initiate a swap from any marketplace listing.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

