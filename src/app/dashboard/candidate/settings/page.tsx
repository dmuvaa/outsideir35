import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import SettingsForm from './SettingsForm';

export default async function CandidateSettingsPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('candidate_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="container fade-in" style={{ padding: '40px 0', minHeight: '80vh' }}>
      
      <Link href="/dashboard/candidate" className="btn-text" style={{ marginBottom: '24px', display: 'inline-block' }}>
        &larr; Back to Dashboard
      </Link>

      <div className="glass-panel" style={{ 
        padding: '40px', 
        marginBottom: '32px',
        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(30, 27, 75, 0.4) 100%)',
        borderLeft: '4px solid var(--color-primary)'
      }}>
        <h1 style={{ fontSize: '32px', fontFamily: 'var(--font-header)', marginBottom: '8px', color: 'var(--text-primary)' }}>
          Profile Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px', margin: 0 }}>
          Manage your professional details, contact information, and rate expectations to stand out to verified recruiters.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '40px' }}>
        <SettingsForm profile={profile} />
      </div>

    </div>
  );
}
