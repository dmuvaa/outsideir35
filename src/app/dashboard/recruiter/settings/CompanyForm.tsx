'use client';

import React, { useState } from 'react';
import { updateCompanyProfile } from '@/app/actions/recruiter';
import { getProxyImageUrl } from '@/lib/image-utils';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface CompanyFormProps {
  initialData: any;
  categories: { id: string; name: string }[];
}

export default function CompanyForm({ initialData, categories }: CompanyFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [descriptionHtml, setDescriptionHtml] = useState(initialData.description || '');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    formData.set('description', descriptionHtml);

    try {
      const res = await updateCompanyProfile(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess('Company profile updated successfully!');
      }
    } catch (err: any) {
      console.error('Server action error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel fade-in" style={{ padding: '32px' }}>
      {error && <div style={{ padding: '16px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '24px' }}>{error}</div>}
      {success && <div style={{ padding: '16px', background: 'var(--color-outside-glow)', color: 'var(--color-outside)', borderRadius: '4px', marginBottom: '24px' }}>{success}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div className="grid-2">
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Company Name *</label>
            <input name="name" defaultValue={initialData.name} required className="input-field" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Website URL *</label>
            <input name="website" type="url" defaultValue={initialData.website_url} required className="input-field" placeholder="https://..." />
          </div>
        </div>

        <div className="grid-3">
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Industry</label>
            <select name="industry" defaultValue={initialData.industry || ''} className="input-field">
              <option value="">Select an industry</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Company Size</label>
            <select name="company_size" defaultValue={initialData.size_band || '1-10'} className="input-field">
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="500+">500+ employees</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Company Logo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {initialData.logo_url && !initialData.logo_url.startsWith('🏢') && (
                <img 
                  src={getProxyImageUrl(initialData.logo_url)} 
                  alt="Current Logo" 
                  style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'contain', background: 'var(--bg-card)' }}
                />
              )}
              <div style={{ flex: 1 }}>
                <input type="file" name="logo_file" accept="image/*" className="input-field" style={{ width: '100%', padding: '6px' }} />
                <input type="hidden" name="existing_logo_url" value={initialData.logo_url || ''} />
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Upload a transparent PNG for best results.</p>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Company Description *</label>
          <div style={{ background: 'var(--panel-bg-solid)', borderRadius: 'var(--radius-sm)' }}>
            <ReactQuill 
              theme="snow"
              value={descriptionHtml} 
              onChange={setDescriptionHtml}
              style={{ minHeight: '200px', marginBottom: '40px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

      </form>
    </div>
  );
}
