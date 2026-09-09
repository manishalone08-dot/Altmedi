import React, { useState } from 'react';
import { UserRole, AuthUser } from '../../types';
import {
  DEMO_USERS,
  loginWithCredentials,
  loginWithDemoUser,
  registerNewUser,
  RegistrationFormData
} from '../../services/authService';
import {
  Pill,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  Eye,
  EyeOff,
  User,
  Building2,
  Stethoscope,
  Store,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  X,
  FileCheck,
  ShieldAlert,
  Loader2,
  Check
} from 'lucide-react';

export interface AuthScreenProps {
  isOpen?: boolean;
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
  onSuccess: (user: AuthUser) => void;
  onClose?: () => void;
  onContinueAsGuest?: () => void;
}

const NASHIK_AREAS = [
  'College Road, Nashik',
  'Canada Corner, Nashik',
  'Nashik Road (Station Area)',
  'Panchavati Karanja, Nashik',
  'Gangapur Road, Nashik',
  'Indira Nagar, Nashik',
  'Govind Nagar, Nashik',
  'Satpur MIDC, Nashik'
];

const COMMON_ALLERGIES = [
  'Penicillin / Amoxicillin',
  'Sulfa Antibiotics',
  'Aspirin / NSAIDs',
  'Cephalosporins',
  'Macrolides (Azithromycin)',
  'Codeine / Opioids'
];

