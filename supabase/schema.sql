-- OutsideIR35 / ContractorHub PostgreSQL Schema DDL
-- Structured into Domains: Identity, Company, Jobs, Candidate, Content, System, and Payments.
-- Tailored for UK Contracting (Outside/Inside IR35, SC/DV Clearances, Day Rates, GDPR).

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

--------------------------------------------------------------------------------
-- DOMAIN 1: IDENTITY & PROFILES
--------------------------------------------------------------------------------

-- Base user accounts
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'candidate', -- 'candidate', 'recruiter', 'admin'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Candidate profiles
CREATE TABLE candidate_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    headline VARCHAR(255),
    bio TEXT,
    location VARCHAR(255),
    website_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    availability VARCHAR(50) DEFAULT 'immediate', -- 'immediate', '1_month', 'not_available'
    min_day_rate NUMERIC(10, 2),
    max_day_rate NUMERIC(10, 2),
    clearance_level VARCHAR(50) DEFAULT 'none', -- 'none', 'BPSS', 'SC', 'DV'
    resume_url VARCHAR(500),
    is_profile_public BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recruiter profiles
CREATE TABLE recruiter_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    company_id UUID, -- Set via triggers or explicit association later
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- GDPR consent records
CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    consent_type VARCHAR(100) NOT NULL, -- 'terms_of_service', 'gdpr_privacy_policy', 'marketing'
    is_granted BOOLEAN NOT NULL DEFAULT TRUE,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------------------------------------
-- DOMAIN 2: COMPANIES
--------------------------------------------------------------------------------

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    description TEXT,
    website_url VARCHAR(255),
    size_band VARCHAR(50), -- '1-10', '11-50', '51-200', '201-500', '500+'
    industry VARCHAR(100),
    headquarters_location VARCHAR(255),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE company_socials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'linkedin', 'twitter', 'github'
    url VARCHAR(500) NOT NULL,
    UNIQUE(company_id, platform)
);

CREATE TABLE company_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    location_name VARCHAR(255) NOT NULL,
    is_headquarters BOOLEAN NOT NULL DEFAULT FALSE
);

--------------------------------------------------------------------------------
-- DOMAIN 3: JOBS & TAXONOMIES
--------------------------------------------------------------------------------

-- Categories (IT, Finance, Legal, etc.)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_svg TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Skills (React, Python, AWS, SAP, etc.)
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Locations taxonomy
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) UNIQUE NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    region VARCHAR(100), -- 'London', 'North West', etc.
    country VARCHAR(100) DEFAULT 'United Kingdom',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Main jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description_html TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    benefits TEXT,
    day_rate_min NUMERIC(10, 2),
    day_rate_max NUMERIC(10, 2),
    ir35_status VARCHAR(50) NOT NULL DEFAULT 'outside', -- 'outside', 'inside', 'undecided'
    remote_type VARCHAR(50) NOT NULL DEFAULT 'hybrid', -- 'remote', 'hybrid', 'onsite'
    clearance_level VARCHAR(50) NOT NULL DEFAULT 'none', -- 'none', 'BPSS', 'SC', 'DV'
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    recruiter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'draft', 'active', 'expired', 'archived'
    external_apply_url VARCHAR(500),
    views_count INT NOT NULL DEFAULT 0,
    applications_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Many-to-many relationship: Job <-> Skills
CREATE TABLE job_skills (
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, skill_id)
);

-- Many-to-many relationship: Job <-> Categories
CREATE TABLE job_categories (
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, category_id)
);

-- General tags
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE job_tags (
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, tag_id)
);

--------------------------------------------------------------------------------
-- DOMAIN 4: CANDIDATE ACTIONS & ALERTS
--------------------------------------------------------------------------------

-- Applications
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_url VARCHAR(500) NOT NULL,
    cover_letter TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'applied', -- 'applied', 'reviewing', 'interviewing', 'offered', 'rejected', 'withdrawn'
    recruiter_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Saved bookmarks
CREATE TABLE saved_jobs (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, job_id)
);

