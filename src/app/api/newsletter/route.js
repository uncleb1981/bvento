import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const NOTIFY_TO = 'bwbuse@gmail.com';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { error: dbError } = await supabase.from('newsletter_subscribers').insert({ email });

  // 23505 = unique_violation - already subscribed, treat as success but
  // skip the notification email so repeat submits don't re-alert.
  if (dbError && dbError.code !== '23505') {
    return NextResponse.json({ error: 'Could not save your subscription right now.' }, { status: 500 });
  }

  if (!dbError && process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'bvento Newsletter <notifications@bvento.com>',
          to: NOTIFY_TO,
          subject: 'New bvento newsletter subscriber',
          text: `${email} just subscribed to surge alerts.`,
        }),
      });
      if (!res.ok) console.error('Resend rejected newsletter email:', res.status, await res.text());
    } catch (err) {
      console.error('Failed to reach Resend for newsletter email:', err);
      // The subscriber is already saved either way - email delivery
      // failing shouldn't fail the request for the visitor.
    }
  }

  return NextResponse.json({ ok: true });
}
