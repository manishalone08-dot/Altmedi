import React, { useState } from 'react';
import { UserRole, AuthUser } from './types';
import { Header } from './components/layout/Header';
import { PatientMobileApp } from './components/patient/PatientMobileApp';
import { DesktopAuthoritativePortal } from './components/portal/DesktopAuthoritativePortal';
import { AuthScreen } from './components/auth/AuthScreen';
import { getStoredAuthUser, logoutUser, DEMO_USERS } from './services/authService';
import { LogIn, UserPlus, ShieldCheck, User } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredAuthUser() || DEMO_USERS.patient);
  const [currentRole, setCurrentRole] = useState<UserRole>(() => currentUser?.role || 'patient');
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // If a user selects a professional or admin role, automatically switch to authoritative portal view
  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (newRole !== 'patient') {
      setViewMode('desktop');
    }
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    if (user.role !== 'patient') {
      setViewMode('desktop');
    } else {
      setViewMode('mobile');
    }
    setShowAuthModal(false);
  };

  const handleSignOut = () => {
    logoutUser();
    setCurrentUser(null);
    setCurrentRole('patient');
    setViewMode('mobile');
    setAuthModalMode('login');
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased">
      {/* Top Authoritative Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
      />

      {/* Guest Mode or Session Banner */}
      {!currentUser ? (
        <div className="bg-teal-900 text-white py-2 px-4 shadow-xs text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-teal-300 shrink-0" />
              <span>
                Exploring as <strong>Guest</strong>. Sign in or create an account to save prescriptions, track pharmacy reservations, and request clinical reviews.
              </span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                id="banner-btn-signin"
                onClick={() => handleOpenAuth('login')}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-teal-800 hover:bg-teal-700 text-white font-semibold transition-colors cursor-pointer border border-teal-600"
              >
                <LogIn className="w-3 h-3" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                id="banner-btn-register"
                onClick={() => handleOpenAuth('register')}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-white text-teal-900 hover:bg-teal-50 font-semibold transition-colors cursor-pointer"
              >
                <UserPlus className="w-3 h-3" />
                <span>Create Account</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-200/70 border-b border-slate-300/60 py-1 px-4 text-[11px] text-slate-600">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 inline-block" />
              <span>
                Logged in as <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.role.replace('_', ' ')})
              </span>
              {currentUser.organization && (
                <span className="text-slate-500 hidden sm:inline">• {currentUser.organization}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleOpenAuth('login')}
              className="text-teal-700 hover:text-teal-900 font-semibold hover:underline flex items-center space-x-1"
            >
              <User className="w-3 h-3" />
              <span>Switch User / Register</span>
            </button>
          </div>
        </div>
      )}

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

      {/* Login & Registration Screen Modal */}
      {showAuthModal && (
        <AuthScreen
          isOpen={showAuthModal}
          initialMode={authModalMode}
          initialRole={currentRole}
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
          onContinueAsGuest={() => setShowAuthModal(false)}
        />
      )}

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
