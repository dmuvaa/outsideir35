'use client';

import React, { useState } from 'react';
import { deleteJob } from '@/app/actions/recruiter';

export default function JobDeleteButton({ jobId }: { jobId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this contract? This action cannot be undone.')) return;
    
    setLoading(true);
    const res = await deleteJob(jobId);
    if (res.error) {
      alert(res.error);
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={loading}
      className="btn btn-secondary btn-sm"
      style={{ color: 'var(--color-inside)', borderColor: 'var(--color-inside)' }}
    >
      {loading ? '...' : 'Delete'}
    </button>
  );
}
