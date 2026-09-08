import React, { useState } from 'react';
import { MedicineEntity, ExtractedPrescriptionItem, PharmacistReview } from '../../types';
import { altMediApi } from '../../services/api';
import { PrescriptionCamera } from './PrescriptionCamera';
import { ExtractionReview } from './ExtractionReview';
import { MedicineComparisonView } from './MedicineComparisonView';
import { PharmacistReviewModal } from './PharmacistReviewModal';
import {
  Search,
  Camera,
  Upload,
  Pill,
  Sparkles,
  ShieldCheck,
  History,
  FileText,
  Clock,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';

export const PatientMobileApp: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MedicineEntity[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineEntity | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [extractedItems, setExtractedItems] = useState<ExtractedPrescriptionItem[] | null>(null);
  const [reviewModalData, setReviewModalData] = useState<{
    original: MedicineEntity;
    alternative: MedicineEntity;
  } | null>(null);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length > 1) {
      const results = await altMediApi.searchMedicines(q);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleCapture = async (imageDataUrl: string, sampleName?: string) => {
    setShowCamera(false);
    const parsed = await altMediApi.parsePrescriptionImage(imageDataUrl);
    setExtractedItems(parsed);
  };

  const handleSelectMedicine = (med: MedicineEntity) => {
    setSelectedMedicine(med);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-[640px] bg-slate-50 border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex flex-col relative">
      {/* Mobile App Header */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white p-4 pt-5 pb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Pill className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight">AltMedi Patient</h1>
              <span className="text-[10px] text-teal-200 font-medium">Nashik Pilot Care</span>
            </div>
          </div>
          <span className="text-[10px] bg-teal-900/60 px-2 py-0.5 rounded-full border border-teal-500/30 text-teal-200">
            Secure Mode
          </span>
        </div>

        {/* Prescription Camera / Upload CTA */}
        {!selectedMedicine && !showCamera && !extractedItems && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-sm">Have a prescription?</p>
                <p className="text-[11px] text-teal-100 mt-0.5">
                  Scan doctor slip to compare generics & pharmacy prices
                </p>
              </div>
              <button
                onClick={() => setShowCamera(true)}
                className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-white text-teal-700 shadow-md hover:bg-teal-50 active:scale-95 transition-all"
                title="Scan Prescription"
              >
                <Camera className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-0.5">Scan</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* State 1: Camera active */}
        {showCamera && (
          <div className="my-2">
            <PrescriptionCamera
              onCapture={handleCapture}
              onCancel={() => setShowCamera(false)}
            />
          </div>
        )}

        {/* State 2: OCR Extracted Items Review */}
        {!showCamera && extractedItems && !selectedMedicine && (
          <ExtractionReview
            items={extractedItems}
            onConfirmItem={(itemId, cand) => {
              setExtractedItems((prev) =>
                prev ? prev.map((it) => (it.id === itemId ? { ...it, normalizedEntity: cand, confirmed: true, isAmbiguous: false } : it)) : null
              );
            }}
            onRemoveItem={(itemId) => {
              setExtractedItems((prev) => (prev ? prev.filter((it) => it.id !== itemId) : null));
            }}
            onProceedToComparison={(med) => setSelectedMedicine(med)}
            onCancel={() => setExtractedItems(null)}
          />
        )}

        {/* State 3: Medicine Comparison Active */}
        {!showCamera && selectedMedicine && (
          <MedicineComparisonView
            sourceMedicine={selectedMedicine}
            onBack={() => setSelectedMedicine(null)}
            onRequestReview={(orig, alt) => setReviewModalData({ original: orig, alternative: alt })}
          />
        )}

        {/* State 4: Default Search & Browse */}
        {!showCamera && !extractedItems && !selectedMedicine && (
          <div className="space-y-5">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search brand, generic (e.g. Augmentin, Pan-D, Calpol)"
                className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-2xs"
              />
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-md divide-y divide-slate-100 overflow-hidden">
                <div className="p-2 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                  Matching Catalog Medicines ({searchResults.length})
                </div>
                {searchResults.map((med) => (
                  <button
                    key={med.id}
                    onClick={() => handleSelectMedicine(med)}
                    className="w-full p-3 text-left hover:bg-teal-50/50 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900">{med.brandName}</div>
                      <div className="text-[11px] text-slate-500">{med.genericName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {med.strength} • {med.dosageForm} • {med.manufacturer}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900">₹{med.standardMrpInr.toFixed(2)}</span>
                      <span className="text-[10px] text-teal-600 font-semibold block">Compare</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Popular Nashik Pilot Medicines for Quick Test */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
                <span>Frequently Prescribed in Nashik</span>
                <span className="text-[10px] text-teal-700">Pilot Catalog</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'med-001', name: 'Augmentin 625 Duo', desc: 'Amoxicillin + Clavulanic Acid (GSK)', price: 204.50 },
                  { id: 'med-005', name: 'Pan-D', desc: 'Pantoprazole + Domperidone (Alkem)', price: 215.00 },
                  { id: 'med-007', name: 'Calpol 650', desc: 'Paracetamol 650mg (GSK)', price: 33.60 },
                  { id: 'med-009', name: 'Telma 40', desc: 'Telmisartan 40mg (Glenmark)', price: 245.00 }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={async () => {
                      const med = await altMediApi.getMedicineById(item.id);
                      if (med) setSelectedMedicine(med);
                    }}
                    className="p-3 bg-white hover:bg-teal-50/40 border border-slate-200 hover:border-teal-400 rounded-xl text-left transition-all flex items-center justify-between shadow-2xs group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-teal-700">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-500">{item.desc}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-800">₹{item.price.toFixed(2)}</div>
                      <span className="text-[10px] text-teal-600 font-semibold">Compare &rarr;</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy & Safety Guarantee */}
            <div className="bg-slate-100/70 p-3 rounded-xl border border-slate-200 text-slate-600 text-[11px] space-y-1">
              <div className="flex items-center space-x-1 font-bold text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>AltMedi Patient Privacy Guarantee</span>
              </div>
              <p>
                No uploaded prescription is retained without explicit user consent. Data is processed locally within the Nashik pilot tenant isolation boundary.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pharmacist Review Modal */}
      {reviewModalData && (
        <PharmacistReviewModal
          originalMedicine={reviewModalData.original}
          proposedAlternative={reviewModalData.alternative}
          onClose={() => setReviewModalData(null)}
          onSubmitted={() => {
            // Callback for review submission
          }}
        />
      )}
    </div>
  );
};
