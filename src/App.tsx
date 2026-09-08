import React, { useState } from 'react';
import { UserRole } from './types';
import { Header } from './components/layout/Header';
import { PatientMobileApp } from './components/patient/PatientMobileApp';
import { DesktopAuthoritativePortal } from './components/portal/DesktopAuthoritativePortal';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('patient');
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  // If a user selects a professional or admin role, automatically switch to authoritative portal view
  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (newRole !== 'patient') {
      setViewMode('desktop');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased">
      {/* Top Authoritative Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Experience Body */}
      <main className="flex-1 py-6">
        {viewMode === 'mobile' ? (
          <div className="max-w-md mx-auto px-4">
            <div className="text-center mb-3">
              <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-2xs">
                <span>Patient Mobile Experience (with Camera & OCR)</span>
              </span>
            </div>
            <PatientMobileApp />
          </div>
        ) : (
          <DesktopAuthoritativePortal
            activeRole={currentRole}
            onSelectRole={handleRoleChange}
          />
        )}
      </main>

      {/* Footer with Compliance & Version Notice */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>AltMedi Nashik Pilot</strong> • Version 1.0 (PRD Compliant)
          </div>
          <div className="text-slate-400 text-[11px]">
            Tenant: Nashik Central Healthcare Network • Data isolation & audit logging active
          </div>
        </div>
      </footer>
    </div>
  );
}
