'use client';

import React, { useState } from 'react';
import { updateApplicationStatus, addRecruiterNote } from '@/app/actions/recruiter';

export default function ApplicationStatusUpdater({ applicationId, initialStatus, initialNotes }: { applicationId: string, initialStatus: string, initialNotes: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setLoading(true);
    await updateApplicationStatus(applicationId, newStatus);
    setLoading(false);
  };

  const handleSaveNotes = async () => {
    setLoading(true);
    const { error } = await addRecruiterNote(applicationId, notes);
    setLoading(false);
    setMessage(error ? error : 'Notes saved.');
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Application Status
      </h3>
      
      <div style={{ marginBottom: '24px' }}>
        <select 
          value={status} 
          onChange={handleStatusChange} 
          disabled={loading}
          className="input-field" 
          style={{ width: '100%', fontWeight: 'bold' }}
        >
          <option value="applied">Applied (Pending)</option>
          <option value="reviewing">Reviewing</option>
          <option value="interviewing">Interviewing</option>
          <option value="offered">Offered</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <h3 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Private Notes
      </h3>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
        Visible only to your team.
      </p>
      
      <textarea 
        value={notes} 
        onChange={(e) => setNotes(e.target.value)} 
        rows={4} 
        className="input-field" 
        style={{ width: '100%', resize: 'vertical', marginBottom: '16px' }}
        placeholder="Add thoughts, interview feedback..."
      />

      <button onClick={handleSaveNotes} disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
        {loading ? 'Saving...' : 'Save Notes'}
      </button>
      {message && <p style={{ marginTop: '12px', fontSize: '13px' }}>{message}</p>}
    </div>
  );
}
