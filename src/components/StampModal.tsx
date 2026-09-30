import React, { useState } from 'react';
import { Stamp, Check, X } from 'lucide-react';

interface StampModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyStamp: (stampType: 'APPROVED' | 'CONFIDENTIAL' | 'DRAFT' | 'URGENT' | 'REJECTED' | 'OFFICIAL' | 'CUSTOM', customText?: string) => void;
}

const STAMPS = [
  { id: 'APPROVED', label: 'APPROVED', color: 'border-emerald-600 text-emerald-600 bg-emerald-50', desc: 'Officially reviewed and verified' },
  { id: 'CONFIDENTIAL', label: 'CONFIDENTIAL', color: 'border-rose-600 text-rose-600 bg-rose-50', desc: 'Restricted distribution only' },
  { id: 'DRAFT', label: 'DRAFT', color: 'border-blue-600 text-blue-600 bg-blue-50', desc: 'Work in progress / Non-binding' },
  { id: 'URGENT', label: 'URGENT', color: 'border-amber-600 text-amber-600 bg-amber-50', desc: 'Priority review required' },
  { id: 'REJECTED', label: 'REJECTED', color: 'border-red-700 text-red-700 bg-red-50', desc: 'Did not meet compliance standards' },
  { id: 'OFFICIAL', label: 'OFFICIAL SEAL', color: 'border-indigo-700 text-indigo-700 bg-indigo-50', desc: 'Windows Enterprise Certified' },
];

export const StampModal: React.FC<StampModalProps> = ({
  isOpen,
  onClose,
  onApplyStamp,
}) => {
  const [selectedStamp, setSelectedStamp] = useState<'APPROVED' | 'CONFIDENTIAL' | 'DRAFT' | 'URGENT' | 'REJECTED' | 'OFFICIAL' | 'CUSTOM'>('APPROVED');
  const [customText, setCustomText] = useState('VERIFIED COPY');

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyStamp(selectedStamp, customText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 select-none">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col text-slate-800 dark:text-zinc-100 text-xs">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
              <Stamp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Select Document Stamp</h3>
              <p className="text-[11px] text-slate-500">
                Apply standard compliance and status seals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2.5">
            {STAMPS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStamp(s.id as any)}
                className={`p-3 rounded-lg border flex flex-col items-center justify-center text-center transition-all ${
                  selectedStamp === s.id
                    ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/20'
                    : 'border-slate-200 dark:border-zinc-700 hover:border-slate-300'
                }`}
              >
                <div
                  className={`border-3 font-black text-xs tracking-wider px-2.5 py-1 uppercase rounded-xs transform -rotate-3 ${s.color}`}
                >
                  {s.label}
                </div>
                <span className="text-[10px] text-slate-400 mt-2">{s.desc}</span>
              </button>
            ))}
          </div>

          {/* Custom stamp option */}
          <div className="mt-2 pt-3 border-t border-slate-200 dark:border-zinc-800 flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer font-medium">
              <input
                type="radio"
                name="stampGroup"
                checked={selectedStamp === 'CUSTOM'}
                onChange={() => setSelectedStamp('CUSTOM')}
                className="w-4 h-4 accent-blue-600"
              />
              <span>Custom Text Stamp:</span>
            </label>
            {selectedStamp === 'CUSTOM' && (
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Enter stamp wording..."
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded px-2.5 py-1.5 uppercase font-bold"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-zinc-800/80 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Place Stamp on Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
