import assert from 'node:assert/strict';
import test from 'node:test';
import { parseApifyItems, parseLinkedInPost, type LinkedInPost } from './scrape-parse.ts';

test('clear single Outside IR35 post is publishable', () => {
  const [lead] = parseLinkedInPost({
    id: '1',
    linkedinUrl: 'https://www.linkedin.com/posts/davideking2-role',
    content:
      'Senior Platform Engineer (Cloud Media Platforms)\nLondon- Hybrid 2/3 days typically wfh/West London\n£450-470pd Outside IR35',
    author: {
      name: 'David King',
      info: 'Account Manager @ PCR Digital - Also helping Marketing Automation Specialists',
    },
    article: {
      title: 'Senior Platform Engineer (Cloud Media Platforms)',
      link: 'https://www.aplitrak.com/?adid=abc',
    },
    postedAt: { date: '2026-09-21T17:47:39.236Z' },
  });

  assert.equal(lead.classification, 'publishable');
  assert.equal(lead.title, 'Senior Platform Engineer (Cloud Media Platforms)');
  assert.equal(lead.companyName, 'PCR Digital');
  assert.equal(lead.dayRateMin, 450);
  assert.equal(lead.dayRateMax, 470);
  assert.equal(lead.ir35Status, 'outside');
  assert.equal(lead.remoteType, 'hybrid');
  assert.match(lead.applyUrl, /aplitrak/);
});

test('hourly rates convert to an 8-hour day', () => {
  const [lead] = parseLinkedInPost({
    id: '2',
    linkedinUrl: 'https://www.linkedin.com/posts/alex-beddows',
    content: 'OUTSIDE IR35 CONTRACT | £80 P/H | 12 MONTHS | FULLY REMOTE\nI\'m looking to speak with high level Cyber Security Technical Assurance professionals for a long-term contract.\nMust be able to obtain SC Clearance.',
    author: { name: 'Alex Beddows', info: 'Principal Cyber Security Recruitment Specialist at Morson Edge' },
  });

  assert.equal(lead.classification, 'publishable');
  assert.equal(lead.dayRateMin, 640);
  assert.equal(lead.dayRateMax, 640);
  assert.equal(lead.remoteType, 'remote');
  assert.equal(lead.clearanceLevel, 'SC');
  assert.equal(lead.companyName, 'Morson Edge');
  assert.match(lead.rateNote, /£80\/hour/);
});

test('mixed Inside/Outside lists only keep Outside roles for review', () => {
  const leads = parseLinkedInPost({
    id: '3',
    linkedinUrl: 'https://www.linkedin.com/posts/jamesevans',
    content: `Python Developer - Inside IR35 - Up to £700 per day - Hybrid
C++ Software Engineer - Outside IR35 - Up to £700 per day - Hybrid
AWS Solution Architect - Inside IR35 - Up to £750 per day - Hybrid`,
    author: { name: 'James Evans', info: 'Technology Contracts Manager at Hunter Bond - London' },
  });

  assert.equal(leads.length, 1);
  assert.equal(leads[0].title, 'C++ Software Engineer');
  assert.equal(leads[0].ir35Status, 'outside');
  assert.equal(leads[0].classification, 'needs_review');
  assert.equal(leads[0].dayRateMax, 700);
  assert.equal(leads[0].companyName, 'Hunter Bond');
});

test('competitor aggregator posts are rejected', () => {
  const [lead] = parseLinkedInPost({
    id: '4',
    linkedinUrl: 'https://www.linkedin.com/posts/outsideir35-kotlin',
    content: '#hiring Kotlin Developers',
    author: { name: 'Outside IR35 Jobs | In-Demand', type: 'company', universalName: 'outsideir35' },
    article: {
      title: 'https://jobsrmine.com/job/na/kotlin-developers-moj/3181394795',
      subtitle: 'jobsrmine.com',
      link: 'https://jobsrmine.com/job/na/kotlin-developers-moj/3181394795',
    },
  });

  assert.equal(lead.classification, 'reject');
  assert.ok(lead.reasons.some((reason) => /competitor|aggregat|competing/i.test(reason)));
});

