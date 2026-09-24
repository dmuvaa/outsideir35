-- OutsideIR35 Seed Data and Database Schema Fixes
-- Run this script in the Supabase Dashboard SQL Editor

-- 1. Schema Fixes (Adding missing columns needed by the application)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- 2. Disable Row Level Security on all tables to allow public CRUD operations
-- Since this is a testing/prototype app and has no RLS policies set up, disabling RLS ensures our client can read and write.
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE company_socials DISABLE ROW LEVEL SECURITY;
ALTER TABLE company_locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_skills DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE guides DISABLE ROW LEVEL SECURITY;
ALTER TABLE faqs DISABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- 3. Clean up existing records in appropriate order to avoid FK errors
DELETE FROM job_skills;
DELETE FROM saved_jobs;
DELETE FROM applications;
DELETE FROM jobs;
DELETE FROM skills;
DELETE FROM companies;
DELETE FROM candidate_profiles;
DELETE FROM recruiter_profiles;
DELETE FROM users;
DELETE FROM guides;
DELETE FROM blog_posts;
DELETE FROM audit_logs;
DELETE FROM consent_records;

-- 4. Insert Default Users
INSERT INTO users (id, email, role) VALUES
('11111111-1111-1111-1111-111111111111', 'contractor@example.com', 'candidate'),
('22222222-2222-2222-2222-222222222222', 'hiring@devtech.example.com', 'recruiter'),
('33333333-3333-3333-3333-333333333333', 'admin@outsideir35.co.uk', 'admin');

-- 5. Insert Profiles
INSERT INTO candidate_profiles (user_id, first_name, last_name, headline, bio, location, website_url, linkedin_url, availability, min_day_rate, max_day_rate, clearance_level, resume_url, is_profile_public) VALUES
('11111111-1111-1111-1111-111111111111', 'Sarah', 'Jenkins', 'Lead React Developer & UI Architect', '10+ years experience building highly interactive, scalable web applications. Specialist in state management, custom SVG graphing, and high-performance frontend interfaces.', 'London, UK', 'https://sarahj-dev.example.com', 'https://linkedin.com/in/sarah-jenkins-dev', 'immediate', 550, 700, 'none', 'Sarah_Jenkins_CV_2026.pdf', true);

-- Note: company_id is linked after company insertion
INSERT INTO recruiter_profiles (user_id, first_name, last_name, phone) VALUES
('22222222-2222-2222-2222-222222222222', 'James', 'Caan', '+44 7700 900077');

-- 6. Insert Companies
INSERT INTO companies (id, name, slug, logo_url, description, website_url, size_band, industry, headquarters_location, is_verified) VALUES
('c1000000-0000-0000-0000-000000000001', 'DevTech Solutions', 'devtech-solutions', '⚡', 'DevTech is a leading software engineering consultancy helping FTSE 100 enterprise organizations build scalable cloud architectures.', 'https://devtech-example.com', '201-500', 'Technology', 'London', true),
('c2000000-0000-0000-0000-000000000002', 'Apex Finance Partners', 'apex-finance-partners', '📈', 'Apex is a premium boutique investment bank specializing in private equity placement, capital markets, and corporate restructuring.', 'https://apexfinance-example.co.uk', '51-200', 'Finance', 'London', true),
('c3000000-0000-0000-0000-000000000003', 'Vanguard Engineering Ltd', 'vanguard-engineering', '⚙️', 'Vanguard delivers heavy civil engineering, industrial design, and structural integrity projects for rail, airports, and transport networks.', 'https://vanguardeng-example.co.uk', '500+', 'Engineering', 'Manchester', true),
('c4000000-0000-0000-0000-000000000004', 'National NHS Trust Health', 'nhs-trust-health', '💙', 'Providing primary care and medical services. Trust health operates several regional hospital locations across the UK.', 'https://nhs-example.nhs.uk', '500+', 'Healthcare', 'Birmingham', true),
('c5000000-0000-0000-0000-000000000005', 'Metis Government Services', 'metis-government-services', '🏛️', 'Metis is a strategic delivery partner to public sector bodies, offering SC/DV cleared program delivery and transition consultancy.', 'https://metisgov-example.gov.uk', '201-500', 'Government', 'Bristol', true),
('c6000000-0000-0000-0000-000000000006', 'BuildSmart Construction', 'buildsmart-construction', '🏗️', 'BuildSmart is a prime contractor delivering commercial, housing, and infrastructure developments across the Midlands and Scotland.', 'https://buildsmart-example.com', '51-200', 'Construction', 'Glasgow', false);

-- Link recruiter to company
UPDATE recruiter_profiles SET company_id = 'c1000000-0000-0000-0000-000000000001' WHERE user_id = '22222222-2222-2222-2222-222222222222';

