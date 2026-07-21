'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { photoForBike } from '@/lib/mockData';
import { getConversation, getMessages, sendMessage, markTradeComplete, getCurrentUser, cashSummary, timeAgo } from '@/lib/store';

export default function ConversationPage() {
  const { id } = useParams();
  const router = useRouter();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const refreshMessages = useCallback(async () => {
    const msgs = await getMessages(id);
    setMessages(msgs);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const currentUser = await getCurrentUser();
      if (cancelled) return;
      if (!currentUser) {
        router.replace(`/login?next=/inbox/${id}`);
        return;
      }
      const conv = await getConversation(id, currentUser.id);
      if (cancelled) return;
      if (!conv) {
        router.replace('/inbox');
        return;
      }
      setUser(currentUser);
      setConversation(conv);
      await refreshMessages();
      if (!cancelled) setReady(true);
    })();
    return () => { cancelled = true; };
  }, [id, router, refreshMessages]);

  useEffect(() => {
    if (!ready) return;
    const poll = setInterval(refreshMessages, 3000);
    return () => clearInterval(poll);
  }, [ready, refreshMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || !user || sending) return;
    setSending(true);
    const toSend = text.trim();
    setText('');
    try {
      await sendMessage(id, toSend, user.id);
      await refreshMessages();
    } catch {
      setText(toSend);
    } finally {
      setSending(false);
    }
  }

  async function handleMarkComplete() {
    try {
      await markTradeComplete(id);
      setConversation((c) => ({ ...c, tradeComplete: true }));
    } catch {
      // no-op — button stays available to retry
    }
  }

  if (!ready || !conversation || !user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col" style={{ minHeight: '75vh' }}>
      <Link href="/inbox" className="text-xs uppercase tracking-[0.1em] mb-4" style={{ color: 'var(--ink-soft)' }}>← Back to inbox</Link>

      <div className="p-5 mb-4" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-24 overflow-hidden relative">
            <img src={photoForBike(conversation.myBike)} alt={conversation.myBike.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-end p-2 text-white text-xs font-medium truncate" style={{ background: 'linear-gradient(to top, rgba(14,16,20,0.8), transparent 65%)' }}>{conversation.myBike.title}</div>
          </div>
          <div className="font-serif italic text-xl" style={{ color: 'var(--ink-soft)' }}>for</div>
          <div className="flex-1 h-24 overflow-hidden relative">
            <img src={photoForBike(conversation.targetBike)} alt={conversation.targetBike.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-end p-2 text-white text-xs font-medium truncate" style={{ background: 'linear-gradient(to top, rgba(14,16,20,0.8), transparent 65%)' }}>{conversation.targetBike.title}</div>
          </div>
        </div>
        <p className="text-sm text-center" style={{ color: 'var(--ink-soft)' }}>
          Trading with <strong style={{ color: 'var(--ink)' }}>{conversation.otherUser.name}</strong>{cashSummary(conversation)}
        </p>
        {conversation.tradeComplete ? (
          <div className="text-center text-sm font-medium mt-3" style={{ color: '#0F5132' }}>✓ Trade marked complete</div>
        ) : (
          <button
            onClick={handleMarkComplete}
            className="w-full mt-3 py-2.5 text-xs uppercase tracking-[0.1em] font-medium"
            style={{ border: '1px solid var(--ink)', color: 'var(--ink)' }}
          >
            Mark trade complete
          </button>
        )}
      </div>

      <div className="flex-1 p-5 overflow-y-auto space-y-3 mb-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} me={user} />
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 text-sm"
          style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
        />
        <button
          type="submit"
          disabled={sending}
          className="px-6 py-2.5 font-medium text-white text-sm disabled:opacity-60"
          style={{ backgroundColor: 'var(--ink)' }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

function MessageBubble({ message, me }) {
  if (message.senderId === 'system') {
    return (
      <div className="text-center text-xs py-1" style={{ color: 'var(--ink-soft)' }}>{message.text}</div>
    );
  }
  const isMe = message.senderId === me.id;
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[75%] px-4 py-2 text-sm"
        style={
          isMe
            ? { backgroundColor: 'var(--ink)', color: 'white' }
            : { backgroundColor: 'var(--accent-soft)', color: 'var(--ink)' }
        }
      >
        {message.text}
        <div className={`text-[10px] mt-0.5 ${isMe ? 'text-white/60' : ''}`} style={!isMe ? { color: 'var(--ink-soft)' } : undefined}>
          {timeAgo(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
