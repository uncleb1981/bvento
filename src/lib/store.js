import { getSupabase } from './supabase';
import { firstNameFromUser } from './profileName';

// ── Current user ──────────────────────────────────────────────────────────────

export async function getCurrentUser() {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (!profile) {
    // Self-heal: the auth callback normally creates this row, but if that ever
    // fails (e.g. an RLS policy gap), create it here so the user isn't stuck
    // with a session that can't own bikes, proposals, etc.
    const { data: created } = await supabase
      .from('profiles')
      .insert({ id: user.id, name: firstNameFromUser(user), completed_trades: 0 })
      .select()
      .single();
    profile = created;
  }

  return {
    id: user.id,
    email: user.email,
    name: profile?.name || user.email?.split('@')[0] || 'Rider',
    city: profile?.city || '',
    completedTrades: profile?.completed_trades || 0,
  };
}

// ── Bikes ─────────────────────────────────────────────────────────────────────

function adaptBike(row) {
  if (!row) return null;
  return {
    id: row.id,
    ownerId: row.owner_id,
    ownerName: row.profiles?.name || 'Rider',
    title: row.title,
    type: row.type,
    condition: row.condition,
    estimatedValue: Number(row.estimated_value),
    description: row.description || '',
    city: row.city || '',
    photo: row.photo_url || null,
    isDemo: !!row.is_demo,
    createdAt: row.created_at,
  };
}

export async function getFeedBikes(currentUserId) {
  const supabase = getSupabase();
  let query = supabase
    .from('bikes')
    .select('*, profiles(name, city)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (currentUserId) query = query.neq('owner_id', currentUserId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(adaptBike);
}

export async function getMyBikes(userId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('bikes')
    .select('*, profiles(name, city)')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(adaptBike);
}

export async function addMyBike(userId, bike) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('bikes')
    .insert({
      owner_id: userId,
      title: bike.title,
      type: bike.type,
      condition: bike.condition,
      estimated_value: bike.estimatedValue,
      description: bike.description,
      city: bike.city,
      photo_url: bike.photo,
    })
    .select('*, profiles(name, city)')
    .single();
  if (error) throw error;
  return adaptBike(data);
}

export async function deleteBike(bikeId) {
  const supabase = getSupabase();
  const { error } = await supabase.from('bikes').delete().eq('id', bikeId);
  if (error) throw error;
}

// ── Passed bikes (session-only skip list, doesn't need to persist) ─────────────

const PASSED_KEY = 'bvento_passed_session';

export function getPassedIds() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(sessionStorage.getItem(PASSED_KEY) || '[]');
  } catch {
    return [];
  }
}

export function passBike(bikeId) {
  if (typeof window === 'undefined') return;
  const passed = getPassedIds();
  if (!passed.includes(bikeId)) sessionStorage.setItem(PASSED_KEY, JSON.stringify([...passed, bikeId]));
}

// ── Trade proposals ───────────────────────────────────────────────────────────

