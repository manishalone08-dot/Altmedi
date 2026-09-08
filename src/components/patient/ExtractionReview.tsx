import React, { useState } from 'react';
import { ExtractedPrescriptionItem, MedicineEntity } from '../../types';
import { CheckCircle2, AlertTriangle, HelpCircle, ArrowRight, Edit3, Trash2, Check, Sparkles } from 'lucide-react';

interface ExtractionReviewProps {
  items: ExtractedPrescriptionItem[];
  onConfirmItem: (itemId: string, selectedEntity: MedicineEntity) => void;
  onRemoveItem: (itemId: string) => void;
  onProceedToComparison: (selectedMedicine: MedicineEntity) => void;
  onCancel: () => void;
}

export const ExtractionReview: React.FC<ExtractionReviewProps> = ({
  items,
  onConfirmItem,
  onRemoveItem,
  onProceedToComparison,
  onCancel
}) => {
  const [activeItems, setActiveItems] = useState<ExtractedPrescriptionItem[]>(items);

  const handleSelectCandidate = (item: ExtractedPrescriptionItem, candidate: MedicineEntity) => {
    const updated = activeItems.map((it) => {
      if (it.id === item.id) {
        return {
          ...it,
          normalizedEntity: candidate,
          isAmbiguous: false,
          confirmed: true
        };
      }
      return it;
    });
    setActiveItems(updated);
    onConfirmItem(item.id, candidate);
  };

  const allConfirmed = activeItems.length > 0 && activeItems.every((it) => it.confirmed && it.normalizedEntity);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              <Sparkles className="w-3 h-3" />
              <span>Prescription Extraction (OCR)</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">Review & Confirm Detected Medicines</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            Cancel / Retake
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Safety rule: AltMedi never automatically guesses unconfirmed medicines. Verify each item below before comparing alternatives.
        </p>
      </div>

      {/* Extracted Items List */}
      <div className="space-y-4 mb-6">
        {activeItems.map((item, index) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl border transition-all ${
              item.isAmbiguous
                ? 'border-amber-300 bg-amber-50/40'
                : item.confirmed
                ? 'border-emerald-200 bg-emerald-50/20'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  Extracted: "{item.rawText}"
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {item.confirmed && item.normalizedEntity ? (
                  <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Confirmed</span>
                  </span>
                ) : item.isAmbiguous ? (
                  <span className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Ambiguity Detected</span>
                  </span>
                ) : null}
              </div>
            </div>

            {/* Resolved Entity View */}
            {item.normalizedEntity && !item.isAmbiguous ? (
              <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs mt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {item.normalizedEntity.brandName}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {item.normalizedEntity.genericName}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        Strength: {item.normalizedEntity.strength}
                      </span>
                      <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        Form: {item.normalizedEntity.dosageForm}
                      </span>
                      <span className="text-[11px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-medium">
                        MRP: ₹{item.normalizedEntity.standardMrpInr.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onProceedToComparison(item.normalizedEntity!)}
                    className="ml-2 inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs"
                  >
                    <span>Compare</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : null}

            {/* Ambiguity Choices Resolution */}
            {item.isAmbiguous && item.ambiguousCandidates && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-amber-900 font-medium">
                  Multiple matches found for generic name. Select the exact intended medicine:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {item.ambiguousCandidates.map((cand) => (
                    <button
                      key={cand.id}
                      onClick={() => handleSelectCandidate(item, cand)}
                      className="p-2.5 rounded-lg border border-amber-200 bg-white hover:border-teal-500 hover:bg-teal-50/40 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-teal-700">
                          {cand.brandName}
                        </span>
                        <span className="text-[10px] text-teal-600 font-semibold">Select</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{cand.manufacturer}</div>
                      <div className="text-[11px] text-slate-700 font-medium mt-1">
                        {cand.strength} • MRP ₹{cand.standardMrpInr.toFixed(2)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs text-slate-500">
          {activeItems.filter((it) => it.confirmed).length} of {activeItems.length} confirmed
        </span>
        {activeItems.length > 0 && (
          <button
            onClick={() => {
              const first = activeItems.find((it) => it.normalizedEntity)?.normalizedEntity;
              if (first) onProceedToComparison(first);
            }}
            disabled={!allConfirmed}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              allConfirmed
                ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Proceed to All Comparisons</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ExtractionReview;
