-- Seed Categories (Industries)
INSERT INTO categories (id, name, slug, description, icon_svg) VALUES
('b1000000-0000-0000-0000-000000000001', 'Software Engineering & IT', 'software-engineering-it', 'Software development, architecture, testing, and IT infrastructure.', '💻'),
('b1000000-0000-0000-0000-000000000002', 'Finance & Accounting', 'finance-accounting', 'Banking, accounting, private equity, and financial controlling.', '📈'),
('b1000000-0000-0000-0000-000000000003', 'Government & Public Sector', 'government-public-sector', 'Public sector, defense, and civil service roles.', '🏛️'),
('b1000000-0000-0000-0000-000000000004', 'Engineering & Manufacturing', 'engineering-manufacturing', 'Civil, structural, mechanical, and electrical engineering.', '⚙️'),
('b1000000-0000-0000-0000-000000000005', 'Healthcare & Medical', 'healthcare-medical', 'Clinical, nursing, locum doctors, and primary care.', '💙'),
('b1000000-0000-0000-0000-000000000006', 'Construction & Property', 'construction-property', 'Building, surveying, project management, and logistics.', '🏗️'),
('b1000000-0000-0000-0000-000000000007', 'Automotive & Transport', 'automotive-transport', 'Automotive design, manufacturing, and systems engineering.', '🚗'),
('b1000000-0000-0000-0000-000000000008', 'Marketing, PR & Media', 'marketing-pr-media', 'Digital marketing, brand management, and PR.', '📱'),
('b1000000-0000-0000-0000-000000000009', 'Sales & Business Development', 'sales-business-development', 'B2B sales, account management, and business development.', '🤝'),
('b1000000-0000-0000-0000-000000000010', 'Legal & Compliance', 'legal-compliance', 'Corporate law, compliance officers, and contract law.', '⚖️'),
('b1000000-0000-0000-0000-000000000011', 'Human Resources', 'human-resources', 'Talent acquisition, HR management, and employee relations.', '👥'),
('b1000000-0000-0000-0000-000000000012', 'Design & Creative', 'design-creative', 'UX/UI design, graphic design, and creative direction.', '🎨'),
('b1000000-0000-0000-0000-000000000013', 'Logistics & Supply Chain', 'logistics-supply-chain', 'Supply chain management, procurement, and transport.', '📦'),
('b1000000-0000-0000-0000-000000000014', 'Energy & Renewables', 'energy-renewables', 'Renewable energy, oil & gas, and grid infrastructure.', '⚡'),
('b1000000-0000-0000-0000-000000000015', 'Telecommunications', 'telecommunications', 'Telecom networks, 5G infrastructure, and ISP engineers.', '📡'),
('b1000000-0000-0000-0000-000000000016', 'Cybersecurity', 'cybersecurity', 'Information security, penetration testing, and SecOps.', '🔒'),
('b1000000-0000-0000-0000-000000000017', 'Data & Analytics', 'data-analytics', 'Data engineering, business intelligence, and AI/ML.', '📊'),
('b1000000-0000-0000-0000-000000000018', 'Product Management', 'product-management', 'Agile product management, ownership, and strategy.', '🎯'),
('b1000000-0000-0000-0000-000000000019', 'Customer Service & Operations', 'customer-service-operations', 'Operations management, support leads, and CS teams.', '🎧'),
('b1000000-0000-0000-0000-000000000020', 'Education & EdTech', 'education-edtech', 'Teachers, trainers, instructional designers, and educational leadership.', '📚'),
('b1000000-0000-0000-0000-000000000021', 'Real Estate & PropTech', 'real-estate-proptech', 'Property sales, letting agents, and real estate management.', '🏢'),
('b1000000-0000-0000-0000-000000000022', 'Retail & E-Commerce', 'retail-ecommerce', 'Store management, merchandising, and e-commerce operations.', '🛍️'),
('b1000000-0000-0000-0000-000000000023', 'Aerospace & Defense', 'aerospace-defense', 'Aerospace engineering, aviation, and defense contracting.', '✈️'),
('b1000000-0000-0000-0000-000000000024', 'Pharmaceuticals & Life Sciences', 'pharmaceuticals-life-sciences', 'Clinical research, biochemistry, and pharma manufacturing.', '🔬'),
('b1000000-0000-0000-0000-000000000025', 'Agriculture & AgriTech', 'agriculture-agritech', 'Farming, agricultural science, and environmental management.', '🌾'),
('b1000000-0000-0000-0000-000000000026', 'Hospitality & Tourism', 'hospitality-tourism', 'Hotel management, travel consulting, and event hosting.', '🏨'),
('b1000000-0000-0000-0000-000000000027', 'Media & Entertainment', 'media-entertainment', 'Journalism, broadcasting, and film production.', '🎬'),
('b1000000-0000-0000-0000-000000000028', 'Other', 'other', 'Roles that do not fit into the predefined categories.', '📌')
ON CONFLICT (name) DO NOTHING;

