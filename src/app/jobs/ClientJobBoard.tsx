'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { companyHref, formatDayRate, isSourcedJob, parseJobSearchParams } from '@/lib/platform';
import { getProxyImageUrl } from '@/lib/image-utils';

export default function ClientJobBoard({ initialJobs, applications, categories = [], skills = [] }: { initialJobs: any[], applications: string[], categories?: any[], skills?: any[] }) {
  const searchParams = useSearchParams();

  // Search States
  const [keyword, setKeyword] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobs] = useState<any[]>(initialJobs);
  const [filteredJobs, setFilteredJobs] = useState<any[]>(initialJobs);

  // Filter States
  const [selectedIr35, setSelectedIr35] = useState<string[]>(['outside']);
  const [selectedRemote, setSelectedRemote] = useState<string[]>([]);
  const [selectedClearance, setSelectedClearance] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dayRateLimit, setDayRateLimit] = useState<number>(1200);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Load URL queries
  useEffect(() => {
    const parsed = parseJobSearchParams({
      q: searchParams?.get('q'),
      location: searchParams?.get('location'),
      ir35: searchParams?.get('ir35'),
      remote: searchParams?.get('remote'),
      clearance: searchParams?.get('clearance'),
    });
    if (parsed.q) setKeyword(parsed.q);
    if (parsed.location) setLocationFilter(parsed.location);
    if (searchParams?.get('ir35') === 'all') {
      setSelectedIr35([]);
    } else if (parsed.ir35) {
      setSelectedIr35([parsed.ir35]);
    } else {
      setSelectedIr35(['outside']);
    }
    if (parsed.remote) setSelectedRemote(['remote']);
    if (parsed.clearance) setSelectedClearance([parsed.clearance]);
  }, [searchParams]);

  // Main Filtering Logic
  useEffect(() => {
    let result = [...jobs];

    if (keyword) {
      const q = keyword.toLowerCase();
      result = result.filter(j => 
        j.title?.toLowerCase().includes(q) || 
        j.description_html?.toLowerCase().includes(q)
      );
    }

    if (locationFilter) {
      const loc = locationFilter.toLowerCase();
      result = result.filter(j => j.location?.toLowerCase().includes(loc));
    }

    if (selectedIr35.length > 0) {
      result = result.filter(j => selectedIr35.includes(j.ir35_status));
    }

    if (selectedRemote.length > 0) {
      result = result.filter(j => selectedRemote.includes(j.remote_type));
    }

    if (selectedClearance.length > 0) {
      result = result.filter(j => selectedClearance.includes(j.clearance_level));
    }

    if (selectedIndustries.length > 0) {
      result = result.filter(j => {
        const catArray = j.job_categories || [];
        return catArray.some((jc: any) => selectedIndustries.includes(jc.categories?.id));
      });
    }

    if (selectedTags.length > 0) {
      result = result.filter(j => {
        const tagArray = j.job_skills || [];
        return tagArray.some((js: any) => selectedTags.includes(js.skills?.id));
      });
    }

    result = result.filter(j => j.day_rate_min == null || Number(j.day_rate_min) <= dayRateLimit);

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'highest-rate') {
      result.sort((a, b) => b.day_rate_max - a.day_rate_max);
    } else if (sortBy === 'lowest-rate') {
      result.sort((a, b) => a.day_rate_min - b.day_rate_min);
    }

    setFilteredJobs(result);
  }, [jobs, keyword, locationFilter, selectedIr35, selectedRemote, selectedClearance, selectedIndustries, selectedTags, dayRateLimit, sortBy]);

  const toggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(x => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const clearAllFilters = () => {
    setKeyword('');
    setLocationFilter('');
    setSelectedIr35(['outside']);
    setSelectedRemote([]);
    setSelectedClearance([]);
    setSelectedIndustries([]);
    setSelectedTags([]);
    setDayRateLimit(1200);
  };

  return (
    <div className="container fade-in" style={{ padding: '40px 0' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-header)' }}>Contract Opportunities</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Showing {filteredJobs.length} live roles. Outside IR35 is the default view.
        </p>
        {selectedIr35.length === 1 && selectedIr35[0] === 'outside' && (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            Include Inside IR35 using the filter, or <button type="button" className="btn-text" onClick={() => setSelectedIr35([])}>show all statuses</button>.
          </p>
        )}
      </div>

      <div className="jobs-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) minmax(0, 3fr)', gap: '32px' }}>
        {/* Sidebar Filters */}
        <aside className="glass-panel filters-sidebar" style={{ backgroundColor: 'var(--panel-bg-solid)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: '700', fontSize: '15px' }}>Filters</span>
            <button onClick={clearAllFilters} className="btn-text" style={{ fontSize: '12px', cursor: 'pointer', padding: 0 }}>
              Clear all
            </button>
          </div>

          <hr style={{ borderColor: 'var(--panel-border)', margin: '16px 0' }} />

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px' }}>Keyword Search</label>
            <input 
              type="text" 
              placeholder="e.g. React, AWS" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="input-field"
              style={{ padding: '8px 12px', width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px' }}>Industry</label>
            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {categories.map(c => (
              <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <input type="checkbox" checked={selectedIndustries.includes(c.id)} onChange={() => toggleFilter(selectedIndustries, setSelectedIndustries, c.id)} /> {c.name}
              </label>
            ))}
            </div>
          </div>

          {selectedIndustries.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px' }}>Tags (Skills/Roles)</label>
              <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {skills.filter(s => selectedIndustries.includes(s.category_id)).map(s => (
                 <label key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', background: selectedTags.includes(s.id) ? 'var(--color-outside-glow)' : 'transparent', color: selectedTags.includes(s.id) ? 'var(--color-outside)' : 'var(--text-secondary)', padding: '4px 8px', borderRadius: '12px', cursor: 'pointer', border: '1px solid', borderColor: selectedTags.includes(s.id) ? 'var(--color-outside)' : 'var(--border-color)', transition: 'all 0.2s' }}>
                   <input type="checkbox" style={{ display: 'none' }} checked={selectedTags.includes(s.id)} onChange={() => toggleFilter(selectedTags, setSelectedTags, s.id)} /> {s.name}
                 </label>
              ))}
              {skills.filter(s => selectedIndustries.includes(s.category_id)).length === 0 && (
                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No tags available for selected industries.</span>
              )}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px' }}>IR35 Status</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px' }}>
              <input type="checkbox" checked={selectedIr35.includes('outside')} onChange={() => toggleFilter(selectedIr35, setSelectedIr35, 'outside')} /> Outside IR35 (PSC)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px' }}>
              <input type="checkbox" checked={selectedIr35.includes('inside')} onChange={() => toggleFilter(selectedIr35, setSelectedIr35, 'inside')} /> Inside IR35 (Umbrella)
            </label>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px' }}>Remote Working</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px' }}>
              <input type="checkbox" checked={selectedRemote.includes('remote')} onChange={() => toggleFilter(selectedRemote, setSelectedRemote, 'remote')} /> Fully Remote
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px' }}>
              <input type="checkbox" checked={selectedRemote.includes('hybrid')} onChange={() => toggleFilter(selectedRemote, setSelectedRemote, 'hybrid')} /> Hybrid
            </label>
          </div>
        </aside>

        {/* Results */}
        <main>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field" style={{ width: 'auto', padding: '6px 12px' }}>
              <option value="newest">Sort by: Newest</option>
              <option value="highest-rate">Sort by: Highest Day Rate</option>
              <option value="lowest-rate">Sort by: Lowest Day Rate</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredJobs.length === 0 ? (
              <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                <p>No contracts found matching your filters.</p>
                <button onClick={clearAllFilters} className="btn btn-secondary btn-sm" style={{ marginTop: '16px' }}>Clear filters</button>
              </div>
            ) : (
              filteredJobs.map(job => {
                const company = Array.isArray(job.companies) ? job.companies[0] : job.companies;
                const hasApplied = applications.includes(job.id);

                const primaryCategory = job.job_categories?.[0]?.categories;
                const topTags = job.job_skills?.slice(0, 3).map((js: any) => js.skills?.name).filter(Boolean);

                return (
                  <div key={job.id} className="glass-panel glass-panel-hover" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
                    
                    {primaryCategory && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{primaryCategory.name}</span>
                        {topTags && topTags.length > 0 && (
                          <>
                            <span style={{ fontSize: '10px' }}>›</span>
                            <span>{topTags.join(', ')}</span>
                          </>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>
                          <Link href={`/jobs/${job.slug}`}>{job.title}</Link>
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                          <div style={{ width: '48px', height: '48px', background: 'var(--bg-color)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', overflow: 'hidden' }}>
                            {(company?.logo_url && (company.logo_url.startsWith('/') || company.logo_url.startsWith('http'))) ? (
                              <img src={getProxyImageUrl(company.logo_url) || company.logo_url} alt={`${company.name} logo`} style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'white' }} />
                            ) : (
                              <span>{company?.logo_url || '🏢'}</span>
                            )}
                          </div>
                          <Link href={companyHref({ slug: company?.slug, id: job.company_id })}>{company?.name}</Link>
                          <span>•</span>
                          <span>{job.location} ({job.remote_type})</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{formatDayRate(job.day_rate_min, job.day_rate_max)}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>per day</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span className={`tag-badge ${job.ir35_status === 'outside' ? 'tag-outside' : 'tag-inside'}`}>
                          {job.ir35_status === 'outside' ? 'Outside IR35' : 'Inside IR35'}
                        </span>
                        {isSourcedJob(job) && (
                          <span className="tag-badge tag-normal">Sourced</span>
                        )}
                        {hasApplied && (
                          <span className="tag-badge" style={{ background: 'var(--color-success)', color: 'white', borderColor: 'var(--color-success)' }}>
                            ✓ Applied
                          </span>
                        )}
                      </div>
                      <Link href={`/jobs/${job.slug}`} className="btn btn-primary btn-sm">
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