-- 7. Insert Skills
INSERT INTO skills (id, name, slug) VALUES
('91000000-0000-0000-0000-000000000001', 'AWS', 'aws'),
('91000000-0000-0000-0000-000000000002', 'Terraform', 'terraform'),
('91000000-0000-0000-0000-000000000003', 'Kubernetes', 'kubernetes'),
('91000000-0000-0000-0000-000000000004', 'CI/CD', 'ci-cd'),
('91000000-0000-0000-0000-000000000005', 'Serverless', 'serverless'),
('91000000-0000-0000-0000-000000000006', 'React', 'react'),
('91000000-0000-0000-0000-000000000007', 'TypeScript', 'typescript'),
('91000000-0000-0000-0000-000000000008', 'CSS', 'css'),
('91000000-0000-0000-0000-000000000009', 'Zustand', 'zustand'),
('91000000-0000-0000-0000-000000000010', 'WebSockets', 'websockets'),
('91000000-0000-0000-0000-000000000011', 'Portfolio Management', 'portfolio-management'),
('91000000-0000-0000-0000-000000000012', 'CFA', 'cfa'),
('91000000-0000-0000-0000-000000000013', 'Financial Modeling', 'financial-modeling'),
('91000000-0000-0000-0000-000000000014', 'Private Equity', 'private-equity'),
('91000000-0000-0000-0000-000000000015', 'Python', 'python'),
('91000000-0000-0000-0000-000000000016', 'FastAPI', 'fastapi'),
('91000000-0000-0000-0000-000000000017', 'PostgreSQL', 'postgresql'),
('91000000-0000-0000-0000-000000000018', 'Docker', 'docker'),
('91000000-0000-0000-0000-000000000019', 'Security', 'security'),
('91000000-0000-0000-0000-000000000020', 'NEC4', 'nec4'),
('91000000-0000-0000-0000-000000000021', 'RICS', 'rics'),
('91000000-0000-0000-0000-000000000022', 'Surveying', 'surveying'),
('91000000-0000-0000-0000-000000000023', 'Commercial Management', 'commercial-management'),
('91000000-0000-0000-0000-000000000024', 'Prince2', 'prince2'),
('91000000-0000-0000-0000-000000000025', 'Civil Engineering', 'civil-engineering'),
('91000000-0000-0000-0000-000000000026', 'Infrastructure', 'infrastructure'),
('91000000-0000-0000-0000-000000000027', 'Risk Management', 'risk-management'),
('91000000-0000-0000-0000-000000000028', 'SAP', 'sap'),
('91000000-0000-0000-0000-000000000029', 'Financial Accounting', 'financial-accounting'),
('91000000-0000-0000-0000-000000000030', 'Cost Controlling', 'cost-controlling'),
('91000000-0000-0000-0000-000000000031', 'ERP', 'erp'),
('91000000-0000-0000-0000-000000000032', 'Cardiology', 'cardiology'),
('91000000-0000-0000-0000-000000000033', 'GMC', 'gmc'),
('91000000-0000-0000-0000-000000000034', 'Patient Care', 'patient-care'),
('91000000-0000-0000-0000-000000000035', 'NHS', 'nhs'),
('91000000-0000-0000-0000-000000000036', 'NMC', 'nmc'),
('91000000-0000-0000-0000-000000000037', 'Primary Care', 'primary-care'),
('91000000-0000-0000-0000-000000000038', 'Triage', 'triage'),
('91000000-0000-0000-0000-000000000039', 'Prescribing', 'prescribing'),
('91000000-0000-0000-0000-000000000040', 'MCIPS', 'mcips'),
('91000000-0000-0000-0000-000000000041', 'Supply Chain', 'supply-chain'),
('91000000-0000-0000-0000-000000000042', 'Negotiation', 'negotiation'),
('91000000-0000-0000-0000-000000000043', 'Logistics', 'logistics'),
('91000000-0000-0000-0000-000000000044', 'BPMN', 'bpmn'),
('91000000-0000-0000-0000-000000000045', 'BCS', 'bcs'),
('91000000-0000-0000-0000-000000000046', 'Requirements Gathering', 'requirements-gathering'),
('91000000-0000-0000-0000-000000000047', 'Regulatory Compliance', 'regulatory-compliance');