-- Map common skills (Tags) to 'Software Engineering & IT'
INSERT INTO skills (name, slug, category_id) VALUES
('React Developer', 'react-developer', 'b1000000-0000-0000-0000-000000000001'),
('Angular Developer', 'angular-developer', 'b1000000-0000-0000-0000-000000000001'),
('Vue.js Developer', 'vue-js-developer', 'b1000000-0000-0000-0000-000000000001'),
('Frontend Developer', 'frontend-developer', 'b1000000-0000-0000-0000-000000000001'),
('Backend Developer', 'backend-developer', 'b1000000-0000-0000-0000-000000000001'),
('Fullstack Developer', 'fullstack-developer', 'b1000000-0000-0000-0000-000000000001'),
('Java Developer', 'java-developer', 'b1000000-0000-0000-0000-000000000001'),
('Python Developer', 'python-developer', 'b1000000-0000-0000-0000-000000000001'),
('Node.js Developer', 'node-js-developer', 'b1000000-0000-0000-0000-000000000001'),
('C# / .NET Developer', 'csharp-net-developer', 'b1000000-0000-0000-0000-000000000001'),
('Go Developer', 'go-developer', 'b1000000-0000-0000-0000-000000000001'),
('Ruby on Rails Developer', 'ruby-on-rails-developer', 'b1000000-0000-0000-0000-000000000001'),
('PHP Developer', 'php-developer', 'b1000000-0000-0000-0000-000000000001'),
('iOS Developer (Swift)', 'ios-developer-swift', 'b1000000-0000-0000-0000-000000000001'),
('Android Developer (Kotlin)', 'android-developer-kotlin', 'b1000000-0000-0000-0000-000000000001'),
('React Native Developer', 'react-native-developer', 'b1000000-0000-0000-0000-000000000001'),
('Flutter Developer', 'flutter-developer', 'b1000000-0000-0000-0000-000000000001'),
('DevOps Engineer', 'devops-engineer', 'b1000000-0000-0000-0000-000000000001'),
('Site Reliability Engineer (SRE)', 'site-reliability-engineer-sre', 'b1000000-0000-0000-0000-000000000001'),
('AWS Cloud Architect', 'aws-cloud-architect', 'b1000000-0000-0000-0000-000000000001'),
('Azure Cloud Architect', 'azure-cloud-architect', 'b1000000-0000-0000-0000-000000000001'),
('GCP Cloud Architect', 'gcp-cloud-architect', 'b1000000-0000-0000-0000-000000000001'),
('Kubernetes Engineer', 'kubernetes-engineer', 'b1000000-0000-0000-0000-000000000001'),
('Terraform / IaC Engineer', 'terraform-iac-engineer', 'b1000000-0000-0000-0000-000000000001'),
('QA Automation Engineer', 'qa-automation-engineer', 'b1000000-0000-0000-0000-000000000001'),
('Manual QA Tester', 'manual-qa-tester', 'b1000000-0000-0000-0000-000000000001'),
('Scrum Master', 'scrum-master', 'b1000000-0000-0000-0000-000000000001'),
('Agile Delivery Manager', 'agile-delivery-manager', 'b1000000-0000-0000-0000-000000000001'),
('IT Support/Helpdesk', 'it-support-helpdesk', 'b1000000-0000-0000-0000-000000000001'),
('Network Engineer', 'network-engineer', 'b1000000-0000-0000-0000-000000000001'),
('System Administrator', 'system-administrator', 'b1000000-0000-0000-0000-000000000001'),
('Salesforce Developer', 'salesforce-developer', 'b1000000-0000-0000-0000-000000000001')
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id;

