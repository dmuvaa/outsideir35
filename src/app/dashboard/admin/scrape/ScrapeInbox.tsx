'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { importScrapedPosts, startApifyScrape, ingestApifyRun, ingestApifyDataset, publishScrapedLead, rejectScrapedLead } from '@/app/actions/scrape';
import { formatDayRate } from '@/lib/platform';
import { extractApplyEmail } from '@/lib/scrape-parse';

type Lead = {
  id: string;
  title: string;
  description_html: string;
  company_name: string | null;
  recruiter_name: string | null;
  location: string | null;
  remote_type: string;
  day_rate_min: number | null;
  day_rate_max: number | null;
  rate_note: string | null;
  ir35_status: string;
  clearance_level: string;
  contract_length: string | null;
  apply_url: string | null;
  apply_email: string | null;
  contact_email: string | null;
  source_url: string | null;
  classification: 'publishable' | 'needs_review' | 'reject';
  classification_reason: string | null;
  confidence: number;
  status: string;
  published_job_id: string | null;
};

const FILTERS = ['pending', 'with_email', 'publishable', 'needs_review', 'reject', 'published', 'rejected'] as const;

export default function ScrapeInbox({ leads, apifyConfigured }: { leads: Lead[]; apifyConfigured: boolean }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('pending');
  const [json, setJson] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [runId, setRunId] = useState('');

  const visible = leads.filter((lead) => {
    if (filter === 'pending') return lead.status === 'pending';
    if (filter === 'with_email') return lead.status === 'pending' && Boolean(leadEmail(lead));
    if (filter === 'published') return lead.status === 'published';
    if (filter === 'rejected') return lead.status === 'rejected';
    return lead.status === 'pending' && lead.classification === filter;
  });

  const counts = {
    pending: leads.filter((l) => l.status === 'pending').length,
    with_email: leads.filter((l) => l.status === 'pending' && Boolean(leadEmail(l))).length,
    publishable: leads.filter((l) => l.status === 'pending' && l.classification === 'publishable').length,
    needs_review: leads.filter((l) => l.status === 'pending' && l.classification === 'needs_review').length,
    reject: leads.filter((l) => l.status === 'pending' && l.classification === 'reject').length,
    published: leads.filter((l) => l.status === 'published').length,
    rejected: leads.filter((l) => l.status === 'rejected').length,
  };

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {message && <p style={{ color: 'var(--color-outside)' }}>{message}</p>}

      <section className="glass-panel" style={{ padding: '24px', display: 'grid', gap: '16px' }}>
        <h2 style={{ fontSize: '18px', margin: 0 }}>Bring posts in</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
          To show a run you already did in Apify: paste the dataset JSON below, or pull it by run / dataset ID.
          Then publish only the Outside IR35 roles you want on the candidate board.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const res = await importScrapedPosts(json);
            setBusy(false);
            if ('error' in res && res.error) {
              setMessage(res.error);
            } else if ('imported' in res) {
              setMessage(`Parsed ${res.imported} roles (${res.stored} new). Publishable: ${res.counts?.publishable || 0}, review: ${res.counts?.needs_review || 0}, reject: ${res.counts?.reject || 0}.`);
            }
          }}
        >
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            className="input-field"
            rows={8}
            placeholder="Paste the Apify dataset JSON array here"
            style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px' }}
          />
          <button className="btn btn-primary btn-sm" type="submit" disabled={busy || !json.trim()} style={{ marginTop: '12px' }}>
            {busy ? 'Importing…' : 'Parse and import'}
          </button>
        </form>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const res = await startApifyScrape(new FormData(e.currentTarget));
            setBusy(false);
            if ('runId' in res && res.runId) setRunId(res.runId);
            if ('error' in res && res.error) setMessage(res.error);
            else if ('status' in res) setMessage(`Apify run started (${res.status || 'RUNNING'}). Pull it when it finishes.`);
          }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'end' }}
        >
          <label style={{ fontSize: '13px' }}>
            Query
            <input name="query" defaultValue="outside ir35" className="input-field" style={{ display: 'block', marginTop: '4px' }} />
          </label>
          <label style={{ fontSize: '13px' }}>
            Max posts
            <input name="maxPosts" type="number" defaultValue={20} min={1} max={50} className="input-field" style={{ display: 'block', marginTop: '4px', width: '90px' }} />
          </label>
          <label style={{ fontSize: '13px' }}>
            Posted
            <select name="postedLimit" defaultValue="week" className="input-field" style={{ display: 'block', marginTop: '4px' }}>
              <option value="day">Past day</option>
              <option value="week">Past week</option>
              <option value="month">Past month</option>
            </select>
          </label>
          <button className="btn btn-secondary btn-sm" type="submit" disabled={busy || !apifyConfigured}>
            Run Apify
          </button>
          {!apifyConfigured && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>APIFY_TOKEN is not set — paste JSON instead.</span>}
        </form>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            const existingRun = String(data.get('existingRunId') || '').trim();
            const datasetId = String(data.get('datasetId') || '').trim();
            setBusy(true);
            const res = datasetId
              ? await ingestApifyDataset(datasetId)
              : await ingestApifyRun(existingRun || runId);
            setBusy(false);
            if (existingRun) setRunId(existingRun);
            if ('error' in res && res.error) setMessage(res.error);
            else if ('pending' in res && res.pending) setMessage(`Still ${res.status}`);
            else if ('imported' in res) setMessage(`Loaded ${res.imported} roles from that run.`);
          }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'end' }}
        >
          <label style={{ fontSize: '13px' }}>
            Existing run ID
            <input name="existingRunId" defaultValue={runId} placeholder="from Apify console → Runs" className="input-field" style={{ display: 'block', marginTop: '4px', minWidth: '220px' }} />
          </label>
          <label style={{ fontSize: '13px' }}>
            Or dataset ID
            <input name="datasetId" placeholder="from the run’s Storage tab" className="input-field" style={{ display: 'block', marginTop: '4px', minWidth: '220px' }} />
          </label>
          <button className="btn btn-primary btn-sm" type="submit" disabled={busy || !apifyConfigured}>
            Show that run
          </button>
        </form>
      </section>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {FILTERS.map((key) => (
          <button
            key={key}
            className={`btn btn-sm ${filter === key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(key)}
          >
            {key.replace('_', ' ')} ({counts[key]})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No leads in this view.
        </div>
      ) : (
        [...visible]
          .sort((a, b) => Number(Boolean(leadEmail(b))) - Number(Boolean(leadEmail(a))))
          .map((lead) => <LeadCard key={lead.id} lead={lead} onMessage={setMessage} />)
      )}
    </div>
  );
}

function leadEmail(lead: Lead) {
  return lead.apply_email || lead.contact_email || extractApplyEmail(`${lead.description_html || ''}\n${lead.apply_url || ''}`);
}

function LeadCard({ lead, onMessage }: { lead: Lead; onMessage: (value: string) => void }) {
  const [busy, setBusy] = useState(false);
  const foundEmail = lead.apply_email || extractApplyEmail(`${lead.description_html || ''}\n${lead.apply_url || ''}`);
  const tone = lead.classification === 'publishable'
    ? 'var(--color-outside)'
    : lead.classification === 'reject'
      ? 'var(--color-inside)'
      : 'var(--color-warning)';

  return (
    <form
      className="glass-panel"
      style={{ padding: '20px', display: 'grid', gap: '12px', borderLeft: `4px solid ${tone}` }}
      onSubmit={async (e) => {
        e.preventDefault();
        const submitter = (e.nativeEvent as SubmitEvent).submitter;
        const decision = submitter instanceof HTMLButtonElement && submitter.name === 'decision'
          ? submitter.value
          : 'publish';
        const data = new FormData(e.currentTarget);
        setBusy(true);
        const res = decision === 'reject'
          ? await rejectScrapedLead(lead.id, String(data.get('contact_email') || ''))
          : await publishScrapedLead(lead.id, data);
        setBusy(false);
        onMessage(res.error || (decision === 'reject'
          ? 'Rejected — it will not appear on the board.'
          : `Published “${lead.title}”. Candidates can see it on /jobs.`));
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '12px', color: tone, fontWeight: 700, textTransform: 'uppercase' }}>
            {lead.classification.replace('_', ' ')} · {lead.confidence}%
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{lead.classification_reason}</div>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          {formatDayRate(lead.day_rate_min, lead.day_rate_max)} / day
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
        <Field name="title" label="Title" defaultValue={lead.title} />
        <Field name="company_name" label="Recruiter / company" defaultValue={lead.company_name || ''} />
        <Field name="location" label="Location" defaultValue={lead.location || ''} />
        <Field name="day_rate_min" label="Day rate min" defaultValue={lead.day_rate_min ?? ''} type="number" />
        <Field name="day_rate_max" label="Day rate max" defaultValue={lead.day_rate_max ?? ''} type="number" />
        <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Workspace
          <select name="remote_type" defaultValue={lead.remote_type} className="input-field" style={{ display: 'block', marginTop: '4px' }}>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>
        </label>
        <Field name="contract_length" label="Length" defaultValue={lead.contract_length || ''} />
        <Field name="apply_url" label="Apply URL" defaultValue={lead.apply_url || ''} />
        <Field name="contact_email" label="Client email" defaultValue={lead.contact_email || foundEmail} type="email" />
        <input type="hidden" name="ir35_status" value="outside" />
        <input type="hidden" name="clearance_level" value={lead.clearance_level} />
      </div>

      <textarea
        name="description_html"
        defaultValue={lead.description_html}
        className="input-field"
        rows={5}
        style={{ width: '100%', fontSize: '12px' }}
      />

      <label style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: foundEmail ? 'var(--color-outside)' : 'var(--text-muted)' }}>
        <input type="checkbox" checked={Boolean(foundEmail)} readOnly disabled />
        {foundEmail ? `Application email found: ${foundEmail}` : 'No application email in this post. You can still publish it.'}
      </label>
      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
        Client email is only for you, so you can ask them to post the role here. Leave it blank if you do not have one.
      </p>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        {lead.status === 'published' ? (
          <Link href="/jobs" className="btn btn-primary btn-sm">View board</Link>
        ) : lead.classification === 'reject' ? null : (
          <button className="btn btn-primary btn-sm" type="submit" name="decision" value="publish" disabled={busy}>
            {busy ? 'Saving…' : 'Publish to candidates'}
          </button>
        )}
        {lead.status === 'pending' && (
          <button className="btn btn-secondary btn-sm" type="submit" name="decision" value="reject" disabled={busy}>
            Reject
          </button>
        )}
        {(lead.contact_email || foundEmail) && (
          <a href={`mailto:${lead.contact_email || foundEmail}`} className="btn btn-secondary btn-sm">
            Email this client
          </a>
        )}
        {lead.source_url && (
          <a href={lead.source_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
            Open LinkedIn
          </a>
        )}
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {lead.recruiter_name} · {lead.ir35_status} · {lead.status}
        </span>
      </div>
    </form>
  );
}

function Field({ name, label, defaultValue, type = 'text' }: { name: string; label: string; defaultValue: string | number; type?: string }) {
  return (
    <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
      {label}
      <input name={name} type={type} defaultValue={defaultValue} className="input-field" style={{ display: 'block', marginTop: '4px', width: '100%' }} />
    </label>
  );
}
