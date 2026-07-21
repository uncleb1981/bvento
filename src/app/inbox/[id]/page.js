'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { TYPE_STYLE } from '@/lib/mockData';
import { getConversation, sendMessage, markTradeComplete, getUser, cashSummary, timeAgo } from '@/lib/store';

export default function ConversationPage() {
  const { id } = useParams();
  const router = useRouter();
  const [conversation, setConversation] = useState(null);
  const [user, setUser] = useState(null);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    setUser(getUser());
    const conv = getConversation(id);
    if (!conv) {
      router.replace('/inbox');
      return;
    }
    setConversation(conv);
  }, [id, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages?.length]);

  function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || !user) return;
    const updated = sendMessage(id, text.trim(), user.id);
    setConversation(updated);
    setText('');

    // Demo mode: light auto-reply so the thread feels alive without a second real account
    setTimeout(() => {
      const replies = [
        "Sounds good, let's figure out a time to meet up.",
        'Works for me! Where are you located?',
        'Awesome, looking forward to it.',
        "I'm flexible on timing, whatever works best for you.",
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      const withReply = sendMessage(id, reply, conversation?.otherUser?.id || 'other');
      setConversation(withReply);
    }, 1500 + Math.random() * 1500);
  }

  function handleMarkComplete() {
    markTradeComplete(id);
    setConversation((c) => ({ ...c, tradeComplete: true }));
  }

  if (!conversation || !user) return null;

  const myStyle = TYPE_STYLE[conversation.myBike.type] || TYPE_STYLE.Road;
  const targetStyle = TYPE_STYLE[conversation.targetBike.type] || TYPE_STYLE.Road;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col" style={{ minHeight: '75vh' }}>
      <Link href="/inbox" className="text-sm text-gray-400 mb-3">← Back to inbox</Link>

      <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 rounded-xl p-2 text-white text-center" style={{ background: myStyle.gradient }}>
            <div className="text-lg">{myStyle.emoji}</div>
            <div className="text-xs font-bold truncate">{conversation.myBike.title}</div>
          </div>
          <div className="text-lg">⇄</div>
          <div className="flex-1 rounded-xl p-2 text-white text-center" style={{ background: targetStyle.gradient }}>
            <div className="text-lg">{targetStyle.emoji}</div>
            <div className="text-xs font-bold truncate">{conversation.targetBike.title}</div>
          </div>
        </div>
        <p className="text-sm text-gray-500 text-center">
          Trading with <strong>{conversation.otherUser.name}</strong>{cashSummary(conversation)}
        </p>
        {conversation.tradeComplete ? (
          <div className="text-center text-sm font-semibold text-green-600 mt-2">✓ Trade marked complete</div>
        ) : (
          <button
            onClick={handleMarkComplete}
            className="w-full mt-3 py-2 rounded-xl text-sm font-semibold border"
            style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}
          >
            Mark trade complete
          </button>
        )}
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-4 overflow-y-auto space-y-3 mb-3">
        {conversation.messages.map((m) => (
          <MessageBubble key={m.id} message={m} me={user} otherUser={conversation.otherUser} />
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-full font-semibold text-white text-sm"
          style={{ backgroundColor: 'var(--brand)' }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

function MessageBubble({ message, me, otherUser }) {
  if (message.senderId === 'system') {
    return (
      <div className="text-center text-xs text-gray-400 py-1">{message.text}</div>
    );
  }
  const isMe = message.senderId === me.id;
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[75%] rounded-2xl px-4 py-2 text-sm"
        style={
          isMe
            ? { backgroundColor: 'var(--brand)', color: 'white' }
            : { backgroundColor: '#F3F4F6', color: '#1F2937' }
        }
      >
        {message.text}
        <div className={`text-[10px] mt-0.5 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
          {timeAgo(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
