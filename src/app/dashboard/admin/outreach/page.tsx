import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getDbRole } from '@/lib/auth-role';
import { redirect } from 'next/navigation';
import { SITE_URL } from '@/lib/platform';
import OutreachList, { type OutreachPerson } from './OutreachList';

type Lead = {
  title: string | null;
  recruiter_name: string | null;
  company_name: string | null;
  contact_email: string | null;
  apply_email: string | null;
};

function cleanEmail(value: string | null) {
  const email = (value || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return '';
  if (email.endsWith('@linkedin.com')) return '';
  return email;
}

function peopleFromLeads(leads: Lead[]) {
  const byEmail = new Map<string, OutreachPerson>();
  for (const lead of leads) {
    const email = cleanEmail(lead.contact_email) || cleanEmail(lead.apply_email);
    if (!email) continue;
    const current = byEmail.get(email);
    const name = (lead.recruiter_name || '').trim();
    const company = (lead.company_name || '').trim();
    if (!current) {
      byEmail.set(email, { email, name, company, roles: lead.title ? [lead.title] : [], sentAt: null });
      continue;
    }
    if (!current.name && name) current.name = name;
    if (!current.company && company) current.company = company;
    if (lead.title && !current.roles.includes(lead.title)) current.roles.push(lead.title);
  }
  return [...byEmail.values()].sort((a, b) => a.name.localeCompare(b.name) || a.email.localeCompare(b.email));
}

export default async function OutreachPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const role = await getDbRole(supabase, user);
  if (role !== 'admin') redirect('/dashboard/admin');

  const { data: leads } = await supabase
    .from('scraped_jobs')
    .select('title, recruiter_name, company_name, contact_email, apply_email')
    .order('created_at', { ascending: false })
    .limit(1000);

  const people = peopleFromLeads((leads || []) as Lead[]);
  const sent = await supabase.from('outreach_contacts').select('email, sent_at');
  if (!sent.error) {
    const sentAt = new Map((sent.data || []).map((row) => [String(row.email).toLowerCase(), row.sent_at as string | null]));
    for (const person of people) person.sentAt = sentAt.get(person.email) || null;
  }

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>Outreach</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '720px' }}>
        These are the recruiters who left an email on a post. Send a short note asking them to open an account and list the role themselves. The link fills in their name, email, and company.
      </p>
      <OutreachList people={people} siteUrl={SITE_URL.replace(/\/$/, '')} trackingReady={!sent.error} />
    </div>
  );
}
