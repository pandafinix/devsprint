import React from 'react';
import { Navbar } from '../components/ui/Navbar';
import { MasterDashboard } from '../components/master/MasterDashboard';

const MasterDashboardPage: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col">
    <Navbar />
    <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
      <MasterDashboard />
    </main>
  </div>
);

export default MasterDashboardPage;