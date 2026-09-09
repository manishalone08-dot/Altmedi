import React, { useState, useEffect } from 'react';
import { TenantEntity, TenantInvitation, UserRole } from '../../types';
import {
  Building2,
  Users,
  Store,
  ShieldCheck,
  Plus,
  Send,
  CheckCircle2,
  Copy,
  Clock,
  Sparkles,
  MapPin,
  Globe2,
  Layers,
  Check
} from 'lucide-react';

export const TenantAdminDashboard: React.FC = () => {
  const [tenants, setTenants] = useState<TenantEntity[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<TenantEntity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<UserRole>('pharmacist');
  const [generatedInvite, setGeneratedInvite] = useState<TenantInvitation | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // New tenant form modal state
  const [showNewTenantModal, setShowNewTenantModal] = useState<boolean>(false);
  const [newTenantData, setNewTenantData] = useState({
    id: '',
    name: '',
    region: '',
    district: '',
    state: 'Maharashtra',
    tier: 'standard' as 'pilot' | 'standard' | 'enterprise'
  });

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/tenants');
      if (res.ok) {
        const data = await res.json();
        setTenants(data);
        if (!selectedTenant && data.length > 0) {
          setSelectedTenant(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant || !inviteEmail) return;

    try {
      const res = await fetch(`/api/v1/tenants/${selectedTenant.id}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      });
      if (res.ok) {
        const invite = await res.json();
        setGeneratedInvite(invite);
      }
    } catch (err) {
      console.error('Failed to create invitation:', err);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTenantData)
      });
      if (res.ok) {
        setShowNewTenantModal(false);
        setNewTenantData({
          id: '',
          name: '',
          region: '',
          district: '',
          state: 'Maharashtra',
          tier: 'standard'
        });
        await fetchTenants();
      }
    } catch (err) {
      console.error('Failed to create tenant:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" />
            <span>Multi-Region Tenant Expansion</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">District Healthcare Tenant Network</h2>
          <p className="text-xs text-teal-100/80 mt-1 max-w-xl">
            Manage multi-district tenant boundaries across Maharashtra with strict logical data isolation, localized pricing indexes, and role-based staff onboarding.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Invite Staff</span>
          </button>
          <button
            type="button"
            onClick={() => setShowNewTenantModal(true)}
            className="px-3.5 py-2 bg-white text-teal-950 hover:bg-teal-50 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Provision Tenant</span>
          </button>
        </div>
      </div>

      {/* Tenant Grid & Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tenants.map((t) => {
          const isSelected = selectedTenant?.id === t.id;
          return (
            <div
              key={t.id}
              onClick={() => setSelectedTenant(t)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                isSelected
                  ? 'bg-teal-50/50 border-teal-500 shadow-md ring-2 ring-teal-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded border border-teal-200">
                  {t.tier} Tier
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  #{t.id.replace('tenant-', '').substring(0, 6).toUpperCase()}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{t.name}</h3>
              <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{t.district}, {t.state}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Users</span>
                  <span className="font-bold text-slate-800">{t.activeUsersCount || 0} active</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">ABDM HFR</span>
                  <span className="font-bold text-teal-700">{t.hfrId || 'Linked'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Tenant Detailed Inspector */}
      {selectedTenant && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">{selectedTenant.name}</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                  Isolation Boundary Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                Tenant ID: {selectedTenant.id} • Region: {selectedTenant.region}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Supported Locales:</span>
              <div className="flex space-x-1">
                {(selectedTenant.languageSupport || ['en', 'mr', 'hi']).map((lang) => (
                  <span key={lang} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded uppercase border border-slate-200">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">ABDM Facility Registry ID</span>
              <div className="text-sm font-bold text-slate-900 mt-1 font-mono">
                {selectedTenant.abdmFacilityId || 'IN-MH-NSK-00982'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Verified with National Health Authority HFR Gateway.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Data Retention & Compliance</span>
              <div className="text-sm font-bold text-slate-900 mt-1">
                DISHA & DPDP 2023 Compliant
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Prescriptions encrypted with tenant key isolation.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Pharmacy Vendor Integrations</span>
              <div className="text-sm font-bold text-emerald-700 mt-1">
                {selectedTenant.activePharmaciesCount || 8} Connected Chemist POS
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Marg ERP, CIMS Gateway, and CSV batch feeds.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Staff Invitation Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">
              Invite Healthcare Staff to {selectedTenant?.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Generate a single-use secure onboarding code linked to this tenant's role-based access.
            </p>

            {generatedInvite ? (
              <div className="my-5 bg-teal-50 border border-teal-200 rounded-xl p-4 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto" />
                <div>
                  <div className="text-xs text-teal-800 font-semibold">Invitation Code Generated</div>
                  <div className="text-2xl font-mono font-black text-teal-950 mt-1 tracking-wider">
                    {generatedInvite.inviteCode}
                  </div>
                  <div className="text-[11px] text-teal-700 mt-1">
                    Role: <strong>{generatedInvite.role}</strong> • For: {generatedInvite.email}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedInvite.inviteCode)}
                  className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Invite Code'}</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateInvite} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Staff Email</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="doctor@hospital.org"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="pharmacist">Pharmacist (Review Queue)</option>
                    <option value="doctor">Doctor / Prescriber</option>
                    <option value="vendor">Vendor / Pharmacy Owner</option>
                    <option value="organization">Clinic / Hospital Admin</option>
                  </select>
                </div>
                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                  >
                    Generate Invitation
                  </button>
                </div>
              </form>
            )}

            {generatedInvite && (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setGeneratedInvite(null);
                    setInviteEmail('');
                  }}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg font-semibold"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Provision New Tenant Modal */}
      {showNewTenantModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Provision New District Tenant</h3>
            <p className="text-xs text-slate-500 mt-1">
              Initialize a isolated geographical boundary with dedicated catalog mappings and audit logs.
            </p>

            <form onSubmit={handleCreateTenant} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tenant ID</label>
                <input
                  type="text"
                  required
                  value={newTenantData.id}
                  onChange={(e) => setNewTenantData({ ...newTenantData, id: e.target.value })}
                  placeholder="tenant-nagpur-05"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Organization / Network Name</label>
                <input
                  type="text"
                  required
                  value={newTenantData.name}
                  onChange={(e) => setNewTenantData({ ...newTenantData, name: e.target.value })}
                  placeholder="Nagpur Vidarbha Healthcare Network"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={newTenantData.district}
                    onChange={(e) => setNewTenantData({ ...newTenantData, district: e.target.value })}
                    placeholder="Nagpur"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Region</label>
                  <input
                    type="text"
                    required
                    value={newTenantData.region}
                    onChange={(e) => setNewTenantData({ ...newTenantData, region: e.target.value })}
                    placeholder="Vidarbha Region"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Tier</label>
                <select
                  value={newTenantData.tier}
                  onChange={(e) => setNewTenantData({ ...newTenantData, tier: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="pilot">Pilot Tier</option>
                  <option value="standard">Standard Regional Tier</option>
                  <option value="enterprise">Enterprise Hospital Alliance</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewTenantModal(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Create Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
