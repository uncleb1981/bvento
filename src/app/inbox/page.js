'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { photoForBike } from '@/lib/mockData';
import {
  getReceivedProposals,
  getSentProposals,
  getConversations,
  getCurrentUser,
  declineProposal,
  acceptProposalAndMatch,
  cashSummary,
  resolvePayer,
  timeAgo,
} from '@/lib/store';

const TABS = ['Received', 'Sent', 'Matches'];

export default function InboxPage() {
  const router = useRouter();
  const [tab, setTab] = useState('Received');
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const refresh = useCallback(async (currentUser) => {
    const [r, s, c] = await Promise.all([
      getReceivedProposals(currentUser.id),
      getSentProposals(currentUser.id),
      getConversations(currentUser.id),
    ]);
    setReceived(r);
    setSent(s);
    setConversations(c);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const currentUser = await getCurrentUser();
      if (cancelled) return;
      if (!currentUser) {
        router.replace('/login?next=/inbox');
        return;
      }
      setUser(currentUser);
      await refresh(currentUser);
      if (!cancelled) setReady(true);
    })();
    return () => { cancelled = true; };
  }, [router, refresh]);

  if (!ready || !user) return null;

  async function handleAccept(proposal) {
    setBusyId(proposal.id);
    setError('');
    try {
      await acceptProposalAndMatch(proposal);
      await refresh(user);
    } catch (err) {
      setError(err.message || 'Could not accept that offer.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDecline(proposal) {
    setBusyId(proposal.id);
    setError('');
    try {
      await declineProposal(proposal.id);
      await refresh(user);
    } catch (err) {
      setError(err.message || 'Could not decline that offer.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-serif text-4xl mb-6" style={{ color: 'var(--ink)' }}>Inbox</h1>

      <div className="flex gap-1 mb-6 border-b" style={{ borderColor: 'var(--border)' }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2.5 text-xs uppercase tracking-[0.12em] font-medium -mb-px"
            style={
              tab === t
                ? { color: 'var(--ink)', borderBottom: '2px solid var(--accent)' }
                : { color: 'var(--ink-soft)', borderBottom: '2px solid transparent' }
            }
          >
            {t}
            {t === 'Received' && received.length > 0 && ` (${received.length})`}
          </button>
        ))}
      </div>

      {error && <p className="text-sm mb-4" style={{ color: '#8A2A1F' }}>{error}</p>}

      {tab === 'Received' && (
        <div className="space-y-3">
          {received.length === 0 && (
            <EmptyState text="No trade offers yet. When another rider proposes a trade for one of your bikes, it'll show up here." />
          )}
          {received.map((p) => (
            <ProposalCard
              key={p.id}
              proposal={p}
              busy={busyId === p.id}
              onAccept={() => handleAccept(p)}
              onDecline={() => handleDecline(p)}
            />
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
              className="flex items-center gap-4 p-4 transition-colors"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="w-14 h-14 flex-shrink-0 overflow-hidden">
                {c.targetBike ? (
                  <img src={photoForBike(c.targetBike)} alt={c.targetBike.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-soft)' }}>
                    <span className="text-[9px] uppercase tracking-[0.08em] text-center" style={{ color: 'var(--ink-soft)' }}>Traded</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate" style={{ color: 'var(--ink)' }}>{c.otherUser.name}</div>
                <div className="text-sm truncate" style={{ color: 'var(--ink-soft)' }}>
                  {c.myBike?.title || `$${c.cashAmount.toLocaleString()} cash`} ⇄ {c.targetBike?.title || 'listing removed'}
                </div>
              </div>
              <div className="text-xs flex-shrink-0" style={{ color: 'var(--ink-soft)' }}>{timeAgo(c.lastMessageAt)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="text-center py-14 px-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--ink-soft)' }}>{text}</p>
    </div>
  );
}

function ProposalCard({ proposal, onAccept, onDecline, mine = false, busy = false }) {
  const otherPersonName = mine ? proposal.toUserName : proposal.fromUserName;
  const payerName = resolvePayer(proposal.cashDirection, mine, otherPersonName);
  return (
    <div className="p-4" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3 mb-3">
        {proposal.myBike ? (
          <div className="flex-1 h-20 overflow-hidden relative">
            <img src={photoForBike(proposal.myBike)} alt={proposal.myBike.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-end p-1.5 text-white text-xs font-medium truncate" style={{ background: 'linear-gradient(to top, rgba(14,16,20,0.8), transparent 65%)' }}>{proposal.myBike.title}</div>
          </div>
        ) : (
          <CashOfferTile amount={proposal.cashAmount} />
        )}
        <div className="font-serif italic text-lg" style={{ color: 'var(--ink-soft)' }}>for</div>
        <div className="flex-1 h-20 overflow-hidden relative">
          <img src={photoForBike(proposal.targetBike)} alt={proposal.targetBike.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-end p-1.5 text-white text-xs font-medium truncate" style={{ background: 'linear-gradient(to top, rgba(14,16,20,0.8), transparent 65%)' }}>{proposal.targetBike.title}</div>
        </div>
      </div>

      <p className="text-sm mb-1" style={{ color: 'var(--ink)' }}>
        {proposal.myBike
          ? (mine ? `You offered ${proposal.myBike.title}` : `${proposal.fromUserName} offered ${proposal.myBike.title}`)
          : (mine ? 'You made a cash offer' : `${proposal.fromUserName} made a cash offer`)}
        {cashSummary(proposal, payerName)}
      </p>
      {proposal.message && <p className="text-sm italic mb-2" style={{ color: 'var(--ink-soft)' }}>&ldquo;{proposal.message}&rdquo;</p>}
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{timeAgo(proposal.createdAt)}</span>
        {mine ? (
          <StatusBadge status={proposal.status} />
        ) : (
          <div className="flex gap-2">
            <button onClick={onDecline} disabled={busy} className="px-3 py-1.5 text-xs uppercase tracking-[0.08em] font-medium disabled:opacity-50" style={{ color: 'var(--ink-soft)', border: '1px solid var(--border)' }}>
              Decline
            </button>
            <button
              onClick={onAccept}
              disabled={busy}
              className="px-3 py-1.5 text-xs uppercase tracking-[0.08em] font-medium text-white disabled:opacity-60"
              style={{ backgroundColor: 'var(--ink)' }}
            >
              {busy ? '…' : 'Accept'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CashOfferTile({ amount }) {
  return (
    <div className="flex-1 h-20 flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--accent-soft)' }}>
      <div className="font-serif text-lg" style={{ color: 'var(--ink)' }}>${amount.toLocaleString()}</div>
      <div className="text-[10px] uppercase tracking-[0.1em]" style={{ color: 'var(--ink-soft)' }}>Cash offer</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: { label: 'Pending', color: '#92400E', border: '#E9CFA0' },
    accepted: { label: 'Accepted', color: '#0F5132', border: '#B7DCC5' },
    declined: { label: 'Declined', color: '#8A2A1F', border: '#E5BEB6' },
  };
  const s = map[status] || map.pending;
  return (
    <span className="text-xs uppercase tracking-[0.08em] font-medium px-2.5 py-1" style={{ color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  );
}