-- 8. Insert Jobs
INSERT INTO jobs (id, title, slug, company_id, description_html, requirements, responsibilities, benefits, day_rate_min, day_rate_max, ir35_status, remote_type, clearance_level, location, featured, created_at, expires_at) VALUES
('11111111-1111-1111-1111-111111111101', 'Lead Cloud Architect (AWS/Terraform)', 'lead-cloud-architect-aws-terraform', 'c1000000-0000-0000-0000-000000000001', '<p>We are seeking a Lead Cloud Architect to guide the migration of a legacy retail payment platform to a serverless AWS infrastructure. You will be responsible for defining the architecture, writing Infrastructure as Code, and aligning with internal platform engineering teams.</p><p>The role operates outside the scope of IR35. The successful candidate must supply their own workspace and tools, and has the absolute right to provide a qualified substitute.</p>', '["Extensive hands-on experience architecting AWS environments (Serverless, ECS, EKS)","Expert level with Infrastructure as Code via Terraform","Strong background in security compliance (PCI-DSS is a major plus)","Experience directing small squads of platform engineers"]', '["Design AWS Landing Zones and account structures","Implement CI/CD deployment pipelines using GitHub Actions","Conduct architectural reviews and threat modeling sessions","Provide technical guidance on container orchestration strategies"]', '["Fully Remote contract engagement","Flexible working schedule (milestone delivery based)","Weekly billing terms"]', 650.00, 800.00, 'outside', 'remote', 'none', 'London', true, '2026-06-16T12:00:00Z', '2026-07-16T12:00:00Z'),
('11111111-1111-1111-1111-111111111102', 'Senior React Developer (Contract)', 'senior-react-developer-contract', 'c1000000-0000-0000-0000-000000000001', '<p>A Senior React Developer is required to build dynamic dashboard views for a data telemetry platform. This project demands optimized state management, custom SVG chart implementations, and high-performance tables handling streaming socket feeds.</p><p>This contract has been assessed as Outside IR35. Payment is issued against deliverables rather than hours logged.</p>', '["Deep mastery of modern React (v18+, hooks, context, concurrent rendering)","Strong state management patterns (Zustand, Redux Toolkit, or Jotai)","Proficiency in writing robust TypeScript types and utilities","Exceptional custom CSS/SCSS layout skills (Flexbox, CSS Grid)"]', '["Translate Figma mockups into reusable, interactive React elements","Optimize bundle sizes and load-time metrics (LCP, INP)","Integrate RESTful and WebSockets data endpoints into React states","Write comprehensive unit tests with Vitest and Testing Library"]', '["100% remote workspace","Outside IR35 determination signed by Qdos","Long-term extension potential"]', 500.00, 600.00, 'outside', 'remote', 'none', 'London', false, '2026-06-15T09:00:00Z', '2026-07-15T09:00:00Z'),
('11111111-1111-1111-1111-111111111103', 'Interim Portfolio Manager (Private Equity)', 'interim-portfolio-manager-private-equity', 'c2000000-0000-0000-0000-000000000002', '<p>Apex Finance requires an Interim Portfolio Manager to oversee the operations, covenant checks, and performance tracking of 12 mid-market portfolio companies during a transitional leadership gap. You will report directly to the Investment Committee.</p><p>Due to day-to-day integration into the client committee, this role is assessed as **Inside IR35** and must be run via an approved UK Umbrella company.</p>', '["Qualified CA/ACCA or CFA charterholder","Minimum 8 years in Private Equity portfolio management or senior corporate finance","Mastery of financial modeling, covenant testing, and valuation techniques","Exceptional presentation skills for Board-level reporting"]', '["Review monthly performance reports and trace variances against budget","Verify debt covenant compliance across portfolio holdings","Draft transitional management briefs and review capital expenditure requests","Coordinate with auditors and transaction specialists on valuation adjustments"]', '["High-tier day rate reflecting Inside status","Hybrid structure (2 days/week in City of London office)","Umbrella payroll service options"]', 850.00, 1000.00, 'inside', 'hybrid', 'none', 'London', true, '2026-06-14T08:30:00Z', '2026-07-14T08:30:00Z'),
('11111111-1111-1111-1111-111111111104', 'SC Cleared Python Backend Developer', 'sc-cleared-python-backend-developer', 'c5000000-0000-0000-0000-000000000005', '<p>A Python Developer holding active **SC Clearance** is needed to deploy and scale APIs within a secure government hosting platform. The environment uses FastAPI, PostgreSQL, and runs inside containerized Kubernetes environments.</p><p>This contract has been determined as Outside IR35. Substitution is permitted subject to the substitute passing matching security clearance screening.</p>', '["Active SC Security Clearance (Security Check) is mandatory","Expert level with Python (FastAPI, Flask, or Django)","Strong query design and performance tuning with PostgreSQL","Proficiency with Docker and Kubernetes configurations"]', '["Build secure, low-latency API endpoints complying with security criteria","Integrate data pipelines with legacy government record databases","Write unit tests ensuring 90%+ code coverage ratios","Collaborate with DevSecOps squads to verify deployment credentials"]', '["Outside IR35 Contract structure","SC Clearance premium rate","Flexible remote/onsite hybrid configuration"]', 550.00, 700.00, 'outside', 'hybrid', 'SC', 'Bristol', true, '2026-06-13T10:00:00Z', '2026-07-13T10:00:00Z'),
('11111111-1111-1111-1111-111111111105', 'DV Cleared Cloud Infrastructure Engineer', 'dv-cleared-cloud-infrastructure-engineer', 'c5000000-0000-0000-0000-000000000005', '<p>A highly secure contract for a Cloud Infrastructure Specialist holding active **Developed Vetting (DV) Clearance**. You will manage air-gapped secure networks, orchestrate cluster nodes, and oversee strict access log audits.</p><p>This role is Outside IR35. Travel to secure government facilities is required.</p>', '["Active DV Clearance (Developed Vetting) is strictly required","Deep expertise in Linux systems administration and scripting (Bash/Python)","Configuring secure AWS networks (VPC, IAM, CloudTrail) inside isolated enclaves","Familiarity with Infrastructure as Code principles (Terraform)"]', '["Audit and optimize secure container environments","Maintain networking interfaces, firewalls, and route logs in isolated networks","Deploy applications in secure, air-gapped target environments","Coordinate with defense agencies on compliance audits"]', '["Exceptional day rate reflecting DV requirements","Secured facility accommodation allowance","Long contract term (12-24 months)"]', 900.00, 1200.00, 'outside', 'onsite', 'DV', 'Gloucester', true, '2026-06-12T14:00:00Z', '2026-08-12T14:00:00Z'),
('11111111-1111-1111-1111-111111111106', 'Quantity Surveyor (Construction)', 'quantity-surveyor-construction', 'c6000000-0000-0000-0000-000000000006', '<p>BuildSmart requires an experienced Contract Quantity Surveyor to manage subcontractor packages, valuation estimates, and material cost logs for a new multi-storey commercial building construction in Glasgow.</p><p>Assessed as Outside IR35. Deliverables are defined on a monthly milestone basis.</p>', '["RICS qualified or equivalent commercial surveying degree","Minimum 5 years managing subcontractor pricing structures in commercial build projects","Expertise in NEC4 contract models and commercial risk assessments","Willingness to travel for regular site visits"]', '["Prepare subcontractor tender evaluation packs and issue recommendations","Perform on-site measurements and audit valuations monthly","Monitor cash flows and track variations against primary budget logs","Liaise with client architects and engineers on material changes"]', '["Outside IR35 engagement structure","Travel expenses fully reimbursed","Stable 9-month contract scope"]', 400.00, 500.00, 'outside', 'hybrid', 'none', 'Glasgow', false, '2026-06-11T11:00:00Z', '2026-07-11T11:00:00Z'),
('11111111-1111-1111-1111-111111111107', 'Senior Project Manager (Infrastructure)', 'senior-project-manager-infrastructure', 'c3000000-0000-0000-0000-000000000003', '<p>We are seeking a Senior Project Manager to manage structural upgrades on regional rail bridges. You will coordinate structural engineering teams, log progress, and oversee health and safety standards on site.</p><p>This contract is Inside IR35. Engagement operates via an approved umbrella payroll firm.</p>', '["APM, Prince2, or PMP certification","Track record managing civil infrastructure projects (rail, bridges, highways)","Understanding of Network Rail safety standards (PTS is advantageous)","Proven experience leading cross-functional engineering teams"]', '["Manage project milestones and update tracking schedules","Conduct site safety inspections and ensure health regulations compliance","Coordinate with material suppliers to ensure timely site deliveries","Report budget status and variance metrics to engineering executives"]', '["Inside IR35 with highly competitive daily compensation","Paid travel allowances","Initial 6-month term with extension review"]', 550.00, 650.00, 'inside', 'hybrid', 'none', 'Manchester', false, '2026-06-10T15:00:00Z', '2026-07-10T15:00:00Z'),
('11111111-1111-1111-1111-111111111108', 'SAP CO/FI Consultant (Financial Controller)', 'sap-cofi-consultant-financial-controller', 'c2000000-0000-0000-0000-000000000002', '<p>Apex Finance requires an SAP FICO Consultant to implement specialized financial controlling modules for a recently acquired manufacturing subsidiary. You will customize reports, configure profit centers, and train internal staff.</p><p>Assessed as Outside IR35. Deliverables-based project contract.</p>', '["SAP certified in CO (Controlling) and FI (Financial Accounting) modules","Minimum 3 full-lifecycle SAP implementation cycles completed","Background in corporate finance, manufacturing cost accounting, or auditing","Ability to design custom report layouts and translate business needs into configuration"]', '["Configure SAP product costing, ledger accounts, and asset classes","Map cost flows between company subsidiaries and main consolidation groups","Draft system testing plans and oversee user acceptance checks","Prepare instructional documentation for finance administrators"]', '["Outside IR35 determination","Highly flexible hours","Work alongside leading corporate finance experts"]', 700.00, 850.00, 'outside', 'hybrid', 'none', 'London', false, '2026-06-09T09:00:00Z', '2026-07-09T09:00:00Z'),
('11111111-1111-1111-1111-111111111109', 'Locum Consultant Cardiologist', 'locum-consultant-cardiologist', 'c4000000-0000-0000-0000-000000000004', '<p>An experienced Consultant Cardiologist is required to support clinical outpatient runs and inpatient ward audits under a locum contract. You will manage cardiac telemetry, consult with patients, and guide medical juniors.</p><p>Assessed as **Inside IR35** (NHS standard policy) and processed via NHS standard payroll channels.</p>', '["GMC registration with License to Practice and listed on Specialist Register","FRCP or equivalent advanced medical degree qualification","Substantial experience in diagnostic imaging, echocardiography, and stress testing","Immediate availability to commit to clinical rotas"]', '["Lead outpatient clinics and perform cardiac assessments","Conduct daily ward rounds in the coronary care unit","Supervise and teach junior registrars and clinical fellows","Participate in multi-disciplinary team review sessions"]', '["GMC premium locum rate","Onsite trust parking provided","3-month initial term"]', 900.00, 1100.00, 'inside', 'onsite', 'none', 'Birmingham', false, '2026-06-08T10:00:00Z', '2026-07-08T10:00:00Z'),
('11111111-1111-1111-1111-111111111110', 'Lead Nurse Practitioner (Primary Care)', 'lead-nurse-practitioner-primary-care', 'c4000000-0000-0000-0000-000000000004', '<p>We require a Locum Lead Nurse Practitioner to run minor ailment clinics, manage triage queues, and perform patient evaluations. Assessed as Inside IR35.</p>', '["Active NMC registration as a Nurse Practitioner","Independent Prescribing qualification (V300)","Experience in primary care, GP practices, or urgent care centers","Strong clinical assessment skills"]', '["Assess, diagnose, and treat patients presenting with minor illnesses","Prescribe medications inside professional scope guidelines","Refer patients to specialists as clinically necessary","Coordinate nursing rotas and triage systems"]', '["Umbrella PAYE integration support","Flexible shift selections (day/night options)","Supportive trust environment"]', 350.00, 450.00, 'inside', 'onsite', 'none', 'Birmingham', false, '2026-06-07T12:00:00Z', '2026-07-07T12:00:00Z'),
('11111111-1111-1111-1111-111111111111', 'Procurement Specialist (Logistics Contract)', 'procurement-specialist-logistics-contract', 'c3000000-0000-0000-0000-000000000003', '<p>Vanguard requires a senior Contract Procurement Advisor to audit supplier agreements, negotiate bulk material price structures, and coordinate import procedures for transport infrastructure components.</p><p>Assessed as Outside IR35. Deliverables include drafting 5 key supplier agreements.</p>', '["MCIPS qualification or equivalent procurement accreditation","Background managing supply chains in logistics, manufacturing, or engineering","Expert contract negotiation skills and commercial acumen","Understanding of international trade terms (Incoterms)"]', '["Review existing supply contracts and identify cost reduction opportunities","Draft and negotiate framework agreements with new component manufacturers","Coordinate with shipping agents to optimize import procedures","Present cost-saving reports to procurement directors"]', '["Outside IR35 status","Fully hybrid (1 day in Manchester office/month)","6-month initial term"]', 450.00, 550.00, 'outside', 'hybrid', 'none', 'Manchester', false, '2026-06-06T16:00:00Z', '2026-07-06T16:00:00Z'),
('11111111-1111-1111-1111-111111111112', 'Senior Business Analyst (Regulatory Change)', 'senior-business-analyst-regulatory-change', 'c2000000-0000-0000-0000-000000000002', '<p>A Senior Business Analyst is required for a 6-month contract to document workflows and system adjustments required under upcoming regulatory change frameworks. Assessed as Outside IR35.</p>', '["BCS Business Analysis Diploma or equivalent BA certification","Experience in financial services (banking, insurance, or asset management)","Expertise in process mapping (BPMN) and requirements engineering","Exceptional stakeholder facilitation skills"]', '["Map current-state processes and conduct gap analysis against regulations","Elicit and document detailed functional and non-functional requirements","Facilitate workshops with compliance, operations, and IT teams","Support user acceptance testing (UAT) planning phases"]', '["Outside IR35 contract","Hybrid model (London)","Collaborative team environment"]', 500.00, 600.00, 'outside', 'hybrid', 'none', 'London', false, '2026-06-05T09:00:00Z', '2026-07-05T09:00:00Z');

