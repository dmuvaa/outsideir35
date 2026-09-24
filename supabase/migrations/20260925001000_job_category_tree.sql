-- Categories sit under a parent (Technology, Finance, …). Subcategories stay the existing specialisms.

ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON categories (parent_id);

INSERT INTO categories (id, name, slug, description, icon_svg) VALUES
('b2000000-0000-0000-0000-000000000001', 'Technology', 'technology', 'Software, data, security, and product roles.', '💻'),
('b2000000-0000-0000-0000-000000000002', 'Finance', 'finance', 'Accounting, banking, and financial control.', '📈'),
('b2000000-0000-0000-0000-000000000003', 'Engineering', 'engineering', 'Engineering, manufacturing, energy, and aerospace.', '⚙️'),
('b2000000-0000-0000-0000-000000000004', 'Healthcare', 'healthcare', 'Clinical, medical, and life sciences roles.', '💙'),
('b2000000-0000-0000-0000-000000000005', 'Construction', 'construction', 'Construction, property, and surveying.', '🏗️'),
('b2000000-0000-0000-0000-000000000006', 'Government', 'government', 'Public sector and civil service roles.', '🏛️'),
('b2000000-0000-0000-0000-000000000007', 'Professional Services', 'professional-services', 'Marketing, legal, people, sales, and operations.', '🤝'),
('b2000000-0000-0000-0000-000000000008', 'Other roles', 'other-roles', 'Roles that do not fit a listed category.', '📌')
ON CONFLICT (slug) DO NOTHING;

UPDATE categories SET parent_id = 'b2000000-0000-0000-0000-000000000001'
WHERE slug IN ('software-engineering-it', 'cybersecurity', 'data-analytics', 'telecommunications', 'product-management');

UPDATE categories SET parent_id = 'b2000000-0000-0000-0000-000000000002'
WHERE slug = 'finance-accounting';

UPDATE categories SET parent_id = 'b2000000-0000-0000-0000-000000000003'
WHERE slug IN ('engineering-manufacturing', 'automotive-transport', 'energy-renewables', 'aerospace-defense');

UPDATE categories SET parent_id = 'b2000000-0000-0000-0000-000000000004'
WHERE slug IN ('healthcare-medical', 'pharmaceuticals-life-sciences');

UPDATE categories SET parent_id = 'b2000000-0000-0000-0000-000000000005'
WHERE slug IN ('construction-property', 'real-estate-proptech');

UPDATE categories SET parent_id = 'b2000000-0000-0000-0000-000000000006'
WHERE slug = 'government-public-sector';

UPDATE categories SET parent_id = 'b2000000-0000-0000-0000-000000000007'
WHERE slug IN (
  'marketing-pr-media', 'design-creative', 'media-entertainment', 'sales-business-development',
  'legal-compliance', 'human-resources', 'education-edtech', 'customer-service-operations',
  'logistics-supply-chain', 'retail-ecommerce', 'hospitality-tourism', 'agriculture-agritech'
);

UPDATE categories SET parent_id = 'b2000000-0000-0000-0000-000000000008'
WHERE slug = 'other';

