import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Manually parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = (match[2] || '').trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Define structures matching seed data
const companiesData = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    name: 'DevTech Solutions',
    slug: 'devtech-solutions',
    logo_url: '⚡',
    description: 'DevTech is a leading software engineering consultancy helping FTSE 100 enterprise organizations build scalable cloud architectures.',
    website_url: 'https://devtech-example.com',
    size_band: '201-500',
    industry: 'Technology',
    headquarters_location: 'London',
    is_verified: true
  },
  {
    id: 'c2000000-0000-0000-0000-000000000002',
    name: 'Apex Finance Partners',
    slug: 'apex-finance-partners',
    logo_url: '📈',
    description: 'Apex is a premium boutique investment bank specializing in private equity placement, capital markets, and corporate restructuring.',
    website_url: 'https://apexfinance-example.co.uk',
    size_band: '51-200',
    industry: 'Finance',
    headquarters_location: 'London',
    is_verified: true
  },
  {
    id: 'c3000000-0000-0000-0000-000000000003',
    name: 'Vanguard Engineering Ltd',
    slug: 'vanguard-engineering',
    logo_url: '⚙️',
    description: 'Vanguard delivers heavy civil engineering, industrial design, and structural integrity projects for rail, airports, and transport networks.',
    website_url: 'https://vanguardeng-example.co.uk',
    size_band: '500+',
    industry: 'Engineering',
    headquarters_location: 'Manchester',
    is_verified: true
  },
  {
    id: 'c4000000-0000-0000-0000-000000000004',
    name: 'National NHS Trust Health',
    slug: 'nhs-trust-health',
    logo_url: '💙',
    description: 'Providing primary care and medical services. Trust health operates several regional hospital locations across the UK.',
    website_url: 'https://nhs-example.nhs.uk',
    size_band: '500+',
    industry: 'Healthcare',
    headquarters_location: 'Birmingham',
    is_verified: true
  },
  {
    id: 'c5000000-0000-0000-0000-000000000005',
    name: 'Metis Government Services',
    slug: 'metis-government-services',
    logo_url: '🏛️',
    description: 'Metis is a strategic delivery partner to public sector bodies, offering SC/DV cleared program delivery and transition consultancy.',
    website_url: 'https://metisgov-example.gov.uk',
    size_band: '201-500',
    industry: 'Government',
    headquarters_location: 'Bristol',
    is_verified: true
  },
  {
    id: 'c6000000-0000-0000-0000-000000000006',
    name: 'BuildSmart Construction',
    slug: 'buildsmart-construction',
    logo_url: '🏗️',
    description: 'BuildSmart is a prime contractor delivering commercial, housing, and infrastructure developments across the Midlands and Scotland.',
    website_url: 'https://buildsmart-example.com',
    size_band: '51-200',
    industry: 'Construction',
    headquarters_location: 'Glasgow',
    is_verified: false
  }
];