function adaptProposal(row) {
  if (!row) return null;
  return {
    id: row.id,
    fromUserId: row.from_user_id,
    fromUserName: row.from_profile?.name || 'Rider',
    toUserId: row.to_user_id,
    toUserName: row.to_profile?.name || 'Rider',
    myBike: adaptBike(row.my_bike),
    targetBike: adaptBike(row.target_bike),
    cashAmount: Number(row.cash_amount),
    cashDirection: row.cash_direction,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

const PROPOSAL_SELECT = `
  *,
  my_bike:bikes!trade_proposals_my_bike_id_fkey(*),
  target_bike:bikes!trade_proposals_target_bike_id_fkey(*),
  from_profile:profiles!trade_proposals_from_user_id_fkey(name),
  to_profile:profiles!trade_proposals_to_user_id_fkey(name)
`;

export async function getReceivedProposals(userId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('trade_proposals')
    .select(PROPOSAL_SELECT)
    .eq('to_user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(adaptProposal);
}

export async function getReceivedPendingCount(userId) {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from('trade_proposals')
    .select('id', { count: 'exact', head: true })
    .eq('to_user_id', userId)
    .eq('status', 'pending');
  if (error) throw error;
  return count || 0;
}

export async function getSentProposals(userId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('trade_proposals')
    .select(PROPOSAL_SELECT)
    .eq('from_user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(adaptProposal);
}

export async function addProposal({ fromUserId, targetBike, myBike, cashAmount, cashDirection, message }) {
  const supabase = getSupabase();
  const { error } = await supabase.from('trade_proposals').insert({
    from_user_id: fromUserId,
    to_user_id: targetBike.ownerId,
    my_bike_id: myBike.id,
    target_bike_id: targetBike.id,
    cash_amount: cashAmount,
    cash_direction: cashDirection,
    message,
    status: 'pending',
  });
  if (error) throw error;
}

export async function declineProposal(proposalId) {
  const supabase = getSupabase();
  const { error } = await supabase.from('trade_proposals').update({ status: 'declined' }).eq('id', proposalId);
  if (error) throw error;
}

export async function acceptProposalAndMatch(proposal) {
  const supabase = getSupabase();
  const { error: updateErr } = await supabase
    .from('trade_proposals')
    .update({ status: 'accepted' })
    .eq('id', proposal.id);
  if (updateErr) throw updateErr;

  const { data: conv, error: convErr } = await supabase
    .from('conversations')
    .insert({
      proposal_id: proposal.id,
      user_1_id: proposal.fromUserId,
      user_2_id: proposal.toUserId,
      my_bike_id: proposal.myBike.id,
      target_bike_id: proposal.targetBike.id,
      cash_amount: proposal.cashAmount,
      cash_direction: proposal.cashDirection,
    })
    .select()
    .single();
  if (convErr) throw convErr;

  await supabase.from('messages').insert({
    conversation_id: conv.id,
    sender_id: null,
    message: `It's a match! ${proposal.myBike.title} ⇄ ${proposal.targetBike.title}${cashSummary(proposal)}`,
  });

  return conv.id;
}

// ── Conversations / matches ───────────────────────────────────────────────────

function adaptConversation(row, myId) {
  const otherUser = row.user_1_id === myId
    ? { id: row.user2?.id, name: row.user2?.name || 'Rider' }
    : { id: row.user1?.id, name: row.user1?.name || 'Rider' };
  return {
    id: row.id,
    myBike: row.user_1_id === myId ? adaptBike(row.my_bike) : adaptBike(row.target_bike),
    targetBike: row.user_1_id === myId ? adaptBike(row.target_bike) : adaptBike(row.my_bike),
    cashAmount: Number(row.cash_amount),
    cashDirection: row.cash_direction,
    otherUser,
    tradeComplete: row.trade_complete,
    lastMessageAt: row.last_message_at,
  };
}

const CONVERSATION_SELECT = `
  *,
  my_bike:bikes!conversations_my_bike_id_fkey(*),
  target_bike:bikes!conversations_target_bike_id_fkey(*),
  user1:profiles!conversations_user_1_id_fkey(id, name),
  user2:profiles!conversations_user_2_id_fkey(id, name)
`;

export async function getConversations(userId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('conversations')
    .select(CONVERSATION_SELECT)
    .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)
    .order('last_message_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row) => adaptConversation(row, userId));
}

export async function getConversation(id, userId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('conversations')
    .select(CONVERSATION_SELECT)
    .eq('id', id)
    .single();
  if (error) return null;
  return adaptConversation(data, userId);
}

export async function getMessages(conversationId) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map((m) => ({
    id: m.id,
    senderId: m.sender_id || 'system',
    text: m.message,
    timestamp: m.created_at,
  }));
}

export async function sendMessage(conversationId, text, senderId) {
  const supabase = getSupabase();
  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: senderId,
    message: text,
  });
  if (error) throw error;
  await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId);
}

export async function markTradeComplete(conversationId) {
  const supabase = getSupabase();
  const { error } = await supabase.from('conversations').update({ trade_complete: true }).eq('id', conversationId);
  if (error) throw error;
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
