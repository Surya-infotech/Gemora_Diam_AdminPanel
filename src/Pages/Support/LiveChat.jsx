import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { io } from 'socket.io-client';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Search as SearchIcon,
  Check as CheckIcon,
  DoneAll as DoneAllIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  SupportAgent as SupportAgentIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import {
  IconButton,
  Tooltip,
  CircularProgress,
  Badge
} from '@mui/material';
import { useAuth } from '../../Middleware/Auth';
import CheckToken from '../../utils/CheckToken';

export default function LiveChat() {
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8085";
  const tokenname = import.meta.env.VITE_AdminTOKEN_NAME;
  const token = localStorage.getItem(tokenname);

  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [customerTyping, setCustomerTyping] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    document.title = "Live Customer Chat | Gemora Diam Admin";
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connect to Socket.IO as Admin Support
  useEffect(() => {
    if (!token) return;

    const socket = io(backendUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_admin_support');
      if (selectedConv?.conversationId) {
        socket.emit('join_conversation', { conversationId: selectedConv.conversationId });
      }
    });

    // Alert on new customer message across all conversations
    socket.on('notify_admin_inbox', ({ conversationId, lastMessage, senderName }) => {
      window.dispatchEvent(new CustomEvent('chatUnreadUpdated'));
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.conversationId === conversationId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            lastMessage,
            lastMessageAt: new Date(),
            unreadCountAdmin: selectedConv?.conversationId === conversationId ? 0 : (updated[index].unreadCountAdmin || 0) + 1
          };
          // Move to top
          const [moved] = updated.splice(index, 1);
          return [moved, ...updated];
        } else {
          // If brand new conversation, reload list
          fetchConversations();
          return prev;
        }
      });
    });

    // Receive message in the currently active conversation
    socket.on('new_message', ({ message, conversationId }) => {
      if (selectedConv?.conversationId === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.messageId === message.messageId)) return prev;
          return [...prev, message];
        });

        // Mark read immediately since admin is active in this room
        socket.emit('mark_messages_read', {
          conversationId,
          readerType: 'admin'
        });
        window.dispatchEvent(new CustomEvent('chatUnreadUpdated'));
      }
    });

    // Real-time typing indicators
    socket.on('user_typing', ({ conversationId, senderType }) => {
      if (selectedConv?.conversationId === conversationId && (senderType === 'customer' || senderType === 'guest')) {
        setCustomerTyping(true);
      }
    });

    socket.on('user_stop_typing', ({ conversationId, senderType }) => {
      if (selectedConv?.conversationId === conversationId && (senderType === 'customer' || senderType === 'guest')) {
        setCustomerTyping(false);
      }
    });

    socket.on('messages_read', ({ readerType }) => {
      if (readerType === 'customer') {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderType === 'admin' ? { ...msg, isRead: true } : msg
          )
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [backendUrl, selectedConv?.conversationId, token]);

  // Fetch conversations from REST API
  const fetchConversations = useCallback(async () => {
    if (!CheckToken(token, logoutUser, navigate)) return;

    try {
      setLoadingConversations(true);
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const res = await fetch(`${backendUrl}/Chat/Admin/Conversations?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        const convList = (data.conversations || []).map((c) =>
          selectedConv?.conversationId === c.conversationId
            ? { ...c, unreadCountAdmin: 0 }
            : c
        );
        setConversations(convList);
      }
    } catch (err) {
      console.error('Failed to fetch admin conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, [backendUrl, logoutUser, navigate, searchTerm, selectedConv?.conversationId, token]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch messages when selecting a conversation
  const handleSelectConversation = async (conv) => {
    setSelectedConv(conv);
    setCustomerTyping(false);

    // Call REST endpoint to mark conversation read on server immediately
    try {
      fetch(`${backendUrl}/Chat/Admin/MarkRead/${conv.conversationId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(() => {
        window.dispatchEvent(new CustomEvent('chatUnreadUpdated'));
      });
    } catch {
      // ignore
    }

    // Leave previous room & join new room
    if (socketRef.current) {
      if (selectedConv?.conversationId) {
        socketRef.current.emit('leave_conversation', selectedConv.conversationId);
      }
      socketRef.current.emit('join_conversation', { conversationId: conv.conversationId });
      socketRef.current.emit('mark_messages_read', {
        conversationId: conv.conversationId,
        readerType: 'admin'
      });
      window.dispatchEvent(new CustomEvent('chatUnreadUpdated'));
    }

    // Reset local unread badge for this conversation
    setConversations((prev) =>
      prev.map((c) =>
        c.conversationId === conv.conversationId
          ? { ...c, unreadCountAdmin: 0 }
          : c
      )
    );

    try {
      setLoadingMessages(true);
      const res = await fetch(`${backendUrl}/Chat/Admin/Messages/${conv.conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send reply message
  const handleSendMessage = (textToSend = inputText, attachmentUrl = '') => {
    const text = (textToSend || '').trim();
    if (!text && !attachmentUrl) return;
    if (!selectedConv?.conversationId) return;

    const payload = {
      conversationId: selectedConv.conversationId,
      senderType: 'admin',
      senderName: 'Gemora Atelier Support',
      message: text,
      messageType: attachmentUrl ? 'image' : 'text',
      attachmentUrl
    };

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('send_message', payload);
    } else {
      fetch(`${backendUrl}/Chat/SendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      }).catch(console.error);
    }

    setInputText('');

    if (socketRef.current) {
      socketRef.current.emit('typing_stop', {
        conversationId: selectedConv.conversationId,
        senderType: 'admin'
      });
    }
  };

  // Handle Admin typing
  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (socketRef.current && selectedConv?.conversationId) {
      socketRef.current.emit('typing_start', {
        conversationId: selectedConv.conversationId,
        senderType: 'admin',
        senderName: 'Gemora Atelier Support'
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('typing_stop', {
          conversationId: selectedConv.conversationId,
          senderType: 'admin'
        });
      }, 1500);
    }
  };

  // Upload image attachment
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${backendUrl}/Chat/UploadAttachment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success && data.url) {
        handleSendMessage('', data.url);
      }
    } catch (err) {
      console.error('Admin attachment upload failed:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div
      style={{
        padding: '16px 20px',
        maxWidth: '1600px',
        margin: '0 auto',
        height: 'calc(100vh - 125px)',
        maxHeight: 'calc(100vh - 125px)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(212, 175, 55, 0.15)', border: '1px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37' }}>
            <SupportAgentIcon fontSize="medium" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontWeight: 600, color: 'var(--text-color, #1e293b)' }}>Customer Live Chat</h4>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Real-time luxury concierge & customer inquiry management</p>
          </div>
        </div>

        <Tooltip title="Refresh conversations">
          <IconButton onClick={fetchConversations} style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>

      {/* Main Split-View Card */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: '380px 1fr',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden'
        }}
      >
        {/* ========================================= */}
        {/* Left Pane: Conversations List             */}
        {/* ========================================= */}
        <div style={{ borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', height: '100%', minHeight: 0, overflow: 'hidden' }}>
          {/* Search Bar */}
          <div style={{ padding: '14px', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <SearchIcon style={{ position: 'absolute', left: '12px', color: '#94a3b8', fontSize: '20px' }} />
              <input
                type="text"
                placeholder="Search customers, emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            {loadingConversations ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                <CircularProgress size={24} style={{ color: '#d4af37' }} />
                <p style={{ marginTop: '10px', fontSize: '13px' }}>Loading inquiries...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>No conversations found</p>
                <span style={{ fontSize: '12px' }}>Waiting for customer chat requests</span>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = selectedConv?.conversationId === conv.conversationId;
                const unread = conv.unreadCountAdmin || 0;
                const timeAgo = conv.lastMessageAt ? moment(conv.lastMessageAt).fromNow(true) : '';

                return (
                  <div
                    key={conv.conversationId}
                    onClick={() => handleSelectConversation(conv)}
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#f1f5f9' : '#ffffff',
                      borderLeft: isSelected ? '4px solid #d4af37' : '4px solid transparent',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: conv.status === 'open' ? '#e2e8f0' : '#f1f5f9',
                            color: '#334155',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: 600
                          }}
                        >
                          {(conv.customerName || 'V').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h6 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                            {conv.customerName || 'Visitor'}
                          </h6>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            {conv.customerEmail || 'Guest'}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{timeAgo}</span>
                        {unread > 0 && (
                          <span
                            style={{
                              backgroundColor: '#d4af37',
                              color: '#0d0f12',
                              fontSize: '11px',
                              fontWeight: 700,
                              borderRadius: '10px',
                              padding: '1px 7px'
                            }}
                          >
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '12px',
                          color: unread > 0 ? '#1e293b' : '#64748b',
                          fontWeight: unread > 0 ? 600 : 400,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '220px'
                        }}
                      >
                        {conv.lastMessage || 'No message'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================= */}
        {/* Right Pane: Active Chat Window            */}
        {/* ========================================= */}
        {selectedConv ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, backgroundColor: '#ffffff', overflow: 'hidden' }}>
            {/* Chat Header */}
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid #d4af37',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: '#b48c1e'
                  }}
                >
                  {(selectedConv.customerName || 'V').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h5 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
                    {selectedConv.customerName}
                  </h5>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '3px', fontSize: '12px', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <EmailIcon fontSize="inherit" /> {selectedConv.customerEmail}
                    </span>
                    {selectedConv.customerPhone && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <PhoneIcon fontSize="inherit" /> {selectedConv.customerPhone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Body */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                padding: '20px',
                backgroundColor: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {loadingMessages ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <CircularProgress size={24} style={{ color: '#d4af37' }} />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8' }}>
                  <p style={{ margin: 0, fontSize: '14px' }}>No messages in this conversation yet</p>
                  <span style={{ fontSize: '12px' }}>Send a message to greet the customer</span>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isAdmin = msg.senderType === 'admin';
                  const timeStr = moment(msg.createdAt).format('LT');

                  return (
                    <div
                      key={msg.messageId || index}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isAdmin ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        alignSelf: isAdmin ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <span style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '3px', fontWeight: 500 }}>
                        {isAdmin ? 'You (Support)' : msg.senderName || selectedConv.customerName}
                      </span>

                      <div
                        style={{
                          padding: msg.messageType === 'image' ? '6px' : '10px 14px',
                          borderRadius: isAdmin ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                          backgroundColor: isAdmin ? '#1e293b' : '#ffffff',
                          color: isAdmin ? '#ffffff' : '#1e293b',
                          border: isAdmin ? '1px solid #334155' : '1px solid #e2e8f0',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                          fontSize: '13px',
                          lineHeight: '1.45',
                          wordBreak: 'break-word'
                        }}
                      >
                        {msg.messageType === 'image' && msg.attachmentUrl ? (
                          <div>
                            <img
                              src={msg.attachmentUrl}
                              alt="Attachment"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '260px',
                                borderRadius: '10px',
                                display: 'block',
                                objectFit: 'cover'
                              }}
                            />
                            {msg.message && <div style={{ padding: '8px 4px 4px' }}>{msg.message}</div>}
                          </div>
                        ) : (
                          msg.message
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', fontSize: '10px', color: '#94a3b8' }}>
                        <span>{timeStr}</span>
                        {isAdmin && (
                          msg.isRead ? (
                            <DoneAllIcon style={{ fontSize: '14px', color: '#10b981' }} />
                          ) : (
                            <CheckIcon style={{ fontSize: '14px', color: '#94a3b8' }} />
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Customer typing indicator */}
              {customerTyping && (
                <div
                  style={{
                    alignSelf: 'flex-start',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    backgroundColor: '#ffffff',
                    fontSize: '11px',
                    color: '#d4af37',
                    border: '1px solid #e2e8f0',
                    fontStyle: 'italic'
                  }}
                >
                  {selectedConv.customerName} is typing...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div
              style={{
                padding: '14px 20px',
                backgroundColor: '#ffffff',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexShrink: 0
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />

              <Tooltip title="Attach image / diamond photo">
                <IconButton
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  style={{ color: '#64748b' }}
                >
                  {isUploading ? <CircularProgress size={20} /> : <AttachFileIcon />}
                </IconButton>
              </Tooltip>

              <input
                type="text"
                placeholder="Type your reply to the customer..."
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '24px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#f8fafc'
                }}
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: inputText.trim() ? '#1e293b' : '#e2e8f0',
                  color: inputText.trim() ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <SendIcon fontSize="small" />
              </button>
            </div>
          </div>
        ) : (
          /* Empty State when no conversation is selected */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: 0,
              backgroundColor: '#f8fafc',
              color: '#94a3b8'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d4af37',
                marginBottom: '14px'
              }}
            >
              <SupportAgentIcon style={{ fontSize: '36px' }} />
            </div>
            <h5 style={{ margin: 0, fontWeight: 600, color: '#475569' }}>Gemora Concierge Support</h5>
            <p style={{ margin: '6px 0 0', fontSize: '13px' }}>Select a conversation on the left to start assisting a customer</p>
          </div>
        )}
      </div>
    </div>
  );
}
