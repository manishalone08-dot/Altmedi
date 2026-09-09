import React from 'react';
import { JanAushadhiItem } from '../../types';
import { Landmark, TrendingDown, MapPin, CheckCircle, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface JanAushadhiBadgeProps {
  item: JanAushadhiItem;
  currentBrandPrice?: number;
}

export const JanAushadhiBadge: React.FC<JanAushadhiBadgeProps> = ({ item, currentBrandPrice }) => {
  const { t } = useTranslation();
  const priceToCompare = currentBrandPrice || item.equivalentBrandMrpInr;
  const directSavings = Math.max(0, priceToCompare - item.pmbjpPriceInr);
  const savingsPct = Math.round((directSavings / priceToCompare) * 100);

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/80 rounded-2xl p-4 shadow-sm relative overflow-hidden">
      {/* Decorative Government Scheme Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-amber-950 tracking-tight">
                {t('janAushadhi.badge')}
              </span>
              <span className="text-[10px] bg-amber-200 text-amber-900 font-semibold px-2 py-0.5 rounded-full border border-amber-300">
                {t('janAushadhi.pmbjp')}
              </span>
            </div>
            <p className="text-[11px] text-amber-800 font-medium">
              Pradhan Mantri Bhartiya Janaushadhi Pariyojana
            </p>
          </div>
        </div>

        {item.isBplSubsidyEligible && (
          <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>{t('janAushadhi.bplEligible')}</span>
          </span>
        )}
      </div>

      {/* Main Info */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="text-xs font-bold text-slate-900 line-clamp-1">{item.genericName}</div>
          <div className="text-[11px] text-slate-600 mt-0.5">
            {item.strength} • {item.dosageForm} • {item.packSize}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
            Govt Code: {item.pmbjpCode}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-xl border border-amber-200/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-500">
              {t('janAushadhi.govtPrice')}
            </div>
            <div className="text-base font-extrabold text-amber-950">
              ₹{item.pmbjpPriceInr.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold border border-emerald-200">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{savingsPct}% Less</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Save ₹{directSavings.toFixed(2)} / pack
            </div>
          </div>
        </div>
      </div>

      {/* Nearest Jan Aushadhi Kendra */}
      {item.nearestStoreArea && (
        <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center space-x-1 text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Nearest Kendra: <strong>{item.nearestStoreArea}</strong></span>
          </div>
          <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300">
            Kendra Stocked
          </span>
        </div>
      )}
    </div>
  );
};
