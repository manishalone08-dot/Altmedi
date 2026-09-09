import React, { useState, useEffect } from 'react';
import { POSIntegration } from '../../types';
import {
  Store,
  RefreshCw,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Cpu,
  Plus,
  ArrowRight,
  Database,
  Terminal,
  FileCheck
} from 'lucide-react';

export const POSConnectorPanel: React.FC = () => {
  const [integrations, setIntegrations] = useState<POSIntegration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [csvStatus, setCsvStatus] = useState<{ success?: boolean; message?: string; sampleRows?: any[] } | null>(null);
  const [isUploadingCsv, setIsUploadingCsv] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newPosData, setNewPosData] = useState({
    vendorId: 'v-01',
    posType: 'marg' as 'cims' | 'marg' | 'redbook' | 'csv',
    apiEndpoint: 'https://api.margcompusoft.com/v2/inventory',
    apiKey: 'marg_prod_secret_token_9934'
  });

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/pos/integrations');
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data);
      }
    } catch (err) {
      console.error('Failed to load POS connectors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleSync = async (id: string) => {
    try {
      setSyncingId(id);
      const res = await fetch(`/api/v1/pos/sync/${id}`, { method: 'POST' });
      if (res.ok) {
        await fetchIntegrations();
      }
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setSyncingId(null);
    }
  };

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) return;

    try {
      setIsUploadingCsv(true);
      setCsvStatus(null);
      const res = await fetch('/api/v1/pos/csv-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId: 'v-01', csvContent })
      });
      const data = await res.json();
      if (res.ok) {
        setCsvStatus({
          success: true,
          message: data.message,
          sampleRows: data.sampleRows
        });
        setCsvContent('');
        await fetchIntegrations();
      } else {
        setCsvStatus({ success: false, message: data.error || 'Failed to upload CSV' });
      }
    } catch (err: any) {
      setCsvStatus({ success: false, message: err.message });
    } finally {
      setIsUploadingCsv(false);
    }
  };

  const handleCreatePos = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/pos/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPosData)
      });
      if (res.ok) {
        setShowAddModal(false);
        await fetchIntegrations();
      }
    } catch (err) {
      console.error('Failed to create POS connector:', err);
    }
  };

  const sampleCsvTemplate = `Medicine Name, Price, Stock Count, Batch Number
Augmentin 625 Duo, 204.50, 45, BAT-2025-01
Pan-D Capsule, 215.00, 80, BAT-2025-02
Calpol 650 Tablet, 33.60, 150, BAT-2025-03
Telma 40 Tablet, 245.00, 30, BAT-2025-04`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>Pharmacy POS & ERP Connectors</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Real-Time Inventory Ingestion</h2>
          <p className="text-xs text-teal-100/80 mt-1 max-w-xl">
            Synchronize live chemist shelf availability directly with Marg ERP, CIMS Gateway, and daily batch CSV uploads to power instant stock checks for patients.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Connect New POS</span>
        </button>
      </div>

      {/* POS Connectors List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {integrations.map((pos) => {
          const isSyncing = syncingId === pos.id;
          return (
            <div key={pos.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                    {pos.posType.toUpperCase()} Connector
                  </span>
                  <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                    {pos.syncStatus}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                  {pos.vendorName || `Chemist Terminal #${pos.vendorId}`}
                </h3>
                <div className="text-xs text-slate-500 mt-1 font-mono">
                  {pos.apiKeyMask || 'Direct File Sync'}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Stocked SKUs</span>
                    <span className="font-bold text-slate-800">{pos.itemsSynced} medicines</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Last Sync</span>
                    <span className="font-bold text-slate-700">
                      {pos.lastSyncAt ? new Date(pos.lastSyncAt).toLocaleTimeString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleSync(pos.id)}
                  disabled={isSyncing}
                  className="w-full py-1.5 px-3 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-teal-600' : ''}`} />
                  <span>{isSyncing ? 'Synchronizing...' : 'Trigger Live Sync'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CSV Batch Upload Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center space-x-2 mb-2">
          <FileSpreadsheet className="w-5 h-5 text-teal-700" />
          <h3 className="text-base font-bold text-slate-900">Batch Inventory CSV Import</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Upload or paste daily price and inventory logs for community chemists without cloud ERP access.
        </p>

        <form onSubmit={handleCsvUpload} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">CSV Data (Comma Separated)</label>
              <button
                type="button"
                onClick={() => setCsvContent(sampleCsvTemplate)}
                className="text-[11px] text-teal-700 hover:underline font-semibold"
              >
                Load Sample CSV Template
              </button>
            </div>
            <textarea
              rows={4}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="Medicine Name, Price, Stock Count, Batch Number..."
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Format: Medicine Name, Price (INR), Stock Count, Batch
            </span>
            <button
              type="submit"
              disabled={isUploadingCsv || !csvContent.trim()}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploadingCsv ? 'Processing...' : 'Upload & Sync Catalog'}</span>
            </button>
          </div>
        </form>

        {/* CSV Status Feedback */}
        {csvStatus && (
          <div className={`mt-4 p-4 rounded-xl border text-xs ${
            csvStatus.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center space-x-2 font-bold">
              {csvStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{csvStatus.message}</span>
            </div>

            {csvStatus.sampleRows && csvStatus.sampleRows.length > 0 && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-emerald-200/60 font-semibold text-emerald-800">
                      <th className="py-1 px-2">Medicine</th>
                      <th className="py-1 px-2">Price</th>
                      <th className="py-1 px-2">Stock</th>
                      <th className="py-1 px-2">Batch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvStatus.sampleRows.map((r, i) => (
                      <tr key={i} className="border-b border-emerald-100">
                        <td className="py-1 px-2 font-medium">{r.medicineName}</td>
                        <td className="py-1 px-2">₹{r.price.toFixed(2)}</td>
                        <td className="py-1 px-2">{r.stockCount} units</td>
                        <td className="py-1 px-2 font-mono">{r.batchNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connect Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Connect Pharmacy POS Connector</h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure webhook or API credentials for real-time inventory synchronization.
            </p>

            <form onSubmit={handleCreatePos} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">POS / ERP System</label>
                <select
                  value={newPosData.posType}
                  onChange={(e) => setNewPosData({ ...newPosData, posType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="marg">Marg ERP 9+ (India Pharmacy Standard)</option>
                  <option value="cims">CIMS Live Gateway</option>
                  <option value="redbook">RedBook Chemist Software</option>
                  <option value="csv">Daily CSV Batch Feed</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">API Endpoint URL</label>
                <input
                  type="url"
                  value={newPosData.apiEndpoint}
                  onChange={(e) => setNewPosData({ ...newPosData, apiEndpoint: e.target.value })}
                  placeholder="https://api.margcompusoft.com/v2/inventory"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">API Secret Key</label>
                <input
                  type="password"
                  value={newPosData.apiKey}
                  onChange={(e) => setNewPosData({ ...newPosData, apiKey: e.target.value })}
                  placeholder="marg_live_••••••••"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
