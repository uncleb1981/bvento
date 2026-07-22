// Fallback used anywhere someone else's name is displayed (bike listings,
// proposals, chat) when they haven't set a name on their profile yet.
export function displayName(name) {
  return name?.trim() || 'Rider';
}