export const AuthScreen: React.FC<AuthScreenProps> = ({
  isOpen = true,
  initialMode = 'login',
  initialRole = 'patient',
  onSuccess,
  onClose,
  onContinueAsGuest
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [authMethod, setAuthMethod] = useState<'email' | 'otp'>('email');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regArea, setRegArea] = useState(NASHIK_AREAS[0]);
  const [regAbhaId, setRegAbhaId] = useState('');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [regLicense, setRegLicense] = useState('');
  const [regOrg, setRegOrg] = useState('');
  const [regSpeciality, setRegSpeciality] = useState('General Medicine');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  if (!isOpen) return null;

  const handleToggleAllergy = (allergy: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your email or 10-digit mobile number.');
      return;
    }

    if (authMethod === 'email' && !loginPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (authMethod === 'otp' && !loginOtp) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await loginWithCredentials(
        loginIdentifier,
        authMethod === 'email' ? loginPassword : loginOtp,
        selectedRole
      );
      onSuccess(user);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = () => {
    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your 10-digit phone number first.');
      return;
    }
    setOtpSent(true);
    setLoginOtp('420188'); // Auto-fill demo OTP for convenience
    setErrorMessage(null);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!regPhone.trim() || regPhone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please accept the Clinical Decision Support Terms & Data Privacy Policy.');
      return;
    }

    // Role-specific validations
    if ((selectedRole === 'pharmacist' || selectedRole === 'doctor') && !regLicense.trim()) {
      setErrorMessage(
        selectedRole === 'pharmacist'
          ? 'State Pharmacy Council Registration No. is required for pharmacists.'
          : 'State Medical Council Registration No. is required for doctors.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const payload: RegistrationFormData = {
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
        role: selectedRole,
        area: regArea,
        abhaId: regAbhaId,
        knownAllergies: selectedAllergies,
        licenseNumber: regLicense,
        organization: regOrg,
        speciality: regSpeciality
      };

      const user = await registerNewUser(payload);
      onSuccess(user);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async (role: UserRole) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await loginWithDemoUser(role);
      onSuccess(user);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div
        id="auth-dialog-card"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-4 sm:my-8 transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Header & Brand Bar */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white p-5 sm:p-6 relative">
          {onClose && (
            <button
              type="button"
              id="btn-close-auth"
              onClick={onClose}
              className="absolute top-4 right-4 text-teal-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close authentication window"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white text-teal-700 flex items-center justify-center shadow-md shrink-0">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  Alt<span className="text-teal-300">Medi</span>
                </span>
                <span className="text-[10px] font-semibold bg-white/20 text-teal-100 px-2 py-0.5 rounded border border-white/20">
                  Nashik Pilot Network
                </span>
              </div>
              <p className="text-xs text-teal-100/90 mt-0.5">
                Clinical Medicine Decision Support & Cost Affordability Platform
              </p>
            </div>
          </div>

          {/* Segmented Mode Selector (Sign In vs Create Account) */}
          <div className="mt-5 grid grid-cols-2 p-1 bg-teal-950/40 rounded-xl border border-white/10 text-xs font-semibold">
            <button
              type="button"
              id="tab-auth-login"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all text-center ${
                mode === 'login'
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'text-teal-200 hover:text-white'
              }`}
            >
              Sign In to Account
            </button>
            <button
              type="button"
              id="tab-auth-register"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-lg transition-all text-center ${
                mode === 'register'
                  ? 'bg-white text-teal-900 shadow-sm'
                  : 'text-teal-200 hover:text-white'
              }`}
            >
              Create New Account
            </button>
          </div>
        </div>

        {/* Form Body Container */}
        <div className="p-5 sm:p-6 space-y-5">
          {errorMessage && (
            <div
              id="auth-error-alert"
              className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 text-xs flex items-start space-x-2.5 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* ======================= LOGIN VIEW ======================= */}
          {mode === 'login' && (
            <div className="space-y-5">
              {/* Quick Persona Demo Sign-In Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>Quick Demo Sign-In (1-Click Roles)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Pre-loaded pilot access</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    id="demo-login-patient"
                    onClick={() => handleDemoSignIn('patient')}
                    disabled={isLoading}
                    className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left text-xs transition-all group disabled:opacity-50 cursor-pointer shadow-2xs"
                  >
                    <div className="w-7 h-7 rounded-md bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-semibold text-slate-900 truncate text-[11px]">Rahul Deshmukh</div>
                      <div className="text-[10px] text-slate-500 truncate">Patient / Caregiver</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    id="demo-login-pharmacist"
                    onClick={() => handleDemoSignIn('pharmacist')}
                    disabled={isLoading}
                    className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left text-xs transition-all group disabled:opacity-50 cursor-pointer shadow-2xs"
                  >
                    <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Pill className="w-3.5 h-3.5" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-semibold text-slate-900 truncate text-[11px]">Pharm. S. Patil</div>
                      <div className="text-[10px] text-slate-500 truncate">Licensed Pharmacist</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    id="demo-login-doctor"
                    onClick={() => handleDemoSignIn('doctor')}
                    disabled={isLoading}
                    className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left text-xs transition-all group disabled:opacity-50 cursor-pointer shadow-2xs"
                  >
                    <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Stethoscope className="w-3.5 h-3.5" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-semibold text-slate-900 truncate text-[11px]">Dr. A. Kulkarni</div>
                      <div className="text-[10px] text-slate-500 truncate">Doctor / MD</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    id="demo-login-vendor"
                    onClick={() => handleDemoSignIn('vendor')}
                    disabled={isLoading}
                    className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left text-xs transition-all group disabled:opacity-50 cursor-pointer shadow-2xs"
                  >
                    <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <Store className="w-3.5 h-3.5" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-semibold text-slate-900 truncate text-[11px]">Rajesh Jain</div>
                      <div className="text-[10px] text-slate-500 truncate">Chemist Vendor</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    id="demo-login-tenant-admin"
                    onClick={() => handleDemoSignIn('tenant_admin')}
                    disabled={isLoading}
                    className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left text-xs transition-all group disabled:opacity-50 cursor-pointer shadow-2xs col-span-2 sm:col-span-2"
                  >
                    <div className="w-7 h-7 rounded-md bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-semibold text-slate-900 truncate text-[11px]">Dr. Vikram Joshi</div>
                      <div className="text-[10px] text-slate-500 truncate">Tenant Admin (Nashik Central Health)</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-slate-200" />
                <span className="px-3 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  or sign in with credentials
                </span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              {/* Method Switcher: Email vs Mobile OTP */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  id="btn-login-method-email"
                  onClick={() => setAuthMethod('email')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center space-x-1.5 ${
                    authMethod === 'email'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email & Password</span>
                </button>
                <button
                  type="button"
                  id="btn-login-method-otp"
                  onClick={() => setAuthMethod('otp')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center space-x-1.5 ${
                    authMethod === 'otp'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Mobile OTP (+91)</span>
                </button>
              </div>

              {/* Standard Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label
                    htmlFor="input-login-id"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    {authMethod === 'email' ? 'Email Address / Mobile Number' : '10-Digit Mobile Number'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      {authMethod === 'email' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                    </div>
                    <input
                      id="input-login-id"
                      type={authMethod === 'email' ? 'text' : 'tel'}
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder={
                        authMethod === 'email'
                          ? 'e.g. rahul.deshmukh@gmail.com'
                          : 'e.g. 9822014589'
                      }
                      required
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
                    />
                  </div>
                </div>

                {authMethod === 'email' ? (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="input-login-pwd"
                        className="block text-xs font-semibold text-slate-700"
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier('rahul.deshmukh@gmail.com');
                          setLoginPassword('AltMedi@2026');
                        }}
                        className="text-[11px] text-teal-700 hover:underline"
                      >
                        Fill sample password
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="input-login-pwd"
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full pl-9 pr-10 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="input-login-otp"
                        className="block text-xs font-semibold text-slate-700"
                      >
                        One-Time Passcode (OTP)
                      </label>
                      {!otpSent ? (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-[11px] font-semibold text-teal-700 hover:text-teal-800"
                        >
                          Request SMS Code
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-medium flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Code sent (Mock: 420188)</span>
                        </span>
                      )}
                    </div>
                    <input
                      id="input-login-otp"
                      type="text"
                      maxLength={6}
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 tracking-widest font-mono text-center focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-2xs"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span>Keep me signed in</span>
                  </label>
                  <span className="text-slate-400 text-[11px]">Protected by 256-bit TLS</span>
                </div>

                <button
                  type="submit"
                  id="btn-submit-login"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to AltMedi</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Guest option */}
              {onContinueAsGuest && (
                <div className="pt-2 text-center border-t border-slate-100">
                  <button
                    type="button"
                    id="btn-continue-guest"
                    onClick={onContinueAsGuest}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium inline-flex items-center space-x-1"
                  >
                    <span>Or continue as Guest Patient (Instant OCR & Compare)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ===================== REGISTRATION VIEW ===================== */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Step 1: Account Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Select Your Account Role / Profile
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('patient')}
                    className={`p-2.5 rounded-xl border text-left transition-all relative ${
                      selectedRole === 'patient'
                        ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-600/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {selectedRole === 'patient' && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                    <User className="w-4 h-4 text-teal-700 mb-1" />
                    <div className="text-xs font-bold text-slate-900">Patient / Family</div>
                    <div className="text-[10px] text-slate-500">Savings & Safety</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('pharmacist')}
                    className={`p-2.5 rounded-xl border text-left transition-all relative ${
                      selectedRole === 'pharmacist'
                        ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {selectedRole === 'pharmacist' && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                    <Pill className="w-4 h-4 text-emerald-700 mb-1" />
                    <div className="text-xs font-bold text-slate-900">Pharmacist</div>
                    <div className="text-[10px] text-slate-500">Review Queue</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('doctor')}
                    className={`p-2.5 rounded-xl border text-left transition-all relative ${
                      selectedRole === 'doctor'
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {selectedRole === 'doctor' && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                    <Stethoscope className="w-4 h-4 text-blue-700 mb-1" />
                    <div className="text-xs font-bold text-slate-900">Doctor / MD</div>
                    <div className="text-[10px] text-slate-500">Prescriptions</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('vendor')}
                    className={`p-2.5 rounded-xl border text-left transition-all relative ${
                      selectedRole === 'vendor'
                        ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-600/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {selectedRole === 'vendor' && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                    <Store className="w-4 h-4 text-amber-700 mb-1" />
                    <div className="text-xs font-bold text-slate-900">Chemist / Vendor</div>
                    <div className="text-[10px] text-slate-500">Stock & Pricing</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('organization')}
                    className={`p-2.5 rounded-xl border text-left transition-all relative col-span-2 sm:col-span-2 ${
                      selectedRole === 'organization'
                        ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-600/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {selectedRole === 'organization' && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                    <Building2 className="w-4 h-4 text-purple-700 mb-1" />
                    <div className="text-xs font-bold text-slate-900">Hospital / Clinic Organization</div>
                    <div className="text-[10px] text-slate-500">Multi-facility network administration</div>
                  </button>
                </div>
              </div>

              {/* Step 2: Personal & Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Ramesh K. Joshi"
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@domain.com"
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label htmlFor="reg-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Phone (+91)
                  </label>
                  <input
                    id="reg-phone"
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="10-digit number"
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 mb-1">
                    Create Password
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Step 3: Nashik Area Selection */}
              <div>
                <label htmlFor="reg-area" className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Location / Nashik Zone
                </label>
                <select
                  id="reg-area"
                  value={regArea}
                  onChange={(e) => setRegArea(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden cursor-pointer"
                >
                  {NASHIK_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 4: Role-Specific Medical & Professional Credentials */}
              {selectedRole === 'patient' && (
                <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-teal-900">
                    <ShieldAlert className="w-4 h-4 text-teal-700" />
                    <span>Patient Health & Safety Profile (Optional)</span>
                  </div>

                  <div>
                    <label htmlFor="reg-abha" className="block text-[11px] font-semibold text-slate-700 mb-1">
                      ABHA ID (Ayushman Bharat Health Account)
                    </label>
                    <input
                      id="reg-abha"
                      type="text"
                      value={regAbhaId}
                      onChange={(e) => setRegAbhaId(e.target.value)}
                      placeholder="e.g. 91-4521-9082-1140"
                      className="w-full px-3 py-1.5 bg-white border border-teal-300 rounded-lg text-xs placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                      Known Drug Allergies / Intolerances (For cross-reactivity warnings)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_ALLERGIES.map((allergy) => {
                        const isSelected = selectedAllergies.includes(allergy);
                        return (
                          <button
                            type="button"
                            key={allergy}
                            onClick={() => handleToggleAllergy(allergy)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold border transition-all ${
                              isSelected
                                ? 'bg-rose-100 text-rose-800 border-rose-300 ring-1 ring-rose-400'
                                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {allergy}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {selectedRole === 'pharmacist' && (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900">
                    <FileCheck className="w-4 h-4 text-emerald-700" />
                    <span>Pharmacy Council Verification Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label htmlFor="reg-pharm-lic" className="block text-[11px] font-semibold text-slate-700 mb-1">
                        State Pharmacy Council Reg. No. *
                      </label>
                      <input
                        id="reg-pharm-lic"
                        type="text"
                        value={regLicense}
                        onChange={(e) => setRegLicense(e.target.value)}
                        placeholder="e.g. MH-PH-84920"
                        required
                        className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-pharm-org" className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Affiliated Chemist / Pharmacy Name
                      </label>
                      <input
                        id="reg-pharm-org"
                        type="text"
                        value={regOrg}
                        onChange={(e) => setRegOrg(e.target.value)}
                        placeholder="e.g. Nashik Medicos & Surgicals"
                        className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedRole === 'doctor' && (
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-900">
                    <Stethoscope className="w-4 h-4 text-blue-700" />
                    <span>Medical Council Prescriber Credentials</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label htmlFor="reg-doc-lic" className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Medical Council Reg. No. (MMC/NMC) *
                      </label>
                      <input
                        id="reg-doc-lic"
                        type="text"
                        value={regLicense}
                        onChange={(e) => setRegLicense(e.target.value)}
                        placeholder="e.g. MMC-2014/05/1829"
                        required
                        className="w-full px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-doc-spec" className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Clinical Speciality
                      </label>
                      <input
                        id="reg-doc-spec"
                        type="text"
                        value={regSpeciality}
                        onChange={(e) => setRegSpeciality(e.target.value)}
                        placeholder="e.g. Internal Medicine"
                        className="w-full px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedRole === 'vendor' && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900">
                    <Store className="w-4 h-4 text-amber-700" />
                    <span>Pharmacy / Vendor Commercial Licensing</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label htmlFor="reg-vend-lic" className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Drug License No. (Form 20B/21B)
                      </label>
                      <input
                        id="reg-vend-lic"
                        type="text"
                        value={regLicense}
                        onChange={(e) => setRegLicense(e.target.value)}
                        placeholder="e.g. 20B/21B-NK-77412"
                        className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-vend-org" className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Store / Pharmacy Trade Name
                      </label>
                      <input
                        id="reg-vend-org"
                        type="text"
                        value={regOrg}
                        onChange={(e) => setRegOrg(e.target.value)}
                        placeholder="e.g. Lifeline Pharmacy Hub"
                        className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Terms & Consent Checkbox */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-start space-x-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    required
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 mt-0.5"
                  />
                  <span className="leading-relaxed text-[11px]">
                    I agree to the <strong className="text-slate-800">AltMedi Clinical Support Terms</strong> and acknowledge that all medicine alternatives and safety insights are advisory and require practitioner confirmation.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                id="btn-submit-register"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-semibold text-xs transition-colors shadow-sm flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Create AltMedi Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center text-xs text-slate-500 pt-1">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-semibold text-teal-700 hover:underline"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
