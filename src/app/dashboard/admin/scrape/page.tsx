import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getDbRole } from '@/lib/auth-role';
import { redirect } from 'next/navigation';
import ScrapeInbox from './ScrapeInbox';

export default async function AdminScrapePage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const role = await getDbRole(supabase, user);
  if (role !== 'admin') redirect('/dashboard/admin');

  const { data: leads, error } = await supabase
    .from('scraped_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>LinkedIn scrape</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '720px' }}>
        Import Apify posts, keep only clear Outside IR35 roles, then publish them to the candidate board.
        Nothing goes live until you approve it.
      </p>
      {error && (
        <p style={{ color: 'var(--color-inside)', marginBottom: '16px' }}>
          Inbox table is missing. Apply <code>supabase/migrations/20260922120000_scraped_jobs_inbox.sql</code>.
        </p>
      )}
      <ScrapeInbox leads={leads || []} apifyConfigured={Boolean(process.env.APIFY_TOKEN)} />
    </div>
  );
}
