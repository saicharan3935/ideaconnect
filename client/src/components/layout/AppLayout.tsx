import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';
import { QuickActionModal } from './QuickActionModal';
import { AIAssistantModal } from '../ai/AIAssistantModal';

export const AppLayout: React.FC = () => {
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1220] text-slate-100 selection:bg-purple-600/30">
      {/* Top Navbar */}
      <Navbar onOpenQuickAction={() => setQuickActionOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <MobileNav onOpenQuickAction={() => setQuickActionOpen(true)} />

      {/* Quick Action Modal for + button */}
      <QuickActionModal
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
      />

      {/* Global AI Assistant Floating Co-Pilot */}
      <AIAssistantModal />
    </div>
  );
};
