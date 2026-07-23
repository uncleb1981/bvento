export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/inbox', '/profile', '/auth'],
      },
    ],
    sitemap: 'https://bvento.com/sitemap.xml',
  };
}
