import assert from 'node:assert/strict';
import test from 'node:test';
import { parentNameFor, suggestSubcategorySlug } from './job-taxonomy.ts';

test('software roles suggest technology, not a blank default', () => {
  assert.equal(suggestSubcategorySlug('Senior Platform Engineer, AWS, London'), 'software-engineering-it');
  assert.equal(parentNameFor('software-engineering-it'), 'Technology');
});

test('finance and clinical roles keep their own categories', () => {
  assert.equal(suggestSubcategorySlug('Management Accountant, outside IR35'), 'finance-accounting');
  assert.equal(parentNameFor('finance-accounting'), 'Finance');
  assert.equal(suggestSubcategorySlug('Locum doctor, outside IR35'), 'healthcare-medical');
  assert.equal(parentNameFor('healthcare-medical'), 'Healthcare');
});

test('daily contract specialisms land in their own subcategory', () => {
  assert.equal(suggestSubcategorySlug('SAP Consultant, outside IR35'), 'erp-sap-crm');
  assert.equal(parentNameFor('erp-sap-crm'), 'Technology');
  assert.equal(suggestSubcategorySlug('SAP FICO Consultant'), 'finance-accounting');
  assert.equal(suggestSubcategorySlug('ServiceNow CPQ Consultant'), 'it-service-management');
  assert.equal(suggestSubcategorySlug('Project Manager, outside IR35'), 'project-programme-management');
  assert.equal(parentNameFor('project-programme-management'), 'Professional Services');
  assert.equal(suggestSubcategorySlug('Quantity Surveyor, London'), 'quantity-surveying');
  assert.equal(parentNameFor('quantity-surveying'), 'Construction');
});

test('a role with no recognisable specialism is left unclassified', () => {
  assert.equal(suggestSubcategorySlug('Contract role, outside IR35, DM me'), '');
  assert.equal(parentNameFor(''), '');
});
