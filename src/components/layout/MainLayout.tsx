'use client';

import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import StickyRadioPlayer from '../radio/StickyRadioPlayer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex pt-16">
        <Sidebar isOpen={sidebarOpen} />

        <main className={`flex-1 transition-all duration-300 pb-24 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          {children}
        </main>
      </div>

      {/* Player radio sticky */}
      <StickyRadioPlayer />
    </div>
  );
}