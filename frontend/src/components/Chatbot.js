import React, { useState, useRef, useEffect, useCallback } from 'react';
import { chatbotAPI } from '../api/client';
import '../styles/chatbot.css';

/* ───── tiny markdown-ish renderer (bold only + newlines) ───── */
function renderMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

const BOT_AVATAR = '🤖';
const USER_AVATAR = '👤';

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fabRef = useRef(null);

  /* close on outside click */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        open &&
        chatContainerRef.current && !chatContainerRef.current.contains(event.target) &&
        fabRef.current && !fabRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  /* auto-scroll */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  /* greeting on first open */
  const greeted = useRef(false);
  useEffect(() => {
    if (open && !greeted.current) {
      greeted.current = true;
      sendMessage('Hi');
    }
    if (open) setUnread(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* ─── send message ─── */
  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || sending) return;

    const userMsg = { role: 'user', text: trimmed, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);
    setQuickReplies([]);

    try {
      const res = await chatbotAPI.send(trimmed);
      const { reply, quickReplies: qr } = res.data.data;
      const botMsg = { role: 'bot', text: reply, ts: Date.now() };
      setMessages(prev => [...prev, botMsg]);
      if (qr) setQuickReplies(qr);
      if (!open) setUnread(prev => prev + 1);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, something went wrong. Please try again.', ts: Date.now() }]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(); };
  const handleQuickReply = (text) => sendMessage(text);

  return (
    <>
      {/* ─── Floating toggle button ─── */}
      <button
        ref={fabRef}
        className={`chatbot-fab ${open ? 'chatbot-fab--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? (
          <i className="fas fa-times"></i>
        ) : (
          <>
            <i className="fas fa-comment-dots"></i>
            {unread > 0 && <span className="chatbot-badge">{unread}</span>}
          </>
        )}
      </button>

      {/* ─── Chat window ─── */}
      {open && (
        <div ref={chatContainerRef} className="chatbot-window">
          {/* header */}
          <div className="chatbot-header">
            <div className="chatbot-header__left">
              <span className="chatbot-header__avatar">{BOT_AVATAR}</span>
              <div>
                <div className="chatbot-header__title">Crime Assistant</div>
                <div className="chatbot-header__sub">Always here to help</div>
              </div>
            </div>
            <button className="chatbot-header__close" onClick={() => setOpen(false)}>
              <i className="fas fa-minus"></i>
            </button>
          </div>

          {/* messages */}
          <div className="chatbot-body">
            {messages.filter(m => !(m.role === 'user' && m.text === 'Hi' && messages.indexOf(m) === 0)).map((m, i) => (
              <div key={i} className={`chatbot-msg chatbot-msg--${m.role}`}>
                <span className="chatbot-msg__avatar">{m.role === 'bot' ? BOT_AVATAR : USER_AVATAR}</span>
                <div className="chatbot-msg__bubble"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }}
                />
              </div>
            ))}
            {sending && (
              <div className="chatbot-msg chatbot-msg--bot">
                <span className="chatbot-msg__avatar">{BOT_AVATAR}</span>
                <div className="chatbot-msg__bubble chatbot-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* quick replies */}
          {quickReplies.length > 0 && (
            <div className="chatbot-quick">
              {quickReplies.map((qr, i) => (
                <button key={i} className="chatbot-quick__btn" onClick={() => handleQuickReply(qr)}>
                  {qr}
                </button>
              ))}
            </div>
          )}

          {/* input */}
          <form className="chatbot-input" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message…"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={sending}
              maxLength={500}
            />
            <button type="submit" disabled={sending || !input.trim()}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
