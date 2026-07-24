import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const FEEDBACK_TO = 'bwbuse@gmail.com';
const MAX_MESSAGE_LENGTH = 4000;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { message, contact, website } = body || {};

  // Honeypot: a real visitor never fills this hidden field in — bots that
  // blindly fill every input do. Pretend success without sending anything.
  if (website) {
    return NextResponse.json({ ok: true });
  }

  const trimmedMessage = typeof message === 'string' ? message.trim() : '';
  const trimmedContact = typeof contact === 'string' ? contact.trim().slice(0, 200) : '';

  if (!trimmedMessage) {
    return NextResponse.json({ error: 'Feedback message is required.' }, { status: 400 });
  }
  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: 'That message is too long.' }, { status: 400 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { error: dbError } = await supabase
    .from('feedback')
    .insert({ message: trimmedMessage, contact: trimmedContact || null });
  if (dbError) {
    return NextResponse.json({ error: 'Could not save your feedback right now.' }, { status: 500 });
  }

  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'bvento Feedback <onboarding@resend.dev>',
          to: FEEDBACK_TO,
          subject: 'New bvento feedback',
          text: `${trimmedMessage}\n\n— from: ${trimmedContact || 'anonymous'}`,
        }),
      });
    } catch {
      // The submission is already saved in the feedback table either way —
      // email delivery failing shouldn't fail the request for the visitor.
    }
  }

  return NextResponse.json({ ok: true });
}
