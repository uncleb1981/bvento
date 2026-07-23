import DiscoverClient from './DiscoverClient';
import { getFeedBikesServer } from '@/lib/feed-server';

export default async function DiscoverPage() {
  const initialBikes = await getFeedBikesServer();
  return <DiscoverClient initialBikes={initialBikes} />;
}