-- Map common skills to 'Finance & Accounting'
INSERT INTO skills (name, slug, category_id) VALUES
('Financial Controller', 'financial-controller', 'b1000000-0000-0000-0000-000000000002'),
('Management Accountant', 'management-accountant', 'b1000000-0000-0000-0000-000000000002'),
('Financial Analyst', 'financial-analyst', 'b1000000-0000-0000-0000-000000000002'),
('Private Equity Analyst', 'private-equity-analyst', 'b1000000-0000-0000-0000-000000000002'),
('Investment Banker', 'investment-banker', 'b1000000-0000-0000-0000-000000000002'),
('Risk Manager', 'risk-manager', 'b1000000-0000-0000-0000-000000000002'),
('Compliance Officer', 'compliance-officer', 'b1000000-0000-0000-0000-000000000002'),
('Auditor', 'auditor', 'b1000000-0000-0000-0000-000000000002'),
('Tax Specialist', 'tax-specialist', 'b1000000-0000-0000-0000-000000000002'),
('Quantitative Analyst', 'quantitative-analyst', 'b1000000-0000-0000-0000-000000000002'),
('SAP FICO', 'sap-fico', 'b1000000-0000-0000-0000-000000000002'),
('Accounts Payable/Receivable', 'accounts-payable-receivable', 'b1000000-0000-0000-0000-000000000002'),
('Payroll Manager', 'payroll-manager', 'b1000000-0000-0000-0000-000000000002'),
('Actuary', 'actuary', 'b1000000-0000-0000-0000-000000000002')
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id;

-- Map common skills to 'Data & Analytics'
INSERT INTO skills (name, slug, category_id) VALUES
('Data Scientist', 'data-scientist', 'b1000000-0000-0000-0000-000000000017'),
('Data Engineer', 'data-engineer', 'b1000000-0000-0000-0000-000000000017'),
('Data Analyst', 'data-analyst', 'b1000000-0000-0000-0000-000000000017'),
('Power BI Developer', 'power-bi-developer', 'b1000000-0000-0000-0000-000000000017'),
('Tableau Developer', 'tableau-developer', 'b1000000-0000-0000-0000-000000000017'),
('Machine Learning Engineer', 'machine-learning-engineer', 'b1000000-0000-0000-0000-000000000017'),
('AI/LLM Engineer', 'ai-llm-engineer', 'b1000000-0000-0000-0000-000000000017'),
('DBA (Database Administrator)', 'dba-database-administrator', 'b1000000-0000-0000-0000-000000000017'),
('Analytics Manager', 'analytics-manager', 'b1000000-0000-0000-0000-000000000017')
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id;

-- Map common skills to 'Cybersecurity'
INSERT INTO skills (name, slug, category_id) VALUES
('Penetration Tester', 'penetration-tester', 'b1000000-0000-0000-0000-000000000016'),
('Security Architect', 'security-architect', 'b1000000-0000-0000-0000-000000000016'),
('Information Security Analyst', 'information-security-analyst', 'b1000000-0000-0000-0000-000000000016'),
('SecOps Engineer', 'secops-engineer', 'b1000000-0000-0000-0000-000000000016'),
('Ethical Hacker', 'ethical-hacker', 'b1000000-0000-0000-0000-000000000016'),
('Identity & Access Management (IAM)', 'identity-access-management-iam', 'b1000000-0000-0000-0000-000000000016'),
('CISO', 'ciso', 'b1000000-0000-0000-0000-000000000016'),
('Security Consultant', 'security-consultant', 'b1000000-0000-0000-0000-000000000016')
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id;

-- Map common skills to 'Product Management'
INSERT INTO skills (name, slug, category_id) VALUES
('Product Manager', 'product-manager', 'b1000000-0000-0000-0000-000000000018'),
('Product Owner', 'product-owner', 'b1000000-0000-0000-0000-000000000018'),
('Business Analyst', 'business-analyst', 'b1000000-0000-0000-0000-000000000018'),
('Technical Product Manager', 'technical-product-manager', 'b1000000-0000-0000-0000-000000000018'),
('Product Marketing Manager', 'product-marketing-manager', 'b1000000-0000-0000-0000-000000000018'),
('Head of Product', 'head-of-product', 'b1000000-0000-0000-0000-000000000018')
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id;

