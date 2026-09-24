'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createJob, updateJob } from '@/app/actions/recruiter';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface CategoryOption {
  id: string;
  name: string;
  parent_id?: string | null;
}

interface JobFormProps {
  mode: 'create' | 'edit';
  initialData?: any;
  categories?: CategoryOption[];
  skills?: { id: string; name: string; category_id: string }[];
  returnTo?: string;
}

export default function JobForm({ mode, initialData = {}, categories = [], skills = [], returnTo = '/dashboard/recruiter/jobs' }: JobFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [descriptionHtml, setDescriptionHtml] = useState(initialData.description_html || '');
  const hasTree = categories.some((category) => category.parent_id);
  const initialCategory = categories.find((category) => category.id === initialData.category_id);
  const [parentId, setParentId] = useState(initialCategory?.parent_id || (!hasTree ? initialCategory?.id || '' : ''));
  const [subcategoryId, setSubcategoryId] = useState(initialCategory?.parent_id ? initialCategory.id : '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialData.skill_ids || []);
  const parents = categories.filter((category) => !category.parent_id);
  const subcategories = categories.filter((category) => category.parent_id === parentId);
  const selectedCategory = hasTree ? subcategoryId : parentId;

  const handleParentChange = (value: string) => {
    setParentId(value);
    setSubcategoryId('');
    setSelectedSkills([]);
  };

  const handleSubcategoryChange = (value: string) => {
    setSubcategoryId(value);
    setSelectedSkills([]);
  };

  const handleSkillToggle = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!selectedCategory) {
      setError(hasTree ? 'Choose a category and a subcategory' : 'Choose a category');
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    if (formData.get('ir35_status') === 'outside' && !formData.get('ir35_attested')) {
      setError('Confirm the Outside IR35 determination before publishing.');
      setLoading(false);
      return;
    }

    formData.set('description_html', descriptionHtml);
    formData.set('category_id', selectedCategory);
    formData.set('skill_ids', JSON.stringify(selectedSkills));
    
    let res;
    try {
      if (mode === 'create') {
        res = await createJob(formData);
      } else {
        res = await updateJob(initialData.id, formData);
      }

      if (res.error) {
        setError(res.error);
      } else {
        router.push(returnTo);
        router.refresh();
      }
    } catch (err: any) {
      console.error('Server action error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '32px' }}>
      {error && <div style={{ padding: '16px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '24px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Job Title</label>
            <input name="title" defaultValue={initialData.title} required className="input-field" style={{ width: '100%' }} placeholder="e.g. Senior React Developer" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Location</label>
            <input name="location" defaultValue={initialData.location} required className="input-field" style={{ width: '100%' }} placeholder="e.g. London" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: hasTree ? '1fr 1fr' : '1fr', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Category</label>
            <select value={parentId} onChange={(e) => handleParentChange(e.target.value)} required className="input-field" style={{ width: '100%' }}>
              <option value="">Select category</option>
              {(hasTree ? parents : categories).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          {hasTree && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Subcategory</label>
              <select value={subcategoryId} onChange={(e) => handleSubcategoryChange(e.target.value)} required={Boolean(parentId)} className="input-field" style={{ width: '100%' }}>
                <option value="">Select subcategory</option>
                {subcategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </div>
          )}
        </div>

        {selectedCategory && (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Select Tags (Skills/Roles)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', background: 'var(--panel-bg-solid)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
              {skills.filter(s => s.category_id === selectedCategory).map(s => (
                <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: selectedSkills.includes(s.id) ? 'var(--color-outside-glow)' : 'transparent', border: '1px solid var(--border-color)', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s', color: selectedSkills.includes(s.id) ? 'var(--color-outside)' : 'inherit', fontWeight: selectedSkills.includes(s.id) ? '600' : '400' }}>
                  <input type="checkbox" style={{ display: 'none' }} checked={selectedSkills.includes(s.id)} onChange={() => handleSkillToggle(s.id)} />
                  {s.name}
                </label>
              ))}
              {skills.filter(s => s.category_id === selectedCategory).length === 0 && (
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No tags available for this category.</span>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Day Rate Min (£)</label>
            <input type="number" name="day_rate_min" defaultValue={initialData.day_rate_min} required className="input-field" style={{ width: '100%' }} placeholder="500" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Day Rate Max (£)</label>
            <input type="number" name="day_rate_max" defaultValue={initialData.day_rate_max} required className="input-field" style={{ width: '100%' }} placeholder="650" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>IR35 Status</label>
            <select name="ir35_status" defaultValue={initialData.ir35_status || 'outside'} className="input-field" style={{ width: '100%' }}>
              <option value="outside">Outside IR35</option>
              <option value="inside">Inside IR35</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Engagement</label>
            <select name="engagement_model" defaultValue={initialData.engagement_model || 'psc'} className="input-field" style={{ width: '100%' }}>
              <option value="psc">Limited company / PSC</option>
              <option value="umbrella">Umbrella</option>
              <option value="either">PSC or umbrella</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Remote Type</label>
            <select name="remote_type" defaultValue={initialData.remote_type || 'hybrid'} className="input-field" style={{ width: '100%' }}>
              <option value="hybrid">Hybrid</option>
              <option value="remote">Fully Remote</option>
              <option value="onsite">On-site</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Clearance</label>
            <select name="clearance_level" defaultValue={initialData.clearance_level || 'none'} className="input-field" style={{ width: '100%' }}>
              <option value="none">None</option>
              <option value="BPSS">BPSS</option>
              <option value="SC">SC</option>
              <option value="DV">DV</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Fee payer</label>
            <input name="fee_payer" defaultValue={initialData.fee_payer || ''} className="input-field" style={{ width: '100%' }} placeholder="Client or agency name" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>End client</label>
            <input name="end_client" defaultValue={initialData.end_client || ''} className="input-field" style={{ width: '100%' }} placeholder="If different from fee payer" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Determination date</label>
            <input type="date" name="determination_date" defaultValue={initialData.determination_date ? String(initialData.determination_date).slice(0, 10) : ''} className="input-field" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Contract length</label>
            <input name="contract_length" defaultValue={initialData.contract_length || ''} className="input-field" style={{ width: '100%' }} placeholder="e.g. 6 months" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <input type="checkbox" name="sds_available" defaultChecked={!!initialData.sds_available} /> SDS available on request
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <input type="checkbox" name="ir35_attested" defaultChecked={!!initialData.ir35_attested_at} required={false} /> I confirm this IR35 status
            </label>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Publish Date</label>
            <input type="date" name="published_at" defaultValue={initialData.published_at ? new Date(initialData.published_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} required className="input-field" style={{ width: '100%' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Set a future date to schedule this post.</span>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Application Deadline</label>
            <input type="date" name="expires_at" defaultValue={initialData.expires_at ? new Date(initialData.expires_at).toISOString().split('T')[0] : ''} className="input-field" style={{ width: '100%' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Optional. The job will disappear from the board after this date.</span>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Job Description</label>
          <div style={{ background: 'var(--panel-bg-solid)', borderRadius: 'var(--radius-sm)' }}>
            <ReactQuill 
              theme="snow"
              value={descriptionHtml} 
              onChange={setDescriptionHtml}
              style={{ minHeight: '250px', marginBottom: '40px' }}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{'list': 'ordered'}, {'list': 'bullet'}],
                  ['link', 'image', 'clean']
                ],
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Visibility Status</label>
          <select name="status" defaultValue={initialData.status || 'active'} className="input-field" style={{ width: '200px' }}>
            <option value="active">Active (Published)</option>
            <option value="draft">Draft (Hidden)</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
          <button type="button" onClick={() => router.back()} className="btn btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Saving...' : mode === 'create' ? 'Publish Contract' : 'Save Changes'}
          </button>
        </div>

      </form>
    </div>
  );
}
