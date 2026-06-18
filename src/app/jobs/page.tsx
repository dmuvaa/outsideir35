'use strict';

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { db, Job } from '@/lib/db';

function JobsContent() {
  const searchParams = useSearchParams();

  // Search States
  const [keyword, setKeyword] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);

  // Filter States
  const [selectedIr35, setSelectedIr35] = useState<string[]>([]);
  const [selectedRemote, setSelectedRemote] = useState<string[]>([]);
  const [selectedClearance, setSelectedClearance] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [dayRateLimit, setDayRateLimit] = useState<number>(1200);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Load Seed Jobs & Apply URL Search
  useEffect(() => {
    db.getJobs().then(list => {
      setJobs(list);
      setFilteredJobs(list);
    });

    // Sync URL queries
    const queryQ = searchParams?.get('q') || '';
    const queryLoc = searchParams?.get('location') || '';
    if (queryQ) setKeyword(queryQ);
    if (queryLoc) setLocationFilter(queryLoc);
  }, [searchParams]);

  // Main Filtering Logic
  useEffect(() => {
    let result = [...jobs];

    // Filter by Keyword (Title/Description/Skills)
    if (keyword) {
      const q = keyword.toLowerCase();
      result = result.filter(j => 
        j.title.toLowerCase().includes(q) || 
        j.descriptionHtml.toLowerCase().includes(q) ||
        j.skills.some(s => s.toLowerCase().includes(q))
      );
    }

    // Filter by Location
    if (locationFilter) {
      const loc = locationFilter.toLowerCase();
      result = result.filter(j => j.location.toLowerCase().includes(loc));
    }

    // Filter by IR35
    if (selectedIr35.length > 0) {
      result = result.filter(j => selectedIr35.includes(j.ir35Status));
    }

    // Filter by Remote Type
    if (selectedRemote.length > 0) {
      result = result.filter(j => selectedRemote.includes(j.remoteType));
    }

    // Filter by Clearance
    if (selectedClearance.length > 0) {
      result = result.filter(j => selectedClearance.includes(j.clearanceLevel));
    }

    // Filter by Industries
    if (selectedIndustries.length > 0) {
      result = result.filter(j => selectedIndustries.includes(j.industry));
    }

    // Filter by Day Rate Slider (Matches jobs whose dayRateMax is <= limit or starts within limit)
    result = result.filter(j => j.dayRateMin <= dayRateLimit);

    // Sorting Logic
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'highest-rate') {
      result.sort((a, b) => b.dayRateMax - a.dayRateMax);
    } else if (sortBy === 'lowest-rate') {
      result.sort((a, b) => a.dayRateMin - b.dayRateMin);
    }

    setFilteredJobs(result);
  }, [jobs, keyword, locationFilter, selectedIr35, selectedRemote, selectedClearance, selectedIndustries, dayRateLimit, sortBy]);

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
    setSelectedIr35([]);
    setSelectedRemote([]);
    setSelectedClearance([]);
    setSelectedIndustries([]);
    setDayRateLimit(1200);
  };

  // Taxonomies
  const industries = ['Technology', 'Finance', 'Engineering', 'Healthcare', 'Construction', 'Government', 'Project Management', 'Business Analysis', 'Procurement'];

  return (
    <div className="container fade-in" style={{ padding: '40px 0' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-header)' }}>Contract Opportunities</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Showing {filteredJobs.length} contract matching roles in the United Kingdom
        </p>
      </div>

      <div className="jobs-layout">
        {/* Sidebar Filters */}
        <aside className="glass-panel filters-sidebar" style={{ backgroundColor: 'var(--panel-bg-solid)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: '700', fontSize: '15px' }}>Filters</span>
            <button onClick={clearAllFilters} className="btn-text" style={{ fontSize: '12px', cursor: 'pointer', padding: 0 }}>
              Clear all
            </button>
          </div>

          <hr style={{ borderColor: 'var(--panel-border)' }} />

          {/* Search Keywords */}
          <div className="filter-group">
            <label className="filter-title">Keyword Search</label>
            <input 
              type="text" 
              placeholder="e.g. React, AWS, PM" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ padding: '8px 12px' }}
            />
          </div>

          {/* Location */}
          <div className="filter-group">
            <label className="filter-title">Location</label>
            <input 
              type="text" 
              placeholder="e.g. London, Hybrid" 
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              style={{ padding: '8px 12px' }}
            />
          </div>

          {/* IR35 Compliance Status */}
          <div className="filter-group">
            <label className="filter-title">IR35 Status</label>
            <label className="filter-checkbox-item">
              <input 
                type="checkbox" 
                checked={selectedIr35.includes('outside')} 
                onChange={() => toggleFilter(selectedIr35, setSelectedIr35, 'outside')}
              />
              Outside IR35 (PSC)
            </label>
            <label className="filter-checkbox-item">
              <input 
                type="checkbox" 
                checked={selectedIr35.includes('inside')} 
                onChange={() => toggleFilter(selectedIr35, setSelectedIr35, 'inside')}
              />
              Inside IR35 (Umbrella)
            </label>
          </div>

          {/* Remote Working Setup */}
          <div className="filter-group">
            <label className="filter-title">Remote Working</label>
            <label className="filter-checkbox-item">
              <input 
                type="checkbox" 
                checked={selectedRemote.includes('remote')} 
                onChange={() => toggleFilter(selectedRemote, setSelectedRemote, 'remote')}
              />
              Fully Remote
            </label>
            <label className="filter-checkbox-item">
              <input 
                type="checkbox" 
                checked={selectedRemote.includes('hybrid')} 
                onChange={() => toggleFilter(selectedRemote, setSelectedRemote, 'hybrid')}
              />
              Hybrid
            </label>
            <label className="filter-checkbox-item">
              <input 
                type="checkbox" 
                checked={selectedRemote.includes('onsite')} 
                onChange={() => toggleFilter(selectedRemote, setSelectedRemote, 'onsite')}
              />
              Onsite Client Facility
            </label>
          </div>

          {/* Clearance Level */}
          <div className="filter-group">
            <label className="filter-title">Security Clearance</label>
            <label className="filter-checkbox-item">
              <input 
                type="checkbox" 
                checked={selectedClearance.includes('none')} 
                onChange={() => toggleFilter(selectedClearance, setSelectedClearance, 'none')}
              />
              No Clearance required
            </label>
            <label className="filter-checkbox-item">
              <input 
                type="checkbox" 
                checked={selectedClearance.includes('SC')} 
                onChange={() => toggleFilter(selectedClearance, setSelectedClearance, 'SC')}
              />
              SC Cleared (Secret)
            </label>
            <label className="filter-checkbox-item">
              <input 
                type="checkbox" 
                checked={selectedClearance.includes('DV')} 
                onChange={() => toggleFilter(selectedClearance, setSelectedClearance, 'DV')}
              />
              DV Cleared (Developed Vetting)
            </label>
          </div>

          {/* Day Rate Range Slider */}
          <div className="filter-group">
            <label className="filter-title">Max Day Rate Target</label>
            <div className="slider-container">
              <input 
                type="range" 
                min="300" 
                max="1500" 
                step="50"
                value={dayRateLimit} 
                onChange={(e) => setDayRateLimit(Number(e.target.value))}
              />
              <div className="slider-val-row">
                <span>£300/day</span>
                <span style={{ color: 'var(--color-primary)' }}>£{dayRateLimit}/day</span>
              </div>
            </div>
          </div>

          {/* Industry Verticals */}
          <div className="filter-group">
            <label className="filter-title">Industries</label>
            {industries.map((ind) => (
              <label key={ind} className="filter-checkbox-item">
                <input 
                  type="checkbox" 
                  checked={selectedIndustries.includes(ind)} 
                  onChange={() => toggleFilter(selectedIndustries, setSelectedIndustries, ind)}
                />
                {ind}
              </label>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main>
          {/* Active Chips & Sorting Row */}
          <div className="glass-panel" style={{
            padding: '16px 24px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '4px 8px',
                  width: '160px',
                  fontSize: '13px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <option value="newest">Newest Roles</option>
                <option value="highest-rate">Highest Day Rate</option>
                <option value="lowest-rate">Lowest Day Rate</option>
              </select>
            </div>

            {/* Clear Filters Indicator */}
            {(keyword || locationFilter || selectedIr35.length > 0 || selectedRemote.length > 0 || selectedClearance.length > 0 || selectedIndustries.length > 0 || dayRateLimit < 1200) && (
              <span style={{ fontSize: '13px', color: 'var(--color-primary)' }}>
                Active filters applied &bull; Showing {filteredJobs.length} matches
              </span>
            )}
          </div>

          {/* Dynamic Jobs List */}
          {filteredJobs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredJobs.map((job) => (
                <div key={job.id} className="glass-panel glass-panel-hover job-card">
                  <div className="job-card-header">
                    <div>
                      <h3 className="job-title">
                        <Link href={`/jobs/${job.slug}`}>{job.title}</Link>
                      </h3>
                      <Link href={`/companies/${job.companyId}`} className="job-company">
                        {job.companyLogo} {job.companyName}
                      </Link>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>
                        £{job.dayRateMin} - £{job.dayRateMax}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>per day</div>
                    </div>
                  </div>

                  <div className="job-meta-row">
                    <div className="job-meta-item">📍 {job.location}</div>
                    <div className="job-meta-item">💻 {job.remoteType.toUpperCase()}</div>
                    <div className="job-meta-item">🛡️ Clearance: {job.clearanceLevel}</div>
                    <div className="job-meta-item">📁 Sector: {job.industry}</div>
                  </div>

                  <div className="job-tags-row">
                    <span className={`tag-badge ${job.ir35Status === 'outside' ? 'tag-outside' : 'tag-inside'}`}>
                      {job.ir35Status === 'outside' ? 'Outside IR35' : 'Inside IR35'}
                    </span>
                    {job.skills.map((skill) => (
                      <span key={skill} className="tag-badge tag-normal">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
              <span style={{ fontSize: '48px' }}>🔍</span>
              <h3 style={{ fontSize: '20px', margin: '16px 0 8px 0' }}>No contract postings found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                Try adjusting your search criteria, widening your day rate limits, or resetting filters.
              </p>
              <button onClick={clearAllFilters} className="btn btn-primary">
                Reset All Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <p>Loading contract opportunities...</p>
      </div>
    }>
      <JobsContent />
    </Suspense>
  );
}