const jobsData = [
  {
    id: '11111111-1111-1111-1111-111111111101',
    title: 'Lead Cloud Architect (AWS/Terraform)',
    slug: 'lead-cloud-architect-aws-terraform',
    company_id: 'c1000000-0000-0000-0000-000000000001',
    description_html: '<p>We are seeking a Lead Cloud Architect to guide the migration of a legacy retail payment platform to a serverless AWS infrastructure. You will be responsible for defining the architecture, writing Infrastructure as Code, and aligning with internal platform engineering teams.</p><p>The role operates outside the scope of IR35. The successful candidate must supply their own workspace and tools, and has the absolute right to provide a qualified substitute.</p>',
    requirements: [
      'Extensive hands-on experience architecting AWS environments (Serverless, ECS, EKS)',
      'Expert level with Infrastructure as Code via Terraform',
      'Strong background in security compliance (PCI-DSS is a major plus)',
      'Experience directing small squads of platform engineers'
    ],
    responsibilities: [
      'Design AWS Landing Zones and account structures',
      'Implement CI/CD deployment pipelines using GitHub Actions',
      'Conduct architectural reviews and threat modeling sessions',
      'Provide technical guidance on container orchestration strategies'
    ],
    benefits: [
      'Fully Remote contract engagement',
      'Flexible working schedule (milestone delivery based)',
      'Weekly billing terms'
    ],
    day_rate_min: 650,
    day_rate_max: 800,
    ir35_status: 'outside',
    remote_type: 'remote',
    clearance_level: 'none',
    location: 'London',
    skills: ['AWS', 'Terraform', 'Kubernetes', 'CI/CD', 'Serverless'],
    created_at: '2026-06-16T12:00:00Z',
    expires_at: '2026-07-16T12:00:00Z',
    featured: true
  },
  {
    id: '11111111-1111-1111-1111-111111111102',
    title: 'Senior React Developer (Contract)',
    slug: 'senior-react-developer-contract',
    company_id: 'c1000000-0000-0000-0000-000000000001',
    description_html: '<p>A Senior React Developer is required to build dynamic dashboard views for a data telemetry platform. This project demands optimized state management, custom SVG chart implementations, and high-performance tables handling streaming socket feeds.</p><p>This contract has been assessed as Outside IR35. Payment is issued against deliverables rather than hours logged.</p>',
    requirements: [
      'Deep mastery of modern React (v18+, hooks, context, concurrent rendering)',
      'Strong state management patterns (Zustand, Redux Toolkit, or Jotai)',
      'Proficiency in writing robust TypeScript types and utilities',
      'Exceptional custom CSS/SCSS layout skills (Flexbox, CSS Grid)'
    ],
    responsibilities: [
      'Translate Figma mockups into reusable, interactive React elements',
      'Optimize bundle sizes and load-time metrics (LCP, INP)',
      'Integrate RESTful and WebSockets data endpoints into React states',
      'Write comprehensive unit tests with Vitest and Testing Library'
    ],
    benefits: [
      '100% remote workspace',
      'Outside IR35 determination signed by Qdos',
      'Long-term extension potential'
    ],
    day_rate_min: 500,
    day_rate_max: 600,
    ir35_status: 'outside',
    remote_type: 'remote',
    clearance_level: 'none',
    location: 'London',
    skills: ['React', 'TypeScript', 'CSS', 'Zustand', 'WebSockets'],
    created_at: '2026-06-15T09:00:00Z',
    expires_at: '2026-07-15T09:00:00Z',
    featured: false
  },
  {
    id: '11111111-1111-1111-1111-111111111103',
    title: 'Interim Portfolio Manager (Private Equity)',
    slug: 'interim-portfolio-manager-private-equity',
    company_id: 'c2000000-0000-0000-0000-000000000002',
    description_html: '<p>Apex Finance requires an Interim Portfolio Manager to oversee the operations, covenant checks, and performance tracking of 12 mid-market portfolio companies during a transitional leadership gap. You will report directly to the Investment Committee.</p><p>Due to day-to-day integration into the client committee, this role is assessed as **Inside IR35** and must be run via an approved UK Umbrella company.</p>',
    requirements: [
      'Qualified CA/ACCA or CFA charterholder',
      'Minimum 8 years in Private Equity portfolio management or senior corporate finance',
      'Mastery of financial modeling, covenant testing, and valuation techniques',
      'Exceptional presentation skills for Board-level reporting'
    ],
    responsibilities: [
      'Review monthly performance reports and trace variances against budget',
      'Verify debt covenant compliance across portfolio holdings',
      'Draft transitional management briefs and review capital expenditure requests',
      'Coordinate with auditors and transaction specialists on valuation adjustments'
    ],
    benefits: [
      'High-tier day rate reflecting Inside status',
      'Hybrid structure (2 days/week in City of London office)',
      'Umbrella payroll service options'
    ],
    day_rate_min: 850,
    day_rate_max: 1000,
    ir35_status: 'inside',
    remote_type: 'hybrid',
    clearance_level: 'none',
    location: 'London',
    skills: ['Portfolio Management', 'CFA', 'Financial Modeling', 'Private Equity'],
    created_at: '2026-06-14T08:30:00Z',
    expires_at: '2026-07-14T08:30:00Z',
    featured: true
  },
  {
    id: '11111111-1111-1111-1111-111111111104',
    title: 'SC Cleared Python Backend Developer',
    slug: 'sc-cleared-python-backend-developer',
    company_id: 'c5000000-0000-0000-0000-000000000005',
    description_html: '<p>A Python Developer holding active **SC Clearance** is needed to deploy and scale APIs within a secure government hosting platform. The environment uses FastAPI, PostgreSQL, and runs inside containerized Kubernetes environments.</p><p>This contract has been determined as Outside IR35. Substitution is permitted subject to the substitute passing matching security clearance screening.</p>',
    requirements: [
      'Active SC Security Clearance (Security Check) is mandatory',
      'Expert level with Python (FastAPI, Flask, or Django)',
      'Strong query design and performance tuning with PostgreSQL',
      'Proficiency with Docker and Kubernetes configurations'
    ],
    responsibilities: [
      'Build secure, low-latency API endpoints complying with security criteria',
      'Integrate data pipelines with legacy government record databases',
      'Write unit tests ensuring 90%+ code coverage ratios',
      'Collaborate with DevSecOps squads to verify deployment credentials'
    ],
    benefits: [
      'Outside IR35 Contract structure',
      'SC Clearance premium rate',
      'Flexible remote/onsite hybrid configuration'
    ],
    day_rate_min: 550,
    day_rate_max: 700,
    ir35_status: 'outside',
    remote_type: 'hybrid',
    clearance_level: 'SC',
    location: 'Bristol',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Kubernetes'],
    created_at: '2026-06-13T10:00:00Z',
    expires_at: '2026-07-13T10:00:00Z',
    featured: true
  },
  {
    id: '11111111-1111-1111-1111-111111111105',
    title: 'DV Cleared Cloud Infrastructure Engineer',
    slug: 'dv-cleared-cloud-infrastructure-engineer',
    company_id: 'c5000000-0000-0000-0000-000000000005',
    description_html: '<p>A highly secure contract for a Cloud Infrastructure Specialist holding active **Developed Vetting (DV) Clearance**. You will manage air-gapped secure networks, orchestrate cluster nodes, and oversee strict access log audits.</p><p>This role is Outside IR35. Travel to secure government facilities is required.</p>',
    requirements: [
      'Active DV Clearance (Developed Vetting) is strictly required',
      'Deep expertise in Linux systems administration and scripting (Bash/Python)',
      'Configuring secure AWS networks (VPC, IAM, CloudTrail) inside isolated enclaves',
      'Familiarity with Infrastructure as Code principles (Terraform)'
    ],
    responsibilities: [
      'Audit and optimize secure container environments',
      'Maintain networking interfaces, firewalls, and route logs in isolated networks',
      'Deploy applications in secure, air-gapped target environments',
      'Coordinate with defense agencies on compliance audits'
    ],
    benefits: [
      'Exceptional day rate reflecting DV requirements',
      'Secured facility accommodation allowance',
      'Long contract term (12-24 months)'
    ],
    day_rate_min: 900,
    day_rate_max: 1200,
    ir35_status: 'outside',
    remote_type: 'onsite',
    clearance_level: 'DV',
    location: 'Gloucester',
    skills: ['AWS', 'Terraform', 'Linux', 'Security', 'Python'],
    created_at: '2026-06-12T14:00:00Z',
    expires_at: '2026-08-12T14:00:00Z',
    featured: true
  },
  {
    id: '11111111-1111-1111-1111-111111111106',
    title: 'Quantity Surveyor (Construction)',
    slug: 'quantity-surveyor-construction',
    company_id: 'c6000000-0000-0000-0000-000000000006',
    description_html: '<p>BuildSmart requires an experienced Contract Quantity Surveyor to manage subcontractor packages, valuation estimates, and material cost logs for a new multi-storey commercial building construction in Glasgow.</p><p>Assessed as Outside IR35. Deliverables are defined on a monthly milestone basis.</p>',
    requirements: [
      'RICS qualified or equivalent commercial surveying degree',
      'Minimum 5 years managing subcontractor pricing structures in commercial build projects',
      'Expertise in NEC4 contract models and commercial risk assessments',
      'Willingness to travel for regular site visits'
    ],
    responsibilities: [
      'Prepare subcontractor tender evaluation packs and issue recommendations',
      'Perform on-site measurements and audit valuations monthly',
      'Monitor cash flows and track variations against primary budget logs',
      'Liaise with client architects and engineers on material changes'
    ],
    benefits: [
      'Outside IR35 engagement structure',
      'Travel expenses fully reimbursed',
      'Stable 9-month contract scope'
    ],
    day_rate_min: 400,
    day_rate_max: 500,
    ir35_status: 'outside',
    remote_type: 'hybrid',
    clearance_level: 'none',
    location: 'Glasgow',
    skills: ['NEC4', 'RICS', 'Surveying', 'Commercial Management'],
    created_at: '2026-06-11T11:00:00Z',
    expires_at: '2026-07-11T11:00:00Z',
    featured: false
  },
  {
    id: '11111111-1111-1111-1111-111111111107',
    title: 'Senior Project Manager (Infrastructure)',
    slug: 'senior-project-manager-infrastructure',
    company_id: 'c3000000-0000-0000-0000-000000000003',
    description_html: '<p>We are seeking a Senior Project Manager to manage structural upgrades on regional rail bridges. You will coordinate structural engineering teams, log progress, and oversee health and safety standards on site.</p><p>This contract is Inside IR35. Engagement operates via an approved umbrella payroll firm.</p>',
    requirements: [
      'APM, Prince2, or PMP certification',
      'Track record managing civil infrastructure projects (rail, bridges, highways)',
      'Understanding of Network Rail safety standards (PTS is advantageous)',
      'Proven experience leading cross-functional engineering teams'
    ],
    responsibilities: [
      'Manage project milestones and update tracking schedules',
      'Conduct site safety inspections and ensure health regulations compliance',
      'Coordinate with material suppliers to ensure timely site deliveries',
      'Report budget status and variance metrics to engineering executives'
    ],
    benefits: [
      'Inside IR35 with highly competitive daily compensation',
      'Paid travel allowances',
      'Initial 6-month term with extension review'
    ],
    day_rate_min: 550,
    day_rate_max: 650,
    ir35_status: 'inside',
    remote_type: 'hybrid',
    clearance_level: 'none',
    location: 'Manchester',
    skills: ['Prince2', 'Civil Engineering', 'Infrastructure', 'Risk Management'],
    created_at: '2026-06-10T15:00:00Z',
    expires_at: '2026-07-10T15:00:00Z',
    featured: false
  },
  {
    id: '11111111-1111-1111-1111-111111111108',
    title: 'SAP CO/FI Consultant (Financial Controller)',
    slug: 'sap-cofi-consultant-financial-controller',
    company_id: 'c2000000-0000-0000-0000-000000000002',
    description_html: '<p>Apex Finance requires an SAP FICO Consultant to implement specialized financial controlling modules for a recently acquired manufacturing subsidiary. You will customize reports, configure profit centers, and train internal staff.</p><p>Assessed as Outside IR35. Deliverables-based project contract.</p>',
    requirements: [
      'SAP certified in CO (Controlling) and FI (Financial Accounting) modules',
      'Minimum 3 full-lifecycle SAP implementation cycles completed',
      'Background in corporate finance, manufacturing cost accounting, or auditing',
      'Ability to design custom report layouts and translate business needs into configuration'
    ],
    responsibilities: [
      'Configure SAP product costing, ledger accounts, and asset classes',
      'Map cost flows between company subsidiaries and main consolidation groups',
      'Draft system testing plans and oversee user acceptance checks',
      'Prepare instructional documentation for finance administrators'
    ],
    benefits: [
      'Outside IR35 determination',
      'Highly flexible hours',
      'Work alongside leading corporate finance experts'
    ],
    day_rate_min: 700,
    day_rate_max: 850,
    ir35_status: 'outside',
    remote_type: 'hybrid',
    clearance_level: 'none',
    location: 'London',
    skills: ['SAP', 'Financial Accounting', 'Cost Controlling', 'ERP'],
    created_at: '2026-06-09T09:00:00Z',
    expires_at: '2026-07-09T09:00:00Z',
    featured: false
  },
  {
    id: '11111111-1111-1111-1111-111111111109',
    title: 'Locum Consultant Cardiologist',
    slug: 'locum-consultant-cardiologist',
    company_id: 'c4000000-0000-0000-0000-000000000004',
    description_html: '<p>An experienced Consultant Cardiologist is required to support clinical outpatient runs and inpatient ward audits under a locum contract. You will manage cardiac telemetry, consult with patients, and guide medical juniors.</p><p>Assessed as **Inside IR35** (NHS standard policy) and processed via NHS standard payroll channels.</p>',
    requirements: [
      'GMC registration with License to Practice and listed on Specialist Register',
      'FRCP or equivalent advanced medical degree qualification',
      'Substantial experience in diagnostic imaging, echocardiography, and stress testing',
      'Immediate availability to commit to clinical rotas'
    ],
    responsibilities: [
      'Lead outpatient clinics and perform cardiac assessments',
      'Conduct daily ward rounds in the coronary care unit',
      'Supervise and teach junior registrars and clinical fellows',
      'Participate in multi-disciplinary team review sessions'
    ],
    benefits: [
      'GMC premium locum rate',
      'Onsite trust parking provided',
      '3-month initial term'
    ],
    day_rate_min: 900,
    day_rate_max: 1100,
    ir35_status: 'inside',
    remote_type: 'onsite',
    clearance_level: 'none',
    location: 'Birmingham',
    skills: ['Cardiology', 'GMC', 'Patient Care', 'NHS'],
    created_at: '2026-06-08T10:00:00Z',
    expires_at: '2026-07-08T10:00:00Z',
    featured: false
  },
  {
    id: '11111111-1111-1111-1111-111111111110',
    title: 'Lead Nurse Practitioner (Primary Care)',
    slug: 'lead-nurse-practitioner-primary-care',
    company_id: 'c4000000-0000-0000-0000-000000000004',
    description_html: '<p>We require a Locum Lead Nurse Practitioner to run minor ailment clinics, manage triage queues, and perform patient evaluations. Assessed as Inside IR35.</p>',
    requirements: [
      'Active NMC registration as a Nurse Practitioner',
      'Independent Prescribing qualification (V300)',
      'Experience in primary care, GP practices, or urgent care centers',
      'Strong clinical assessment skills'
    ],
    responsibilities: [
      'Assess, diagnose, and treat patients presenting with minor illnesses',
      'Prescribe medications inside professional scope guidelines',
      'Refer patients to specialists as clinically necessary',
      'Coordinate nursing rotas and triage systems'
    ],
    benefits: [
      'Umbrella PAYE integration support',
      'Flexible shift selections (day/night options)',
      'Supportive trust environment'
    ],
    day_rate_min: 350,
    day_rate_max: 450,
    ir35_status: 'inside',
    remote_type: 'onsite',
    clearance_level: 'none',
    location: 'Birmingham',
    skills: ['NMC', 'Primary Care', 'Triage', 'Prescribing'],
    created_at: '2026-06-07T12:00:00Z',
    expires_at: '2026-07-07T12:00:00Z',
    featured: false
  },
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'Procurement Specialist (Logistics Contract)',
    slug: 'procurement-specialist-logistics-contract',
    company_id: 'c3000000-0000-0000-0000-000000000003',
    description_html: '<p>Vanguard requires a senior Contract Procurement Advisor to audit supplier agreements, negotiate bulk material price structures, and coordinate import procedures for transport infrastructure components.</p><p>Assessed as Outside IR35. Deliverables include drafting 5 key supplier agreements.</p>',
    requirements: [
      'MCIPS qualification or equivalent procurement accreditation',
      'Background managing supply chains in logistics, manufacturing, or engineering',
      'Expert contract negotiation skills and commercial acumen',
      'Understanding of international trade terms (Incoterms)'
    ],
    responsibilities: [
      'Review existing supply contracts and identify cost reduction opportunities',
      'Draft and negotiate framework agreements with new component manufacturers',
      'Coordinate with shipping agents to optimize import procedures',
      'Present cost-saving reports to procurement directors'
    ],
    benefits: [
      'Outside IR35 status',
      'Fully hybrid (1 day in Manchester office/month)',
      '6-month initial term'
    ],
    day_rate_min: 450,
    day_rate_max: 550,
    ir35_status: 'outside',
    remote_type: 'hybrid',
    clearance_level: 'none',
    location: 'Manchester',
    skills: ['MCIPS', 'Supply Chain', 'Negotiation', 'Logistics'],
    created_at: '2026-06-06T16:00:00Z',
    expires_at: '2026-07-06T16:00:00Z',
    featured: false
  },
  {
    id: '11111111-1111-1111-1111-111111111112',
    title: 'Senior Business Analyst (Regulatory Change)',
    slug: 'senior-business-analyst-regulatory-change',
    company_id: 'c2000000-0000-0000-0000-000000000002',
    description_html: '<p>A Senior Business Analyst is required for a 6-month contract to document workflows and system adjustments required under upcoming regulatory change frameworks. Assessed as Outside IR35.</p>',
    requirements: [
      'BCS Business Analysis Diploma or equivalent BA certification',
      'Experience in financial services (banking, insurance, or asset management)',
      'Expertise in process mapping (BPMN) and requirements engineering',
      'Exceptional stakeholder facilitation skills'
    ],
    responsibilities: [
      'Map current-state processes and conduct gap analysis against regulations',
      'Elicit and document detailed functional and non-functional requirements',
      'Facilitate workshops with compliance, operations, and IT teams',
      'Support user acceptance testing (UAT) planning phases'
    ],
    benefits: [
      'Outside IR35 contract',
      'Hybrid model (London)',
      'Collaborative team environment'
    ],
    day_rate_min: 500,
    day_rate_max: 600,
    ir35_status: 'outside',
    remote_type: 'hybrid',
    clearance_level: 'none',
    location: 'London',
    skills: ['BPMN', 'BCS', 'Requirements Gathering', 'Regulatory Compliance'],
    created_at: '2026-06-05T09:00:00Z',
    expires_at: '2026-07-05T09:00:00Z',
    featured: false
  }
];

