'use client';

import React, { useState } from 'react';
import { updateCandidateProfile } from '@/app/actions/candidate';

export default function SettingsForm({ profile }: { profile: any }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await updateCandidateProfile(formData);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {error && (
        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '8px' }}>
          {error}
        </div>
      )}
      
      {message && (
        <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', borderRadius: '8px' }}>
          {message}
        </div>
      )}

      {/* Basic Info */}
      <div>
        <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '8px', marginBottom: '16px' }}>Personal Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className="input-label">First Name</label>
            <input type="text" name="first_name" defaultValue={profile?.first_name} className="input-field" required />
          </div>
          <div>
            <label className="input-label">Last Name</label>
            <input type="text" name="last_name" defaultValue={profile?.last_name} className="input-field" required />
          </div>
        </div>
        <div style={{ marginTop: '16px' }}>
          <label className="input-label">Headline</label>
          <input type="text" name="headline" defaultValue={profile?.headline} className="input-field" placeholder="e.g. Lead React Developer & UI Architect" />
        </div>
        <div style={{ marginTop: '16px' }}>
          <label className="input-label">Bio</label>
          <textarea name="bio" defaultValue={profile?.bio} rows={4} className="input-field" style={{ width: '100%', resize: 'vertical' }} placeholder="A brief summary of your experience..." />
        </div>
        <div style={{ marginTop: '16px' }}>
          <label className="input-label">Location</label>
          <input type="text" name="location" defaultValue={profile?.location} className="input-field" placeholder="e.g. London, UK" />
        </div>
      </div>

      {/* Rates & Availability */}
      <div>
        <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '8px', marginBottom: '16px', marginTop: '16px' }}>Contract Preferences</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label className="input-label">Min Day Rate (£)</label>
            <input type="number" name="min_day_rate" defaultValue={profile?.min_day_rate} className="input-field" />
          </div>
          <div>
            <label className="input-label">Max Day Rate (£)</label>
            <input type="number" name="max_day_rate" defaultValue={profile?.max_day_rate} className="input-field" />
          </div>
          <div>
            <label className="input-label">Availability</label>
            <select name="availability" defaultValue={profile?.availability || 'immediate'} className="input-field">
              <option value="immediate">Immediate</option>
              <option value="2_weeks">2 Weeks Notice</option>
              <option value="4_weeks">4 Weeks Notice</option>
              <option value="unavailable">Not Currently Available</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: '16px' }}>
          <label className="input-label">Security Clearance Level</label>
          <select name="clearance_level" defaultValue={profile?.clearance_level || 'none'} className="input-field">
            <option value="none">None</option>
            <option value="BPSS">BPSS</option>
            <option value="CTC">CTC</option>
            <option value="SC">SC (Security Check)</option>
            <option value="DV">DV (Developed Vetting)</option>
          </select>
        </div>
      </div>

      {/* Links & Files */}
      <div>
        <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '8px', marginBottom: '16px', marginTop: '16px' }}>Links & Documents</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className="input-label">Portfolio / Website</label>
            <input type="url" name="website_url" defaultValue={profile?.website_url} className="input-field" placeholder="https://" />
          </div>
          <div>
            <label className="input-label">LinkedIn URL</label>
            <input type="url" name="linkedin_url" defaultValue={profile?.linkedin_url} className="input-field" placeholder="https://linkedin.com/in/..." />
          </div>
        </div>
        <div style={{ marginTop: '16px' }}>
          <label className="input-label">GitHub URL</label>
          <input type="url" name="github_url" defaultValue={profile?.github_url} className="input-field" placeholder="https://github.com/..." />
        </div>
        <div style={{ marginTop: '16px' }}>
          <label className="input-label">Resume / CV Upload</label>
          <input type="hidden" name="existing_resume_url" value={profile?.resume_url || ''} />
          {profile?.resume_url && (
            <div style={{ marginBottom: '8px', fontSize: '14px', color: 'var(--color-primary)' }}>
              Current resume: <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">View File</a>
            </div>
          )}
          <input type="file" name="resume_file" accept=".pdf,.doc,.docx" className="input-field" style={{ padding: '8px' }} />
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Upload a new PDF or Word document to replace your current resume.</p>
        </div>
      </div>

      {/* Privacy */}
      <div style={{ padding: '16px', background: 'var(--panel-bg-hover)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
        <input type="checkbox" id="is_profile_public" name="is_profile_public" defaultChecked={profile?.is_profile_public} style={{ width: '18px', height: '18px' }} />
        <div>
          <label htmlFor="is_profile_public" style={{ fontWeight: '600', cursor: 'pointer', color: 'var(--text-primary)' }}>Make Profile Public</label>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>Allow verified recruiters to find you in the talent directory.</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '12px 32px' }}>
          {loading ? 'Saving...' : 'Save Profile Settings'}
        </button>
      </div>
    </form>
  );
}
