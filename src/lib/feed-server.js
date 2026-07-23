import { createClient } from './supabase-server';
import { adaptBike } from './store';

export async function getFeedBikesServer() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('bikes')
    .select('*, profiles(name, city)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map(adaptBike);
}
