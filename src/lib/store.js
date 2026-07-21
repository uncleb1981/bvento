'use client';

import { MOCK_USER, MOCK_BIKES, MOCK_MY_BIKES } from './mockData';

const USER_KEY = 'bvento_user';
const MY_BIKES_KEY = 'bvento_my_bikes';
const FEED_BIKES_KEY = 'bvento_feed_bikes';
const PASSED_KEY = 'bvento_passed';
const PROPOSALS_KEY = 'bvento_proposals';
const CONVERSATIONS_KEY = 'bvento_conversations';

function isClient() {
  return typeof window !== 'undefined';
}

function read(key, fallback) {
  if (!isClient()) return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  if (!isClient()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ── User ──────────────────────────────────────────────────────────────────────

export function getUser() {
  if (!isClient()) return null;
  const stored = read(USER_KEY, null);
  if (stored) return stored;
  write(USER_KEY, MOCK_USER);
  return MOCK_USER;
}

// ── Bikes ─────────────────────────────────────────────────────────────────────

export function getFeedBikes() {
  const all = read(FEED_BIKES_KEY, null) || (write(FEED_BIKES_KEY, MOCK_BIKES), MOCK_BIKES);
  const passed = new Set(getPassedIds());
  return all.filter((b) => !passed.has(b.id));
}

export function getPassedIds() {
  return read(PASSED_KEY, []);
}

export function passBike(bikeId) {
  const passed = getPassedIds();
  if (!passed.includes(bikeId)) write(PASSED_KEY, [...passed, bikeId]);
}

export function getMyBikes() {
  return read(MY_BIKES_KEY, null) || (write(MY_BIKES_KEY, MOCK_MY_BIKES), MOCK_MY_BIKES);
}

export function addMyBike(bike) {
  const bikes = getMyBikes();
  const updated = [bike, ...bikes];
  write(MY_BIKES_KEY, updated);
  return bike;
}

export function findBikeById(id) {
  return (
    getFeedBikes().find((b) => b.id === id) ||
    getMyBikes().find((b) => b.id === id) ||
    read(FEED_BIKES_KEY, MOCK_BIKES).find((b) => b.id === id) ||
    null
  );
}

// ── Trade proposals ───────────────────────────────────────────────────────────
// { id, fromUserId, fromUserName, toUserId, toUserName, myBike, targetBike,
//   cashAmount, cashDirection: 'i_pay' | 'they_pay' | 'even', message, status: 'pending'|'accepted'|'declined', createdAt }

export function getProposals() {
  return read(PROPOSALS_KEY, []);
}

export function addProposal(proposal) {
  const proposals = getProposals();
  const updated = [proposal, ...proposals];
  write(PROPOSALS_KEY, updated);
  return proposal;
}

export function updateProposalStatus(id, status) {
  const proposals = getProposals();
  const updated = proposals.map((p) => (p.id === id ? { ...p, status } : p));
  write(PROPOSALS_KEY, updated);
  return updated.find((p) => p.id === id);
}

// Demo-only: since the mock feed has no second real account to reply for real,
// proposals the current user sends carry a respondAt/willAccept so a background
// ticker (see processDueResponses, run from a component mounted in layout.js)
// can resolve them later — independent of which page happens to be open,
// unlike a setTimeout scoped to the page that created the proposal.
export function addProposalWithAutoResponse(proposal, { minDelayMs = 3000, maxDelayMs = 7000, acceptChance = 0.8 } = {}) {
  const respondAt = Date.now() + minDelayMs + Math.random() * (maxDelayMs - minDelayMs);
  return addProposal({ ...proposal, respondAt, willAccept: Math.random() < acceptChance });
}

export function processDueResponses() {
  const proposals = getProposals();
  const due = proposals.filter((p) => p.status === 'pending' && p.respondAt && p.respondAt <= Date.now());
  due.forEach((proposal) => {
    updateProposalStatus(proposal.id, proposal.willAccept ? 'accepted' : 'declined');
    if (proposal.willAccept) createConversationFromProposal(proposal);
  });
}

// ── Matches / conversations ───────────────────────────────────────────────────

export function getConversations() {
  return read(CONVERSATIONS_KEY, []);
}

export function getConversation(id) {
  return getConversations().find((c) => c.id === id) || null;
}

export function createConversationFromProposal(proposal) {
  const now = new Date().toISOString();
  const me = getUser();
  // The mock store is shared by a single browser, so "the other person" is
  // whichever side of the proposal isn't the current user.
  const otherUser = proposal.fromUserId === me?.id
    ? { id: proposal.toUserId, name: proposal.toUserName }
    : { id: proposal.fromUserId, name: proposal.fromUserName };
  const conv = {
    id: `conv-${proposal.id}`,
    proposalId: proposal.id,
    myBike: proposal.myBike,
    targetBike: proposal.targetBike,
    cashAmount: proposal.cashAmount,
    cashDirection: proposal.cashDirection,
    otherUser,
    messages: [
      {
        id: `msg-${Date.now()}`,
        senderId: 'system',
        text: `It's a match! ${proposal.myBike.title} ⇄ ${proposal.targetBike.title}${cashSummary(proposal)}`,
        timestamp: now,
      },
    ],
    tradeComplete: false,
    lastMessageAt: now,
  };
  const convs = getConversations();
  write(CONVERSATIONS_KEY, [conv, ...convs]);
  return conv;
}

export function sendMessage(convId, text, senderId) {
  const convs = getConversations();
  const now = new Date().toISOString();
  const updated = convs.map((c) => {
    if (c.id !== convId) return c;
    return {
      ...c,
      messages: [...c.messages, { id: `msg-${Date.now()}`, senderId, text, timestamp: now }],
      lastMessageAt: now,
    };
  });
  write(CONVERSATIONS_KEY, updated);
  return updated.find((c) => c.id === convId);
}

export function markTradeComplete(convId) {
  const convs = getConversations();
  const updated = convs.map((c) => (c.id === convId ? { ...c, tradeComplete: true } : c));
  write(CONVERSATIONS_KEY, updated);
}

// ── Cash math ─────────────────────────────────────────────────────────────────

// Suggest a cash amount + direction to balance two bikes of different value.
// Positive gap means myBike is worth less than targetBike, so I'd add cash.
export function suggestCash(myBike, targetBike) {
  const gap = Math.round((targetBike.estimatedValue - myBike.estimatedValue) / 5) * 5;
  if (gap === 0) return { cashAmount: 0, cashDirection: 'even' };
  if (gap > 0) return { cashAmount: gap, cashDirection: 'i_pay' };
  return { cashAmount: Math.abs(gap), cashDirection: 'they_pay' };
}

export function cashSummary(proposal) {
  if (!proposal.cashAmount || proposal.cashDirection === 'even') return ' — straight trade, no cash.';
  if (proposal.cashDirection === 'i_pay') return ` — plus $${proposal.cashAmount} cash.`;
  return ` — plus $${proposal.cashAmount} cash back.`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function timeAgo(timestamp) {
  const diff = new Date() - new Date(timestamp);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
