import React from 'react';
import { UserRole } from '../../types';
import {
  Pill,
  ShieldCheck,
  Smartphone,
  Monitor,
  Building2,
  Stethoscope,
  Store,
  Settings,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  viewMode: 'mobile' | 'desktop';
  onViewModeChange: (mode: 'mobile' | 'desktop') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Context */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-600 text-white shadow-sm">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Alt<span className="text-teal-600">Medi</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Nashik Pilot v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Medicine Alternative, Safety & Price Comparison
              </p>
            </div>
          </div>

          {/* Tenant & Safety Note */}
          <div className="hidden lg:flex items-center space-x-3 text-xs text-slate-600 border-x border-slate-200 px-4">
            <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-medium text-slate-700">Tenant:</span>
              <span className="font-semibold text-teal-700">Nashik Central Network</span>
              <span className="text-slate-400">#NK-4201</span>
            </div>
            <div className="flex items-center space-x-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Clinical Decision Support</span>
            </div>
          </div>

          {/* Controls: View Mode & Role Switcher */}
          <div className="flex items-center space-x-3">
            {/* View Mode Switcher */}
            <div className="inline-flex rounded-lg p-1 bg-slate-100 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => onViewModeChange('mobile')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'mobile'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Mobile Patient View (with Camera & OCR)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Patient Mobile</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('desktop')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'desktop'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Authoritative Desktop & Professional Portals"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Authoritative Portal</span>
              </button>
            </div>

            {/* Role Switcher */}
            <div className="relative">
              <label htmlFor="role-select" className="sr-only">
                Select Active Role
              </label>
              <div className="flex items-center bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs">
                <span className="text-slate-500 mr-1.5 font-medium hidden md:inline">Role:</span>
                <select
                  id="role-select"
                  value={currentRole}
                  onChange={(e) => onRoleChange(e.target.value as UserRole)}
                  className="bg-transparent text-slate-800 font-semibold focus:outline-hidden cursor-pointer"
                >
                  <option value="patient">Patient / Caregiver</option>
                  <option value="pharmacist">Pharmacist (Review Queue)</option>
                  <option value="doctor">Doctor / Prescriber</option>
                  <option value="vendor">Vendor / Pharmacy</option>
                  <option value="organization">Hospital / Clinic</option>
                  <option value="tenant_admin">Tenant Admin</option>
                  <option value="platform_admin">AltMedi Platform Admin</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-1 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Safety Banner */}
      <div className="bg-amber-50 border-t border-amber-200/60 px-4 py-1.5 text-center text-xs text-amber-900 font-medium">
        <span className="font-semibold">Clinical Boundary Notice:</span> AltMedi assists with medicine comparison and affordability. It is not an autonomous prescriber. Any alternative or substitution must be confirmed with your doctor or pharmacist.
      </div>
    </header>
  );
};
