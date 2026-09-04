'use client';

// Buttondown embed-subscribe form - same account/pattern used on
// clearingthedecks.com, tagged "bvento" so these subscribers stay
// distinguishable from that project's list within the same account.
// No custom backend: this posts straight to Buttondown's public embed
// endpoint and opens their confirmation page in a popup.
export default function NewsletterSignup() {
  return (
    <form
      action="https://buttondown.com/api/emails/embed-subscribe/ClearingtheDecks"
      method="post"
      target="popupwindow"
      onSubmit={() => {
        window.open('https://buttondown.com/api/emails/embed-subscribe/ClearingtheDecks', 'popupwindow');
      }}
      className="flex items-center gap-1.5"
    >
      <input type="hidden" name="embed" value="1" />
      <input type="hidden" name="tag" value="bvento" />
      <input
        type="email"
        name="email"
        placeholder="Email for surge alerts"
        required
        className="text-xs px-2.5 py-1.5 w-[9.5rem] sm:w-40"
        style={{ border: '1px solid var(--border)', color: 'var(--ink)', backgroundColor: 'var(--surface)' }}
      />
      <button
        type="submit"
        className="text-white text-xs uppercase tracking-[0.1em] font-medium px-3 py-1.5 whitespace-nowrap transition-colors"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        Subscribe
      </button>
    </form>
  );
}
