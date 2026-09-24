'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchForm() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [ir35Status, setIr35Status] = useState('all');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [scCleared, setScCleared] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set('q', keyword);
    if (location) params.set('location', location);
    if (ir35Status !== 'all') params.set('ir35', ir35Status.toLowerCase());
    if (remoteOnly) params.set('remote', 'remote');
    if (scCleared) params.set('clearance', 'SC');
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <form onSubmit={handleSearch} className="glass-panel search-hero-box" style={{
        boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="search-input-group">
          <span style={{ fontSize: '18px' }}>🔍</span>
          <input
            type="text"
            placeholder="Keywords, skills, or roles..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <div className="search-input-group">
          <span style={{ fontSize: '18px' }}>📍</span>
          <input
            type="text"
            placeholder="Location (e.g. London, Remote)..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        
        {/* Quick Filters Toggle Button inside the bar */}
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="btn btn-secondary"
          style={{
            padding: '10px 16px',
            border: '1px solid var(--panel-border)',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          🎛️ Filters { (ir35Status !== 'all' || remoteOnly || scCleared) && <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>•</span> }
        </button>

        <button type="submit" className="btn btn-primary btn-search" style={{ padding: '0 32px' }}>
          Find Roles
        </button>
      </form>

      {/* Expandable Filters Panel */}
      {showFilters && (
        <div className="fade-in glass-panel filters-panel" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '8px',
          padding: '20px',
          zIndex: 9,
          border: '1px solid var(--color-primary-glow)'
        }}>
          <div className="filters-grid">
            <div className="filter-group">
              <span className="filter-title">IR35 Status</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => setIr35Status('all')} className={`btn btn-sm ${ir35Status === 'all' ? 'btn-primary' : 'btn-secondary'}`}>Any</button>
                <button type="button" onClick={() => setIr35Status('outside')} className={`btn btn-sm ${ir35Status === 'outside' ? 'btn-primary' : 'btn-secondary'}`}>Outside Only</button>
                <button type="button" onClick={() => setIr35Status('inside')} className={`btn btn-sm ${ir35Status === 'inside' ? 'btn-primary' : 'btn-secondary'}`}>Inside Only</button>
              </div>
            </div>
            
            <div className="filter-group">
              <span className="filter-title">Contract Types</span>
              <label className="filter-checkbox-item">
                <input type="checkbox" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} />
                <span>Remote Work Options</span>
              </label>
              <label className="filter-checkbox-item">
                <input type="checkbox" checked={scCleared} onChange={(e) => setScCleared(e.target.checked)} />
                <span>Requires SC Clearance</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
