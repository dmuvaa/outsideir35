import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCompaniesServer } from '@/lib/server-data';
import CompaniesDirectory from './CompaniesDirectory';

export const metadata: Metadata = {
  title: 'Companies hiring contractors | OutsideIR35',
  description: 'Browse companies and agencies posting UK contract roles. IR35 status is listed on every job.',
};

export default async function CompaniesPage() {
  const companies = await getCompaniesServer();
  return <CompaniesDirectory companies={companies} />;
}
