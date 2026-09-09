import React, { useState } from 'react';
import { ABDMFacilityRecord, ABDMDoctorRecord } from '../../types';
import {
  ShieldCheck,
  Building2,
  Stethoscope,
  UserCheck,
  FileCheck2,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Award
} from 'lucide-react';

export const ABDMIntegrationPanel: React.FC = () => {
  // Facility HFR lookup state
  const [facilityId, setFacilityId] = useState<string>('HFR-MH-4201');
  const [facilityResult, setFacilityResult] = useState<ABDMFacilityRecord | null>({
    hfrId: 'HFR-MH-4201',
    facilityName: 'Nashik District Civil Hospital & Affiliates',
    facilityType: 'District Hospital / Teaching Facility',
    state: 'Maharashtra',
    district: 'Nashik',
    systemOfMedicine: 'Allopathy',
    status: 'verified'
  });

  // Doctor HPR / NMR lookup state
  const [doctorReg, setDoctorReg] = useState<string>('MMC-2018-8472');
  const [doctorResult, setDoctorResult] = useState<ABDMDoctorRecord | null>({
    hprId: '91-8472-3920-11',
    practitionerName: 'Dr. Rajesh Deshmukh',
    registrationNumber: 'MMC-2018-8472',
    stateCouncil: 'Maharashtra Medical Council (MMC)',
    speciality: 'Internal Medicine / Pulmonology',
    nmrVerified: true
  });

  // ABHA validation state
  const [abhaInput, setAbhaInput] = useState<string>('91-4421-9984-3321');
  const [abhaResult, setAbhaResult] = useState<any>({
    isValid: true,
    abhaAddress: 'patient.care@abdm',
    abhaNumber: '91-4421-9984-3321'
  });

  // Consent generation state
  const [consentSuccess, setConsentSuccess] = useState<any>(null);

  const handleLookupFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/abdm/facility/${encodeURIComponent(facilityId)}`);
      if (res.ok) {
        const data = await res.json();
        setFacilityResult(data);
      }
    } catch (err) {
      console.error('Facility lookup error:', err);
    }
  };

  const handleVerifyDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/abdm/verify-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationNumber: doctorReg, stateCouncil: 'MMC' })
      });
      if (res.ok) {
        const data = await res.json();
        setDoctorResult(data);
      }
    } catch (err) {
      console.error('Doctor verify error:', err);
    }
  };

  const handleVerifyAbha = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/abdm/verify-abha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ abhaInput })
      });
      if (res.ok) {
        const data = await res.json();
        setAbhaResult(data);
      } else {
        setAbhaResult({ isValid: false });
      }
    } catch (err) {
      console.error('ABHA verify error:', err);
    }
  };

  const handleCreateConsent = async () => {
    try {
      const res = await fetch('/api/v1/abdm/consent/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          abhaAddress: abhaResult?.abhaAddress || 'patient.care@abdm',
          purpose: 'MEDICINE_AFFORDABILITY_COMPARISON',
          facilityId: facilityResult?.hfrId || 'HFR-MH-4201'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setConsentSuccess(data);
      }
    } catch (err) {
      console.error('Consent request error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>National Digital Health Mission</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">ABDM Integration & Compliance Gateway</h2>
          <p className="text-xs text-emerald-100/80 mt-1 max-w-xl">
            Interoperate with the Ayushman Bharat Digital Mission (ABDM) architecture. Certifies Health Facility Registry (HFR), Healthcare Professionals Registry (HPR), National Medical Register (NMR), and Ayushman Bharat Health Accounts (ABHA).
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 text-center">
          <span className="text-[10px] text-emerald-200 uppercase font-bold block">Milestone Status</span>
          <span className="text-xs font-extrabold text-white">M1 & M2 Ready</span>
        </div>
      </div>

      {/* 3 Pillars Grid: HFR, HPR/NMR, ABHA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pillar 1: Health Facility Registry (HFR) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Health Facility Registry (HFR)</h3>
          </div>

          <form onSubmit={handleLookupFacility} className="space-y-2">
            <label className="block text-[11px] font-semibold text-slate-600">Facility ID / Registry Code</label>
            <div className="flex space-x-1.5">
              <input
                type="text"
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
                placeholder="HFR-MH-4201"
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold"
              >
                Lookup
              </button>
            </div>
          </form>

          {facilityResult && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{facilityResult.facilityName}</span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                  {facilityResult.status}
                </span>
              </div>
              <div className="text-[11px] text-slate-600">{facilityResult.facilityType}</div>
              <div className="text-[10px] text-slate-400 font-mono">
                Location: {facilityResult.district}, {facilityResult.state} • {facilityResult.systemOfMedicine}
              </div>
            </div>
          )}
        </div>

        {/* Pillar 2: Healthcare Professionals (HPR) & NMR */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Stethoscope className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">HPR & Medical Register (NMR)</h3>
          </div>

          <form onSubmit={handleVerifyDoctor} className="space-y-2">
            <label className="block text-[11px] font-semibold text-slate-600">Medical Registration Number</label>
            <div className="flex space-x-1.5">
              <input
                type="text"
                value={doctorReg}
                onChange={(e) => setDoctorReg(e.target.value)}
                placeholder="MMC-2018-8472"
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold"
              >
                Verify
              </button>
            </div>
          </form>

          {doctorResult && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{doctorResult.practitionerName}</span>
                {doctorResult.nmrVerified && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center">
                    <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 text-emerald-600" />
                    NMR Verified
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-600">{doctorResult.speciality}</div>
              <div className="text-[10px] text-slate-400 font-mono">
                Council: {doctorResult.stateCouncil} • Reg: {doctorResult.registrationNumber}
              </div>
            </div>
          )}
        </div>

        {/* Pillar 3: ABHA Address & Verification */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <UserCheck className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">ABHA Account Validation</h3>
          </div>

          <form onSubmit={handleVerifyAbha} className="space-y-2">
            <label className="block text-[11px] font-semibold text-slate-600">ABHA Address or 14-Digit Number</label>
            <div className="flex space-x-1.5">
              <input
                type="text"
                value={abhaInput}
                onChange={(e) => setAbhaInput(e.target.value)}
                placeholder="patient@abdm or 91-4421-9984-3321"
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold"
              >
                Validate
              </button>
            </div>
          </form>

          {abhaResult && (
            <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
              abhaResult.isValid ? 'bg-teal-50/70 border-teal-200 text-teal-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span>{abhaResult.isValid ? 'Valid Ayushman Account' : 'Invalid ABHA'}</span>
                <span className="text-[10px] font-mono">
                  {abhaResult.isValid ? abhaResult.abhaAddress : 'Failed Format'}
                </span>
              </div>
              {abhaResult.isValid && (
                <div className="text-[11px] text-teal-700 font-mono">
                  ABHA Number: {abhaResult.abhaNumber}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Consent Manager Simulator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCheck2 className="w-5 h-5 text-teal-700" />
            <div>
              <h3 className="text-base font-bold text-slate-900">ABDM Electronic Consent Manager Simulator</h3>
              <p className="text-xs text-slate-500">
                Generate signed consent artefacts for electronic prescription exchange between doctors and community pharmacies.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCreateConsent}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            Issue Prescription Consent
          </button>
        </div>

        {consentSuccess && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs font-mono space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between text-slate-700 font-bold">
              <span>Consent Artefact ID: {consentSuccess.consentRequestId}</span>
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                STATUS: {consentSuccess.status}
              </span>
            </div>
            <div className="text-slate-500 text-[11px]">
              Patient ABHA: {consentSuccess.abhaAddress} • Facility: {consentSuccess.facilityId}
            </div>
            <div className="text-slate-400 text-[10px]">
              Health Info Types: {consentSuccess.hiTypes.join(', ')} • Valid Until: {consentSuccess.validUntil}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