-- Extra specialisms used on UK contract desks. Safe to re-run.
INSERT INTO categories (id, name, slug, description, icon_svg, parent_id) VALUES
('b2000000-0000-0000-0000-000000000101', 'Cloud & Infrastructure', 'cloud-infrastructure', 'Cloud, platform, and infrastructure engineering.', '☁️', 'b2000000-0000-0000-0000-000000000001'),
('b2000000-0000-0000-0000-000000000102', 'Quality Assurance & Testing', 'quality-assurance-testing', 'Manual testing, automation, and SDET roles.', '🧪', 'b2000000-0000-0000-0000-000000000001'),
('b2000000-0000-0000-0000-000000000103', 'ERP, SAP & CRM', 'erp-sap-crm', 'SAP, Salesforce, Dynamics, Workday, and Oracle roles.', '🧩', 'b2000000-0000-0000-0000-000000000001'),
('b2000000-0000-0000-0000-000000000104', 'IT Service Management', 'it-service-management', 'ServiceNow, ITIL, and service desk roles.', '🛠️', 'b2000000-0000-0000-0000-000000000001'),
('b2000000-0000-0000-0000-000000000105', 'Solution Architecture', 'solution-architecture', 'Solution, enterprise, and technical architecture.', '🏛️', 'b2000000-0000-0000-0000-000000000001'),
('b2000000-0000-0000-0000-000000000106', 'Banking & Capital Markets', 'banking-capital-markets', 'Investment banking, markets, and credit roles.', '🏦', 'b2000000-0000-0000-0000-000000000002'),
('b2000000-0000-0000-0000-000000000107', 'Insurance', 'insurance', 'Underwriting, claims, and actuarial roles.', '🛡️', 'b2000000-0000-0000-0000-000000000002'),
('b2000000-0000-0000-0000-000000000108', 'Tax & Treasury', 'tax-treasury', 'Tax, VAT, and treasury roles.', '💷', 'b2000000-0000-0000-0000-000000000002'),
('b2000000-0000-0000-0000-000000000109', 'Rail & Infrastructure', 'rail-infrastructure', 'Rail, signalling, and transport infrastructure.', '🚆', 'b2000000-0000-0000-0000-000000000003'),
('b2000000-0000-0000-0000-000000000110', 'Utilities', 'utilities', 'Water, power, and utilities roles.', '💡', 'b2000000-0000-0000-0000-000000000003'),
('b2000000-0000-0000-0000-000000000111', 'Health Informatics', 'health-informatics', 'EPR, clinical systems, and health data roles.', '🩺', 'b2000000-0000-0000-0000-000000000004'),
('b2000000-0000-0000-0000-000000000112', 'Quantity Surveying & Commercial', 'quantity-surveying', 'Quantity surveying and commercial management.', '📐', 'b2000000-0000-0000-0000-000000000005'),
('b2000000-0000-0000-0000-000000000113', 'Project & Programme Management', 'project-programme-management', 'Project, programme, PMO, and delivery roles.', '📋', 'b2000000-0000-0000-0000-000000000007'),
('b2000000-0000-0000-0000-000000000114', 'Business Analysis', 'business-analysis', 'Business analysis and requirements roles.', '📝', 'b2000000-0000-0000-0000-000000000007'),
('b2000000-0000-0000-0000-000000000115', 'Change & Transformation', 'change-transformation', 'Change, transformation, and operating-model roles.', '🔄', 'b2000000-0000-0000-0000-000000000007'),
('b2000000-0000-0000-0000-000000000116', 'Procurement', 'procurement', 'Procurement, buying, and category management.', '🛒', 'b2000000-0000-0000-0000-000000000007')
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description;

UPDATE skills SET category_id = 'b2000000-0000-0000-0000-000000000101'
WHERE slug IN (
  'site-reliability-engineer-sre', 'aws-cloud-architect', 'azure-cloud-architect', 'gcp-cloud-architect',
  'kubernetes-engineer', 'terraform-iac-engineer', 'system-administrator'
);
UPDATE skills SET category_id = 'b2000000-0000-0000-0000-000000000102'
WHERE slug IN ('qa-automation-engineer', 'manual-qa-tester');
UPDATE skills SET category_id = 'b2000000-0000-0000-0000-000000000103'
WHERE slug = 'salesforce-developer';
UPDATE skills SET category_id = 'b2000000-0000-0000-0000-000000000104'
WHERE slug = 'it-support-helpdesk';
UPDATE skills SET category_id = 'b1000000-0000-0000-0000-000000000015'
WHERE slug = 'network-engineer';
UPDATE skills SET category_id = 'b2000000-0000-0000-0000-000000000106'
WHERE slug IN ('investment-banker', 'quantitative-analyst', 'private-equity-analyst');
UPDATE skills SET category_id = 'b2000000-0000-0000-0000-000000000107'
WHERE slug = 'actuary';
UPDATE skills SET category_id = 'b2000000-0000-0000-0000-000000000108'
WHERE slug = 'tax-specialist';
UPDATE skills SET category_id = 'b2000000-0000-0000-0000-000000000112'
WHERE slug = 'quantity-surveyor';
UPDATE skills SET category_id = 'b2000000-0000-0000-0000-000000000113'
WHERE slug IN ('scrum-master', 'agile-delivery-manager');
UPDATE skills SET category_id = 'b2000000-0000-0000-0000-000000000114'
WHERE slug = 'business-analyst';
UPDATE skills SET category_id = 'b2000000-0000-0000-0000-000000000116'
WHERE slug = 'procurement-manager';