-- Map common skills to 'Design & Creative'
INSERT INTO skills (name, slug, category_id) VALUES
('UX/UI Designer', 'ux-ui-designer', 'b1000000-0000-0000-0000-000000000012'),
('Product Designer', 'product-designer', 'b1000000-0000-0000-0000-000000000012'),
('Graphic Designer', 'graphic-designer', 'b1000000-0000-0000-0000-000000000012'),
('Art Director', 'art-director', 'b1000000-0000-0000-0000-000000000012'),
('Copywriter', 'copywriter', 'b1000000-0000-0000-0000-000000000012'),
('Motion Graphics Designer', 'motion-graphics-designer', 'b1000000-0000-0000-0000-000000000012'),
('3D Artist', '3d-artist', 'b1000000-0000-0000-0000-000000000012'),
('UX Researcher', 'ux-researcher', 'b1000000-0000-0000-0000-000000000012')
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id;

-- Map common skills to 'Marketing, PR & Media'
INSERT INTO skills (name, slug, category_id) VALUES
('Digital Marketing Manager', 'digital-marketing-manager', 'b1000000-0000-0000-0000-000000000008'),
('SEO Specialist', 'seo-specialist', 'b1000000-0000-0000-0000-000000000008'),
('Content Strategist', 'content-strategist', 'b1000000-0000-0000-0000-000000000008'),
('Social Media Manager', 'social-media-manager', 'b1000000-0000-0000-0000-000000000008'),
('PPC/Paid Media Manager', 'ppc-paid-media-manager', 'b1000000-0000-0000-0000-000000000008'),
('PR Specialist', 'pr-specialist', 'b1000000-0000-0000-0000-000000000008'),
('Brand Manager', 'brand-manager', 'b1000000-0000-0000-0000-000000000008'),
('Event Manager', 'event-manager', 'b1000000-0000-0000-0000-000000000008'),
('Email Marketing Specialist', 'email-marketing-specialist', 'b1000000-0000-0000-0000-000000000008')
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id;

-- Map common skills to 'Sales & Business Development'
INSERT INTO skills (name, slug, category_id) VALUES
('Account Executive', 'account-executive', 'b1000000-0000-0000-0000-000000000009'),
('Business Development Manager (BDM)', 'business-development-manager-bdm', 'b1000000-0000-0000-0000-000000000009'),
('Sales Manager', 'sales-manager', 'b1000000-0000-0000-0000-000000000009'),
('Key Account Manager', 'key-account-manager', 'b1000000-0000-0000-0000-000000000009'),
('SDR / BDR', 'sdr-bdr', 'b1000000-0000-0000-0000-000000000009'),
('Customer Success Manager (CSM)', 'customer-success-manager-csm', 'b1000000-0000-0000-0000-000000000009'),
('Sales Engineer / Solutions Architect', 'sales-engineer-solutions-architect', 'b1000000-0000-0000-0000-000000000009')
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id;

-- Map common skills to 'Engineering & Manufacturing'
INSERT INTO skills (name, slug, category_id) VALUES
('Mechanical Engineer', 'mechanical-engineer', 'b1000000-0000-0000-0000-000000000004'),
('Electrical Engineer', 'electrical-engineer', 'b1000000-0000-0000-0000-000000000004'),
('Civil Engineer', 'civil-engineer', 'b1000000-0000-0000-0000-000000000004'),
('Structural Engineer', 'structural-engineer', 'b1000000-0000-0000-0000-000000000004'),
('Manufacturing Engineer', 'manufacturing-engineer', 'b1000000-0000-0000-0000-000000000004'),
('Quality Assurance Engineer', 'quality-assurance-engineer', 'b1000000-0000-0000-0000-000000000004'),
('Process Engineer', 'process-engineer', 'b1000000-0000-0000-0000-000000000004'),
('CAD Technician', 'cad-technician', 'b1000000-0000-0000-0000-000000000004')
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id;

-- Map common skills to 'Construction & Property'
INSERT INTO skills (name, slug, category_id) VALUES
('Quantity Surveyor', 'quantity-surveyor', 'b1000000-0000-0000-0000-000000000006'),
('Site Manager', 'site-manager', 'b1000000-0000-0000-0000-000000000006'),
('Project Manager (Construction)', 'project-manager-construction', 'b1000000-0000-0000-0000-000000000006'),
('Estimator', 'estimator', 'b1000000-0000-0000-0000-000000000006'),
('Architect', 'architect', 'b1000000-0000-0000-0000-000000000006'),
('Health & Safety Officer', 'health-safety-officer', 'b1000000-0000-0000-0000-000000000006'),
('Facilities Manager', 'facilities-manager', 'b1000000-0000-0000-0000-000000000006'),
('Property Manager', 'property-manager', 'b1000000-0000-0000-0000-000000000006')
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id;

