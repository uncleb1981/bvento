// Derives a first-name-only display name from a Supabase auth user, so
// full legal names from Google (or anywhere else) never end up on public
// listings — just "Ben", not "Ben Buse".
export function firstNameFromUser(user) {
  const meta = user?.user_metadata || {};
  const source = meta.given_name || meta.full_name || meta.name;
  if (source) {
    const first = source.trim().split(/\s+/)[0];
    if (first) return first;
  }
  const emailName = user?.email?.split('@')[0] || 'Rider';
  return emailName.charAt(0).toUpperCase() + emailName.slice(1);
}
