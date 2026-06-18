'use strict';

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db, Job } from '@/lib/db';

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'jobs' | 'flags' | 'audits'>('users');
  
  // CMS lists
  const [jobs, setJobs] = useState<Job[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Feature Flags State
  const [flags, setFlags] = useState({
    enable_paddle_billing: true,
    enable_typesense_fts: false,
    restrict_anonymous_search: false,
    gdpr_automatic_purge: true
  });

  // Users state
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const user = db.getAuthUser();
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    setCurrentUser(user);

    async function loadData() {
      try {
        const [jobsData, logsData, usersData] = await Promise.all([
          db.getJobs(),
          db.getAuditLogs(),
          db.getPlatformUsers()
        ]);
        setJobs(jobsData);
        setAuditLogs(logsData);
        setUsers(usersData);
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err);
      }
    }
    loadData();
  }, [router]);

  if (!currentUser) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <p>Loading administration panel...</p>
      </div>
    );
  }

  const handleDeleteJob = async (id: string) => {
    if (confirm('Are you sure you want to delete this contract posting?')) {
      try {
        await db.deleteJob(id);
        setJobs(jobs.filter(j => j.id !== id));
      } catch (err) {
        alert('Failed to delete job posting');
      }
    }
  };

  const handleToggleFlag = (key: keyof typeof flags) => {
    setFlags({
      ...flags,
      [key]: !flags[key]
    });
  };

  return (
    <div className="container fade-in" style={{ padding: '40px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '40px' }}>
        
        {/* Sidebar Nav */}
        <aside className="glass-panel" style={{ padding: '24px', height: 'fit-content', backgroundColor: 'var(--panel-bg-solid)' }}>
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '32px' }}>🛡️</span>
            <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-header)', marginTop: '8px' }}>Admin Portal</h3>
            <span style={{ fontSize: '12px', color: 'var(--color-inside)', fontWeight: '600' }}>Platform Controller</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => setActiveTab('users')} className={`btn btn-text btn-sm ${activeTab === 'users' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%' }}>
              👥 User Registry
            </button>
            <button onClick={() => setActiveTab('jobs')} className={`btn btn-text btn-sm ${activeTab === 'jobs' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%' }}>
              💼 Moderate Contracts ({jobs.length})
            </button>
            <button onClick={() => setActiveTab('flags')} className={`btn btn-text btn-sm ${activeTab === 'flags' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%' }}>
              ⚙️ Feature Flags
            </button>
            <button onClick={() => setActiveTab('audits')} className={`btn btn-text btn-sm ${activeTab === 'audits' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%' }}>
              📝 System Audit Logs ({auditLogs.length})
            </button>
          </nav>
        </aside>

        {/* Tab Content */}
        <main>
          {/* TAB 1: USERS REGISTER */}
          {activeTab === 'users' && (
            <div className="fade-in">
              <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Platform User Registry</h2>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Full Name</th>
                      <th>Email Address</th>
                      <th>Role Profile</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td><code>{user.id}</code></td>
                        <td><strong>{user.name}</strong></td>
                        <td>{user.email}</td>
                        <td>
                          <span className="tag-badge tag-normal" style={{ fontSize: '10px' }}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className="tag-badge tag-outside" style={{ fontSize: '9px', backgroundColor: user.status === 'Active' ? 'var(--color-outside-glow)' : 'var(--color-warning-glow)', color: user.status === 'Active' ? 'var(--color-outside)' : 'var(--color-warning)', borderColor: 'transparent' }}>
                            {user.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: JOBS MODERATION */}
          {activeTab === 'jobs' && (
            <div className="fade-in">
              <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Job Postings Moderation</h2>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Title & Company</th>
                      <th>Day Rate</th>
                      <th>IR35</th>
                      <th>Visits</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id}>
                        <td>
                          <strong>{job.title}</strong><br />
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{job.companyName}</span>
                        </td>
                        <td>£{job.dayRateMin} - £{job.dayRateMax}</td>
                        <td>
                          <span className={`tag-badge ${job.ir35Status === 'outside' ? 'tag-outside' : 'tag-inside'}`} style={{ fontSize: '9px' }}>
                            {job.ir35Status.toUpperCase()}
                          </span>
                        </td>
                        <td>{job.views}</td>
                        <td>
                          <button onClick={() => handleDeleteJob(job.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--color-inside)', borderColor: 'rgba(239,68,68,0.2)', padding: '4px 8px', fontSize: '11px' }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: FEATURE FLAGS */}
          {activeTab === 'flags' && (
            <div className="fade-in">
              <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>System Feature Flags</h2>
              <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Flag item */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ color: 'var(--text-primary)', fontSize: '15px' }}>Enable Paddle Subscription Engine</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>Enables Paddle subscription paywalls for recruiter posting options.</p>
                  </div>
                  <button onClick={() => handleToggleFlag('enable_paddle_billing')} className={`btn btn-sm ${flags.enable_paddle_billing ? 'btn-primary' : 'btn-secondary'}`}>
                    {flags.enable_paddle_billing ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <hr style={{ borderColor: 'var(--panel-border)' }} />

                {/* Flag item */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ color: 'var(--text-primary)', fontSize: '15px' }}>Enable Typesense Search Integration</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>Overrides native Postgres search vectors with Typesense clusters.</p>
                  </div>
                  <button onClick={() => handleToggleFlag('enable_typesense_fts')} className={`btn btn-sm ${flags.enable_typesense_fts ? 'btn-primary' : 'btn-secondary'}`}>
                    {flags.enable_typesense_fts ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <hr style={{ borderColor: 'var(--panel-border)' }} />

                {/* Flag item */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ color: 'var(--text-primary)', fontSize: '15px' }}>Restrict Anonymous Job Search</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>Forces candidate registration before displaying contract results.</p>
                  </div>
                  <button onClick={() => handleToggleFlag('restrict_anonymous_search')} className={`btn btn-sm ${flags.restrict_anonymous_search ? 'btn-primary' : 'btn-secondary'}`}>
                    {flags.restrict_anonymous_search ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <hr style={{ borderColor: 'var(--panel-border)' }} />

                {/* Flag item */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ color: 'var(--text-primary)', fontSize: '15px' }}>Automatic GDPR Data Retention Purges</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>Purges recruiter and candidate CV data when logs request deletions.</p>
                  </div>
                  <button onClick={() => handleToggleFlag('gdpr_automatic_purge')} className={`btn btn-sm ${flags.gdpr_automatic_purge ? 'btn-primary' : 'btn-secondary'}`}>
                    {flags.gdpr_automatic_purge ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: SYSTEM AUDIT LOGS */}
          {activeTab === 'audits' && (
            <div className="fade-in">
              <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>System Security & GDPR Audits</h2>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Action log</th>
                      <th>Timestamp</th>
                      <th>Client IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td><strong>{log.action}</strong></td>
                        <td>{new Date(log.date).toLocaleString('en-GB')}</td>
                        <td><code>{log.ip}</code></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