-- Map common skills to 'Healthcare & Medical'
INSERT INTO skills (name, slug, category_id) VALUES
('Registered Nurse (RGN)', 'registered-nurse-rgn', 'b1000000-0000-0000-0000-000000000005'),
('Locum Doctor', 'locum-doctor', 'b1000000-0000-0000-0000-000000000005'),
('Pharmacist', 'pharmacist', 'b1000000-0000-0000-0000-000000000005'),
('Physiotherapist', 'physiotherapist', 'b1000000-0000-0000-0000-000000000005'),
('Healthcare Assistant (HCA)', 'healthcare-assistant-hca', 'b1000000-0000-0000-0000-000000000005'),
('Clinical Psychologist', 'clinical-psychologist', 'b1000000-0000-0000-0000-000000000005'),
('Dentist', 'dentist', 'b1000000-0000-0000-0000-000000000005'),
('Occupational Therapist', 'occupational-therapist', 'b1000000-0000-0000-0000-000000000005')
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id;

-- Map common skills to 'Logistics & Supply Chain'
INSERT INTO skills (name, slug, category_id) VALUES
('Supply Chain Manager', 'supply-chain-manager', 'b1000000-0000-0000-0000-000000000013'),
('Procurement Manager', 'procurement-manager', 'b1000000-0000-0000-0000-000000000013'),
('Logistics Coordinator', 'logistics-coordinator', 'b1000000-0000-0000-0000-000000000013'),
('Warehouse Manager', 'warehouse-manager', 'b1000000-0000-0000-0000-000000000013'),
('Operations Manager', 'operations-manager', 'b1000000-0000-0000-0000-000000000013'),
('Inventory Planner', 'inventory-planner', 'b1000000-0000-0000-0000-000000000013'),
('Transport Planner', 'transport-planner', 'b1000000-0000-0000-0000-000000000013')
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id;

-- Map common skills to 'Legal & Compliance'
INSERT INTO skills (name, slug, category_id) VALUES
('Corporate Lawyer', 'corporate-lawyer', 'b1000000-0000-0000-0000-000000000010'),
('Paralegal', 'paralegal', 'b1000000-0000-0000-0000-000000000010'),
('Legal Counsel', 'legal-counsel', 'b1000000-0000-0000-0000-000000000010'),
('Compliance Officer', 'compliance-officer-legal', 'b1000000-0000-0000-0000-000000000010'),
('Contracts Manager', 'contracts-manager', 'b1000000-0000-0000-0000-000000000010'),
('Data Protection Officer (DPO)', 'data-protection-officer-dpo', 'b1000000-0000-0000-0000-000000000010'),
('Regulatory Affairs Specialist', 'regulatory-affairs-specialist', 'b1000000-0000-0000-0000-000000000010')
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id;

-- Map common skills to 'Education & EdTech'
INSERT INTO skills (name, slug, category_id) VALUES
('Instructional Designer', 'instructional-designer', 'b1000000-0000-0000-0000-000000000020'),
('E-Learning Developer', 'e-learning-developer', 'b1000000-0000-0000-0000-000000000020'),
('Corporate Trainer', 'corporate-trainer', 'b1000000-0000-0000-0000-000000000020'),
('Education Consultant', 'education-consultant', 'b1000000-0000-0000-0000-000000000020')
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id;

-- Map common skills to 'Real Estate & PropTech'
INSERT INTO skills (name, slug, category_id) VALUES
('Property Manager', 'property-manager-real-estate', 'b1000000-0000-0000-0000-000000000021'),
('Real Estate Agent', 'real-estate-agent', 'b1000000-0000-0000-0000-000000000021'),
('Leasing Consultant', 'leasing-consultant', 'b1000000-0000-0000-0000-000000000021'),
('Facilities Coordinator', 'facilities-coordinator', 'b1000000-0000-0000-0000-000000000021')
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id;

-- Map common skills to 'Retail & E-Commerce'
INSERT INTO skills (name, slug, category_id) VALUES
('E-Commerce Manager', 'e-commerce-manager', 'b1000000-0000-0000-0000-000000000022'),
('Visual Merchandiser', 'visual-merchandiser', 'b1000000-0000-0000-0000-000000000022'),
('Retail Store Manager', 'retail-store-manager', 'b1000000-0000-0000-0000-000000000022'),
('Buyer', 'buyer', 'b1000000-0000-0000-0000-000000000022')
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id;

