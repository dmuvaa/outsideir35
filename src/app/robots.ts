import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/platform';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/api/', '/auth/', '/login', '/register', '/forgot-password', '/reset-password'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
