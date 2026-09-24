'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteJobsAsAdmin } from '@/app/actions/admin';
import { formatDayRate } from '@/lib/platform';

export type ManagedRole = {
  id: string;
  title: string;
  slug: string;
  status: string;
  source: string | null;
  ir35_status: string;
  location: string | null;
  day_rate_min: number | null;
  day_rate_max: number | null;
  created_at: string;
  companies: { name: string } | { name: string }[] | null;
};

const LIVE = ['active', 'open', 'published'];

function companyName(role: ManagedRole) {
  const company = Array.isArray(role.companies) ? role.companies[0] : role.companies;
  return company?.name || 'Unknown company';
}

function postedLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function RoleManager({ roles }: { roles: ManagedRole[] }) {
  const router = useRouter();
  const [view, setView] = useState<'live' | 'all'>('live');
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const visible = roles.filter((role) => view === 'all' || LIVE.includes(role.status));
  const selectedInView = visible.filter((role) => selected.includes(role.id)).map((role) => role.id);

  const removeRoles = async (ids: string[]) => {
    if (!ids.length) return;
    const label = ids.length === 1
      ? 'Remove this role from the candidate board?'
      : `Remove ${ids.length} roles from the candidate board?`;
    if (!window.confirm(label)) return;
    setBusy(true);
    const res = await deleteJobsAsAdmin(ids);
    setBusy(false);
    if (res.error) {
      setMessage(res.error);
      return;
    }
    setSelected((current) => current.filter((id) => !ids.includes(id)));
    const removed = res.removed ?? ids.length;
    setMessage(`Removed ${removed} ${removed === 1 ? 'role' : 'roles'}.`);
    router.refresh();
  };

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {message && <p style={{ color: 'var(--color-outside)', margin: 0 }}>{message}</p>}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button className={`btn btn-sm ${view === 'live' ? 'btn-primary' : 'btn-secondary'}`} type="button" onClick={() => setView('live')}>
          On the board ({roles.filter((role) => LIVE.includes(role.status)).length})
        </button>
        <button className={`btn btn-sm ${view === 'all' ? 'btn-primary' : 'btn-secondary'}`} type="button" onClick={() => setView('all')}>
          All roles ({roles.length})
        </button>
        {visible.length > 0 && (
          <>
            <label style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', marginLeft: '8px' }}>
              <input
                type="checkbox"
                checked={visible.every((role) => selected.includes(role.id))}
                onChange={(e) => {
                  const ids = visible.map((role) => role.id);
                  setSelected(e.target.checked
                    ? [...new Set([...selected, ...ids])]
                    : selected.filter((id) => !ids.includes(id)));
                }}
              />
              Select all in this view
            </label>
            <button className="btn btn-secondary btn-sm" type="button" disabled={busy || selectedInView.length === 0} onClick={() => removeRoles(selectedInView)}>
              Remove selected ({selectedInView.length})
            </button>
          </>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No roles in this view.
        </div>
      ) : (
        visible.map((role) => (
          <article key={role.id} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                checked={selected.includes(role.id)}
                onChange={() => setSelected((current) => current.includes(role.id) ? current.filter((id) => id !== role.id) : [...current, role.id])}
                aria-label={`Select ${role.title}`}
                style={{ marginTop: '4px' }}
              />
              <div>
                <div style={{ fontWeight: 700 }}>{role.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {companyName(role)} · {role.status} · {role.ir35_status} · {role.location || 'Location not set'}
                  {role.source === 'linkedin' ? ' · LinkedIn' : ''}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Posted {postedLabel(role.created_at)} · {formatDayRate(role.day_rate_min, role.day_rate_max)} / day
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Link href={`/jobs/${role.slug}`} className="btn btn-secondary btn-sm">View</Link>
              <Link href={`/dashboard/admin/roles/${role.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
              <button className="btn btn-secondary btn-sm" type="button" disabled={busy} onClick={() => removeRoles([role.id])} style={{ color: 'var(--color-inside)' }}>
                Remove
              </button>
            </div>
          </article>
        ))
      )}
    </div>
  );
}
