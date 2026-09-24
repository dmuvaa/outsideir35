import assert from 'node:assert/strict';
import test from 'node:test';
import {
  allowedStorageUrl,
  applicationStatusLabel,
  companyHref,
  formatDayRate,
  isAllowedImagePath,
  isLiveJob,
  isSourcedJob,
  jobMatchesSeoIntent,
  normalizeApplicationStatus,
  normalizeIr35,
  parseJobSearchParams,
  parseSeoIntent,
  profileCompletionScore,
  seoCopy,
  slugify,
  uniqueSlug,
  validateJobPostInput,
  validateRegisterInput,
} from './platform.ts';

test('slugify strips punctuation and lowercases', () => {
  assert.equal(slugify('Senior React Developer!'), 'senior-react-developer');
});

test('uniqueSlug is stable prefix', () => {
  assert.match(uniqueSlug('AWS Architect', 42), /^aws-architect-42$/);
});

test('normalizeIr35 accepts mixed case and rejects junk', () => {
  assert.equal(normalizeIr35('Outside'), 'outside');
  assert.equal(normalizeIr35('INSIDE'), 'inside');
  assert.equal(normalizeIr35('all'), null);
  assert.equal(normalizeIr35('maybe'), null);
});

test('companyHref prefers slug over uuid', () => {
  assert.equal(companyHref({ slug: 'acme', id: 'uuid-1' }), '/companies/acme');
  assert.equal(companyHref({ id: 'uuid-1' }), '/companies/uuid-1');
});

test('isLiveJob rejects drafts, expired, and unpublished', () => {
  const now = new Date('2026-09-16T12:00:00Z');
  assert.equal(isLiveJob({ status: 'active' }, now), true);
  assert.equal(isLiveJob({ status: 'open' }, now), true);
  assert.equal(isLiveJob({ status: 'draft' }, now), false);
  assert.equal(isLiveJob({ status: 'active', expires_at: '2026-09-01T00:00:00Z' }, now), false);
  assert.equal(isLiveJob({ status: 'active', published_at: '2026-09-20T00:00:00Z' }, now), false);
});

test('formatDayRate hides empty sourced rates', () => {
  assert.equal(formatDayRate(450, 470), '£450 – £470');
  assert.equal(formatDayRate(640, 640), '£640');
  assert.equal(formatDayRate(null, null), 'Rate DOE');
  assert.equal(isSourcedJob({ source: 'linkedin' }), true);
});

test('legacy application statuses map to applied/interviewing/offered', () => {
  assert.equal(normalizeApplicationStatus('pending'), 'applied');
  assert.equal(normalizeApplicationStatus('interview'), 'interviewing');
  assert.equal(normalizeApplicationStatus('offer'), 'offered');
  assert.equal(applicationStatusLabel('pending'), 'Applied');
});

test('profileCompletionScore is field-based', () => {
  assert.equal(profileCompletionScore(null), 15);
  assert.equal(
    profileCompletionScore({
      first_name: 'Ada',
      last_name: 'Lovelace',
      headline: 'Engineer',
      bio: 'Bio',
      location: 'London',
      min_day_rate: 500,
      max_day_rate: 700,
      availability: 'immediate',
      resume_url: 'https://example.com/cv.pdf',
      linkedin_url: 'https://linkedin.com/in/ada',
    }),
    100
  );
});

test('parseSeoIntent extracts outside IR35 react london', () => {
  const intent = parseSeoIntent('outside-ir35-react-jobs-london');
  assert.equal(intent.ir35, 'outside');
  assert.equal(intent.skill, 'REACT');
  assert.equal(intent.location, 'London');
  const copy = seoCopy(intent, 4);
  assert.match(copy.title, /Outside IR35/);
  assert.match(copy.title, /REACT/);
});

test('jobMatchesSeoIntent filters on skill and IR35', () => {
  const intent = parseSeoIntent('outside-ir35-react-jobs');
  assert.equal(
    jobMatchesSeoIntent({ skills: ['React'], ir35Status: 'outside', location: 'London' }, intent),
    true
  );
  assert.equal(
    jobMatchesSeoIntent({ skills: ['Python'], ir35Status: 'outside' }, intent),
    false
  );
});

test('parseJobSearchParams lowercases IR35 from the hero form', () => {
  const parsed = parseJobSearchParams({ ir35: 'Outside', remote: 'remote', clearance: 'sc' });
  assert.equal(parsed.ir35, 'outside');
  assert.equal(parsed.remote, true);
  assert.equal(parsed.clearance, 'SC');
});

test('validateRegisterInput covers consent and recruiter company', () => {
  const missing = validateRegisterInput({ firstName: 'Ada', consent: true });
  assert.match(missing.error || '', /last name/i);
  const ok = validateRegisterInput({
    firstName: 'Ada',
    lastName: 'Lovelace',
    role: 'candidate',
    consent: true,
  });
  assert.equal(ok.error, null);
  const recruiter = validateRegisterInput({
    firstName: 'Ada',
    lastName: 'Lovelace',
    role: 'recruiter',
    consent: true,
  });
  assert.match(recruiter.error || '', /Company name/);
});

test('validateJobPostInput requires outside IR35 attestation', () => {
  const missing = validateJobPostInput({
    title: 'Role',
    location: 'London',
    day_rate_min: 600,
    day_rate_max: 500,
    ir35_status: 'outside',
  });
  assert.match(missing.error || '', /exceed/);
  const unattested = validateJobPostInput({
    title: 'Role',
    location: 'London',
    day_rate_min: 500,
    day_rate_max: 600,
    ir35_status: 'outside',
    attested: false,
  });
  assert.match(unattested.error || '', /Confirm/);
  const ok = validateJobPostInput({
    title: 'Role',
    location: 'London',
    day_rate_min: 500,
    day_rate_max: 600,
    ir35_status: 'outside',
    attested: true,
    status: 'active',
  });
  assert.equal(ok.error, null);
});

test('image proxy rejects traversal and foreign hosts', () => {
  assert.equal(isAllowedImagePath('../secret'), false);
  assert.equal(isAllowedImagePath('media/logo.png'), true);
  assert.equal(
    allowedStorageUrl(
      'https://xyz.supabase.co/storage/v1/object/public/media/a.png',
      'https://abc.supabase.co'
    ),
    false
  );
  assert.equal(
    allowedStorageUrl(
      'https://abc.supabase.co/storage/v1/object/public/media/a.png',
      'https://abc.supabase.co'
    ),
    true
  );
});
