import type { MetadataRoute } from 'next';
import { getJobsServer, getBlogPostsServer, getGuidesServer, getCompaniesServer } from '@/lib/server-data';
import { SITE_URL } from '@/lib/platform';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [jobs, posts, guides, companies] = await Promise.all([
    getJobsServer(),
    getBlogPostsServer(),
    getGuidesServer(),
    getCompaniesServer(),
  ]);

  const staticRoutes = ['', '/jobs', '/companies', '/candidates', '/pricing', '/blog', '/guides', '/login', '/register'].map((path) => ({
    url: `${SITE_URL}${path || '/'}`,
    lastModified: new Date(),
  }));

  return [
    ...staticRoutes,
    ...jobs.map((job) => ({ url: `${SITE_URL}/jobs/${job.slug}`, lastModified: new Date(job.createdAt) })),
    ...posts.map((post) => ({ url: `${SITE_URL}/blog/${post.slug}`, lastModified: new Date(post.publishedAt || post.createdAt) })),
    ...guides.map((guide: any) => ({ url: `${SITE_URL}/guides/${guide.slug}`, lastModified: new Date() })),
    ...companies.map((c) => ({ url: `${SITE_URL}/companies/${c.slug}`, lastModified: new Date() })),
  ];
}
