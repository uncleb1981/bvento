import DiscoverClient from './DiscoverClient';
import { getFeedBikesServer } from '@/lib/feed-server';

export const metadata = {
  title: 'bvento — Bike Trading in Bentonville & Northwest Arkansas',
  description:
    'Trade bikes with local riders in Bentonville, Rogers, Springdale, and Fayetteville, AR. Browse listings, propose a trade, and add cash to balance the deal.',
};

export default async function DiscoverPage() {
  const initialBikes = await getFeedBikesServer();
  return <DiscoverClient initialBikes={initialBikes} />;
}
