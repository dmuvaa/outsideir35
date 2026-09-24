import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isAllowedApplicationStatus,
  jobEvidencePayload,
  validateJobPostInput,
  validateRegisterInput,
} from './platform.ts';

test('profile setup rejects a recruiter without a company', () => {
  assert.equal(
    validateRegisterInput({
      firstName: 'A',
      lastName: 'B',
      role: 'candidate',
      consent: true,
    }).error,
    null
  );
  assert.ok(
    validateRegisterInput({
      firstName: 'A',
      lastName: 'B',
      role: 'recruiter',
      consent: true,
    }).error
  );
});

test('createJob/updateJob action contracts', () => {
  const ok = validateJobPostInput({
    title: 'React contractor',
    location: 'London',
    day_rate_min: 500,
    day_rate_max: 650,
    ir35_status: 'outside',
    attested: true,
    status: 'active',
  });
  assert.equal(ok.error, null);

  const fd = new FormData();
  fd.set('engagement_model', 'psc');
  fd.set('fee_payer', 'Acme Ltd');
  fd.set('ir35_attested', 'on');
  const evidence = jobEvidencePayload(fd);
  assert.equal(evidence.fee_payer, 'Acme Ltd');
  assert.ok(evidence.ir35_attested_at);
});

test('updateApplicationStatus only allows pipeline values', () => {
  assert.equal(isAllowedApplicationStatus('applied'), true);
  assert.equal(isAllowedApplicationStatus('pending'), false);
  assert.equal(isAllowedApplicationStatus('hacked'), false);
});
