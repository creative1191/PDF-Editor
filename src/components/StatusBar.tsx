import React from 'react';
import {
  EditorTool,
  PDFSecuritySettings,
} from '../types/pdf';
import {
  Lock,
  Unlock,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Type,
  PenTool,
} from 'lucide-react';

interface StatusBarProps {
  currentPageIndex: number;
  totalPages: number;
  onJumpToPage: (page: number) => void;
  activeTool: EditorTool;
  security: PDFSecuritySettings;
  onOpenSecurity: () => void;
  zoom: number;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  textBlocksCount: number;
  annotationsCount: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  currentPageIndex,
  totalPages,
  onJumpToPage,
  activeTool,
  security,
  onOpenSecurity,
  zoom,
  setZoom,
  textBlocksCount,
  annotationsCount,
}) => {
  const getToolLabel = () => {
    switch (activeTool) {
      case 'edit-text':
        return 'Editing Text & Layout In-Place';
      case 'add-text':
        return 'Insert Text Box Mode';
      case 'highlight':
        return 'Text Highlight Mode';
      case 'draw':
        return 'Freehand Pen Mode';
      case 'note':
        return 'Sticky Comment Tool';
      case 'redact':
        return 'Redaction Tool (Confidential)';
      case 'ocr-area':
        return 'Snip OCR Area';
      case 'hand':
        return 'Pan & Scroll';
      default:
        return 'Selection Mode';
    }
  };

  return (
    <div className="h-7 bg-[#f3f4f6] dark:bg-[#18181b] border-t border-[#e5e7eb] dark:border-[#27272a] flex items-center justify-between px-3 text-[11px] text-slate-600 dark:text-zinc-400 select-none z-30 font-sans">
      {/* Left: Page Navigator & Current Tool */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span>Page</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPageIndex + 1}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val >= 1 && val <= totalPages) {
                onJumpToPage(val - 1);
              }
            }}
            className="w-9 h-5 px-1 text-center bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded text-slate-900 dark:text-zinc-100 font-medium focus:outline-none"
          />
          <span>of {totalPages}</span>
        </div>

        <div className="h-3 w-px bg-slate-300 dark:bg-zinc-700" />

        {/* Active Tool Badge */}
        <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-zinc-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          <span>{getToolLabel()}</span>
        </div>

        <div className="h-3 w-px bg-slate-300 dark:bg-zinc-700 hidden sm:block" />

        {/* Objects Counter */}
        <div className="hidden sm:flex items-center gap-2 text-slate-500">
          <span>{textBlocksCount} text blocks</span>
          <span>·</span>
          <span>{annotationsCount} markups</span>
        </div>
      </div>

      {/* Right: Security Badge & Zoom Controls */}
      <div className="flex items-center gap-3">
        {/* Security status */}
        <button
          onClick={onOpenSecurity}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors font-medium text-[10px]"
          title="Click to view Security & Encryption status"
        >
          {security.isPasswordProtected ? (
            <>
              <Lock className="w-3 h-3 text-rose-600" />
              <span className="text-rose-700 dark:text-rose-400">AES-256 Protected</span>
            </>
          ) : (
            <>
              <Unlock className="w-3 h-3 text-slate-400" />
              <span>Unprotected</span>
            </>
          )}
        </button>

        <div className="h-3 w-px bg-slate-300 dark:bg-zinc-700" />

        {/* Zoom Stepper & Slider */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-zinc-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-20 accent-blue-600 cursor-pointer h-1 bg-slate-300 rounded"
          />

          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-zinc-800"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <span className="w-10 text-center font-medium font-mono text-[10px]">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={() => setZoom(1.15)}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-[10px]"
            title="Fit to Width"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
