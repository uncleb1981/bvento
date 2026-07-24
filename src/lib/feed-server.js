import { createClient } from './supabase-server';
import { adaptBike } from './store';

export async function getFeedBikesServer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('bikes')
    .select('*, profiles(name, city)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (user) query = query.neq('owner_id', user.id);

  const { data, error } = await query;
  if (error) return [];
  return (data || []).map(adaptBike);
}
