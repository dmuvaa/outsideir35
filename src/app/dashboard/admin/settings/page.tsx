import React from 'react';
import { redirect } from 'next/navigation';

export default function AdminSettingsPage() {
  redirect('/dashboard/admin');
}
