import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Pricing - OutsideIR35 Portal',
  description: 'Transparent pricing for companies and recruiters hiring outside IR35 contractors.',
};

export default function PricingPage() {
  return (
    <div className="fade-in" style={{ paddingBottom: '80px' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '80px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
          zIndex: -1,
          pointerEvents: 'none'
        }} />
        
        <h1 style={{ 
          fontSize: '48px', 
          fontFamily: 'var(--font-header)',
          marginBottom: '24px',
          background: 'linear-gradient(to right, var(--text-primary), #c084fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-block'
        }}>
          Hire contractors, not a placement fee
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Flat posting prices for UK contract roles. Checkout is not live yet — create a recruiter account and we will turn billing on before paid listings are required.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'center' }}>
          
          {/* Starter Tier */}
          <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>Starter</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Perfect for occasional hiring</p>
            <div style={{ marginBottom: '32px' }}>
              <span style={{ fontSize: '48px', fontWeight: '800', color: 'var(--text-primary)' }}>£149</span>
              <span style={{ color: 'var(--text-muted)' }}>/posting</span>
            </div>
            
            <Link href="/register?role=recruiter&plan=starter" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center', marginBottom: '32px', padding: '12px' }}>
              Get Started
            </Link>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--color-primary)' }}>✓</span> 30-day job listing
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--color-primary)' }}>✓</span> Recruiter attestation on IR35 status
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--color-primary)' }}>✓</span> Receive applications directly
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.5 }}>
                <span>✕</span> No candidate database access
              </div>
            </div>
          </div>

          {/* Professional Tier (Highlighted) */}
          <div className="glass-panel" style={{ 
            padding: '48px 40px', 
            borderRadius: '24px', 
            border: '2px solid var(--color-primary)',
            background: 'linear-gradient(to bottom, rgba(124, 58, 237, 0.05), transparent)',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              position: 'absolute',
              top: '-14px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(to right, #c084fc, #7c3aed)',
              color: 'white',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              Most Popular
            </div>

            <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-header)', marginBottom: '8px', color: 'var(--color-primary)' }}>Professional</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>For active scaling teams</p>
            <div style={{ marginBottom: '32px' }}>
              <span style={{ fontSize: '48px', fontWeight: '800', color: 'var(--text-primary)' }}>£399</span>
              <span style={{ color: 'var(--text-muted)' }}>/month</span>
            </div>
            
            <Link href="/register?role=recruiter" className="btn btn-primary" style={{ width: '100%', textAlign: 'center', marginBottom: '32px', padding: '12px' }}>
              Create recruiter account
            </Link>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--color-primary)' }}>✓</span> <strong>5 active job listings</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--color-primary)' }}>✓</span> Premium placement in search
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--color-primary)' }}>✓</span> Featured Company Profile
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--color-primary)' }}>✓</span> Applications inbox
              </div>
            </div>
          </div>

          {/* Enterprise Tier */}
          <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-header)', marginBottom: '8px' }}>Enterprise</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>High-volume recruitment</p>
            <div style={{ marginBottom: '32px' }}>
              <span style={{ fontSize: '48px', fontWeight: '800', color: 'var(--text-primary)' }}>£899</span>
              <span style={{ color: 'var(--text-muted)' }}>/month</span>
            </div>
            
            <Link href="/register?role=recruiter&plan=enterprise" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center', marginBottom: '32px', padding: '12px' }}>
              Contact Sales
            </Link>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--color-primary)' }}>✓</span> <strong>Unlimited job listings</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--color-primary)' }}>✓</span> Public contractor directory (when live)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--color-primary)' }}>✓</span> Priority support
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="container" style={{ marginTop: '80px', maxWidth: '800px' }}>
        <h2 style={{ fontSize: '32px', fontFamily: 'var(--font-header)', textAlign: 'center', marginBottom: '40px' }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '18px', marginBottom: '12px', color: 'var(--text-primary)' }}>Do you take a percentage of the contract rate?</h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              No. We charge a flat fee for job postings and subscriptions. You deal directly with the contractors, meaning no hidden margin fees or expensive agency percentages.
            </p>
          </div>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '18px', marginBottom: '12px', color: 'var(--text-primary)' }}>Can I cancel a subscription?</h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Paid subscriptions are not enabled yet. When they are, monthly plans will cancel at period end with no extra fee.
            </p>
          </div>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '18px', marginBottom: '12px', color: 'var(--text-primary)' }}>How does the compliance badging work?</h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Recruiters attest the IR35 status when they post. Outside listings can include fee payer, engagement model, determination date, and whether an SDS is available. We do not run CEST or issue determinations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
