import { permanentRedirect } from 'next/navigation';

export default function WeekendRedirect() {
  permanentRedirect('/');
}