-- Map common skills to 'Aerospace & Defense'
INSERT INTO skills (name, slug, category_id) VALUES
('Aerospace Engineer', 'aerospace-engineer', 'b1000000-0000-0000-0000-000000000023'),
('Systems Engineer (Defense)', 'systems-engineer-defense', 'b1000000-0000-0000-0000-000000000023'),
('Avionics Technician', 'avionics-technician', 'b1000000-0000-0000-0000-000000000023'),
('Defense Contractor', 'defense-contractor', 'b1000000-0000-0000-0000-000000000023')
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id;

-- Map common skills to 'Pharmaceuticals & Life Sciences'
INSERT INTO skills (name, slug, category_id) VALUES
('Clinical Research Associate (CRA)', 'clinical-research-associate-cra', 'b1000000-0000-0000-0000-000000000024'),
('Biomedical Scientist', 'biomedical-scientist', 'b1000000-0000-0000-0000-000000000024'),
('Pharmacovigilance Scientist', 'pharmacovigilance-scientist', 'b1000000-0000-0000-0000-000000000024'),
('Medical Science Liaison', 'medical-science-liaison', 'b1000000-0000-0000-0000-000000000024')
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id;

-- Map common skills to 'Agriculture & AgriTech'
INSERT INTO skills (name, slug, category_id) VALUES
('Agronomist', 'agronomist', 'b1000000-0000-0000-0000-000000000025'),
('Farm Manager', 'farm-manager', 'b1000000-0000-0000-0000-000000000025'),
('Agricultural Engineer', 'agricultural-engineer', 'b1000000-0000-0000-0000-000000000025'),
('Environmental Consultant', 'environmental-consultant', 'b1000000-0000-0000-0000-000000000025')
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id;

-- Map common skills to 'Hospitality & Tourism'
INSERT INTO skills (name, slug, category_id) VALUES
('Hotel Manager', 'hotel-manager', 'b1000000-0000-0000-0000-000000000026'),
('Travel Consultant', 'travel-consultant', 'b1000000-0000-0000-0000-000000000026'),
('Event Coordinator', 'event-coordinator', 'b1000000-0000-0000-0000-000000000026'),
('Executive Chef', 'executive-chef', 'b1000000-0000-0000-0000-000000000026')
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id;

-- Map common skills to 'Media & Entertainment'
INSERT INTO skills (name, slug, category_id) VALUES
('Journalist', 'journalist', 'b1000000-0000-0000-0000-000000000027'),
('Video Editor', 'video-editor', 'b1000000-0000-0000-0000-000000000027'),
('Broadcast Engineer', 'broadcast-engineer', 'b1000000-0000-0000-0000-000000000027'),
('Producer', 'producer', 'b1000000-0000-0000-0000-000000000027')
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id;

-- Map common skills to 'Other'
INSERT INTO skills (name, slug, category_id) VALUES
('Other / Uncategorized', 'other-uncategorized', 'b1000000-0000-0000-0000-000000000028')
ON CONFLICT (name) DO UPDATE SET category_id = EXCLUDED.category_id;

-- Ensure previously created generic skills from seed script are mapped to categories if possible
UPDATE skills SET category_id = 'b1000000-0000-0000-0000-000000000001' WHERE name IN ('React', 'Python', 'AWS', 'Terraform', 'Kubernetes', 'CI/CD', 'Serverless', 'TypeScript', 'CSS', 'Zustand', 'WebSockets', 'Docker', 'FastAPI', 'Linux', 'Security');
UPDATE skills SET category_id = 'b1000000-0000-0000-0000-000000000002' WHERE name IN ('CFA', 'Financial Modeling', 'Private Equity', 'SAP', 'Financial Accounting', 'Cost Controlling', 'Portfolio Management');
UPDATE skills SET category_id = 'b1000000-0000-0000-0000-000000000006' WHERE name IN ('NEC4', 'RICS', 'Surveying', 'Commercial Management', 'Supply Chain', 'Logistics');
UPDATE skills SET category_id = 'b1000000-0000-0000-0000-000000000004' WHERE name IN ('Civil Engineering', 'Infrastructure');
UPDATE skills SET category_id = 'b1000000-0000-0000-0000-000000000005' WHERE name IN ('Primary Care', 'Prescribing', 'Cardiology', 'NHS', 'GMC');
