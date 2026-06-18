'use strict';

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db, Company, Job, Application } from '@/lib/db';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export default function EmployerDashboard() {
  const router = useRouter();
  
  // Navigation & User session states
  const [activeTab, setActiveTab] = useState<'kpis' | 'create-job' | 'applicants' | 'company-profile'>('kpis');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [recruiterProfile, setRecruiterProfile] = useState<any>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Jobs & Applicants states
  const [recruiterJobs, setRecruiterJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Application[]>([]);

  // Company Profile Form States
  const [compName, setCompName] = useState('');
  const [compIndustry, setCompIndustry] = useState('');
  const [compSize, setCompSize] = useState('');
  const [compWebsite, setCompWebsite] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compLogo, setCompLogo] = useState('');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // CREATE JOB WIZARD STATES
  const [wizardStep, setWizardStep] = useState(1);
  const [jobTitle, setJobTitle] = useState('');
  const [jobIndustry, setJobIndustry] = useState('Technology');
  const [jobDesc, setJobDesc] = useState('');
  const [jobReqs, setJobReqs] = useState('');
  const [jobResps, setJobResps] = useState('');
  const [jobLocation, setJobLocation] = useState('London');
  const [jobRemote, setJobRemote] = useState<'remote' | 'hybrid' | 'onsite'>('remote');
  const [jobIr35, setJobIr35] = useState<'outside' | 'inside' | 'undecided'>('outside');
  const [jobRateMin, setJobRateMin] = useState<number>(550);
  const [jobRateMax, setJobRateMax] = useState<number>(750);
  const [jobClearance, setJobClearance] = useState<'none' | 'BPSS' | 'SC' | 'DV'>('none');
  const [jobSkillsInput, setJobSkillsInput] = useState('');
  
  // Applicant details note state
  const [selectedAppNotes, setSelectedAppNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const user = db.getAuthUser();
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'recruiter' && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    setCurrentUser(user);

    async function loadData() {
      try {
        // Load Recruiter Profile & Company
        const rec = await db.getRecruiterProfile();
        setRecruiterProfile(rec);

        const companiesList = await db.getCompanies();
        const comp = companiesList.find(c => c.id === rec.companyId) || companiesList[0];
        if (comp) {
          setCompany(comp);
          setCompName(comp.name);
          setCompIndustry(comp.industry);
          setCompSize(comp.size);
          setCompWebsite(comp.website);
          setCompDesc(comp.description);
          setCompLogo(comp.logo);

          // Load jobs & applications associated with this recruiter's company
          const allJobs = await db.getJobs();
          const cJobs = allJobs.filter(j => j.companyId === comp.id);
          setRecruiterJobs(cJobs);

          const jobIds = cJobs.map(j => j.id);
          const allApps = await db.getApplications();
          const companyApps = allApps.filter(a => jobIds.includes(a.jobId));
          setApplicants(companyApps);
          
          // Initialize notes mapping
          const notesMap: Record<string, string> = {};
          companyApps.forEach(a => {
            notesMap[a.id] = a.notes || '';
          });
          setSelectedAppNotes(notesMap);
        }
      } catch (err: any) {
        console.error('Employer Dashboard loading failed:', err);
        setLoadError(err.message || 'Failed to retrieve recruiter data.');
      }
    }
    loadData();
  }, [router]);

  if (loadError) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-inside)', marginBottom: '16px' }}>Dashboard Loading Failed</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{loadError}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  if (!currentUser || !company) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <p>Loading employer dashboard...</p>
      </div>
    );
  }

  // WIZARD PUBLISH ACTION
  const handlePublishJob = async () => {
    const skillList = jobSkillsInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const reqList = jobReqs.split('\n').map(s => s.trim()).filter(s => s.length > 0);
    const respList = jobResps.split('\n').map(s => s.trim()).filter(s => s.length > 0);

    const newJobPayload = {
      title: jobTitle,
      slug: jobTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      descriptionHtml: `<p>${jobDesc}</p>`,
      requirements: reqList,
      responsibilities: respList,
      benefits: ['Flexible schedule', 'Outside IR35 compliance structure'],
      dayRateMin: jobRateMin,
      dayRateMax: jobRateMax,
      ir35Status: jobIr35,
      remoteType: jobRemote,
      clearanceLevel: jobClearance,
      location: jobLocation,
      industry: jobIndustry,
      skills: skillList,
      companyId: company.id,
      recruiterId: currentUser.id,
      status: 'active' as const,
      featured: false,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };

    const created = await db.createJob(newJobPayload);
    
    // Refresh jobs list
    setRecruiterJobs([created, ...recruiterJobs]);
    setWizardStep(5); // Success step
  };

  const handleResetWizard = () => {
    setWizardStep(1);
    setJobTitle('');
    setJobDesc('');
    setJobReqs('');
    setJobResps('');
    setJobSkillsInput('');
    setActiveTab('kpis');
  };

  // APPLICANTS ACTION
  const handleStatusChange = async (appId: string, status: Application['status']) => {
    await db.updateApplicationStatus(appId, status, selectedAppNotes[appId]);
    // Refresh local applications state
    const allApps = await db.getApplications();
    const updatedApps = allApps.filter(a => recruiterJobs.map(j => j.id).includes(a.jobId));
    setApplicants(updatedApps);
  };

  const handleSaveNotes = async (appId: string) => {
    const app = applicants.find(a => a.id === appId);
    if (app) {
      await db.updateApplicationStatus(appId, app.status, selectedAppNotes[appId]);
      alert('Notes saved successfully.');
    }
  };

  // COMPANY UPDATE
  const handleCompanySave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (company) {
      const updated: Company = {
        ...company,
        name: compName,
        industry: compIndustry,
        size: compSize,
        website: compWebsite,
        description: compDesc,
        logo: compLogo
      };
      
      const { error } = await supabase
        .from('companies')
        .upsert({
          id: company.id,
          name: compName,
          slug: company.slug,
          logo_url: compLogo,
          description: compDesc,
          website_url: compWebsite,
          size_band: compSize,
          industry: compIndustry,
          headquarters_location: company.location,
          is_verified: company.verified
        });
        
      if (error) {
        alert(`Failed to save company: ${error.message}`);
        return;
      }
      
      setCompany(updated);
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 3000);
    }
  };

  // KPI Calculations
  const activeCount = recruiterJobs.filter(j => j.status === 'active').length;
  const totalViews = recruiterJobs.reduce((acc, j) => acc + j.views, 0);
  const totalApps = applicants.length;

  return (
    <div className="container fade-in" style={{ padding: '40px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '40px' }}>
        
        {/* Sidebar Nav */}
        <aside className="glass-panel" style={{ padding: '24px', height: 'fit-content', backgroundColor: 'var(--panel-bg-solid)' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)', 
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '18px' }}>💼</span>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--color-outside)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>Role</div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '700', lineHeight: 1.2 }}>Recruiter Portal</div>
              </div>
            </div>
            <span style={{ fontSize: '32px' }}>{company.logo}</span>
            <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-header)', marginTop: '8px' }}>{company.name}</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{currentUser.email}</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => { setActiveTab('kpis'); setWizardStep(1); }} className={`btn btn-text btn-sm ${activeTab === 'kpis' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%' }}>
              📈 Analytics & Jobs
            </button>
            <button onClick={() => setActiveTab('create-job')} className={`btn btn-text btn-sm ${activeTab === 'create-job' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%' }}>
              ➕ Post Contract Role
            </button>
            <button onClick={() => setActiveTab('applicants')} className={`btn btn-text btn-sm ${activeTab === 'applicants' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%' }}>
              👥 Applicants ({applicants.length})
            </button>
            <button onClick={() => setActiveTab('company-profile')} className={`btn btn-text btn-sm ${activeTab === 'company-profile' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%' }}>
              🏢 Company Profile
            </button>
          </nav>
        </aside>

        {/* Tab Content */}
        <main>
          
          {/* TAB 1: ANALYTICS & JOB POSTINGS LIST */}
          {activeTab === 'kpis' && (
            <div className="fade-in">
              <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Recruiter Analytics</h2>

              {/* KPI Cards */}
              <div className="stats-grid">
                <div className="glass-panel stat-card">
                  <div className="stat-label">ACTIVE CONTRACTS</div>
                  <div className="stat-num">{activeCount}</div>
                </div>
                <div className="glass-panel stat-card">
                  <div className="stat-label">TOTAL APPLICATIONS</div>
                  <div className="stat-num">{totalApps}</div>
                </div>
                <div className="glass-panel stat-card">
                  <div className="stat-label">ROLE VISITS</div>
                  <div className="stat-num">{totalViews}</div>
                </div>
              </div>

              {/* Jobs Table */}
              <div style={{ marginTop: '40px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Manage Contract Postings</h3>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Day Rate</th>
                        <th>IR35 Status</th>
                        <th>Visits</th>
                        <th>Applications</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recruiterJobs.map((job) => (
                        <tr key={job.id}>
                          <td><strong>{job.title}</strong><br /><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📍 {job.location}</span></td>
                          <td>£{job.dayRateMin} - £{job.dayRateMax}</td>
                          <td>
                            <span className={`tag-badge ${job.ir35Status === 'outside' ? 'tag-outside' : 'tag-inside'}`} style={{ fontSize: '9px' }}>
                              {job.ir35Status.toUpperCase()}
                            </span>
                          </td>
                          <td>{job.views}</td>
                          <td>{job.applications}</td>
                          <td>
                            <span className="tag-badge tag-clearance" style={{ fontSize: '9px' }}>
                              {job.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MULTI-STEP CREATE JOB WIZARD */}
          {activeTab === 'create-job' && (
            <div className="fade-in">
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Post a New Contract Role</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                Step {wizardStep} of 5 &bull; Provide job details, parameters, and compliance determinations.
              </p>

              {/* WIZARD PROCESS PANEL */}
              <div className="glass-panel" style={{ padding: '32px', backgroundColor: 'var(--panel-bg-solid)' }}>
                
                {/* STEP 1: Basic Information */}
                {wizardStep === 1 && (
                  <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Step 1: Role Overview</h3>
                    <div className="filter-group">
                      <label className="filter-title">Job Title</label>
                      <input 
                        type="text" 
                        value={jobTitle} 
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Lead AWS Serverless Engineer"
                        required
                      />
                    </div>
                    <div className="filter-group">
                      <label className="filter-title">Business Sector</label>
                      <select value={jobIndustry} onChange={(e) => setJobIndustry(e.target.value)}>
                        <option value="Technology">Technology</option>
                        <option value="Finance">Finance</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Construction">Construction</option>
                        <option value="Government">Government</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label className="filter-title">Job Description Details</label>
                      <textarea 
                        value={jobDesc} 
                        onChange={(e) => setJobDesc(e.target.value)}
                        placeholder="Provide project overview, technology goals, and team structures..."
                        rows={6}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                      <button onClick={() => setWizardStep(2)} className="btn btn-primary" disabled={!jobTitle || !jobDesc}>
                        Next: Parameters
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Location, IR35 & Rates */}
                {wizardStep === 2 && (
                  <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Step 2: Location & Rates</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="filter-group">
                        <label className="filter-title">Location Name</label>
                        <input 
                          type="text" 
                          value={jobLocation} 
                          onChange={(e) => setJobLocation(e.target.value)}
                          placeholder="e.g. London"
                        />
                      </div>
                      <div className="filter-group">
                        <label className="filter-title">Workspace Type</label>
                        <select value={jobRemote} onChange={(e: any) => setJobRemote(e.target.value)}>
                          <option value="remote">Fully Remote</option>
                          <option value="hybrid">Hybrid</option>
                          <option value="onsite">Onsite Client Site</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="filter-group">
                        <label className="filter-title">IR35 Compliance Status</label>
                        <select value={jobIr35} onChange={(e: any) => setJobIr35(e.target.value)}>
                          <option value="outside">Outside IR35 (PSC)</option>
                          <option value="inside">Inside IR35 (Umbrella)</option>
                          <option value="undecided">Undecided</option>
                        </select>
                      </div>
                      <div className="filter-group">
                        <label className="filter-title">Security Clearance Requirement</label>
                        <select value={jobClearance} onChange={(e: any) => setJobClearance(e.target.value)}>
                          <option value="none">No Clearance required</option>
                          <option value="BPSS">BPSS checks</option>
                          <option value="SC">SC Cleared (Secret)</option>
                          <option value="DV">DV Cleared (Developed Vetting)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="filter-group">
                        <label className="filter-title">Target Minimum Day Rate (£)</label>
                        <input 
                          type="number" 
                          value={jobRateMin} 
                          onChange={(e) => setJobRateMin(Number(e.target.value))}
                        />
                      </div>
                      <div className="filter-group">
                        <label className="filter-title">Target Maximum Day Rate (£)</label>
                        <input 
                          type="number" 
                          value={jobRateMax} 
                          onChange={(e) => setJobRateMax(Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                      <button onClick={() => setWizardStep(1)} className="btn btn-secondary">
                        Back
                      </button>
                      <button onClick={() => setWizardStep(3)} className="btn btn-primary">
                        Next: Skills & Reqs
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Skills, Requirements & Responsibilities */}
                {wizardStep === 3 && (
                  <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Step 3: Skills & Criteria</h3>
                    
                    <div className="filter-group">
                      <label className="filter-title">Target Skills (comma separated)</label>
                      <input 
                        type="text" 
                        value={jobSkillsInput} 
                        onChange={(e) => setJobSkillsInput(e.target.value)}
                        placeholder="e.g. AWS, Terraform, Serverless"
                        required
                      />
                    </div>

                    <div className="filter-group">
                      <label className="filter-title">Candidate Requirements (One per line)</label>
                      <textarea 
                        value={jobReqs} 
                        onChange={(e) => setJobReqs(e.target.value)}
                        placeholder="e.g. AWS Certified Developer Associate&#10;5+ years building container applications"
                        rows={4}
                      />
                    </div>

                    <div className="filter-group">
                      <label className="filter-title">Key Responsibilities (One per line)</label>
                      <textarea 
                        value={jobResps} 
                        onChange={(e) => setJobResps(e.target.value)}
                        placeholder="e.g. Design platform telemetry pipelines&#10;Configure infrastructure templates"
                        rows={4}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                      <button onClick={() => setWizardStep(2)} className="btn btn-secondary">
                        Back
                      </button>
                      <button onClick={() => setWizardStep(4)} className="btn btn-primary" disabled={!jobSkillsInput}>
                        Next: Preview Role
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: PREVIEW POSTING */}
                {wizardStep === 4 && (
                  <div className="fade-in">
                    <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Step 4: Preview Role Posting</h3>
                    
                    <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px', borderLeft: '4px solid var(--color-primary)' }}>
                      <span className={`tag-badge ${jobIr35 === 'outside' ? 'tag-outside' : 'tag-inside'}`} style={{ marginBottom: '8px' }}>
                        {jobIr35.toUpperCase()} IR35
                      </span>
                      <h4 style={{ fontSize: '20px', color: 'var(--text-primary)', marginBottom: '8px' }}>{jobTitle}</h4>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        📍 {jobLocation} &bull; 💻 {jobRemote.toUpperCase()} &bull; 🛡️ Clearance: {jobClearance}
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '16px' }}>
                        £{jobRateMin} - £{jobRateMax} per day
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        Skills: {jobSkillsInput}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <button onClick={() => setWizardStep(3)} className="btn btn-secondary">
                        Back
                      </button>
                      <button onClick={handlePublishJob} className="btn btn-primary">
                        Publish Live Contract &raquo;
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 5: SUCCESS PUBLISH */}
                {wizardStep === 5 && (
                  <div className="fade-in" style={{ textAlign: 'center', padding: '24px 0' }}>
                    <span style={{ fontSize: '48px' }}>🎉</span>
                    <h3 style={{ fontSize: '22px', margin: '16px 0 8px 0', color: 'var(--color-outside)' }}>Contract Published Successfully!</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                      Your posting is now live and indexed under the programmatic search categories.
                    </p>
                    <button onClick={handleResetWizard} className="btn btn-primary">
                      Return to Workspace
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TAB 3: APPLICANT TRACKING */}
          {activeTab === 'applicants' && (
            <div className="fade-in">
              <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Applicant Management</h2>
              {applicants.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {applicants.map((app) => (
                    <div key={app.id} className="glass-panel" style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <h4 style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{app.candidateName}</h4>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Applied for: <strong>{app.jobTitle}</strong> &bull; Date: {new Date(app.createdAt).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Stage:</span>
                          <select 
                            value={app.status} 
                            onChange={(e: any) => handleStatusChange(app.id, e.target.value)}
                            style={{ padding: '6px 12px', width: '140px', fontSize: '12px' }}
                          >
                            <option value="applied">Applied</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="interviewing">Interviewing</option>
                            <option value="offered">Offered</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>

                      {app.coverLetter && (
                        <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>
                          <strong>Candidate Cover Note:</strong> "{app.coverLetter}"
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', marginBottom: '16px' }}>
                        <span>CV Document:</span>
                        <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
                          📄 {app.resumeUrl.includes('/') ? app.resumeUrl.split('/').pop() : app.resumeUrl} (Download / View CV)
                        </a>
                      </div>

                      {/* Notes Section */}
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={selectedAppNotes[app.id] || ''}
                          onChange={(e) => setSelectedAppNotes({ ...selectedAppNotes, [app.id]: e.target.value })}
                          placeholder="Add private recruiter evaluation notes..."
                          style={{ padding: '8px 12px', fontSize: '13px' }}
                        />
                        <button onClick={() => handleSaveNotes(app.id)} className="btn btn-secondary btn-sm" style={{ padding: '8px 14px' }}>
                          Save
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-secondary)' }}>No candidates have applied for your company contract postings yet.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COMPANY PROFILE CONFIG */}
          {activeTab === 'company-profile' && (
            <div className="fade-in">
              <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Company Configuration</h2>
              
              {profileSaveSuccess && (
                <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-outside-glow)', border: '1px solid var(--color-outside)', borderRadius: 'var(--radius-sm)', color: 'var(--color-outside)', fontSize: '13px', marginBottom: '20px' }}>
                  ✓ Company profile updated successfully!
                </div>
              )}

              <form onSubmit={handleCompanySave} className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="filter-group">
                    <label className="filter-title">Company Name</label>
                    <input 
                      type="text" 
                      value={compName} 
                      onChange={(e) => setCompName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="filter-group">
                    <label className="filter-title">Industry Sector</label>
                    <input 
                      type="text" 
                      value={compIndustry} 
                      onChange={(e) => setCompIndustry(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="filter-group">
                    <label className="filter-title">Company Size Band</label>
                    <select value={compSize} onChange={(e) => setCompSize(e.target.value)}>
                      <option value="1-10">1 - 10 employees</option>
                      <option value="11-50">11 - 50 employees</option>
                      <option value="51-200">51 - 200 employees</option>
                      <option value="201-500">201 - 500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label className="filter-title">Website URL</label>
                    <input 
                      type="text" 
                      value={compWebsite} 
                      onChange={(e) => setCompWebsite(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="filter-group">
                    <label className="filter-title">Emoji Logo Icon</label>
                    <input 
                      type="text" 
                      value={compLogo} 
                      onChange={(e) => setCompLogo(e.target.value)}
                      placeholder="e.g. ⚡"
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <label className="filter-title">Company Description / Bio</label>
                  <textarea 
                    value={compDesc} 
                    onChange={(e) => setCompDesc(e.target.value)}
                    rows={4}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button type="submit" className="btn btn-primary">
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
