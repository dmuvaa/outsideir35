'use client';

import React, { useState } from 'react';
import { markOutreachSent } from '@/app/actions/admin';

export type OutreachPerson = {
  email: string;
  name: string;
  company: string;
  roles: string[];
  sentAt: string | null;
};

const DEFAULT_NOTE = `Hi {first},

Contractors looking for Outside IR35 work keep asking for a single place to find those roles. If you would like yours listed, you can open an account and post it yourself:

{link}

It takes a minute, and you can add the day rate and IR35 status as you go.`;

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { first: '', last: '' };
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

function inviteLink(siteUrl: string, person: OutreachPerson) {
  const { first, last } = splitName(person.name);
  const url = new URL('/register', siteUrl);
  url.searchParams.set('role', 'recruiter');
  url.searchParams.set('invite', '1');
  if (person.email) url.searchParams.set('email', person.email);
  if (first) url.searchParams.set('firstName', first);
  if (last) url.searchParams.set('lastName', last);
  if (person.company) url.searchParams.set('companyName', person.company);
  return url.toString();
}

function fillNote(template: string, person: OutreachPerson, siteUrl: string) {
  const { first } = splitName(person.name);
  return template
    .replaceAll('{first}', first || 'there')
    .replaceAll('{name}', person.name || 'there')
    .replaceAll('{company}', person.company || 'your team')
    .replaceAll('{link}', inviteLink(siteUrl, person));
}

export default function OutreachList({ people, siteUrl, trackingReady }: { people: OutreachPerson[]; siteUrl: string; trackingReady: boolean }) {
  const [note, setNote] = useState(DEFAULT_NOTE);
  const [sent, setSent] = useState<Record<string, string | null>>(Object.fromEntries(people.map((person) => [person.email, person.sentAt])));
  const [message, setMessage] = useState('');
  const [onlyUnsent, setOnlyUnsent] = useState(false);

  const visible = people.filter((person) => !onlyUnsent || !sent[person.email]);

  const copyText = async (value: string, confirmation: string) => {
    await navigator.clipboard.writeText(value);
    setMessage(confirmation);
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {message && <p style={{ color: 'var(--color-outside)', margin: 0 }}>{message}</p>}
      {!trackingReady && (
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '13px' }}>
          Notes can be copied now. To remember who you already wrote to, run supabase/migrations/20260925020000_outreach_contacts.sql.
        </p>
      )}

      <section className="glass-panel" style={{ padding: '20px', display: 'grid', gap: '8px' }}>
        <label style={{ fontSize: '13px', fontWeight: 600 }}>
          Note
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={8}
            className="input-field"
            style={{ display: 'block', width: '100%', marginTop: '8px', fontSize: '14px' }}
          />
        </label>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
          {'{first}'}, {'{name}'}, {'{company}'}, and {'{link}'} are filled in for each person.
        </p>
      </section>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{people.length} {people.length === 1 ? 'person' : 'people'} with an email</span>
        <label style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' }}>
          <input type="checkbox" checked={onlyUnsent} onChange={(e) => setOnlyUnsent(e.target.checked)} />
          Hide people already contacted
        </label>
        <button
          className="btn btn-secondary btn-sm"
          type="button"
          onClick={() => copyText(people.map((person) => person.email).join(', '), 'Copied the email addresses.')}
          disabled={!people.length}
        >
          Copy emails
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No one with an email in this view.
        </div>
      ) : visible.map((person) => {
        const body = fillNote(note, person, siteUrl);
        const mailto = `mailto:${person.email}?subject=${encodeURIComponent('Listing your Outside IR35 roles')}&body=${encodeURIComponent(body)}`;
        const when = sent[person.email] ? new Date(sent[person.email] as string) : null;
        return (
          <article key={person.email} className="glass-panel" style={{ padding: '16px', display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{person.name || 'Name not on the post'}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{person.email}{person.company ? ` · ${person.company}` : ''}</div>
                {person.roles[0] && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{person.roles.slice(0, 2).join(' · ')}</div>}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {when && !Number.isNaN(when.getTime()) ? `Sent ${when.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Not sent'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <a className="btn btn-primary btn-sm" href={mailto}>Email</a>
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => copyText(body, `Copied the note for ${person.email}.`)}>Copy note</button>
              <a className="btn btn-secondary btn-sm" href={inviteLink(siteUrl, person)} target="_blank" rel="noreferrer">Open invite</a>
              <button
                className="btn btn-secondary btn-sm"
                type="button"
                onClick={async () => {
                  const res = await markOutreachSent(person.email, person.name, person.company);
                  if (res.error) {
                    setMessage(res.error);
                    return;
                  }
                  setSent((current) => ({ ...current, [person.email]: new Date().toISOString() }));
                  setMessage(`Marked ${person.email} as sent.`);
                }}
              >
                Mark sent
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