const guidesData = [
  {
    id: '99999999-9999-9999-9999-999999999901',
    title: 'Understanding IR35: The Complete Guide for Contractors',
    slug: 'what-is-ir35-guide',
    guide_category: 'compliance',
    content_html: '<h3>What is IR35?</h3><p>IR35 is the common name given to the UK tax legislation designed to identify "disguised employees" working via intermediary structures (like a Limited Company or PSC) to avoid paying standard employment taxes.</p><h4>Inside vs. Outside IR35</h4><p>When a contract is determined as **Outside IR35**, the contractor is treated as a separate, self-employed business. This allows optimizing tax distributions using a combination of director salary and dividends. When a contract is **Inside IR35**, the contractor is deemed an employee for tax purposes, meaning PAYE tax and National Insurance are deducted at source (often via an Umbrella company).</p><h4>Key IR35 Test Pillars</h4><ul><li>**Right of Substitution:** Can you supply a qualified helper instead of performing the tasks yourself?</li><li>**Control:** Does the client control how, when, and where you deliver the project?</li><li>**Mutuality of Obligation (MOO):** Is the client obliged to offer work, and are you obliged to accept it?</li></ul>'
  },
  {
    id: '99999999-9999-9999-9999-999999999902',
    title: 'Security Clearances in the UK: BPSS, SC, and DV Explained',
    slug: 'what-is-sc-clearance-guide',
    guide_category: 'clearance',
    content_html: '<h3>UK Security Clearances Guide</h3><p>Security clearance levels determine your eligibility to work on sensitive government, defense, and national infrastructure projects.</p><h4>Clearance Levels</h4><ul><li>**BPSS (Baseline Personnel Security Standard):** The standard background screening checks (identity, right to work, criminal record, employment history).</li><li>**SC (Security Check):** Required for staff handling secret assets or working in proximity to sensitive environments. Involves credit checks and background screening. Valid for 5-10 years.</li><li>**DV (Developed Vetting):** The highest security level in the UK. Required for single access to top-secret assets. Involves highly detailed financial audits and personal interviews.</li></ul>'
  },
  {
    id: '99999999-9999-9999-9999-999999999903',
    title: 'Contractor Tax Explained: Dividend & Corporation Tax Rates (2025/26)',
    slug: 'contractor-tax-explained-guide',
    guide_category: 'tax',
    content_html: '<h3>Contractor Tax optimization (Outside IR35)</h3><p>Operating Outside IR35 through a Private Limited Company allows contractors to structure their remuneration to maximize post-tax income.</p><h4>1. Corporation Tax</h4><p>Corporation tax is levied on company profits after business expenses and director salary are deducted:</p><ul><li>**19% Small Profits Rate:** On company profits up to £50,000.</li><li>**25% Main Rate:** On company profits above £250,000.</li><li>**Marginal Relief:** Tapered rate between £50,000 and £250,000.</li></ul><h4>2. Remuneration Strategy</h4><p>Contractors typically pay themselves a small salary up to the Secondary National Insurance Threshold (£9,100 or £12,570 depending on setup) and distribute the remaining profit as Dividends. Dividends are tax-free up to £500, with dividend tax rates applied beyond that: 8.75% (basic), 33.75% (higher), and 39.35% (additional).</p>'
  }
];

