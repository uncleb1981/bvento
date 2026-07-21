'use client';

import { useEffect } from 'react';
import { processDueResponses } from '@/lib/store';

// Renders nothing — just polls for demo trade proposals that are due for a
// simulated response, independent of whichever page happens to be mounted.
export default function AutoResponder() {
  useEffect(() => {
    processDueResponses();
    const poll = setInterval(processDueResponses, 1500);
    return () => clearInterval(poll);
  }, []);

  return null;
}
