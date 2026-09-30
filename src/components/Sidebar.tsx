import React from 'react';
import {
  SidebarTab,
  PDFDocument,
  Annotation,
  OCRResult,
} from '../types/pdf';
import {
  Layers,
  Bookmark,
  MessageSquare,
  ScanText,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle2,
  Copy,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeSidebarTab: SidebarTab;
  setActiveSidebarTab: (tab: SidebarTab) => void;
  document: PDFDocument;
  currentPageIndex: number;
  onSelectPage: (index: number) => void;
  onDeleteAnnotation: (pageIndex: number, annId: string) => void;
  ocrResult: OCRResult | null;
  onConvertScannedToEditable: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResultsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setIsOpen,
  activeSidebarTab,
  setActiveSidebarTab,
  document,
  currentPageIndex,
  onSelectPage,
  onDeleteAnnotation,
  ocrResult,
  onConvertScannedToEditable,
  searchQuery,
  setSearchQuery,
  searchResultsCount,
}) => {
  const tabs: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
    { id: 'thumbnails', label: 'Pages', icon: <Layers className="w-4 h-4" /> },
    { id: 'annotations', label: 'Comments', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'ocr-results', label: 'OCR Text', icon: <ScanText className="w-4 h-4" /> },
    { id: 'bookmarks', label: 'Bookmarks', icon: <Bookmark className="w-4 h-4" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-4 h-4" /> },
  ];

  // Count total annotations across document
  const totalAnnotations = document.pages.reduce((acc, p) => acc + p.annotations.length, 0);

  return (
    <div
      className={`bg-white dark:bg-[#18181b] border-r border-[#e5e7eb] dark:border-[#27272a] flex transition-all duration-200 z-30 select-none ${
        isOpen ? 'w-72' : 'w-11'
      }`}
    >
      {/* Icon Rail */}
      <div className="w-11 flex flex-col items-center py-2 border-r border-slate-200/60 dark:border-zinc-800 bg-[#f9fafb] dark:bg-[#1f1f23]">
        <div className="flex flex-col gap-1 w-full items-center">
          {tabs.map((tab) => {
            const isActive = activeSidebarTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSidebarTab(tab.id);
                  if (!isOpen) setIsOpen(true);
                }}
                className={`p-2 rounded relative transition-colors ${
                  isActive && isOpen
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                    : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
                }`}
                title={tab.label}
              >
                {tab.icon}
                {tab.id === 'annotations' && totalAnnotations > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-auto">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors"
            title={isOpen ? 'Collapse Navigation Pane' : 'Expand Navigation Pane'}
          >
            {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Pane Content */}
      {isOpen && (
        <div className="flex-1 flex flex-col h-full overflow-hidden text-xs text-slate-700 dark:text-zinc-200">
          {/* Header */}
          <div className="p-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between font-semibold">
            <span>
              {tabs.find((t) => t.id === activeSidebarTab)?.label || 'Navigation'}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {/* 1. Page Thumbnails */}
            {activeSidebarTab === 'thumbnails' && (
              <div className="flex flex-col gap-3">
                {document.pages.map((page, idx) => {
                  const isSelected = currentPageIndex === idx;
                  return (
                    <div
                      key={page.id}
                      onClick={() => onSelectPage(idx)}
                      className={`cursor-pointer rounded border p-2 transition-all flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? 'border-blue-600 ring-2 ring-blue-400/40 bg-blue-50/50 dark:bg-blue-950/30'
                          : 'border-slate-200 dark:border-zinc-800 hover:border-slate-400 bg-white dark:bg-zinc-900 shadow-2xs'
                      }`}
                    >
                      {/* Mini preview card */}
                      <div className="w-36 h-48 bg-white border border-slate-200 dark:border-zinc-700 rounded shadow-xs relative overflow-hidden flex flex-col p-1.5 text-[6px] text-slate-400 pointer-events-none select-none">
                        {page.isScanned ? (
                          <div className="flex-1 flex flex-col items-center justify-center bg-amber-50/50 text-amber-800 font-sans p-1 text-center">
                            <span className="font-bold text-[8px]">Scanned Image</span>
                            <span className="text-[6px] text-amber-600">OCR Ready</span>
                          </div>
                        ) : (
                          <div className="flex-1 overflow-hidden space-y-1 opacity-70">
                            {page.textBlocks.slice(0, 5).map((tb, i) => (
                              <div
                                key={i}
                                className="truncate font-sans"
                                style={{
                                  fontSize: '6px',
                                  fontWeight: tb.fontWeight,
                                }}
                              >
                                {tb.text.slice(0, 35)}
                              </div>
                            ))}
                          </div>
                        )}
                        {page.annotations.length > 0 && (
                          <div className="absolute bottom-1 right-1 text-[7px] bg-blue-600 text-white px-1 rounded font-bold">
                            {page.annotations.length} ann
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">
                        Page {idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. Annotations & Sticky Notes */}
            {activeSidebarTab === 'annotations' && (
              <div className="flex flex-col gap-2">
                {document.pages.flatMap((page, pageIdx) =>
                  page.annotations.map((ann) => (
                    <div
                      key={ann.id}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs capitalize text-slate-800 dark:text-zinc-100 flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: ann.color || '#3b82f6' }}
                          />
                          {ann.type} (Page {pageIdx + 1})
                        </span>
                        <button
                          onClick={() => onDeleteAnnotation(pageIdx, ann.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                          title="Delete Annotation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {ann.content && (
                        <p className="text-[11px] text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-800/60 p-1.5 rounded">
                          "{ann.content}"
                        </p>
                      )}

                      {ann.stampType && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded self-start">
                          STAMP: {ann.stampType}
                        </span>
                      )}

                      {ann.signatureData && (
                        <span className="text-[10px] text-blue-700 italic">
                          Signed: {ann.signatureData.slice(0, 20)}
                        </span>
                      )}

                      {ann.author && (
                        <div className="text-[10px] text-slate-400 flex items-center justify-between">
                          <span>{ann.author}</span>
                          <span>{ann.date || 'Today'}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}

                {totalAnnotations === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No annotations or comments on this document yet. Use the Highlight, Pen, or Comment tools to add markups.
                  </div>
                )}
              </div>
            )}

            {/* 3. OCR Extracted Text Panel */}
            {activeSidebarTab === 'ocr-results' && (
              <div className="flex flex-col gap-3">
                {ocrResult ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-teal-700 dark:text-teal-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        {ocrResult.blocks.length} Blocks Recognized
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(ocrResult.fullText);
                        }}
                        className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-1 text-[11px]"
                        title="Copy All OCR Text"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>

                    <button
                      onClick={onConvertScannedToEditable}
                      className="w-full py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Convert Scanned to Editable Layout</span>
                    </button>

                    <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
                      {ocrResult.blocks.map((b, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 text-[11px]"
                        >
                          <div className="font-medium text-slate-800 dark:text-zinc-200 line-clamp-3">
                            {b.text}
                          </div>
                          <div className="mt-1 text-[9px] text-slate-400 flex items-center justify-between">
                            <span>{b.fontFamily} · {b.fontSize}pt</span>
                            <span>Pos: {Math.round(b.x)}%, {Math.round(b.y)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No OCR scan performed yet. Select "OCR & AI Tools" in ribbon or click "Scan Page with OCR" to analyze text.
                  </div>
                )}
              </div>
            )}

            {/* 4. Bookmarks */}
            {activeSidebarTab === 'bookmarks' && (
              <div className="flex flex-col gap-1.5">
                {document.pages.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => onSelectPage(idx)}
                    className="text-left p-2 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 text-xs"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                    <span>Page {idx + 1}: {p.textBlocks[0]?.text.slice(0, 28) || 'Document Section'}</span>
                  </button>
                ))}
              </div>
            )}

            {/* 5. Search In Document */}
            {activeSidebarTab === 'search' && (
              <div className="flex flex-col gap-2.5">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search text in document..."
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                </div>

                {searchQuery && (
                  <div className="text-[11px] text-slate-500">
                    Found {searchResultsCount} matching occurrence{searchResultsCount === 1 ? '' : 's'}.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