const blogData = [
  {
    id: '88888888-8888-8888-8888-888888888801',
    title: 'Autumn Budget Impact on UK Contracting Sector',
    slug: 'autumn-budget-impact-contracting',
    excerpt: 'How the recent shifts in Employer National Insurance and corporate tax brackets affect your daily take-home pay structures.',
    content_html: '<p>The Autumn Budget introduced key changes that alter the financial landscape for UK contractors. The major impact stems from the increase of **Employer National Insurance (Class 1) to 15%** (up from 13.8%) and the reduction of the secondary threshold to **£5,000 per year** (down from £9,100).</p><p>This increase primarily targets employment costs, meaning **Inside IR35** contracts run via Umbrella companies will see higher payroll deductions, as the employer NI increase is commonly passed down through the assignment day rate. Meanwhile, **Outside IR35** contractors should review their company salary structure to ensure their director pay remains tax-efficient.</p>',
    featured_image_url: '📊',
    status: 'published',
    created_at: '2026-06-10T10:00:00Z',
    published_at: '2026-06-10T10:00:00Z'
  },
  {
    id: '88888888-8888-8888-8888-888888888802',
    title: 'How to Write an Outside IR35 Compliant Contract',
    slug: 'write-outside-ir35-compliant-contract',
    excerpt: 'Avoid HMRC audit triggers by drafting precise clauses covering substitution, control, and mutuality of obligation.',
    content_html: '<p>Drafting a compliant contract is the first defense against HMRC challenges. The contract must explicitly state that the relationship is one of business-to-business and not employer-employee. Key clauses include:</p><h4>1. Genuine Substitution Clause</h4><p>Ensure the contract states that the contractor company can supply a substitute of matching expertise without needing client permission, and that the contractor company is solely responsible for paying that substitute.</p><h4>2. Control & Supervision</h4><p>Ensure the contract details that the contractor is responsible for deciding *how* the deliverables are met, and that they are not subject to the direct supervision, control, or direction of the client staff.</p>',
    featured_image_url: '✍️',
    status: 'published',
    created_at: '2026-06-05T11:00:00Z',
    published_at: '2026-06-05T11:00:00Z'
  }
];

