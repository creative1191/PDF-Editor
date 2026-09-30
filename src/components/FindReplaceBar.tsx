import React, { useState } from 'react';
import { Search, Replace, ChevronDown, ChevronUp, X, Check } from 'lucide-react';
import { PDFDocument } from '../types/pdf';

interface FindReplaceBarProps {
  isOpen: boolean;
  onClose: () => void;
  document: PDFDocument;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onReplaceOne: (find: string, replace: string) => void;
  onReplaceAll: (find: string, replace: string) => void;
  matchesCount: number;
}

export const FindReplaceBar: React.FC<FindReplaceBarProps> = ({
  isOpen,
  onClose,
  document,
  searchQuery,
  setSearchQuery,
  onReplaceOne,
  onReplaceAll,
  matchesCount,
}) => {
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showReplace, setShowReplace] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="absolute top-2 right-6 z-40 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg shadow-xl p-2.5 flex flex-col gap-2 text-xs text-slate-800 dark:text-zinc-100 min-w-[320px] animate-in slide-in-from-top-2 duration-150 select-none">
      {/* Search Row */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find in document..."
            autoFocus
            className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 pr-14"
          />
          <span className="absolute right-2 top-1.5 text-[10px] text-slate-400">
            {matchesCount > 0 ? `${matchesCount} found` : searchQuery ? 'No match' : ''}
          </span>
        </div>

        <button
          onClick={() => setShowReplace(!showReplace)}
          className={`p-1 rounded ${
            showReplace
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60'
              : 'hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-500'
          }`}
          title="Toggle Replace"
        >
          <Replace className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
          title="Close (Esc)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Replace Row */}
      {showReplace && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-zinc-700/60">
          <input
            type="text"
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            placeholder="Replace with..."
            className="flex-1 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={() => onReplaceOne(searchQuery, replaceQuery)}
            disabled={!searchQuery || matchesCount === 0}
            className="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-700 hover:bg-slate-200 text-xs font-medium disabled:opacity-40"
          >
            Replace
          </button>
          <button
            onClick={() => onReplaceAll(searchQuery, replaceQuery)}
            disabled={!searchQuery || matchesCount === 0}
            className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-2xs disabled:opacity-40"
          >
            All
          </button>
        </div>
      )}
    </div>
  );
};
