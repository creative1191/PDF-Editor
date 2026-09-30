import React from 'react';
import {
  FileText,
  Save,
  Undo2,
  Redo2,
  Printer,
  Download,
  Lock,
  Unlock,
  ShieldCheck,
  Search,
  Minus,
  Square,
  X,
  FilePlus,
  FolderOpen,
} from 'lucide-react';
import { PDFDocument } from '../types/pdf';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocuments';

interface TitleBarProps {
  document: PDFDocument;
  onSelectSample: (docId: string) => void;
  onNewBlankDoc: () => void;
  onOpenFile: (file: File) => void;
  onSave: () => void;
  onExportPDF: () => void;
  onPrint: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasUnsavedChanges: boolean;
  onOpenSecurity: () => void;
  onToggleSearch: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  document,
  onSelectSample,
  onNewBlankDoc,
  onOpenFile,
  onSave,
  onExportPDF,
  onPrint,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  hasUnsavedChanges,
  onOpenSecurity,
  onToggleSearch,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onOpenFile(e.target.files[0]);
    }
  };

  return (
    <div className="h-10 bg-[#f3f4f6] dark:bg-[#18181b] border-b border-[#e5e7eb] dark:border-[#27272a] flex items-center justify-between select-none px-2 text-xs font-sans text-[#1f2937] dark:text-[#f3f4f6] relative z-40">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.json"
        onChange={handleFileInputChange}
      />

      {/* Left: App Brand & Quick Access Toolbar */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-5 h-5 rounded bg-red-600 text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
            PDF
          </div>
          <span className="font-semibold text-xs tracking-tight text-slate-800 dark:text-slate-100 hidden sm:inline">
            WinPDF Studio
          </span>
        </div>

        {/* Separator */}
        <div className="h-4 w-px bg-slate-300 dark:bg-zinc-700 mx-1" />

        {/* Quick Access Icons */}
        <button
          onClick={onNewBlankDoc}
          title="New Blank Document (Ctrl+N)"
          className="p-1 rounded text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <FilePlus className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          title="Open PDF / Scanned File (Ctrl+O)"
          className="p-1 rounded text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <FolderOpen className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onSave}
          title="Save Document (Ctrl+S)"
          className="p-1 rounded text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={`p-1 rounded transition-colors ${
            canUndo
              ? 'text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800'
              : 'text-slate-300 dark:text-zinc-600 cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className={`p-1 rounded transition-colors ${
            canRedo
              ? 'text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800'
              : 'text-slate-300 dark:text-zinc-600 cursor-not-allowed'
          }`}
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onPrint}
          title="Print Document (Ctrl+P)"
          className="p-1 rounded text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onExportPDF}
          title="Export as Valid .PDF File"
          className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] flex items-center gap-1 transition-colors shadow-xs ml-1"
        >
          <Download className="w-3 h-3" />
          <span>Export PDF</span>
        </button>
      </div>

      {/* Center: File Selector / Document Name & Protection Status */}
      <div className="flex items-center gap-2 max-w-md mx-2">
        <select
          value={document.id}
          onChange={(e) => onSelectSample(e.target.value)}
          className="bg-white/80 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded px-2 py-0.5 text-xs text-slate-800 dark:text-slate-200 font-medium truncate focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs max-w-[240px]"
          title="Choose Sample Document or Working File"
        >
          {SAMPLE_DOCUMENTS.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.title}
            </option>
          ))}
          {!SAMPLE_DOCUMENTS.some((d) => d.id === document.id) && (
            <option value={document.id}>{document.title}</option>
          )}
        </select>

        {hasUnsavedChanges && (
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Unsaved edits" />
        )}

        {/* Security Badge */}
        <button
          onClick={onOpenSecurity}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
            document.security.isPasswordProtected
              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-200'
              : 'bg-slate-200/80 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-slate-300'
          }`}
          title="Security & Password Protection Settings"
        >
          {document.security.isPasswordProtected ? (
            <>
              <Lock className="w-3 h-3 text-rose-600 dark:text-rose-400" />
              <span>AES-256 Protected</span>
            </>
          ) : (
            <>
              <Unlock className="w-3 h-3 text-slate-500" />
              <span>Unprotected</span>
            </>
          )}
        </button>
      </div>

      {/* Right: Quick Search & Standard Windows 11 TitleBar Window Controls */}
      <div className="flex items-center">
        <button
          onClick={onToggleSearch}
          title="Find & Replace in Document (Ctrl+F)"
          className="p-1 rounded text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors mr-2"
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        {/* Windows Window Control Buttons */}
        <div className="flex items-center -mr-2">
          <button
            title="Minimize"
            className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            title="Maximize / Restore"
            className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            title="Close"
            className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-zinc-300 hover:bg-[#c42b1c] hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