const usersData = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'contractor@example.com',
    role: 'candidate'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'hiring@devtech.example.com',
    role: 'recruiter'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'admin@outsideir35.co.uk',
    role: 'admin'
  }
];

const candidateProfileData = {
  user_id: '11111111-1111-1111-1111-111111111111',
  first_name: 'Sarah',
  last_name: 'Jenkins',
  headline: 'Lead React Developer & UI Architect',
  bio: '10+ years experience building highly interactive, scalable web applications. Specialist in state management, custom SVG graphing, and high-performance frontend interfaces.',
  location: 'London, UK',
  website_url: 'https://sarahj-dev.example.com',
  linkedin_url: 'https://linkedin.com/in/sarah-jenkins-dev',
  availability: 'immediate',
  min_day_rate: 550,
  max_day_rate: 700,
  clearance_level: 'none',
  resume_url: 'Sarah_Jenkins_CV_2026.pdf',
  is_profile_public: true
};

const recruiterProfileData = {
  user_id: '22222222-2222-2222-2222-222222222222',
  first_name: 'James',
  last_name: 'Caan',
  phone: '+44 7700 900077',
  company_id: 'c1000000-0000-0000-0000-000000000001'
};

async function main() {
  console.log('Seeding Supabase Database...');

  // 1. Clean up existing records in appropriate order to avoid foreign key errors
  console.log('Cleaning existing records...');
  await supabase.from('job_skills').delete().neq('job_id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('saved_jobs').delete().neq('job_id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('applications').delete().neq('job_id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('skills').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('companies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('candidate_profiles').delete().neq('user_id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('recruiter_profiles').delete().neq('user_id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('guides').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('blog_posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('consent_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 2. Insert Users
  console.log('Inserting default users...');
  const { error: usersError } = await supabase.from('users').insert(usersData);
  if (usersError) console.error('Error inserting users:', usersError.message);

  // 3. Insert Profiles
  console.log('Inserting profiles...');
  await supabase.from('candidate_profiles').insert(candidateProfileData);
  await supabase.from('recruiter_profiles').insert(recruiterProfileData);

  // 4. Insert Companies
  console.log('Inserting companies...');
  const { error: compError } = await supabase.from('companies').insert(companiesData);
  if (compError) console.error('Error inserting companies:', compError.message);

  // 5. Insert Skills dynamically & Jobs & JobSkills mapping
  console.log('Inserting jobs & skills...');
  for (const job of jobsData) {
    const { skills, ...jobFields } = job;
    
    // Insert Job
    const { error: jobInsertErr } = await supabase.from('jobs').insert({
      id: jobFields.id,
      title: jobFields.title,
      slug: jobFields.slug,
      company_id: jobFields.company_id,
      description_html: jobFields.description_html,
      requirements: JSON.stringify(jobFields.requirements),
      responsibilities: JSON.stringify(jobFields.responsibilities),
      benefits: JSON.stringify(jobFields.benefits),
      day_rate_min: jobFields.day_rate_min,
      day_rate_max: jobFields.day_rate_max,
      ir35_status: jobFields.ir35_status,
      remote_type: jobFields.remote_type,
      clearance_level: jobFields.clearance_level,
      location: jobFields.location,
      featured: jobFields.featured,
      created_at: jobFields.created_at,
      expires_at: jobFields.expires_at
    });

    if (jobInsertErr) {
      console.error(`Error inserting job ${jobFields.title}:`, jobInsertErr.message);
      continue;
    }

    // Insert associated Skills and JobSkills junctions
    for (const skillName of skills) {
      let skillId = '';
      
      // Query if skill already exists
      const { data: existingSkill } = await supabase
        .from('skills')
        .select('id')
        .eq('name', skillName)
        .single();
        
      if (existingSkill) {
        skillId = existingSkill.id;
      } else {
        // Create new skill
        const skillSlug = skillName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const { data: newSkill, error: skillErr } = await supabase
          .from('skills')
          .insert({ name: skillName, slug: skillSlug })
          .select('id')
          .single();
          
        if (skillErr) {
          console.error(`Error inserting skill ${skillName}:`, skillErr.message);
          continue;
        }
        if (newSkill) skillId = newSkill.id;
      }
      
      if (skillId) {
        await supabase.from('job_skills').insert({
          job_id: jobFields.id,
          skill_id: skillId
        });
      }
    }
  }

  // 6. Insert Guides
  console.log('Inserting guides...');
  const { error: guidesError } = await supabase.from('guides').insert(guidesData);
  if (guidesError) console.error('Error inserting guides:', guidesError.message);

  // 7. Insert Blogs
  console.log('Inserting blog posts...');
  const { error: blogError } = await supabase.from('blog_posts').insert(blogData);
  if (blogError) console.error('Error inserting blog posts:', blogError.message);

  console.log('Database Seeding Completed Successfully!');
}

main().catch(console.error);