-- 9. Insert Job Skills mappings
INSERT INTO job_skills (job_id, skill_id) VALUES
('11111111-1111-1111-1111-111111111101', '91000000-0000-0000-0000-000000000001'), -- Job 1: AWS
('11111111-1111-1111-1111-111111111101', '91000000-0000-0000-0000-000000000002'), -- Job 1: Terraform
('11111111-1111-1111-1111-111111111101', '91000000-0000-0000-0000-000000000003'), -- Job 1: Kubernetes
('11111111-1111-1111-1111-111111111101', '91000000-0000-0000-0000-000000000004'), -- Job 1: CI/CD
('11111111-1111-1111-1111-111111111101', '91000000-0000-0000-0000-000000000005'), -- Job 1: Serverless
('11111111-1111-1111-1111-111111111102', '91000000-0000-0000-0000-000000000006'), -- Job 2: React
('11111111-1111-1111-1111-111111111102', '91000000-0000-0000-0000-000000000007'), -- Job 2: TypeScript
('11111111-1111-1111-1111-111111111102', '91000000-0000-0000-0000-000000000008'), -- Job 2: CSS
('11111111-1111-1111-1111-111111111102', '91000000-0000-0000-0000-000000000009'), -- Job 2: Zustand
('11111111-1111-1111-1111-111111111102', '91000000-0000-0000-0000-000000000010'), -- Job 2: WebSockets
('11111111-1111-1111-1111-111111111103', '91000000-0000-0000-0000-000000000011'), -- Job 3: Portfolio Management
('11111111-1111-1111-1111-111111111103', '91000000-0000-0000-0000-000000000012'), -- Job 3: CFA
('11111111-1111-1111-1111-111111111103', '91000000-0000-0000-0000-000000000013'), -- Job 3: Financial Modeling
('11111111-1111-1111-1111-111111111103', '91000000-0000-0000-0000-000000000014'), -- Job 3: Private Equity
('11111111-1111-1111-1111-111111111104', '91000000-0000-0000-0000-000000000015'), -- Job 4: Python
('11111111-1111-1111-1111-111111111104', '91000000-0000-0000-0000-000000000016'), -- Job 4: FastAPI
('11111111-1111-1111-1111-111111111104', '91000000-0000-0000-0000-000000000017'), -- Job 4: PostgreSQL
('11111111-1111-1111-1111-111111111104', '91000000-0000-0000-0000-000000000018'), -- Job 4: Docker
('11111111-1111-1111-1111-111111111104', '91000000-0000-0000-0000-000000000003'), -- Job 4: Kubernetes
('11111111-1111-1111-1111-111111111105', '91000000-0000-0000-0000-000000000001'), -- Job 5: AWS
('11111111-1111-1111-1111-111111111105', '91000000-0000-0000-0000-000000000002'), -- Job 5: Terraform
('11111111-1111-1111-1111-111111111105', '91000000-0000-0000-0000-000000000019'), -- Job 5: Security
('11111111-1111-1111-1111-111111111105', '91000000-0000-0000-0000-000000000015'), -- Job 5: Python
('11111111-1111-1111-1111-111111111106', '91000000-0000-0000-0000-000000000020'), -- Job 6: NEC4
('11111111-1111-1111-1111-111111111106', '91000000-0000-0000-0000-000000000021'), -- Job 6: RICS
('11111111-1111-1111-1111-111111111106', '91000000-0000-0000-0000-000000000022'), -- Job 6: Surveying
('11111111-1111-1111-1111-111111111106', '91000000-0000-0000-0000-000000000023'), -- Job 6: Commercial Management
('11111111-1111-1111-1111-111111111107', '91000000-0000-0000-0000-000000000024'), -- Job 7: Prince2
('11111111-1111-1111-1111-111111111107', '91000000-0000-0000-0000-000000000025'), -- Job 7: Civil Engineering
('11111111-1111-1111-1111-111111111107', '91000000-0000-0000-0000-000000000026'), -- Job 7: Infrastructure
('11111111-1111-1111-1111-111111111107', '91000000-0000-0000-0000-000000000027'), -- Job 7: Risk Management
('11111111-1111-1111-1111-111111111108', '91000000-0000-0000-0000-000000000028'), -- Job 8: SAP
('11111111-1111-1111-1111-111111111108', '91000000-0000-0000-0000-000000000029'), -- Job 8: Financial Accounting
('11111111-1111-1111-1111-111111111108', '91000000-0000-0000-0000-000000000030'), -- Job 8: Cost Controlling
('11111111-1111-1111-1111-111111111108', '91000000-0000-0000-0000-000000000031'), -- Job 8: ERP
('11111111-1111-1111-1111-111111111109', '91000000-0000-0000-0000-000000000032'), -- Job 9: Cardiology
('11111111-1111-1111-1111-111111111109', '91000000-0000-0000-0000-000000000033'), -- Job 9: GMC
('11111111-1111-1111-1111-111111111109', '91000000-0000-0000-0000-000000000034'), -- Job 9: Patient Care
('11111111-1111-1111-1111-111111111109', '91000000-0000-0000-0000-000000000035'), -- Job 9: NHS
('11111111-1111-1111-1111-111111111110', '91000000-0000-0000-0000-000000000036'), -- Job 10: NMC
('11111111-1111-1111-1111-111111111110', '91000000-0000-0000-0000-000000000037'), -- Job 10: Primary Care
('11111111-1111-1111-1111-111111111110', '91000000-0000-0000-0000-000000000038'), -- Job 10: Triage
('11111111-1111-1111-1111-111111111110', '91000000-0000-0000-0000-000000000039'), -- Job 10: Prescribing
('11111111-1111-1111-1111-111111111111', '91000000-0000-0000-0000-000000000040'), -- Job 11: MCIPS
('11111111-1111-1111-1111-111111111111', '91000000-0000-0000-0000-000000000041'), -- Job 11: Supply Chain
('11111111-1111-1111-1111-111111111111', '91000000-0000-0000-0000-000000000042'), -- Job 11: Negotiation
('11111111-1111-1111-1111-111111111111', '91000000-0000-0000-0000-000000000043'), -- Job 11: Logistics
('11111111-1111-1111-1111-111111111112', '91000000-0000-0000-0000-000000000044'), -- Job 12: BPMN
('11111111-1111-1111-1111-111111111112', '91000000-0000-0000-0000-000000000045'), -- Job 12: BCS
('11111111-1111-1111-1111-111111111112', '91000000-0000-0000-0000-000000000046'), -- Job 12: Requirements Gathering
('11111111-1111-1111-1111-111111111112', '91000000-0000-0000-0000-000000000047'); -- Job 12: Regulatory Compliance

