import React, { useState, useEffect } from 'react';
import {
  UserRole,
  MedicineEntity,
  PharmacistReview,
  VendorOffer,
  AuditEvent,
  MedicineMapping
} from '../../types';
import { altMediApi } from '../../services/api';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  FileCheck2,
  Building2,
  Store,
  Stethoscope,
  Settings,
  History,
  AlertTriangle,
  RefreshCw,
  Edit2,
  ArrowRight,
  Filter,
  Check,
  X
} from 'lucide-react';
import { MedicineComparisonView } from '../patient/MedicineComparisonView';

interface DesktopPortalProps {
  activeRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export const DesktopAuthoritativePortal: React.FC<DesktopPortalProps> = ({
  activeRole,
  onSelectRole
}) => {
  const [reviews, setReviews] = useState<PharmacistReview[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [mappings, setMappings] = useState<MedicineMapping[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MedicineEntity[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineEntity | null>(null);
  const [activeTab, setActiveTab] = useState<string>('default');

  // Decision state for pharmacist
  const [selectedReview, setSelectedReview] = useState<PharmacistReview | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [decisionAction, setDecisionAction] = useState<'confirmed' | 'rejected'>('confirmed');

  // Vendor edit state
  const [vendorOfferPrice, setVendorOfferPrice] = useState<number>(184);
  const [vendorOfferStock, setVendorOfferStock] = useState<number>(42);
  const [vendorUpdateSuccess, setVendorUpdateSuccess] = useState(false);

  const loadData = async () => {
    const [revList, logs, maps] = await Promise.all([
      altMediApi.getReviewQueue(),
      altMediApi.getAuditLogs(),
      altMediApi.getMappings()
    ]);
    setReviews(revList);
    setAuditLogs(logs);
    setMappings(maps);
  };

  useEffect(() => {
    loadData();
  }, [activeRole]);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length > 1) {
      const results = await altMediApi.searchMedicines(q);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handlePharmacistDecisionSubmit = async () => {
    if (!selectedReview || !decisionReason.trim()) return;
    await altMediApi.submitPharmacistDecision(
      selectedReview.id,
      decisionAction,
      decisionReason,
      'M. Shinde (Reg #MH-82194 - Pharmacist)'
    );
    setSelectedReview(null);
    setDecisionReason('');
    await loadData();
  };

  const handleMappingStatusChange = async (mapId: string, status: 'approved' | 'quarantined' | 'deprecated') => {
    await altMediApi.updateMappingStatus(
      mapId,
      status,
      `Platform Governance action by ${activeRole}`,
      'operations@altmedi.in'
    );
    await loadData();
  };

  const handleVendorUpdate = async () => {
    await altMediApi.updateVendorOffer('off-001', vendorOfferPrice, vendorOfferStock, 'Nashik Medicos Admin');
    setVendorUpdateSuccess(true);
    setTimeout(() => setVendorUpdateSuccess(false), 3000);
    await loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Sub-header: Active Role Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200 uppercase tracking-wider">
              {activeRole.replace('_', ' ')} Portal
            </span>
            <span className="text-xs text-slate-400">
              Tenant: Nashik Central Healthcare Network (pilot-nashik-01)
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            {activeRole === 'pharmacist' && 'Pharmacist Professional Confirmation Queue'}
            {activeRole === 'doctor' && 'Doctor Clinical Decision & Prescription Review'}
            {activeRole === 'vendor' && 'Pharmacy Inventory & Offer Management'}
            {activeRole === 'organization' && 'Hospital / Clinic Organization Oversight'}
            {activeRole === 'tenant_admin' && 'Tenant Administration & Access Control'}
            {activeRole === 'platform_admin' && 'AltMedi Super Admin & Catalog Governance'}
            {activeRole === 'patient' && 'Authoritative Medicine Reference & Comparison'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-based access enforced server-side. All sensitive changes are immutably logged for clinical auditability.
          </p>
        </div>

        {/* Quick Role Navigation Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            { role: 'patient' as UserRole, label: 'Search / Compare' },
            { role: 'pharmacist' as UserRole, label: 'Pharmacist Queue' },
            { role: 'doctor' as UserRole, label: 'Doctor Review' },
            { role: 'vendor' as UserRole, label: 'Vendor Offers' },
            { role: 'platform_admin' as UserRole, label: 'Admin Governance' }
          ].map((item) => (
            <button
              key={item.role}
              onClick={() => onSelectRole(item.role)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeRole === item.role
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW BY ROLE */}

      {/* 1. PHARMACIST PORTAL: Review Queue */}
      {activeRole === 'pharmacist' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Pending In-Review</span>
              <div className="text-2xl font-bold text-amber-600">
                {reviews.filter((r) => r.status === 'in_review').length}
              </div>
              <span className="text-[11px] text-slate-400">Requires clinical verification</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Confirmed Today</span>
              <div className="text-2xl font-bold text-emerald-600">
                {reviews.filter((r) => r.status === 'confirmed').length}
              </div>
              <span className="text-[11px] text-slate-400">Approved substitutions</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Rejected / Escalated</span>
              <div className="text-2xl font-bold text-rose-600">
                {reviews.filter((r) => r.status === 'rejected').length}
              </div>
              <span className="text-[11px] text-slate-400">Doctor consultation required</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="w-5 h-5 text-teal-600" />
                <h2 className="font-bold text-sm text-slate-900">Incoming Substitution Review Queue</h2>
              </div>
              <button
                onClick={loadData}
                className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Case ID</th>
                    <th className="px-4 py-3">Patient / Urgency</th>
                    <th className="px-4 py-3">Prescribed Medicine</th>
                    <th className="px-4 py-3">Proposed Alternative</th>
                    <th className="px-4 py-3">Classification</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{rev.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{rev.patientName}</div>
                        <div className="text-[11px] text-slate-400">{rev.patientPhoneMasked}</div>
                        {rev.urgency === 'urgent' && (
                          <span className="inline-block mt-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 rounded">
                            Urgent
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{rev.originalMedicine.brandName}</div>
                        <div className="text-[11px] text-slate-500">{rev.originalMedicine.strength}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-teal-700">{rev.proposedAlternative.brandName}</div>
                        <div className="text-[11px] text-slate-500">{rev.proposedAlternative.strength}</div>
                      </td>
                      <td className="px-4 py-3">
                        {rev.classification === 'same_active_ingredient' ? (
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Same Active Ingredient
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                            Therapeutic Alternative
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {rev.status === 'in_review' && (
                          <span className="inline-flex items-center text-amber-700 font-semibold text-[11px]">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            In Review
                          </span>
                        )}
                        {rev.status === 'confirmed' && (
                          <span className="inline-flex items-center text-emerald-700 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Confirmed
                          </span>
                        )}
                        {rev.status === 'rejected' && (
                          <span className="inline-flex items-center text-rose-700 font-semibold text-[11px]">
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {rev.status === 'in_review' ? (
                          <button
                            onClick={() => setSelectedReview(rev)}
                            className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-2xs"
                          >
                            Review & Decide
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">Decided</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pharmacist Action Modal */}
          {selectedReview && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-base text-slate-900">
                    Pharmacist Clinical Confirmation: Case {selectedReview.id}
                  </h3>
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="text-slate-400 hover:text-slate-700 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block font-bold uppercase text-[10px]">Original</span>
                    <div className="font-bold text-slate-900">{selectedReview.originalMedicine.brandName}</div>
                    <div className="text-slate-500">{selectedReview.originalMedicine.genericName}</div>
                    <div className="text-slate-700 font-medium mt-1">
                      {selectedReview.originalMedicine.strength} • MRP ₹{selectedReview.originalMedicine.standardMrpInr}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase text-[10px]">Proposed Alternative</span>
                    <div className="font-bold text-teal-700">{selectedReview.proposedAlternative.brandName}</div>
                    <div className="text-slate-500">{selectedReview.proposedAlternative.genericName}</div>
                    <div className="text-slate-700 font-medium mt-1">
                      {selectedReview.proposedAlternative.strength} • MRP ₹{selectedReview.proposedAlternative.standardMrpInr}
                    </div>
                  </div>
                </div>

                {selectedReview.classification === 'therapeutic_alternative' && (
                  <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl text-xs text-amber-900 font-medium">
                    ⚠️ <strong>Clinical Notice:</strong> This is a therapeutic alternative (different molecule/class). Under Indian pharmacy dispensing regulations, therapeutic substitution requires direct prescriber telephonic or written authorization.
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Professional Clinical Decision
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDecisionAction('confirmed')}
                        className={`py-2 px-3 rounded-lg border font-bold flex items-center justify-center space-x-1.5 ${
                          decisionAction === 'confirmed'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 bg-slate-50 text-slate-600'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>Confirm Substitution</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDecisionAction('rejected')}
                        className={`py-2 px-3 rounded-lg border font-bold flex items-center justify-center space-x-1.5 ${
                          decisionAction === 'rejected'
                            ? 'border-rose-600 bg-rose-50 text-rose-800'
                            : 'border-slate-200 bg-slate-50 text-slate-600'
                        }`}
                      >
                        <X className="w-4 h-4" />
                        <span>Reject / Advise Doctor Consult</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Clinical Rationale & Regulatory Reason Code (Required)
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g. Verified identical active API and bioequivalence parameters. Patient informed of brand change."
                      value={decisionReason}
                      onChange={(e) => setDecisionReason(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="px-3 py-2 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePharmacistDecisionSubmit}
                    disabled={!decisionReason.trim()}
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs ${
                      decisionReason.trim()
                        ? 'bg-teal-600 hover:bg-teal-700 cursor-pointer'
                        : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    Record Immutable Decision
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. DOCTOR PORTAL */}
      {activeRole === 'doctor' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <h2 className="font-bold text-sm text-slate-900">Doctor Prescriber Review Workspace</h2>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-medium">
                OPD Clinical View
              </span>
            </div>
            <p className="text-xs text-slate-600">
              AltMedi operates purely as clinical decision support. Prescribers can view bioequivalence evidence, price variance for their prescribed medicines in Nashik, and verify patient substitution inquiries.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                <div className="text-xs font-bold text-slate-800">Prescription Formulation Search</div>
                <input
                  type="text"
                  placeholder="Enter brand or molecule..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
                {searchResults.length > 0 && (
                  <div className="bg-white border rounded-lg p-2 space-y-1 mt-2">
                    {searchResults.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMedicine(m)}
                        className="p-1.5 hover:bg-teal-50 rounded cursor-pointer text-xs flex justify-between"
                      >
                        <span className="font-bold text-slate-900">{m.brandName}</span>
                        <span className="text-slate-500">₹{m.standardMrpInr}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2 text-xs">
                <div className="font-bold text-slate-800">Clinical Guidelines Notice</div>
                <p className="text-slate-600 leading-relaxed">
                  Per CDSCO and National Formulary of India guidelines, same-active-ingredient substitutions within identical release profiles do not alter therapeutic efficacy. Therapeutic substitutions require prescription amendment.
                </p>
              </div>
            </div>
          </div>

          {selectedMedicine && (
            <MedicineComparisonView
              sourceMedicine={selectedMedicine}
              onBack={() => setSelectedMedicine(null)}
              onRequestReview={() => alert('Prescriber consultation verified.')}
            />
          )}
        </div>
      )}

      {/* 3. VENDOR / PHARMACY PORTAL */}
      {activeRole === 'vendor' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Store className="w-5 h-5 text-teal-600" />
                <h2 className="font-bold text-sm text-slate-900">
                  Nashik Medicos & Surgicals (College Road) - Offer Management
                </h2>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                Verified Vendor #VEND-NK-01
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Update pricing and live stock for canonical catalog medicines. Stale offers (&gt;7 days) are automatically labeled in consumer search.
            </p>

            {vendorUpdateSuccess && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Offer updated successfully! Changes published immediately and logged into audit trail.</span>
              </div>
            )}

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4">
              <h3 className="font-bold text-xs text-slate-800">Quick Inventory & Price Update (Augmentin 625 Duo)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={vendorOfferPrice}
                    onChange={(e) => setVendorOfferPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">MRP: ₹204.50</span>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Available Units</label>
                  <input
                    type="number"
                    value={vendorOfferStock}
                    onChange={(e) => setVendorOfferStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Pack of 10 tablets</span>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleVendorUpdate}
                    className="w-full py-2 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs"
                  >
                    Publish Live Offer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUPER ADMIN & PLATFORM GOVERNANCE */}
      {(activeRole === 'platform_admin' || activeRole === 'tenant_admin') && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h2 className="font-bold text-sm text-slate-900">Medicine Mapping Governance Queue</h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Admin controls ensuring only approved bioequivalent or therapeutic alternatives reach consumers
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Mapping ID</th>
                    <th className="px-4 py-3">Source & Target Medicine</th>
                    <th className="px-4 py-3">Classification</th>
                    <th className="px-4 py-3">Confidence</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {mappings.map((map) => (
                    <tr key={map.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{map.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">
                          {map.sourceMedicineId} ↔ {map.targetMedicineId}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {map.clinicalRationale}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-800">
                          {map.classification.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-teal-700">
                        {Math.round(map.confidenceScore * 100)}%
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            map.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : map.status === 'quarantined'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {map.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1.5">
                        {map.status !== 'approved' && (
                          <button
                            onClick={() => handleMappingStatusChange(map.id, 'approved')}
                            className="px-2 py-1 rounded bg-emerald-600 text-white font-semibold text-[11px]"
                          >
                            Approve
                          </button>
                        )}
                        {map.status !== 'quarantined' && (
                          <button
                            onClick={() => handleMappingStatusChange(map.id, 'quarantined')}
                            className="px-2 py-1 rounded bg-rose-600 text-white font-semibold text-[11px]"
                          >
                            Quarantine
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Immutable Audit Log Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-slate-700" />
                <h2 className="font-bold text-sm text-slate-900">Immutable Audit Trail (Section 18)</h2>
              </div>
              <span className="text-[11px] text-slate-500">Append-only compliance ledger</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Actor / Role</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Entity</th>
                    <th className="px-4 py-3">Details / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900">{log.actor}</span>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          {log.actorRole}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-teal-800">{log.action}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {log.entityType} ({log.entityId})
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-sm">
                        {log.reason || log.newValue || 'No additional notes'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. PATIENT DESKTOP PORTAL VIEW (When in Desktop Mode & Role = Patient) */}
      {activeRole === 'patient' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Explore & Compare Medicines</h2>
                <p className="text-xs text-slate-500">
                  Search across verified Indian formulations in the Nashik pilot database
                </p>
              </div>
            </div>

            <div className="relative max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by brand name, generic molecule (e.g. Augmentin, Pan-D, Calpol, Telma)..."
                className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-w-2xl bg-white shadow-sm overflow-hidden">
                {searchResults.map((med) => (
                  <div
                    key={med.id}
                    onClick={() => {
                      setSelectedMedicine(med);
                      setSearchResults([]);
                    }}
                    className="p-3 hover:bg-teal-50 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{med.brandName}</span>
                      <span className="text-slate-500 block">{med.genericName}</span>
                      <span className="text-slate-400 text-[11px]">
                        {med.strength} • {med.dosageForm} • {med.manufacturer}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">₹{med.standardMrpInr.toFixed(2)}</div>
                      <span className="text-teal-600 font-semibold text-[11px]">Compare Alternatives &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedMedicine ? (
            <MedicineComparisonView
              sourceMedicine={selectedMedicine}
              onBack={() => setSelectedMedicine(null)}
              onRequestReview={() => alert('Pharmacist review requested from desktop portal.')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { id: 'med-001', name: 'Augmentin 625 Duo', gen: 'Amoxicillin + Clavulanate', mrp: 204.50 },
                { id: 'med-005', name: 'Pan-D', gen: 'Pantoprazole + Domperidone', mrp: 215.00 },
                { id: 'med-007', name: 'Calpol 650', gen: 'Paracetamol 650mg', mrp: 33.60 },
                { id: 'med-009', name: 'Telma 40', gen: 'Telmisartan 40mg', mrp: 245.00 }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={async () => {
                    const m = await altMediApi.getMedicineById(item.id);
                    if (m) setSelectedMedicine(m);
                  }}
                  className="p-4 bg-white rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-sm text-left transition-all group"
                >
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    Popular Pilot Item
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-2 group-hover:text-teal-700">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">{item.gen}</p>
                  <div className="mt-2 text-xs font-bold text-slate-800">MRP: ₹{item.mrp.toFixed(2)}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
