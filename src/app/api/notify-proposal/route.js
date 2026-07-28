import { NextResponse } from 'next/server';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { recipientEmail, recipientName, proposerName, bikeTitle } = body || {};
  if (!recipientEmail) {
    return NextResponse.json({ error: 'Missing recipient email.' }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    // Email isn't configured yet — the proposal itself already succeeded,
    // so don't fail the request over this.
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'bvento <notifications@bvento.com>',
        to: recipientEmail,
        subject: `${proposerName} wants to trade for your ${bikeTitle || 'bike'}`,
        html: `<p>Hi ${recipientName},</p><p><strong>${proposerName}</strong> just proposed a trade for your listing${bikeTitle ? ` &mdash; <strong>${bikeTitle}</strong>` : ''} on bvento.</p><p><a href="https://bvento.com/inbox?tab=Received">View the offer</a></p>`,
      }),
    });
    if (!res.ok) console.error('Resend rejected proposal notification email:', res.status, await res.text());
  } catch (err) {
    console.error('Failed to reach Resend for proposal notification email:', err);
    // Non-critical — the proposal was already saved either way.
  }

  return NextResponse.json({ ok: true });
}
