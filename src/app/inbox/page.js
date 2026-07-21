'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TYPE_STYLE } from '@/lib/mockData';
import {
  getProposals,
  getConversations,
  getUser,
  updateProposalStatus,
  createConversationFromProposal,
  cashSummary,
  timeAgo,
} from '@/lib/store';

const TABS = ['Received', 'Sent', 'Matches'];

export default function InboxPage() {
  const [tab, setTab] = useState('Received');
  const [user, setUser] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [conversations, setConversations] = useState([]);

  function refresh() {
    setUser(getUser());
    setProposals(getProposals());
    setConversations(getConversations());
  }

  useEffect(() => {
    refresh();
    const poll = setInterval(refresh, 2000);
    return () => clearInterval(poll);
  }, []);

  if (!user) return null;

  const received = proposals.filter((p) => p.toUserId === user.id && p.status === 'pending');
  const sent = proposals.filter((p) => p.fromUserId === user.id);

  function handleAccept(proposal) {
    updateProposalStatus(proposal.id, 'accepted');
    createConversationFromProposal(proposal);
    refresh();
  }

  function handleDecline(proposal) {
    updateProposalStatus(proposal.id, 'declined');
    refresh();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-black mb-4" style={{ color: 'var(--brand-dark)' }}>Inbox</h1>

      <div className="flex gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-full text-sm font-semibold"
            style={
              tab === t
                ? { backgroundColor: 'var(--brand)', color: 'white' }
                : { backgroundColor: 'white', color: '#6B7280', border: '1px solid #F3F4F6' }
            }
          >
            {t}
            {t === 'Received' && received.length > 0 && ` (${received.length})`}
          </button>
        ))}
      </div>

      {tab === 'Received' && (
        <div className="space-y-3">
          {received.length === 0 && (
            <EmptyState text="No trade offers yet. When another rider proposes a trade for one of your bikes, it'll show up here." />
          )}
          {received.map((p) => (
            <ProposalCard key={p.id} proposal={p} onAccept={() => handleAccept(p)} onDecline={() => handleDecline(p)} />
          ))}
        </div>
      )}

      {tab === 'Sent' && (
        <div className="space-y-3">
          {sent.length === 0 && (
            <EmptyState text="You haven't proposed any trades yet. Head to Discover and swipe right on a bike." />
          )}
          {sent.map((p) => (
            <ProposalCard key={p.id} proposal={p} mine />
          ))}
        </div>
      )}

      {tab === 'Matches' && (
        <div className="space-y-3">
          {conversations.length === 0 && (
            <EmptyState text="No matches yet. Accepted trades turn into a match with a chat thread." />
          )}
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/inbox/${c.id}`}
              className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-100 hover:border-gray-200"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white flex-shrink-0"
                style={{ background: (TYPE_STYLE[c.targetBike.type] || TYPE_STYLE.Road).gradient }}
              >
                {(TYPE_STYLE[c.targetBike.type] || TYPE_STYLE.Road).emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-800 truncate">{c.otherUser.name}</div>
                <div className="text-sm text-gray-500 truncate">
                  {c.myBike.title} ⇄ {c.targetBike.title}
                </div>
              </div>
              <div className="text-xs text-gray-400 flex-shrink-0">{timeAgo(c.lastMessageAt)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="text-center py-12 px-6 bg-white rounded-2xl border border-gray-100">
      <div className="text-4xl mb-2">📭</div>
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}

function ProposalCard({ proposal, onAccept, onDecline, mine = false }) {
  const targetStyle = TYPE_STYLE[proposal.targetBike.type] || TYPE_STYLE.Road;
  const myStyle = TYPE_STYLE[proposal.myBike.type] || TYPE_STYLE.Road;

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 rounded-xl p-2 text-white text-center" style={{ background: myStyle.gradient }}>
          <div className="text-lg">{myStyle.emoji}</div>
          <div className="text-xs font-bold truncate">{proposal.myBike.title}</div>
        </div>
        <div className="text-lg">⇄</div>
        <div className="flex-1 rounded-xl p-2 text-white text-center" style={{ background: targetStyle.gradient }}>
          <div className="text-lg">{targetStyle.emoji}</div>
          <div className="text-xs font-bold truncate">{proposal.targetBike.title}</div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-1">
        {mine ? `You offered ${proposal.myBike.title}` : `${proposal.fromUserName} offered ${proposal.myBike.title}`}
        {cashSummary(proposal)}
      </p>
      {proposal.message && <p className="text-sm text-gray-400 italic mb-2">&ldquo;{proposal.message}&rdquo;</p>}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400">{timeAgo(proposal.createdAt)}</span>
        {mine ? (
          <StatusBadge status={proposal.status} />
        ) : (
          <div className="flex gap-2">
            <button onClick={onDecline} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
              Decline
            </button>
            <button
              onClick={onAccept}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: 'var(--brand)' }}
            >
              Accept
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: { label: 'Pending', bg: '#FEF3C7', color: '#92400E' },
    accepted: { label: 'Accepted', bg: '#D1FAE5', color: '#065F46' },
    declined: { label: 'Declined', bg: '#FEE2E2', color: '#991B1B' },
  };
  const s = map[status] || map.pending;
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}