-- Saved filter sets
CREATE TABLE saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    filters_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email Alerts
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    saved_search_id UUID REFERENCES saved_searches(id) ON DELETE SET NULL,
    frequency VARCHAR(50) NOT NULL DEFAULT 'daily', -- 'immediate', 'daily', 'weekly'
    last_sent_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------------------------------------
-- DOMAIN 5: CONTENT (BLOG, GUIDES, SEO PAGES)
--------------------------------------------------------------------------------

-- Blog posts
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content_html TEXT NOT NULL,
    excerpt TEXT,
    featured_image_url VARCHAR(500),
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'published'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE
);

-- Guides
CREATE TABLE guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content_html TEXT NOT NULL,
    guide_category VARCHAR(100) NOT NULL, -- 'compliance', 'tax', 'clearance', 'business'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- FAQs linked to entities
CREATE TABLE faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'global', 'seo_page', 'job', 'company'
    entity_id UUID, -- references the corresponding entity if not global
    sort_order INT NOT NULL DEFAULT 0
);

-- Explicit SEO pages metadata (For programmatic landing page overrides)
CREATE TABLE seo_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    meta_title VARCHAR(255) NOT NULL,
    meta_description VARCHAR(500) NOT NULL,
    h1_title VARCHAR(255),
    intro_html TEXT,
    keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------------------------------------
-- DOMAIN 6: PAYMENTS (PADDLE MOR INTEGRATION)
--------------------------------------------------------------------------------

CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    paddle_price_id VARCHAR(100) UNIQUE,
    price_amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'GBP',
    billing_interval VARCHAR(50) NOT NULL DEFAULT 'month', -- 'month', 'year'
    features_json JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id),
    status VARCHAR(50) NOT NULL, -- 'active', 'trialing', 'past_due', 'paused', 'canceled'
    paddle_subscription_id VARCHAR(100) UNIQUE,
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'GBP',
    status VARCHAR(50) NOT NULL, -- 'paid', 'open', 'void'
    paddle_invoice_id VARCHAR(100) UNIQUE,
    pdf_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(50) NOT NULL DEFAULT 'paddle',
    event_type VARCHAR(100) NOT NULL,
    payload_json JSONB NOT NULL,
    is_processed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------------------------------------
-- DOMAIN 7: SYSTEM (LOGGING, SETTINGS, FLAGS)
--------------------------------------------------------------------------------

-- Transactional email log
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    template_name VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'sent', -- 'sent', 'failed'
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- In-app notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL, -- 'application_received', 'job_alert', 'system'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Feature flags
CREATE TABLE feature_flags (
    key VARCHAR(100) PRIMARY KEY,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Security and action audits
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL, -- 'delete_account', 'export_data', 'change_role'
    entity_type VARCHAR(100),
    entity_id UUID,
    old_state JSONB,
    new_state JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Global platform configurations
CREATE TABLE settings (
    key VARCHAR(100) PRIMARY KEY,
    value_json JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------------------------------------
-- SEARCH PERFORMANCE INDEXING
--------------------------------------------------------------------------------

-- Trigram index for fuzzy skill search
CREATE INDEX idx_skills_name_trgm ON skills USING gin (name gin_trgm_ops);

-- Trigram index for fuzzy company search
CREATE INDEX idx_companies_name_trgm ON companies USING gin (name gin_trgm_ops);

-- Index for searching jobs by Title/Rates/Remote/IR35
CREATE INDEX idx_jobs_status_active ON jobs(status) WHERE status = 'active';
CREATE INDEX idx_jobs_ir35_status ON jobs(ir35_status);
CREATE INDEX idx_jobs_remote_type ON jobs(remote_type);
CREATE INDEX idx_jobs_clearance_level ON jobs(clearance_level);
CREATE INDEX idx_jobs_day_rates ON jobs(day_rate_min, day_rate_max);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

-- GIN Index on jobs title & description for Postgres Full Text Search
CREATE INDEX idx_jobs_fts ON jobs USING gin (to_tsvector('english', title || ' ' || description_html));