test('agency marketing is rejected', () => {
  const [lead] = parseLinkedInPost({
    id: '5',
    content: 'You bring the demand.\nWe bring the AI Agent Engineers.\nNo hiring.\nJust AI engineering capacity on demand.\nOutside IR35\nDM “AI PARTNER”.',
    author: { name: 'Stefan Jakovljević' },
    linkedinUrl: 'https://www.linkedin.com/posts/stefan',
  });

  assert.equal(lead.classification, 'reject');
});

test('thin Outside IR35 posts stay in review instead of going live', () => {
  const [lead] = parseLinkedInPost({
    id: '6',
    content: 'Hiring 2x Security Business Analysts, outside IR35 - one network security focused, one DR/resilience focused\nPlease DM me for specifics.',
    author: { name: 'David Manfield' },
    linkedinUrl: 'https://www.linkedin.com/posts/davidmanfield',
  });

  assert.equal(lead.ir35Status, 'outside');
  assert.equal(lead.classification, 'needs_review');
  assert.equal(lead.dayRateMin, null);
});

test('email apply paths and missing rates stay in review', () => {
  const [lead] = parseLinkedInPost({
    id: '7',
    content: 'I am currently looking for a freelance Senior Mechanical Design Engineer to support my client on a Data Centre project in Woking.\nThis is a long term contract Outside IR35 with an immediate start.\nmatthew.noon@g2recruitment.com',
    author: { name: 'Matt Noon', info: 'Specialist in Construction & Engineering' },
    job: {
      title: 'Senior Mechanical Design Engineer',
      location: 'Woking, England, United Kingdom (Hybrid)',
      subtitle: 'Job by g2 Recruitment',
      linkedinUrl: 'https://www.linkedin.com/jobs/view/4469916604',
    },
    linkedinUrl: 'https://www.linkedin.com/posts/matt-noon',
  });

  assert.equal(lead.title, 'Senior Mechanical Design Engineer');
  assert.equal(lead.companyName, 'g2 Recruitment');
  assert.match(lead.location, /Woking/i);
  assert.equal(lead.classification, 'needs_review');
});

test('numbered Outside IR35 lines split out of an aggregator list', () => {
  const leads = parseLinkedInPost({
    id: '8',
    content: `5. Lead AI Engineers — Outside IR35 — £550–£650 per day — Remote · UK
6. Java Developer — Inside IR35 — £440–£450 per day — Remote · UK
8. AI Architect — Outside IR35 — Up to £1,000 per day — Remote · UK`,
    author: { name: 'Smit Shah' },
    linkedinUrl: 'https://www.linkedin.com/posts/shahsmit123',
  });

  assert.equal(leads.length, 2);
  assert.deepEqual(leads.map((lead) => lead.title), ['Lead AI Engineers', 'AI Architect']);
  assert.ok(leads.every((lead) => lead.classification === 'needs_review'));
});

test('import dedupes the same role from a post and its repost', () => {
  const original: LinkedInPost = {
    id: '9',
    content: 'UX/UI Designer\nBristol/Midlands\n3-week engagement\nDay rate DOE\nOutside IR35',
    author: { name: 'Lewis Tilley' },
    linkedinUrl: 'https://www.linkedin.com/posts/lewis-tilley',
  };
  const share: LinkedInPost = {
    id: '10',
    content: 'UX/UI Designer (start Thursday)',
    author: { name: 'Alex Bradbury' },
    linkedinUrl: 'https://www.linkedin.com/posts/alexbradbury',
    repost: original,
  };

  const leads = parseApifyItems([original, share]);
  assert.equal(leads.length, 1);
  assert.equal(leads[0].title, 'UX/UI Designer');
  assert.equal(leads[0].classification, 'needs_review');
});
