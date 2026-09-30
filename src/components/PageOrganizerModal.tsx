import React from 'react';
import { PDFDocument, PDFPage } from '../types/pdf';
import {
  Layers,
  RotateCw,
  RotateCcw,
  Trash2,
  FilePlus,
  Copy,
  ArrowUp,
  ArrowDown,
  X,
  Check,
} from 'lucide-react';

interface PageOrganizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: PDFDocument;
  onReorderPages: (newPages: PDFPage[]) => void;
  onInsertBlankPage: () => void;
  onRotatePage: (pageIndex: number, degrees: number) => void;
  onDeletePage: (pageIndex: number) => void;
  onDuplicatePage: (pageIndex: number) => void;
}

export const PageOrganizerModal: React.FC<PageOrganizerModalProps> = ({
  isOpen,
  onClose,
  document,
  onReorderPages,
  onInsertBlankPage,
  onRotatePage,
  onDeletePage,
  onDuplicatePage,
}) => {
  if (!isOpen) return null;

  const movePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= document.pages.length) return;
    const updated = [...document.pages];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    // re-index page numbers
    const renumbered = updated.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    onReorderPages(renumbered);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 select-none">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col text-slate-800 dark:text-zinc-100 text-xs max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Page Organizer & Grid Manager</h3>
              <p className="text-[11px] text-slate-500">
                Reorder, rotate, duplicate and extract pages
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

        {/* Toolbar */}
        <div className="px-5 py-2.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 flex items-center justify-between">
          <span className="text-slate-500 font-medium">
            Total {document.pages.length} Pages in Document
          </span>
          <button
            onClick={onInsertBlankPage}
            className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>Insert New Blank Page</span>
          </button>
        </div>

        {/* Grid of Pages */}
        <div className="p-6 flex-1 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-6 bg-slate-100/50 dark:bg-zinc-950/50">
          {document.pages.map((page, idx) => (
            <div
              key={page.id}
              className="flex flex-col items-center gap-2 bg-white dark:bg-zinc-800 p-3 rounded-lg border border-slate-200 dark:border-zinc-700 shadow-xs group"
            >
              {/* Thumbnail preview */}
              <div className="w-32 h-44 bg-white border border-slate-200 dark:border-zinc-600 rounded shadow-xs relative overflow-hidden flex flex-col p-1.5 text-[5px] text-slate-400 pointer-events-none select-none">
                {page.isScanned ? (
                  <div className="flex-1 flex flex-col items-center justify-center bg-amber-50 text-amber-800 font-bold p-1 text-center">
                    Scanned Document
                  </div>
                ) : (
                  <div className="space-y-0.5 opacity-60">
                    {page.textBlocks.slice(0, 6).map((tb, i) => (
                      <div key={i} className="truncate font-sans">
                        {tb.text.slice(0, 20)}
                      </div>
                    ))}
                  </div>
                )}
                <div className="absolute top-1 right-1 bg-black/60 text-white px-1 rounded text-[7px] font-bold">
                  {page.rotation}°
                </div>
              </div>

              <span className="font-semibold text-xs text-slate-700 dark:text-zinc-300">
                Page {idx + 1}
              </span>

              {/* Action buttons */}
              <div className="flex items-center gap-1 mt-1">
                <button
                  onClick={() => movePage(idx, idx - 1)}
                  disabled={idx === 0}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 disabled:opacity-30"
                  title="Move Page Left / Up"
                >
                  <ArrowUp className="w-3.5 h-3.5 -rotate-90" />
                </button>
                <button
                  onClick={() => movePage(idx, idx + 1)}
                  disabled={idx === document.pages.length - 1}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 disabled:opacity-30"
                  title="Move Page Right / Down"
                >
                  <ArrowDown className="w-3.5 h-3.5 -rotate-90" />
                </button>
                <button
                  onClick={() => onRotatePage(idx, 90)}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300"
                  title="Rotate 90° Clockwise"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDuplicatePage(idx)}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-700 text-blue-600"
                  title="Duplicate Page"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeletePage(idx)}
                  disabled={document.pages.length <= 1}
                  className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 disabled:opacity-30"
                  title="Delete Page"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-zinc-800/80 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
