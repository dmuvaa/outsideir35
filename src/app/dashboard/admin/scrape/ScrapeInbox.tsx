'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { importScrapedPosts, startApifyScrape, ingestApifyRun, ingestApifyDataset, publishScrapedLead, rejectScrapedLead, deleteScrapedLeads } from '@/app/actions/scrape';
import { formatDayRate } from '@/lib/platform';
import { extractApplyEmail } from '@/lib/scrape-parse';
import { suggestSubcategorySlug } from '@/lib/job-taxonomy';

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
  created_at: string | null;
};

const FILTERS = ['pending', 'with_email', 'publishable', 'needs_review', 'reject', 'published', 'rejected'] as const;

type CategoryOption = { id: string; name: string; slug: string; parent_id: string | null };

function importMessage(res: { posts?: number; imported?: number; stored?: number; failed?: number }) {
  const total = res.posts ?? res.imported ?? 0;
  const imported = res.imported ?? total;
  const stored = res.stored ?? imported;
  if (res.failed) return `Imported ${imported} of ${total} posts.`;
  if (stored < imported) return `Imported ${imported} posts. ${stored} were new.`;
  return `Imported ${imported} posts.`;
}

export default function ScrapeInbox({ leads, categories = [], apifyConfigured }: { leads: Lead[]; categories?: CategoryOption[]; apifyConfigured: boolean }) {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('pending');
  const [json, setJson] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [runId, setRunId] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

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

  const ordered = [...visible].sort((a, b) => {
    const day = postedTime(b) - postedTime(a);
    if (day) return day;
    return Number(Boolean(leadEmail(b))) - Number(Boolean(leadEmail(a)));
  });
  const selectedInView = ordered.filter((lead) => selected.includes(lead.id)).map((lead) => lead.id);

  const removePosts = async (ids: string[]) => {
    if (!ids.length) return;
    const label = ids.length === 1 ? 'Remove this post from the inbox?' : `Remove ${ids.length} posts from the inbox?`;
    if (!window.confirm(label)) return;
    setBusy(true);
    const res = await deleteScrapedLeads(ids);
    setBusy(false);
    if ('error' in res && res.error) {
      setMessage(res.error);
      return;
    }
    const removed = 'removed' in res ? res.removed : ids.length;
    setSelected((current) => current.filter((id) => !ids.includes(id)));
    setMessage(`Removed ${removed} ${removed === 1 ? 'post' : 'posts'}.`);
    router.refresh();
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
              setFilter('pending');
              setMessage(importMessage(res));
              router.refresh();
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
            Max posts (0 = all)
            <input name="maxPosts" type="number" defaultValue={0} min={0} className="input-field" style={{ display: 'block', marginTop: '4px', width: '90px' }} />
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
            else if ('imported' in res) {
              setFilter('pending');
              setMessage(importMessage(res));
              router.refresh();
            }
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

      {visible.length > 0 && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' }}>
            <input
              type="checkbox"
              checked={visible.every((lead) => selected.includes(lead.id))}
              onChange={(e) => {
                const ids = visible.map((lead) => lead.id);
                setSelected(e.target.checked
                  ? [...new Set([...selected, ...ids])]
                  : selected.filter((id) => !ids.includes(id)));
              }}
            />
            Select all in this view
          </label>
          <button
            className="btn btn-secondary btn-sm"
            type="button"
            disabled={busy || selectedInView.length === 0}
            onClick={() => removePosts(selectedInView)}
          >
            Remove selected ({selectedInView.length})
          </button>
        </div>
      )}

      {visible.length === 0 ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No leads in this view.
        </div>
      ) : (
        ordered.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            categories={categories}
            selected={selected.includes(lead.id)}
            onToggle={() => setSelected((current) => current.includes(lead.id) ? current.filter((id) => id !== lead.id) : [...current, lead.id])}
            onRemove={() => removePosts([lead.id])}
            onMessage={setMessage}
          />
        ))
      )}
    </div>
  );
}

function postedTime(lead: Lead) {
  const time = lead.created_at ? Date.parse(lead.created_at) : NaN;
  return Number.isFinite(time) ? time : 0;
}

function formatPosted(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `Posted ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

function leadEmail(lead: Lead) {
  return lead.apply_email || lead.contact_email || extractApplyEmail(`${lead.description_html || ''}\n${lead.apply_url || ''}`);
}

function LeadCard({
  lead,
  categories,
  selected,
  onToggle,
  onRemove,
  onMessage,
}: {
  lead: Lead;
  categories: CategoryOption[];
  selected: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onMessage: (value: string) => void;
}) {
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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <input type="checkbox" checked={selected} onChange={onToggle} aria-label={`Select ${lead.title}`} style={{ marginTop: '4px' }} />
          <div>
            <div style={{ fontSize: '12px', color: tone, fontWeight: 700, textTransform: 'uppercase' }}>
              {lead.classification.replace('_', ' ')} · {lead.confidence}%
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{lead.classification_reason}</div>
          </div>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'right' }}>
          <div>{formatPosted(lead.created_at)}</div>
          <div>{formatDayRate(lead.day_rate_min, lead.day_rate_max)} / day</div>
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
        <CategoryFields categories={categories} title={lead.title} description={lead.description_html} />
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
        <button className="btn btn-secondary btn-sm" type="button" onClick={onRemove} disabled={busy}>
          Remove
        </button>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {lead.recruiter_name} · {lead.ir35_status} · {lead.status}
        </span>
      </div>
    </form>
  );
}

function CategoryFields({ categories, title, description }: { categories: CategoryOption[]; title: string; description: string }) {
  const hasTree = categories.some((category) => category.parent_id);
  const suggestion = categories.find((category) => category.slug === suggestSubcategorySlug(`${title}\n${description}`));
  const [parentId, setParentId] = useState(suggestion?.parent_id || (!hasTree ? suggestion?.id || '' : ''));
  const [subcategoryId, setSubcategoryId] = useState(suggestion?.parent_id ? suggestion.id : '');
  const parents = categories.filter((category) => !category.parent_id);
  const children = categories.filter((category) => category.parent_id === parentId);

  return (
    <>
      <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Category
        <select value={parentId} onChange={(e) => { setParentId(e.target.value); setSubcategoryId(''); }} className="input-field" style={{ display: 'block', marginTop: '4px', width: '100%' }}>
          <option value="">Select category</option>
          {(hasTree ? parents : categories).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </label>
      {hasTree && (
        <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Subcategory
          <select value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)} className="input-field" style={{ display: 'block', marginTop: '4px', width: '100%' }}>
            <option value="">Select subcategory</option>
            {children.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
      )}
      <input type="hidden" name="category_id" value={hasTree ? subcategoryId : parentId} />
    </>
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