INSERT INTO skills (name, slug, category_id) VALUES
('Cloud Engineer', 'cloud-engineer', 'b2000000-0000-0000-0000-000000000101'),
('Test Analyst', 'test-analyst', 'b2000000-0000-0000-0000-000000000102'),
('SDET', 'sdet', 'b2000000-0000-0000-0000-000000000102'),
('SAP Consultant', 'sap-consultant', 'b2000000-0000-0000-0000-000000000103'),
('SAP ABAP Developer', 'sap-abap-developer', 'b2000000-0000-0000-0000-000000000103'),
('Workday Consultant', 'workday-consultant', 'b2000000-0000-0000-0000-000000000103'),
('Dynamics 365 Consultant', 'dynamics-365-consultant', 'b2000000-0000-0000-0000-000000000103'),
('ServiceNow Consultant', 'servicenow-consultant', 'b2000000-0000-0000-0000-000000000104'),
('ITIL Service Manager', 'itil-service-manager', 'b2000000-0000-0000-0000-000000000104'),
('Solution Architect', 'solution-architect', 'b2000000-0000-0000-0000-000000000105'),
('Enterprise Architect', 'enterprise-architect', 'b2000000-0000-0000-0000-000000000105'),
('KYC Analyst', 'kyc-analyst', 'b2000000-0000-0000-0000-000000000106'),
('Credit Risk Analyst', 'credit-risk-analyst', 'b2000000-0000-0000-0000-000000000106'),
('Underwriter', 'underwriter', 'b2000000-0000-0000-0000-000000000107'),
('Treasury Manager', 'treasury-manager', 'b2000000-0000-0000-0000-000000000108'),
('VAT Specialist', 'vat-specialist', 'b2000000-0000-0000-0000-000000000108'),
('Signalling Engineer', 'signalling-engineer', 'b2000000-0000-0000-0000-000000000109'),
('Rail Systems Engineer', 'rail-systems-engineer', 'b2000000-0000-0000-0000-000000000109'),
('Utilities Engineer', 'utilities-engineer', 'b2000000-0000-0000-0000-000000000110'),
('EPR Analyst', 'epr-analyst', 'b2000000-0000-0000-0000-000000000111'),
('Epic Analyst', 'epic-analyst', 'b2000000-0000-0000-0000-000000000111'),
('Commercial Manager', 'commercial-manager', 'b2000000-0000-0000-0000-000000000112'),
('Project Manager', 'project-manager', 'b2000000-0000-0000-0000-000000000113'),
('Programme Manager', 'programme-manager', 'b2000000-0000-0000-0000-000000000113'),
('PMO Analyst', 'pmo-analyst', 'b2000000-0000-0000-0000-000000000113'),
('Lead Business Analyst', 'lead-business-analyst', 'b2000000-0000-0000-0000-000000000114'),
('Change Manager', 'change-manager', 'b2000000-0000-0000-0000-000000000115'),
('Transformation Lead', 'transformation-lead', 'b2000000-0000-0000-0000-000000000115'),
('Buyer', 'buyer', 'b2000000-0000-0000-0000-000000000116'),
('Category Manager', 'category-manager', 'b2000000-0000-0000-0000-000000000116')
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id, slug = EXCLUDED.slug;
