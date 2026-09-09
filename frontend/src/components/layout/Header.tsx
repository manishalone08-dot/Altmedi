import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserRole, AuthUser } from '../../types';
import {
  Pill,
  ShieldCheck,
  Smartphone,
  Monitor,
  Building2,
  Stethoscope,
  Store,
  Settings,
  ChevronDown,
  User,
  LogIn,
  LogOut,
  Sparkles,
  CheckCircle2,
  Globe
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  viewMode: 'mobile' | 'desktop';
  onViewModeChange: (mode: 'mobile' | 'desktop') => void;
  currentUser?: AuthUser | null;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  viewMode,
  onViewModeChange,
  currentUser,
  onOpenAuth,
  onSignOut
}) => {
  const { t, i18n } = useTranslation();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setShowLangDropdown(false);
  };

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
                  {t('app.version')}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {t('app.tagline')}
              </p>
            </div>
          </div>

          {/* Tenant & Safety Note */}
          <div className="hidden lg:flex items-center space-x-3 text-xs text-slate-600 border-x border-slate-200 px-4">
            <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-medium text-slate-700">{t('auth.tenant')}:</span>
              <span className="font-semibold text-teal-700">{t('app.tenant')}</span>
              <span className="text-slate-400">#NK-4201</span>
            </div>
            <div className="flex items-center space-x-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t('app.clinicalSupport')}</span>
            </div>
          </div>

          {/* Controls: View Mode, Language, Role Switcher & Auth */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Picker Dropdown */}
            <div className="relative">
              <button
                type="button"
                id="header-language-picker"
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 hover:border-teal-500 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
                title={t('language.label')}
              >
                <Globe className="w-3.5 h-3.5 text-teal-600" />
                <span>
                  {i18n.language?.startsWith('mr')
                    ? 'मराठी'
                    : i18n.language?.startsWith('hi')
                    ? 'हिन्दी'
                    : 'EN'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangDropdown && (
                <div
                  id="header-lang-menu"
                  className="absolute right-0 sm:left-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95"
                >
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('en')}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-teal-50 hover:text-teal-800 flex items-center justify-between ${
                      i18n.language === 'en' ? 'text-teal-700 font-bold bg-teal-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>English</span>
                    {i18n.language === 'en' && <CheckCircle2 className="w-3 h-3 text-teal-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('mr')}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-teal-50 hover:text-teal-800 flex items-center justify-between ${
                      i18n.language === 'mr' ? 'text-teal-700 font-bold bg-teal-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>मराठी (Marathi)</span>
                    {i18n.language === 'mr' && <CheckCircle2 className="w-3 h-3 text-teal-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('hi')}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-teal-50 hover:text-teal-800 flex items-center justify-between ${
                      i18n.language === 'hi' ? 'text-teal-700 font-bold bg-teal-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>हिन्दी (Hindi)</span>
                    {i18n.language === 'hi' && <CheckCircle2 className="w-3 h-3 text-teal-600" />}
                  </button>
                </div>
              )}
            </div>

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
                title={t('nav.patientMobileTitle')}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('nav.patientMobile')}</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('desktop')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'desktop'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={t('nav.authoritativePortalTitle')}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('nav.authoritativePortal')}</span>
              </button>
            </div>

            {/* Role Switcher */}
            <div className="relative">
              <label htmlFor="role-select" className="sr-only">
                {t('nav.role')}
              </label>
              <div className="flex items-center bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs">
                <span className="text-slate-500 mr-1.5 font-medium hidden md:inline">{t('nav.role')}:</span>
                <select
                  id="role-select"
                  value={currentRole}
                  onChange={(e) => onRoleChange(e.target.value as UserRole)}
                  className="bg-transparent text-slate-800 font-semibold focus:outline-hidden cursor-pointer"
                >
                  <option value="patient">{t('nav.rolePatient')}</option>
                  <option value="pharmacist">{t('nav.rolePharmacist')}</option>
                  <option value="doctor">{t('nav.roleDoctor')}</option>
                  <option value="vendor">{t('nav.roleVendor')}</option>
                  <option value="organization">{t('nav.roleOrganization')}</option>
                  <option value="tenant_admin">{t('nav.roleTenantAdmin')}</option>
                  <option value="platform_admin">{t('nav.rolePlatformAdmin')}</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-1 pointer-events-none" />
              </div>
            </div>

            {/* User Authentication Status & Profile */}
            <div className="relative">
              {currentUser ? (
                <div className="relative">
                  <button
                    type="button"
                    id="header-btn-user-profile"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-2 p-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 hover:border-teal-400 bg-white hover:bg-slate-50 transition-all text-left shadow-2xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="hidden md:block max-w-[110px] truncate">
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] text-teal-700 capitalize leading-none">
                        {currentUser.role.replace('_', ' ')}
                      </div>
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserDropdown && (
                    <div
                      id="header-user-dropdown"
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95"
                    >
                      <div className="px-3.5 py-2 border-b border-slate-100">
                        <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                        <div className="mt-1 flex items-center space-x-1.5">
                          <span className="text-[10px] font-semibold bg-teal-50 text-teal-800 px-1.5 py-0.5 rounded border border-teal-200 capitalize">
                            {currentUser.role.replace('_', ' ')}
                          </span>
                          {currentUser.licenseNumber && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              {currentUser.licenseNumber}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="px-3.5 py-2 text-[11px] text-slate-600 space-y-1">
                        <div>
                          <strong>{t('auth.tenant')}:</strong> {currentUser.tenantName}
                        </div>
                        {currentUser.area && (
                          <div>
                            <strong>{t('auth.area')}:</strong> {currentUser.area}
                          </div>
                        )}
                        {currentUser.abhaId && (
                          <div>
                            <strong>{t('auth.abha')}:</strong> {currentUser.abhaId}
                          </div>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100 px-2 space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserDropdown(false);
                            onOpenAuth?.('login');
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
                        >
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>{t('auth.switchAccount')}</span>
                        </button>
                        <button
                          type="button"
                          id="header-btn-logout"
                          onClick={() => {
                            setShowUserDropdown(false);
                            onSignOut?.();
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 font-semibold"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>{t('auth.signOut')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  id="header-btn-signin"
                  onClick={() => onOpenAuth?.('login')}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('auth.signInRegister')}</span>
                  <span className="sm:hidden">{t('auth.login')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Safety Banner */}
      <div className="bg-amber-50 border-t border-amber-200/60 px-4 py-1.5 text-center text-xs text-amber-900 font-medium">
        <span className="font-semibold">{t('app.clinicalBoundaryLabel')}</span> {t('app.clinicalBoundary')}
      </div>
    </header>
  );
};