-- 10. Insert Guides
INSERT INTO guides (id, title, slug, guide_category, content_html) VALUES
('99999999-9999-9999-9999-999999999901', 'Understanding IR35: The Complete Guide for Contractors', 'what-is-ir35-guide', 'compliance', '<h3>What is IR35?</h3><p>IR35 is the common name given to the UK tax legislation designed to identify "disguised employees" working via intermediary structures (like a Limited Company or PSC) to avoid paying standard employment taxes.</p><h4>Inside vs. Outside IR35</h4><p>When a contract is determined as **Outside IR35**, the contractor is treated as a separate, self-employed business. This allows optimizing tax distributions using a combination of director salary and dividends. When a contract is **Inside IR35**, the contractor is deemed an employee for tax purposes, meaning PAYE tax and National Insurance are deducted at source (often via an Umbrella company).</p><h4>Key IR35 Test Pillars</h4><ul><li>**Right of Substitution:** Can you supply a qualified helper instead of performing the tasks yourself?</li><li>**Control:** Does the client control how, when, and where you deliver the project?</li><li>**Mutuality of Obligation (MOO):** Is the client obliged to offer work, and are you obliged to accept it?</li></ul>'),
('99999999-9999-9999-9999-999999999902', 'Security Clearances in the UK: BPSS, SC, and DV Explained', 'what-is-sc-clearance-guide', 'clearance', '<h3>UK Security Clearances Guide</h3><p>Security clearance levels determine your eligibility to work on sensitive government, defense, and national infrastructure projects.</p><h4>Clearance Levels</h4><ul><li>**BPSS (Baseline Personnel Security Standard):** The standard background screening checks (identity, right to work, criminal record, employment history).</li><li>**SC (Security Check):** Required for staff handling secret assets or working in proximity to sensitive environments. Involves credit checks and background screening. Valid for 5-10 years.</li><li>**DV (Developed Vetting):** The highest security level in the UK. Required for single access to top-secret assets. Involves highly detailed financial audits and personal interviews.</li></ul>'),
('99999999-9999-9999-9999-999999999903', 'Contractor Tax Explained: Dividend & Corporation Tax Rates (2025/26)', 'contractor-tax-explained-guide', 'tax', '<h3>Contractor Tax optimization (Outside IR35)</h3><p>Operating Outside IR35 through a Private Limited Company allows contractors to structure their remuneration to maximize post-tax income.</p><h4>1. Corporation Tax</h4><p>Corporation tax is levied on company profits after business expenses and director salary are deducted:</p><ul><li>**19% Small Profits Rate:** On company profits up to £50,000.</li><li>**25% Main Rate:** On company profits above £250,000.</li><li>**Marginal Relief:** Tapered rate between £50,000 and £250,000.</li></ul><h4>2. Remuneration Strategy</h4><p>Contractors typically pay themselves a small salary up to the Secondary National Insurance Threshold (£9,100 or £12,570 depending on setup) and distribute the remaining profit as Dividends. Dividends are tax-free up to £500, with dividend tax rates applied beyond that: 8.75% (basic), 33.75% (higher), and 39.35% (additional).</p>');

