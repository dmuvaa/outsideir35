'use strict';

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db, UserProfile, Job, Application } from '@/lib/db';

export default function CandidateDashboard() {
  const router = useRouter();
  
  // Navigation & User session states
  const [activeTab, setActiveTab] = useState<'overview' | 'assessment' | 'calculator' | 'profile' | 'applications' | 'saved' | 'compliance'>('overview');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [savedJobsList, setSavedJobsList] = useState<Job[]>([]);
  const [applicationsList, setApplicationsList] = useState<Application[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Profile Form States
  const [profileName, setProfileName] = useState('');
  const [profileHeadline, setProfileHeadline] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileLocation, setProfileLocation] = useState('');
  const [profileWebsite, setProfileWebsite] = useState('');
  const [profileLinkedin, setProfileLinkedin] = useState('');
  const [profileAvailability, setProfileAvailability] = useState<'immediate' | '1_month' | 'not_available'>('immediate');
  const [profileMinRate, setProfileMinRate] = useState<number>(500);
  const [profileMaxRate, setProfileMaxRate] = useState<number>(800);
  const [profileClearance, setProfileClearance] = useState<'none' | 'BPSS' | 'SC' | 'DV'>('none');
  const [cvFileName, setCvFileName] = useState('');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // IR35 Assessment Tool States
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0); // 0 (Strong Outside) to 100 (Strong Inside)
  const [quizResultText, setQuizResultText] = useState('');
  
  // Pay Calculator States
  const [calcDayRate, setCalcDayRate] = useState<number>(600);
  const [calcDays, setCalcDays] = useState<number>(220);
  const [calcExpenses, setCalcExpenses] = useState<number>(3000);
  const [calcPension, setCalcPension] = useState<number>(5); // % contribution

  useEffect(() => {
    const user = db.getAuthUser();
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'candidate') {
      router.push('/employer');
      return;
    }
    setCurrentUser(user);

    async function loadData() {
      try {
        // Load candidate data
        const p = await db.getCandidateProfile();
        setProfile(p);
        setProfileName(p.name);
        setProfileHeadline(p.headline || '');
        setProfileBio(p.bio || '');
        setProfileLocation(p.location || '');
        setProfileWebsite(p.website || '');
        setProfileLinkedin(p.linkedin || '');
        setProfileAvailability(p.availability);
        setProfileMinRate(p.minDayRate || 500);
        setProfileMaxRate(p.maxDayRate || 800);
        setProfileClearance(p.clearanceLevel);
        setCvFileName(p.resumeName || '');

        // Load saved bookmarks
        const jobs = await db.getJobs();
        setSavedJobsList(jobs.filter(j => p.savedJobs.includes(j.id)));
        setRecommendedJobs(jobs.slice(0, 2));

        // Load applications list
        const apps = await db.getApplications();
        setApplicationsList(apps.filter(a => a.userId === p.userId));
      } catch (err: any) {
        console.error('Candidate Dashboard loading failed:', err);
        setLoadError(err.message || 'Failed to retrieve profile data.');
      }
    }
    loadData();
  }, [router]);

  if (loadError) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-inside)', marginBottom: '16px' }}>Dashboard Loading Failed</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{loadError}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  if (!currentUser || !profile) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <p>Redirecting to session dashboard...</p>
      </div>
    );
  }

  // PROFILE SAVING LOGIC
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const updated: UserProfile = {
      ...profile,
      name: profileName,
      headline: profileHeadline,
      bio: profileBio,
      location: profileLocation,
      website: profileWebsite,
      linkedin: profileLinkedin,
      availability: profileAvailability,
      minDayRate: profileMinRate,
      maxDayRate: profileMaxRate,
      clearanceLevel: profileClearance,
      resumeName: cvFileName
    };
    await db.saveCandidateProfile(updated);
    setProfile(updated);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
  };

  // GDPR DELETE LOGIC
  const handleDeleteAccount = async () => {
    if (confirm('CAUTION: This will delete your profile info, CV uploads, and applications logs. This action is irreversible.')) {
      await db.deleteAccountData();
      alert('Your account data has been successfully purged under GDPR compliance rules.');
      router.push('/');
    }
  };

  // IR35 QUIZ CEST QUESTIONS DEFINITIONS
  const quizQuestions = [
    {
      id: 1,
      section: 'Substitution',
      text: 'Does your contract allow you to provide a substitute to perform the work in your place?',
      options: [
        { label: 'Yes, with absolute discretion, and the client cannot reject a qualified substitute.', val: 'out_strong' },
        { label: 'Yes, but the client retains final approval, or we must choose from a client panel.', val: 'neutral' },
        { label: 'No, the contract requires personal service from myself only.', val: 'in_strong' }
      ]
    },
    {
      id: 2,
      section: 'Substitution',
      text: 'If a substitute is sent, who is responsible for paying them?',
      options: [
        { label: 'My limited company (PSC) directly processes the substitute billing.', val: 'out_strong' },
        { label: 'The client pays the substitute directly or via agency payroll.', val: 'in_strong' },
        { label: 'Not applicable (no substitution clause exists).', val: 'in_strong' }
      ]
    },
    {
      id: 3,
      section: 'Control',
      text: 'Who determines the working schedule and hours of service?',
      options: [
        { label: 'I determine my own working schedule based on project milestones.', val: 'out_strong' },
        { label: 'The hours are flexible, but I must coordinate with core office hours.', val: 'neutral' },
        { label: 'The client dictates fixed operational hours that I must follow.', val: 'in_strong' }
      ]
    },
    {
      id: 4,
      section: 'Control',
      text: 'Where are the services primarily performed?',
      options: [
        { label: 'I decide my primary workspace (e.g. remote home office).', val: 'out_strong' },
        { label: 'A hybrid schedule set at the absolute discretion of the client.', val: 'neutral' },
        { label: 'Fixed onsite presence is mandatory at client facilities.', val: 'in_strong' }
      ]
    },
    {
      id: 5,
      section: 'Control',
      text: 'Who directs the operational methods and execution tasks?',
      options: [
        { label: 'I decide the methods. The client only reviews final deliverables.', val: 'out_strong' },
        { label: 'I deliver the goals, but must follow standard client architecture guidelines.', val: 'neutral' },
        { label: 'The client provides daily instructions and supervises active output.', val: 'in_strong' }
      ]
    },
    {
      id: 6,
      section: 'MOO & Risk',
      text: 'Is the client obliged to offer work, or are you obliged to accept extra tasks outside contract scope?',
      options: [
        { label: 'No. We contract for specific deliverables. Extra work requires new contracts.', val: 'out_strong' },
        { label: 'Yes, the client expects me to pick up ad-hoc tasks as they arise.', val: 'in_strong' }
      ]
    },
    {
      id: 7,
      section: 'MOO & Risk',
      text: 'How are equipment and software assets sourced for this role?',
      options: [
        { label: 'I supply my own laptop, software licenses, and testing gear.', val: 'out_strong' },
        { label: 'The client provides a secure laptop for security reasons, but I pay for minor tools.', val: 'neutral' },
        { label: 'The client provides all laptops, tools, credentials, and software.', val: 'in_strong' }
      ]
    },
    {
      id: 8,
      section: 'MOO & Risk',
      text: 'If there are errors in your deliverables, how are they corrected?',
      options: [
        { label: 'My company corrects errors at our own expense and outside billing hours.', val: 'out_strong' },
        { label: 'Errors are corrected during billable hours under client direction.', val: 'in_strong' }
      ]
    }
  ];

  const handleSelectAnswer = (questionId: number, val: string) => {
    setQuizAnswers({
      ...quizAnswers,
      [questionId]: val
    });
  };

  const handleNextQuiz = () => {
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      // Evaluate quiz results
      let outsideScore = 0;
      let insideScore = 0;
      
      Object.values(quizAnswers).forEach((ans) => {
        if (ans === 'out_strong') outsideScore += 2;
        else if (ans === 'neutral') outsideScore += 1;
        else if (ans === 'in_strong') insideScore += 2;
      });

      const total = (insideScore / (outsideScore + insideScore || 1)) * 100;
      setQuizScore(Math.round(total));
      setQuizCompleted(true);

      if (total < 35) {
        setQuizResultText('🟢 OUTSIDE IR35 COMPLIANT. Your engagement demonstrates high operational substitution, autonomy, and business risk, matching self-employed criteria.');
      } else if (total < 65) {
        setQuizResultText('🟡 AMBIGUOUS RISK. Your contract contains some compliance strengths but displays indicators of corporate integration or client direction. Review notice periods.');
      } else {
        setQuizResultText('🔴 INSIDE IR35 RISK. Your engagement indicates personal service requirements, direct client supervision, and lack of business risk, mirroring employment.');
      }
    }
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizStep(0);
    setQuizCompleted(false);
  };

  // COMPARATIVE TAX CALCULATOR ALGORITHM (2025/2026 TAX RULES)
  const calculateTaxes = () => {
    // 1. Inputs
    const rate = calcDayRate;
    const days = calcDays;
    const expenses = calcExpenses;
    const pensionPct = calcPension / 100;

    const grossRevenue = rate * days;

    // --- SETUP A: INSIDE IR35 (Umbrella PAYE) ---
    // Employer costs (passed to assignment rate)
    const umbrellaFee = 1500; // annual umbrella margin
    const employerNiThreshold = 5000; // secondary threshold 25/26!
    const employerNiRate = 0.15; // 15% employer NI 25/26!
    const levyRate = 0.005; // 0.5% levy

    // Formula to back-solve Gross Salary:
    // Revenue = Salary + EmployerNI + Levy + Pension + UmbrellaFee
    // EmployerNI = (Salary - 5000) * 0.15 [if Salary > 5000]
    // Levy = Salary * 0.005
    // Pension = Salary * pensionPct
    // Solve: Revenue - UmbrellaFee + (5000 * 0.15) = Salary * (1 + 0.15 + 0.005 + pensionPct)
    const insidePensionAmt = grossRevenue * 0.05; // simple pension mock calculation
    
    // Back-solved estimation for Umbrella Gross Salary:
    const umbrellaGrossSalary = Math.max(0, (grossRevenue - umbrellaFee - insidePensionAmt + (5000 * 0.15)) / 1.155);
    const employerNi = Math.max(0, (umbrellaGrossSalary - 5000) * 0.15);
    const apprenticeLevy = umbrellaGrossSalary * 0.005;

    // Employee Deductions
    const personalAllowance = 12570;
    // Basic income tax
    let insideIncomeTax = 0;
    if (umbrellaGrossSalary > personalAllowance) {
      const taxable = umbrellaGrossSalary - personalAllowance;
      if (taxable <= 37700) {
        insideIncomeTax = taxable * 0.20;
      } else {
        insideIncomeTax = (37700 * 0.20) + ((taxable - 37700) * 0.40);
      }
    }
    // Employee NI (8% up to 50270, 2% above)
    let insideEmployeeNi = 0;
    if (umbrellaGrossSalary > 12570) {
      const niBase = Math.min(umbrellaGrossSalary, 50270) - 12570;
      const niHigh = Math.max(0, umbrellaGrossSalary - 50270);
      insideEmployeeNi = (niBase * 0.08) + (niHigh * 0.02);
    }
    const insideNetTakeHome = Math.max(0, umbrellaGrossSalary - insideIncomeTax - insideEmployeeNi);

    // --- SETUP B: OUTSIDE IR35 (PSC / Limited Company) ---
    // Remuneration Strategy: Salary at Personal Allowance (£12,570), rest as Dividends.
    const outsideDirectorSalary = 12570;
    const companyProfit = Math.max(0, grossRevenue - expenses - outsideDirectorSalary);

    // Corporation Tax Calculation (HMRC Marginal Relief 2025/2026)
    let corporationTax = 0;
    if (companyProfit <= 50000) {
      corporationTax = companyProfit * 0.19; // 19% Small profits
    } else if (companyProfit > 250000) {
      corporationTax = companyProfit * 0.25; // 25% Main rate
    } else {
      // Marginal relief formula: (Profit * 25%) - (250000 - Profit) * (3/200)
      corporationTax = (companyProfit * 0.25) - ((250000 - companyProfit) * 0.015);
    }

    const availableDividends = Math.max(0, companyProfit - corporationTax);

    // Personal Dividend Tax (8.75% basic, 33.75% higher, 39.35% additional, £500 allowance)
    const dividendAllowance = 500;
    let personalTax = 0;
    let personalAllowanceTaper = 12570;
    
    // Taper personal allowance by £1 for every £2 of income over £100,000
    const totalIncome = outsideDirectorSalary + availableDividends;
    if (totalIncome > 100000) {
      personalAllowanceTaper = Math.max(0, 12570 - ((totalIncome - 100000) / 2));
    }

    // Dividends taxation calculation
    const taxableDividends = Math.max(0, availableDividends - dividendAllowance);
    if (taxableDividends > 0) {
      // Basic rate band ceiling is £50,270.
      // Basic rate band remaining after director salary:
      const basicBandRemaining = Math.max(0, 50270 - outsideDirectorSalary);
      const basicDividends = Math.min(taxableDividends, basicBandRemaining);
      const higherDividends = Math.max(0, taxableDividends - basicBandRemaining);

      personalTax = (basicDividends * 0.0875) + (higherDividends * 0.3375);
    }

    const outsideNetTakeHome = outsideDirectorSalary + availableDividends - personalTax;

    return {
      grossRevenue,
      // Inside details
      insideGross: umbrellaGrossSalary,
      insideTax: insideIncomeTax,
      insideNi: insideEmployeeNi,
      insideEmployerNi: employerNi,
      insideLevy: apprenticeLevy,
      insideUmbrellaFee: umbrellaFee,
      insideNet: insideNetTakeHome,
      // Outside details
      outsideSalary: outsideDirectorSalary,
      outsideCorpTax: corporationTax,
      outsideDividends: availableDividends,
      outsidePersonalTax: personalTax,
      outsideNet: outsideNetTakeHome
    };
  };

  const taxData = calculateTaxes();

  return (
    <div className="container fade-in" style={{ padding: '40px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '40px' }}>
        
        {/* Left Sidebar Menu */}
        <aside className="glass-panel" style={{ padding: '24px', height: 'fit-content', backgroundColor: 'var(--panel-bg-solid)' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(192, 132, 252, 0.1) 100%)', 
              border: '1px solid rgba(124, 58, 237, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '18px' }}>👨‍💻</span>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>Role</div>
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '700', lineHeight: 1.2 }}>Candidate Portal</div>
              </div>
            </div>
            <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-header)', color: 'var(--text-primary)' }}>{profileName}</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{currentUser.email}</span>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => setActiveTab('overview')} className={`btn btn-text btn-sm ${activeTab === 'overview' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%' }}>
              📊 Work Summary
            </button>
            <button onClick={() => setActiveTab('assessment')} className={`btn btn-text btn-sm ${activeTab === 'assessment' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%' }}>
              🛡️ IR35 Compliance Quiz
            </button>
            <button onClick={() => setActiveTab('calculator')} className={`btn btn-text btn-sm ${activeTab === 'calculator' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%' }}>
              🧮 Inside/Outside Tax Calc
            </button>
            <button onClick={() => setActiveTab('profile')} className={`btn btn-text btn-sm ${activeTab === 'profile' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%' }}>
              👤 Edit Profile
            </button>
            <button onClick={() => setActiveTab('applications')} className={`btn btn-text btn-sm ${activeTab === 'applications' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%' }}>
              📁 Applied Jobs ({applicationsList.length})
            </button>
            <button onClick={() => setActiveTab('saved')} className={`btn btn-text btn-sm ${activeTab === 'saved' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%' }}>
              ★ Bookmarks ({savedJobsList.length})
            </button>
            <button onClick={() => setActiveTab('compliance')} className={`btn btn-text btn-sm ${activeTab === 'compliance' ? 'active' : ''}`} style={{ textAlign: 'left', width: '100%' }}>
              🔒 GDPR Compliance Logs
            </button>
          </nav>
        </aside>

        {/* Right Tab Content */}
        <main>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="fade-in">
              <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Dashboard Overview</h2>
              
              {/* Statistics Row */}
              <div className="stats-grid">
                <div className="glass-panel stat-card">
                  <div className="stat-label">APPLICATIONS LOGGED</div>
                  <div className="stat-num">{applicationsList.length}</div>
                </div>
                <div className="glass-panel stat-card">
                  <div className="stat-label">BOOKMARKED ROLES</div>
                  <div className="stat-num">{savedJobsList.length}</div>
                </div>
                <div className="glass-panel stat-card">
                  <div className="stat-label">CLEARANCE STATUS</div>
                  <div className="stat-num" style={{ fontSize: '22px', paddingTop: '10px' }}>{profile.clearanceLevel}</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Recommended Jobs for You</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {recommendedJobs.map((job) => (
                    <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--panel-border)' }}>
                      <div>
                        <h4 style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                          <Link href={`/jobs/${job.slug}`}>{job.title}</Link>
                        </h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{job.companyName} &bull; 📍 {job.location}</span>
                      </div>
                      <span className={`tag-badge ${job.ir35Status === 'outside' ? 'tag-outside' : 'tag-inside'}`}>
                        {job.ir35Status === 'outside' ? 'Outside IR35' : 'Inside IR35'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IR35 COMPLIANCE ASSESSMENT CEST QUIZ */}
          {activeTab === 'assessment' && (
            <div className="fade-in">
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>IR35 Compliance Questionnaire</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                Determine your engagement status risk category using our interactive CEST-style compliance checker.
              </p>

              {!quizCompleted ? (
                <div className="glass-panel" style={{ padding: '32px' }}>
                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '4px', background: 'var(--panel-border)', borderRadius: '2px', marginBottom: '24px' }}>
                    <div style={{ width: `${((quizStep + 1) / quizQuestions.length) * 100}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '2px', transition: 'width 0.3s' }}></div>
                  </div>

                  <span className="tag-badge tag-clearance" style={{ marginBottom: '12px' }}>
                    {quizQuestions[quizStep].section} Pillar
                  </span>
                  
                  <h3 style={{ fontSize: '20px', fontFamily: 'var(--font-header)', marginBottom: '24px' }}>
                    {quizQuestions[quizStep].text}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {quizQuestions[quizStep].options.map((opt, idx) => (
                      <label 
                        key={idx} 
                        className="glass-panel" 
                        style={{
                          padding: '16px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                          borderColor: quizAnswers[quizQuestions[quizStep].id] === opt.val ? 'var(--color-primary)' : 'var(--panel-border)',
                          backgroundColor: quizAnswers[quizQuestions[quizStep].id] === opt.val ? 'var(--color-primary-glow)' : 'transparent'
                        }}
                      >
                        <input
                          type="radio"
                          name={`q_${quizQuestions[quizStep].id}`}
                          checked={quizAnswers[quizQuestions[quizStep].id] === opt.val}
                          onChange={() => handleSelectAnswer(quizQuestions[quizStep].id, opt.val)}
                          style={{ accentColor: 'var(--color-primary)' }}
                        />
                        <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                    <button 
                      onClick={handleNextQuiz} 
                      className="btn btn-primary"
                      disabled={!quizAnswers[quizQuestions[quizStep].id]}
                    >
                      {quizStep < quizQuestions.length - 1 ? 'Next Question' : 'View Scoring Report'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: '32px' }}>
                  <h3 style={{ fontSize: '22px', marginBottom: '16px' }}>Compliance Summary</h3>
                  
                  {/* Dynamic risk score visual */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', margin: '24px 0' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '8px solid var(--panel-border)', borderTopColor: quizScore < 35 ? 'var(--color-outside)' : quizScore < 65 ? 'var(--color-warning)' : 'var(--color-inside)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '800', fontSize: '24px' }}>
                      {quizScore}%
                    </div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        Employment Status Risk Score
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px', maxWidth: '400px' }}>
                        Lower percentages match Outside IR35 self-employment criteria. Higher percentages match Inside employment rules.
                      </p>
                    </div>
                  </div>

                  <div style={{ padding: '16px 20px', backgroundColor: 'var(--panel-bg)', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid ' + (quizScore < 35 ? 'var(--color-outside)' : quizScore < 65 ? 'var(--color-warning)' : 'var(--color-inside)'), fontSize: '14px', lineHeight: '1.5', color: 'var(--text-primary)' }}>
                    {quizResultText}
                  </div>

                  <div style={{ marginTop: '32px', display: 'flex', gap: '8px' }}>
                    <button onClick={resetQuiz} className="btn btn-secondary">
                      Restart Test
                    </button>
                    <button onClick={() => setActiveTab('calculator')} className="btn btn-primary">
                      Open Pay Calculator
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INSIDE VS OUTSIDE PAY CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="fade-in">
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Comparative Day Rate Calculator</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                Compare post-tax distributions for Outside IR35 (PSC) vs. Inside IR35 (Umbrella PAYE) using the HMRC 2025/2026 tax tables.
              </p>

              {/* Calculator settings panels */}
              <div className="glass-panel" style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="filter-group">
                  <label className="filter-title">Day Rate (£)</label>
                  <input 
                    type="number" 
                    value={calcDayRate} 
                    onChange={(e) => setCalcDayRate(Number(e.target.value))}
                    min="100"
                    max="3000"
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-title">Contract Days / Year</label>
                  <input 
                    type="number" 
                    value={calcDays} 
                    onChange={(e) => setCalcDays(Number(e.target.value))}
                    min="1"
                    max="365"
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-title">Outside expenses (£/yr)</label>
                  <input 
                    type="number" 
                    value={calcExpenses} 
                    onChange={(e) => setCalcExpenses(Number(e.target.value))}
                    min="0"
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-title">Pension Contribution (%)</label>
                  <input 
                    type="number" 
                    value={calcPension} 
                    onChange={(e) => setCalcPension(Number(e.target.value))}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* side-by-side Comparative Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                {/* Outside IR35 Card */}
                <div className="glass-panel" style={{ padding: '28px', borderLeft: '5px solid var(--color-outside)' }}>
                  <h3 style={{ fontSize: '18px', color: 'var(--color-outside)', marginBottom: '8px' }}>Outside IR35 (PSC)</h3>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    £{Math.round(taxData.outsideNet).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                    Annual Net Take-Home Pay ({Math.round((taxData.outsideNet / taxData.grossRevenue) * 100)}% of gross)
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Gross Billings:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>£{Math.round(taxData.grossRevenue).toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Expenses & Salary:</span>
                      <span>-£{Math.round(calcExpenses + taxData.outsideSalary).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Corporation Tax:</span>
                      <span>-£{Math.round(taxData.outsideCorpTax).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Personal Dividend Tax:</span>
                      <span>-£{Math.round(taxData.outsidePersonalTax).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Inside IR35 Card */}
                <div className="glass-panel" style={{ padding: '28px', borderLeft: '5px solid var(--color-inside)' }}>
                  <h3 style={{ fontSize: '18px', color: 'var(--color-inside)', marginBottom: '8px' }}>Inside IR35 (Umbrella)</h3>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    £{Math.round(taxData.insideNet).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                    Annual Net Take-Home Pay ({Math.round((taxData.insideNet / taxData.grossRevenue) * 100)}% of gross)
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Gross Billings:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>£{Math.round(taxData.grossRevenue).toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Employer NI (15%) & Levy:</span>
                      <span>-£{Math.round(taxData.insideEmployerNi + taxData.insideLevy).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Umbrella margin & Pension:</span>
                      <span>-£{Math.round(taxData.insideUmbrellaFee + (calcDayRate * calcDays * 0.05)).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Income Tax (PAYE) & NI:</span>
                      <span>-£{Math.round(taxData.insideTax + taxData.insideNi).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simple CSS-based comparison graph */}
              <div className="glass-panel" style={{ padding: '24px', marginTop: '32px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Take-Home Pay Comparison Graph</h3>
                <div style={{ display: 'flex', justifyContent: 'space-around', height: '140px', alignItems: 'flex-end', gap: '20px' }}>
                  <div style={{ width: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ height: `${(taxData.outsideNet / taxData.grossRevenue) * 100}px`, width: '100%', background: 'var(--color-outside)', borderRadius: 'var(--radius-sm)' }}></div>
                    <span style={{ fontSize: '12px', marginTop: '8px' }}>Outside IR35</span>
                  </div>
                  <div style={{ width: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ height: `${(taxData.insideNet / taxData.grossRevenue) * 100}px`, width: '100%', background: 'var(--color-inside)', borderRadius: 'var(--radius-sm)' }}></div>
                    <span style={{ fontSize: '12px', marginTop: '8px' }}>Inside IR35</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EDIT CANDIDATE PROFILE */}
          {activeTab === 'profile' && (
            <div className="fade-in">
              <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Candidate Profile</h2>
              
              {profileSaveSuccess && (
                <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-outside-glow)', border: '1px solid var(--color-outside)', borderRadius: 'var(--radius-sm)', color: 'var(--color-outside)', fontSize: '13px', marginBottom: '20px' }}>
                  ✓ Profile updated successfully!
                </div>
              )}

              <form onSubmit={handleProfileSave} className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="filter-group">
                    <label className="filter-title">Full Name</label>
                    <input 
                      type="text" 
                      value={profileName} 
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="filter-group">
                    <label className="filter-title">Professional Headline</label>
                    <input 
                      type="text" 
                      value={profileHeadline} 
                      onChange={(e) => setProfileHeadline(e.target.value)}
                      placeholder="e.g. Lead React Developer & UI Architect"
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <label className="filter-title">Bio Summary</label>
                  <textarea 
                    value={profileBio} 
                    onChange={(e) => setProfileBio(e.target.value)}
                    rows={4}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="filter-group">
                    <label className="filter-title">Location</label>
                    <input 
                      type="text" 
                      value={profileLocation} 
                      onChange={(e) => setProfileLocation(e.target.value)}
                    />
                  </div>
                  <div className="filter-group">
                    <label className="filter-title">Availability Status</label>
                    <select 
                      value={profileAvailability} 
                      onChange={(e: any) => setProfileAvailability(e.target.value)}
                    >
                      <option value="immediate">Available Immediately</option>
                      <option value="1_month">1 Month Notice</option>
                      <option value="not_available">Not Available</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="filter-group">
                    <label className="filter-title">LinkedIn Profile URL</label>
                    <input 
                      type="text" 
                      value={profileLinkedin} 
                      onChange={(e) => setProfileLinkedin(e.target.value)}
                    />
                  </div>
                  <div className="filter-group">
                    <label className="filter-title">Target Day Rate Min (£)</label>
                    <input 
                      type="number" 
                      value={profileMinRate} 
                      onChange={(e) => setProfileMinRate(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="filter-group">
                    <label className="filter-title">Security Clearance Level</label>
                    <select 
                      value={profileClearance} 
                      onChange={(e: any) => setProfileClearance(e.target.value)}
                    >
                      <option value="none">No Clearance</option>
                      <option value="BPSS">BPSS</option>
                      <option value="SC">SC Cleared</option>
                      <option value="DV">DV Cleared</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label className="filter-title">Upload CV / Resume (PDF, Doc, Docx)</label>
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const publicUrl = await db.uploadCV(file);
                            setCvFileName(publicUrl);
                            alert('CV uploaded successfully!');
                          } catch (err: any) {
                            alert('CV upload failed: ' + err.message);
                          }
                        }
                      }}
                      style={{ padding: '6px 0', border: 'none', background: 'none' }}
                    />
                    {cvFileName && (
                      <div style={{ marginTop: '8px', fontSize: '12px' }}>
                        Active CV: <a href={cvFileName} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>{cvFileName.split('/').pop()}</a>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: APPLIED JOBS */}
          {activeTab === 'applications' && (
            <div className="fade-in">
              <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Your Job Applications</h2>
              {applicationsList.length > 0 ? (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Hiring Entity</th>
                        <th>Applied On</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicationsList.map((app) => (
                        <tr key={app.id}>
                          <td><strong>{app.jobTitle}</strong></td>
                          <td>{app.companyName}</td>
                          <td>{new Date(app.createdAt).toLocaleDateString('en-GB')}</td>
                          <td>
                            <span className="tag-badge tag-clearance">
                              {app.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-secondary)' }}>You have not submitted any applications yet.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SAVED BOOKMARKS */}
          {activeTab === 'saved' && (
            <div className="fade-in">
              <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Bookmarked Contracts</h2>
              {savedJobsList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {savedJobsList.map((job) => (
                    <div key={job.id} className="glass-panel job-card">
                      <div className="job-card-header">
                        <div>
                          <h3 className="job-title">
                            <Link href={`/jobs/${job.slug}`}>{job.title}</Link>
                          </h3>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{job.companyName} &bull; 📍 {job.location}</span>
                        </div>
                        <span className={`tag-badge ${job.ir35Status === 'outside' ? 'tag-outside' : 'tag-inside'}`}>
                          {job.ir35Status === 'outside' ? 'Outside IR35' : 'Inside IR35'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-secondary)' }}>You have no bookmarked roles.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: GDPR SETTINGS */}
          {activeTab === 'compliance' && (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* GDPR Info Box */}
              <div className="glass-panel" style={{ padding: '32px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>GDPR Consent Registry (UK GDPR / KDPA)</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
                  Under compliance regulations, we maintain explicit consent records detailing when permissions were granted. Your CV documents are stored in secure buckets and accesses are logged.
                </p>

                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Consent Type</th>
                        <th>Status</th>
                        <th>Logged IP</th>
                        <th>Recorded Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profile.consent.map((con, idx) => (
                        <tr key={idx}>
                          <td><strong>{con.type.replace(/_/g, ' ').toUpperCase()}</strong></td>
                          <td><span className="tag-badge tag-outside">Granted</span></td>
                          <td>{con.ip}</td>
                          <td>{new Date(con.date).toLocaleString('en-GB')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Data Rights Panel */}
              <div className="glass-panel" style={{ padding: '32px', borderLeft: '4px solid var(--color-inside)' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>GDPR Right to Be Forgotten & Access</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', marginBottom: '24px' }}>
                  You have the right to request a complete export of your user data records or to delete all profile databases and CV documents.
                </p>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <a 
                    href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(profile))}`} 
                    download="GDPR_OutsideIR35_Data_Export.json"
                    className="btn btn-secondary btn-sm"
                  >
                    📥 Export All Data (JSON)
                  </a>
                  <button onClick={handleDeleteAccount} className="btn btn-secondary btn-sm" style={{ color: 'var(--color-inside)', borderColor: 'rgba(239,68,68,0.3)' }}>
                    🗑️ Request Account Deletion
                  </button>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
