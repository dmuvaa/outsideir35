'use client';

import React, { useState } from 'react';
import { applyForJob, toggleSaveJob } from '@/app/actions/job';

interface JobActionsProps {
  jobId: string;
  isSaved: boolean;
  hasApplied: boolean;
  isCandidate: boolean;
  resumeUrl?: string;
  externalApplyUrl?: string | null;
}

export default function JobActions({ jobId, isSaved: initialIsSaved, hasApplied: initialHasApplied, isCandidate, resumeUrl, externalApplyUrl }: JobActionsProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [localHasApplied, setLocalHasApplied] = useState(initialHasApplied);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveToggle = async () => {
    if (!isCandidate) {
      setMessage('Only contractor accounts can save jobs.');
      return;
    }
    
    // Optimistic update
    const previousState = isSaved;
    setIsSaved(!isSaved);
    
    const { error } = await toggleSaveJob(jobId, previousState);
    if (error) {
      setIsSaved(previousState);
      setMessage(error);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isCandidate) {
      setMessage('Only contractors can apply.');
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('jobId', jobId);
    
    const { error } = await applyForJob(formData);
    
    setLoading(false);
    if (error) {
      setMessage(error);
    } else {
      setShowApplyForm(false);
      setLocalHasApplied(true);
      setMessage('Application submitted.');
    }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
        <button onClick={handleSaveToggle} className="btn btn-secondary btn-sm" disabled={!isCandidate}>
          {isSaved ? '★ Saved' : '☆ Save Job'}
        </button>
        
        {externalApplyUrl ? (
          <a href={externalApplyUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
            Apply via recruiter
          </a>
        ) : localHasApplied ? (
          <button className="btn btn-primary btn-sm" disabled style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)', color: 'white', opacity: 1 }}>
            Applied
          </button>
        ) : (
          <button onClick={() => setShowApplyForm(true)} className="btn btn-primary btn-sm" disabled={!isCandidate || showApplyForm}>
            Apply Now
          </button>
        )}
      </div>
      {message && (
        <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{message}</p>
      )}

      {showApplyForm && !localHasApplied && !externalApplyUrl && (
        <div className="glass-panel" style={{ marginTop: '24px', padding: '24px', borderLeft: '4px solid var(--color-primary)' }}>
          <h3 style={{ marginTop: 0 }}>Submit Application</h3>
          <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Cover Letter (Optional)
              </label>
              <textarea 
                name="coverLetter"
                rows={4} 
                className="input-field" 
                placeholder="Why are you a good fit for this role?"
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
            
            <div style={{ background: 'var(--panel-bg-hover)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>📄</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Attached Resume</div>
                <div style={{ color: 'var(--text-muted)' }}>
                  {resumeUrl ? resumeUrl.split('/').pop() : 'No resume uploaded. Please update your profile first.'}
                </div>
              </div>
            </div>
            
            {resumeUrl && <input type="hidden" name="resumeUrl" value={resumeUrl} />}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setShowApplyForm(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={loading || !resumeUrl}>
                  {loading ? 'Submitting...' : 'Confirm Application'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