-- 11. Insert Blog Posts
INSERT INTO blog_posts (id, title, slug, content_html, excerpt, featured_image_url, status, created_at, published_at) VALUES
('88888888-8888-8888-8888-888888888801', 'Autumn Budget Impact on UK Contracting Sector', 'autumn-budget-impact-contracting', '<p>The Autumn Budget introduced key changes that alter the financial landscape for UK contractors. The major impact stems from the increase of **Employer National Insurance (Class 1) to 15%** (up from 13.8%) and the reduction of the secondary threshold to **£5,000 per year** (down from £9,100).</p><p>This increase primarily targets employment costs, meaning **Inside IR35** contracts run via Umbrella companies will see higher payroll deductions, as the employer NI increase is commonly passed down through the assignment day rate. Meanwhile, **Outside IR35** contractors should review their company salary structure to ensure their director pay remains tax-efficient.</p>', 'How the recent shifts in Employer National Insurance and corporate tax brackets affect your daily take-home pay structures.', '📊', 'published', '2026-06-10T10:00:00Z', '2026-06-10T10:00:00Z'),
('88888888-8888-8888-8888-888888888802', 'How to Write an Outside IR35 Compliant Contract', 'write-outside-ir35-compliant-contract', '<p>Drafting a compliant contract is the first defense against HMRC challenges. The contract must explicitly state that the relationship is one of business-to-business and not employer-employee. Key clauses include:</p><h4>1. Genuine Substitution Clause</h4><p>Ensure the contract states that the contractor company can supply a substitute of matching expertise without needing client permission, and that the contractor company is solely responsible for paying that substitute.</p><h4>2. Control & Supervision</h4><p>Ensure the contract details that the contractor is responsible for deciding *how* the deliverables are met, and that they are not subject to the direct supervision, control, or direction of the client staff.</p>', 'Avoid HMRC audit triggers by drafting precise clauses covering substitution, control, and mutuality of obligation.', '✍️', 'published', '2026-06-05T11:00:00Z', '2026-06-05T11:00:00Z');

