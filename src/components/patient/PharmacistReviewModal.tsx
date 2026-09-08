import React, { useState } from 'react';
import { MedicineEntity, PharmacistReview } from '../../types';
import { altMediApi } from '../../services/api';
import { FileCheck2, ShieldCheck, X, CheckCircle2, Clock } from 'lucide-react';

interface PharmacistReviewModalProps {
  originalMedicine: MedicineEntity;
  proposedAlternative: MedicineEntity;
  onClose: () => void;
  onSubmitted: (review: PharmacistReview) => void;
}

export const PharmacistReviewModal: React.FC<PharmacistReviewModalProps> = ({
  originalMedicine,
  proposedAlternative,
  onClose,
  onSubmitted
}) => {
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [urgency, setUrgency] = useState<'routine' | 'urgent'>('routine');
  const [submitting, setSubmitting] = useState(false);
  const [submittedReview, setSubmittedReview] = useState<PharmacistReview | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const review = await altMediApi.requestPharmacistReview(
        originalMedicine.id,
        proposedAlternative.id,
        patientName || 'Nashik Resident',
        patientPhone,
        urgency
      );
      setSubmittedReview(review);
      onSubmitted(review);
    } catch (err) {
      alert('Failed to submit review request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {!submittedReview ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Request Pharmacist Confirmation</h3>
                <p className="text-xs text-slate-500">
                  A licensed Nashik pharmacist will review this substitution against your prescription.
                </p>
              </div>
            </div>

            {/* Substitution Summary */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Original Prescribed:</span>
                <span className="font-bold text-slate-800">{originalMedicine.brandName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Proposed Alternative:</span>
                <span className="font-bold text-teal-700">{proposedAlternative.brandName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Active API:</span>
                <span className="text-slate-700">{originalMedicine.genericName}</span>
              </div>
            </div>

            {/* Form inputs */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Patient Name (or Caregiver)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Deshmukh"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mobile Number (for SMS confirmation)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9822012345"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Urgency Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUrgency('routine')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center ${
                      urgency === 'routine'
                        ? 'border-teal-600 bg-teal-50 text-teal-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    Routine (Within 30 mins)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('urgent')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center ${
                      urgency === 'urgent'
                        ? 'border-rose-600 bg-rose-50 text-rose-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    Urgent / High Priority
                  </button>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              By submitting, your request is dispatched to the participating on-duty community pharmacist at <strong>Lifeline Pharmacy Hub (Nashik)</strong>. No medication will be dispensed without verified approval.
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl text-slate-600 hover:text-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {submitting ? 'Submitting...' : 'Send to Pharmacist Queue'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Request Dispatched</h3>
              <p className="text-xs text-slate-600 mt-1">
                Your request ID is <strong className="font-mono text-slate-900">#{submittedReview.id}</strong>
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Pharmacy:</span>
                <span className="font-semibold text-slate-800">{submittedReview.pharmacyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="inline-flex items-center text-amber-700 font-semibold">
                  <Clock className="w-3 h-3 mr-1" />
                  In Pharmacist Review
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              You can track the decision in the Pharmacist Portal or await SMS notification.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs"
            >
              Back to Comparison
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacistReviewModal;