-- 12. Seed Bookmarks, Consents, and Audit Logs
INSERT INTO saved_jobs (user_id, job_id) VALUES
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111101');

INSERT INTO consent_records (user_id, consent_type, is_granted, ip_address, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'terms_of_service', true, '192.168.1.1', '2026-06-17T15:00:00Z'),
('11111111-1111-1111-1111-111111111111', 'gdpr_privacy_policy', true, '192.168.1.1', '2026-06-17T15:00:00Z');

INSERT INTO audit_logs (action, ip_address, created_at) VALUES
('User Registration: contractor@example.com registered as candidate', '192.168.1.1', '2026-06-17T12:00:00Z'),
('GDPR Consent Recorded: Candidate accepted policy terms', '192.168.1.1', '2026-06-17T12:01:00Z');

-- 13. Create seeded users in Supabase Auth (auth.users)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, aud)
VALUES
('11111111-1111-1111-1111-111111111111', 'contractor@example.com', crypt('Password123!', gen_salt('bf', 10)), now(), 'authenticated', 'authenticated'),
('22222222-2222-2222-2222-222222222222', 'hiring@devtech.example.com', crypt('Password123!', gen_salt('bf', 10)), now(), 'authenticated', 'authenticated'),
('33333333-3333-3333-3333-333333333333', 'admin@outsideir35.co.uk', crypt('Password123!', gen_salt('bf', 10)), now(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 14. Create resumes bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- 15. Allow public storage policies (for uploads/downloads/deletes in resumes bucket)
CREATE POLICY "Public Storage Policy" ON storage.objects
FOR ALL TO public
USING (bucket_id = 'resumes')
WITH CHECK (bucket_id = 'resumes');
