import React from 'react';
import {
  RibbonTab,
  EditorTool,
  TextBlock,
} from '../types/pdf';
import {
  MousePointer,
  Hand,
  Type,
  PlusSquare,
  Highlighter,
  PenTool,
  Square,
  Circle,
  MessageSquare,
  Stamp,
  FileSignature,
  EyeOff,
  Eraser,
  ScanText,
  Sparkles,
  Lock,
  Shield,
  FileCheck,
  RotateCw,
  Trash2,
  Copy,
  Scissors,
  ClipboardPaste,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  FilePlus,
  Palette,
  ChevronDown,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface RibbonProps {
  activeTab: RibbonTab;
  setActiveTab: (tab: RibbonTab) => void;
  activeTool: EditorTool;
  setActiveTool: (tool: EditorTool) => void;
  selectedBlock: TextBlock | null;
  onUpdateSelectedBlock: (updates: Partial<TextBlock>) => void;
  onDeleteSelectedBlock: () => void;
  onAddNewTextBlock: () => void;
  onOpenSecurityModal: () => void;
  onOpenOCRModal: () => void;
  onConvertScannedToEditable: () => void;
  onOpenSignatureModal: () => void;
  onOpenStampModal: () => void;
  onOpenPageOrganizer: () => void;
  onInsertBlankPage: () => void;
  onRotateCurrentPage: () => void;
  onDeleteCurrentPage: () => void;
  zoom: number;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean | ((prev: boolean) => boolean)) => void;
  activeHighlightColor: string;
  setActiveHighlightColor: (color: string) => void;
  activeDrawColor: string;
  setActiveDrawColor: (color: string) => void;
  drawStrokeWidth: number;
  setDrawStrokeWidth: (w: number) => void;
  canCopy: boolean;
  onCopySelected: () => void;
  onPaste: () => void;
}

const FONT_FAMILIES = [
  'Segoe UI',
  'Arial',
  'Calibri',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Trebuchet MS',
  'Impact',
];

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', hex: '#fef08a' },
  { name: 'Green', hex: '#bbf7d0' },
  { name: 'Cyan', hex: '#a5f3fc' },
  { name: 'Pink', hex: '#fbcfe8' },
  { name: 'Orange', hex: '#fed7aa' },
];

export const Ribbon: React.FC<RibbonProps> = ({
  activeTab,
  setActiveTab,
  activeTool,
  setActiveTool,
  selectedBlock,
  onUpdateSelectedBlock,
  onDeleteSelectedBlock,
  onAddNewTextBlock,
  onOpenSecurityModal,
  onOpenOCRModal,
  onConvertScannedToEditable,
  onOpenSignatureModal,
  onOpenStampModal,
  onOpenPageOrganizer,
  onInsertBlankPage,
  onRotateCurrentPage,
  onDeleteCurrentPage,
  zoom,
  setZoom,
  showGrid,
  setShowGrid,
  activeHighlightColor,
  setActiveHighlightColor,
  activeDrawColor,
  setActiveDrawColor,
  drawStrokeWidth,
  setDrawStrokeWidth,
  canCopy,
  onCopySelected,
  onPaste,
}) => {
  const tabs: { id: RibbonTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'edit', label: 'Edit & Text' },
    { id: 'annotate', label: 'Annotate & Markup' },
    { id: 'ocr', label: 'OCR & AI Tools' },
    { id: 'security', label: 'Security & Protect' },
    { id: 'pages', label: 'Page Organizer' },
    { id: 'view', label: 'View' },
  ];

  return (
    <div className="bg-[#fdfdfd] dark:bg-[#1f1f23] border-b border-[#e5e7eb] dark:border-[#2e2e33] flex flex-col shadow-xs select-none">
      {/* Ribbon Tab Bar */}
      <div className="flex items-center gap-1 px-3 pt-1 border-b border-[#e5e7eb]/70 dark:border-[#2e2e33]/70">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium transition-all relative rounded-t-md ${
                isActive
                  ? 'bg-white dark:bg-[#27272a] text-blue-600 dark:text-blue-400 border-t-2 border-t-blue-600 dark:border-t-blue-400 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100/70 dark:hover:bg-zinc-800/70'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Ribbon Command Panel */}
      <div className="h-24 px-3 py-1.5 flex items-center gap-3 overflow-x-auto text-xs text-slate-700 dark:text-zinc-200">
        {/* --- HOME TAB --- */}
        {activeTab === 'home' && (
          <>
            {/* Clipboard Group */}
            <div className="flex flex-col items-center justify-between h-full pr-3 border-r border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-1">
                <button
                  onClick={onPaste}
                  className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Paste Clipboard"
                >
                  <ClipboardPaste className="w-5 h-5 text-slate-700 dark:text-zinc-300" />
                  <span className="text-[10px] mt-0.5">Paste</span>
                </button>
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={onCopySelected}
                    disabled={!canCopy}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] ${
                      canCopy
                        ? 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                        : 'text-slate-300 dark:text-zinc-600 cursor-not-allowed'
                    }`}
                    title="Copy Selected"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={onCopySelected}
                    disabled={!canCopy}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] ${
                      canCopy
                        ? 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                        : 'text-slate-300 dark:text-zinc-600 cursor-not-allowed'
                    }`}
                    title="Cut Selected"
                  >
                    <Scissors className="w-3 h-3" />
                    <span>Cut</span>
                  </button>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Clipboard</span>
            </div>

            {/* Selection & Modes */}
            <div className="flex flex-col items-center justify-between h-full pr-3 border-r border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTool('select')}
                  className={`flex flex-col items-center justify-center p-1.5 rounded transition-all ${
                    activeTool === 'select'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-semibold ring-1 ring-blue-400'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                  title="Select & Pan Tool (V)"
                >
                  <MousePointer className="w-4 h-4" />
                  <span className="text-[10px] mt-0.5">Select</span>
                </button>
                <button
                  onClick={() => setActiveTool('hand')}
                  className={`flex flex-col items-center justify-center p-1.5 rounded transition-all ${
                    activeTool === 'hand'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-semibold ring-1 ring-blue-400'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                  title="Hand Tool (H)"
                >
                  <Hand className="w-4 h-4" />
                  <span className="text-[10px] mt-0.5">Hand</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Navigate</span>
            </div>

            {/* Core Text & Edit Highlight */}
            <div className="flex flex-col items-center justify-between h-full pr-3 border-r border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTool('edit-text')}
                  className={`flex flex-col items-center justify-center px-2.5 py-1 rounded transition-all ${
                    activeTool === 'edit-text'
                      ? 'bg-blue-600 text-white font-semibold shadow-xs ring-2 ring-blue-400'
                      : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
                  }`}
                  title="Edit existing document text in-place (Click any text on the page)"
                >
                  <Type className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5 font-bold">Edit Text</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTool('add-text');
                    onAddNewTextBlock();
                  }}
                  className={`flex flex-col items-center justify-center px-2 py-1 rounded transition-all ${
                    activeTool === 'add-text'
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 font-semibold ring-1 ring-indigo-400'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                  title="Add New Text Block"
                >
                  <PlusSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-[10px] mt-0.5">Add Text</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">In-Place Editing</span>
            </div>

            {/* Quick Markup Tools */}
            <div className="flex flex-col items-center justify-between h-full pr-3 border-r border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTool('highlight')}
                  className={`p-1.5 rounded transition-all ${
                    activeTool === 'highlight'
                      ? 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-400'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                  title="Highlight Text (H)"
                >
                  <Highlighter className="w-4 h-4 text-yellow-600" />
                </button>
                <button
                  onClick={() => setActiveTool('draw')}
                  className={`p-1.5 rounded transition-all ${
                    activeTool === 'draw'
                      ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-400'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                  title="Freehand Draw / Pen"
                >
                  <PenTool className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => setActiveTool('note')}
                  className={`p-1.5 rounded transition-all ${
                    activeTool === 'note'
                      ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-400'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                  title="Add Sticky Comment"
                >
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                </button>
                <button
                  onClick={onOpenSignatureModal}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
                  title="Digital E-Signature"
                >
                  <FileSignature className="w-4 h-4 text-emerald-600" />
                </button>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Quick Markup</span>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col items-center justify-between h-full">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenOCRModal}
                  className="flex flex-col items-center justify-center px-2 py-1 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition-colors"
                  title="Run Optical Character Recognition"
                >
                  <ScanText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-[10px] mt-0.5 font-medium">Quick OCR</span>
                </button>
                <button
                  onClick={onOpenSecurityModal}
                  className="flex flex-col items-center justify-center px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors"
                  title="Configure AES-256 Protection & Passwords"
                >
                  <Shield className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span className="text-[10px] mt-0.5 font-medium">Protect</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Tools</span>
            </div>
          </>
        )}

        {/* --- EDIT & TEXT TAB --- */}
        {activeTab === 'edit' && (
          <>
            {/* Font Family & Size */}
            <div className="flex flex-col justify-between h-full pr-3 border-r border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <select
                  value={selectedBlock?.fontFamily || 'Segoe UI'}
                  onChange={(e) => onUpdateSelectedBlock({ fontFamily: e.target.value })}
                  disabled={!selectedBlock}
                  className="bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded px-2 py-1 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 min-w-[130px]"
                >
                  {FONT_FAMILIES.map((font) => (
                    <option key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </option>
                  ))}
                </select>

                <div className="flex items-center border border-slate-300 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 overflow-hidden">
                  <input
                    type="number"
                    min="6"
                    max="72"
                    value={selectedBlock?.fontSize || 12}
                    onChange={(e) =>
                      onUpdateSelectedBlock({ fontSize: Math.max(6, Number(e.target.value)) })
                    }
                    disabled={!selectedBlock}
                    className="w-11 px-1.5 py-1 text-xs text-center text-slate-800 dark:text-zinc-200 focus:outline-none disabled:opacity-50"
                  />
                  <div className="flex flex-col border-l border-slate-200 dark:border-zinc-700">
                    <button
                      onClick={() =>
                        onUpdateSelectedBlock({
                          fontSize: Math.min(72, (selectedBlock?.fontSize || 12) + 1),
                        })
                      }
                      disabled={!selectedBlock}
                      className="px-1 text-[9px] hover:bg-slate-100 dark:hover:bg-zinc-700"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() =>
                        onUpdateSelectedBlock({
                          fontSize: Math.max(6, (selectedBlock?.fontSize || 12) - 1),
                        })
                      }
                      disabled={!selectedBlock}
                      className="px-1 text-[9px] hover:bg-slate-100 dark:hover:bg-zinc-700"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>

              {/* Bold, Italic, Underline, Strikethrough, Color */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    onUpdateSelectedBlock({
                      fontWeight: selectedBlock?.fontWeight === 'bold' ? 'normal' : 'bold',
                    })
                  }
                  disabled={!selectedBlock}
                  className={`p-1 rounded ${
                    selectedBlock?.fontWeight === 'bold'
                      ? 'bg-blue-100 text-blue-700 font-bold dark:bg-blue-900/60'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  } disabled:opacity-50`}
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() =>
                    onUpdateSelectedBlock({
                      fontStyle: selectedBlock?.fontStyle === 'italic' ? 'normal' : 'italic',
                    })
                  }
                  disabled={!selectedBlock}
                  className={`p-1 rounded ${
                    selectedBlock?.fontStyle === 'italic'
                      ? 'bg-blue-100 text-blue-700 font-bold dark:bg-blue-900/60'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  } disabled:opacity-50`}
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() =>
                    onUpdateSelectedBlock({
                      textDecoration:
                        selectedBlock?.textDecoration === 'underline' ? 'none' : 'underline',
                    })
                  }
                  disabled={!selectedBlock}
                  className={`p-1 rounded ${
                    selectedBlock?.textDecoration === 'underline'
                      ? 'bg-blue-100 text-blue-700 font-bold dark:bg-blue-900/60'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  } disabled:opacity-50`}
                  title="Underline (Ctrl+U)"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() =>
                    onUpdateSelectedBlock({
                      textDecoration:
                        selectedBlock?.textDecoration === 'line-through' ? 'none' : 'line-through',
                    })
                  }
                  disabled={!selectedBlock}
                  className={`p-1 rounded ${
                    selectedBlock?.textDecoration === 'line-through'
                      ? 'bg-blue-100 text-blue-700 font-bold dark:bg-blue-900/60'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  } disabled:opacity-50`}
                  title="Strikethrough"
                >
                  <Strikethrough className="w-3.5 h-3.5" />
                </button>

                <div className="h-4 w-px bg-slate-300 dark:bg-zinc-700 mx-1" />

                {/* Text Color Picker */}
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={selectedBlock?.color || '#0f172a'}
                    onChange={(e) => onUpdateSelectedBlock({ color: e.target.value })}
                    disabled={!selectedBlock}
                    className="w-5 h-5 rounded cursor-pointer border border-slate-300 dark:border-zinc-700 p-0 disabled:opacity-50"
                    title="Font Color"
                  />
                </div>
              </div>

              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Typography & Font</span>
            </div>

            {/* Paragraph & Alignment */}
            <div className="flex flex-col justify-between h-full pr-3 border-r border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onUpdateSelectedBlock({ textAlign: 'left' })}
                  disabled={!selectedBlock}
                  className={`p-1 rounded ${
                    selectedBlock?.textAlign === 'left' || !selectedBlock?.textAlign
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  } disabled:opacity-50`}
                  title="Align Left"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onUpdateSelectedBlock({ textAlign: 'center' })}
                  disabled={!selectedBlock}
                  className={`p-1 rounded ${
                    selectedBlock?.textAlign === 'center'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  } disabled:opacity-50`}
                  title="Align Center"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onUpdateSelectedBlock({ textAlign: 'right' })}
                  disabled={!selectedBlock}
                  className={`p-1 rounded ${
                    selectedBlock?.textAlign === 'right'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  } disabled:opacity-50`}
                  title="Align Right"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onUpdateSelectedBlock({ textAlign: 'justify' })}
                  disabled={!selectedBlock}
                  className={`p-1 rounded ${
                    selectedBlock?.textAlign === 'justify'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  } disabled:opacity-50`}
                  title="Justify"
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-slate-500">Spacing:</span>
                <select
                  value={selectedBlock?.lineHeight || 1.4}
                  onChange={(e) =>
                    onUpdateSelectedBlock({ lineHeight: parseFloat(e.target.value) })
                  }
                  disabled={!selectedBlock}
                  className="bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded px-1 py-0.5 text-[11px] disabled:opacity-50"
                >
                  <option value={1.15}>Single (1.15)</option>
                  <option value={1.3}>1.30</option>
                  <option value={1.45}>1.45</option>
                  <option value={1.6}>1.60</option>
                  <option value={2.0}>Double (2.0)</option>
                </select>
              </div>

              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Paragraph Flow</span>
            </div>

            {/* Block Layout Management */}
            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveTool('add-text');
                    onAddNewTextBlock();
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-medium"
                >
                  <PlusSquare className="w-3.5 h-3.5" />
                  <span>Insert Text Box</span>
                </button>

                <button
                  onClick={onDeleteSelectedBlock}
                  disabled={!selectedBlock}
                  className="flex items-center gap-1 px-2 py-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Block</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-500 italic">
                {selectedBlock
                  ? `Editing block: "${selectedBlock.text.slice(0, 24)}..."`
                  : 'Click any text on the page to edit formatting'}
              </div>

              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Document Objects</span>
            </div>
          </>
        )}

        {/* --- ANNOTATE & MARKUP TAB --- */}
        {activeTab === 'annotate' && (
          <>
            {/* Highlight & Colors */}
            <div className="flex flex-col justify-between h-full pr-3 border-r border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTool('highlight')}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                    activeTool === 'highlight'
                      ? 'bg-yellow-200 text-yellow-900 font-semibold ring-1 ring-yellow-400'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                  title="Highlight Text with Opacity"
                >
                  <Highlighter className="w-4 h-4 text-yellow-600" />
                  <span>Highlight</span>
                </button>

                {/* Color swatches */}
                <div className="flex items-center gap-1">
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        setActiveHighlightColor(c.hex);
                        setActiveTool('highlight');
                      }}
                      className={`w-4 h-4 rounded-full border ${
                        activeHighlightColor === c.hex ? 'ring-2 ring-blue-500 scale-110' : 'border-slate-300'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Highlight & Markup</span>
            </div>

            {/* Freehand Drawing */}
            <div className="flex flex-col justify-between h-full pr-3 border-r border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTool('draw')}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                    activeTool === 'draw'
                      ? 'bg-blue-100 text-blue-700 font-semibold ring-1 ring-blue-400'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                  title="Draw on Document"
                >
                  <PenTool className="w-4 h-4 text-blue-600" />
                  <span>Pen</span>
                </button>

                <input
                  type="color"
                  value={activeDrawColor}
                  onChange={(e) => setActiveDrawColor(e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border border-slate-300 p-0"
                  title="Pen Color"
                />

                <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-zinc-400">
                  <span>Width:</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={drawStrokeWidth}
                    onChange={(e) => setDrawStrokeWidth(Number(e.target.value))}
                    className="w-16 accent-blue-600 cursor-pointer"
                  />
                  <span>{drawStrokeWidth}px</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Freehand Pen</span>
            </div>

            {/* Shapes */}
            <div className="flex flex-col justify-between h-full pr-3 border-r border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTool('shape')}
                  className={`p-1.5 rounded transition-all ${
                    activeTool === 'shape'
                      ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-400'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                  title="Rectangle Shape"
                >
                  <Square className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTool('shape')}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
                  title="Ellipse Shape"
                >
                  <Circle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTool('shape')}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
                  title="Arrow Marker"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Geometric Shapes</span>
            </div>

            {/* Signatures & Stamps & Redaction */}
            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenSignatureModal}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-medium transition-colors"
                >
                  <FileSignature className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sign Document</span>
                </button>

                <button
                  onClick={onOpenStampModal}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-medium transition-colors"
                >
                  <Stamp className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-300" />
                  <span>Stamp</span>
                </button>

                <button
                  onClick={() => setActiveTool('redact')}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                    activeTool === 'redact'
                      ? 'bg-neutral-900 text-white font-semibold ring-1 ring-black'
                      : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-800 dark:text-neutral-200'
                  }`}
                  title="Permanently black-out confidential data"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Redact</span>
                </button>

                <button
                  onClick={() => setActiveTool('eraser')}
                  className={`p-1.5 rounded transition-all ${
                    activeTool === 'eraser'
                      ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-400'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                  title="Eraser tool (Click annotation to remove)"
                >
                  <Eraser className="w-4 h-4 text-rose-500" />
                </button>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Compliance & Signatures</span>
            </div>
          </>
        )}

        {/* --- OCR & AI TOOLS TAB --- */}
        {activeTab === 'ocr' && (
          <>
            {/* Primary OCR Actions */}
            <div className="flex flex-col justify-between h-full pr-3 border-r border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenOCRModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <ScanText className="w-4 h-4" />
                  <span>Scan Page with OCR</span>
                </button>

                <button
                  onClick={onConvertScannedToEditable}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  title="Convert scanned image directly into editable layout"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Convert to Editable Layout</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Layout Character Recognition</span>
            </div>

            {/* OCR Options */}
            <div className="flex flex-col justify-between h-full pr-3 border-r border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Engine:</span>
                <span className="font-semibold text-teal-700 dark:text-teal-400">
                  Gemini 3.8 Flash + Windows Neural OCR
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Detects text, font family, font size, bold/italic, and spatial layout coordinates.
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">OCR Settings</span>
            </div>

            {/* Area OCR */}
            <div className="flex flex-col justify-between h-full">
              <button
                onClick={() => setActiveTool('ocr-area')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  activeTool === 'ocr-area'
                    ? 'bg-teal-100 text-teal-800 ring-1 ring-teal-400 font-semibold'
                    : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                }`}
                title="Snip and OCR a custom rectangular section"
              >
                <PlusSquare className="w-4 h-4 text-teal-600" />
                <span>Area Snip OCR</span>
              </button>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Targeted Snip</span>
            </div>
          </>
        )}

        {/* --- SECURITY & PROTECT TAB --- */}
        {activeTab === 'security' && (
          <>
            <div className="flex flex-col justify-between h-full pr-3 border-r border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenSecurityModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  <span>Password Protect (AES-256)</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Encryption & Passwords</span>
            </div>

            <div className="flex flex-col justify-between h-full pr-3 border-r border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenSecurityModal}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-xs font-medium transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                  <span>Restrict Permissions</span>
                </button>
                <button
                  onClick={onOpenSecurityModal}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-xs font-medium transition-colors"
                >
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Configure Watermark</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Rights & Protection</span>
            </div>

            <div className="flex flex-col justify-between h-full">
              <button
                onClick={onOpenSecurityModal}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-xs font-medium transition-colors"
              >
                <span>Sanitize Hidden Metadata</span>
              </button>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Data Hygiene</span>
            </div>
          </>
        )}

        {/* --- PAGE ORGANIZER TAB --- */}
        {activeTab === 'pages' && (
          <>
            <div className="flex flex-col justify-between h-full pr-3 border-r border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenPageOrganizer}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Layers className="w-4 h-4" />
                  <span>Page Grid Organizer</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Reorder & Extract</span>
            </div>

            <div className="flex flex-col justify-between h-full pr-3 border-r border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onInsertBlankPage}
                  className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors"
                >
                  <FilePlus className="w-3.5 h-3.5 text-blue-600" />
                  <span>Insert Page</span>
                </button>
                <button
                  onClick={onRotateCurrentPage}
                  className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-300" />
                  <span>Rotate 90°</span>
                </button>
                <button
                  onClick={onDeleteCurrentPage}
                  className="flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 text-xs font-medium transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Page</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Page Actions</span>
            </div>
          </>
        )}

        {/* --- VIEW TAB --- */}
        {activeTab === 'view' && (
          <>
            <div className="flex flex-col justify-between h-full pr-3 border-r border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <span className="w-12 text-center text-xs font-medium">
                  {Math.round(zoom * 100)}%
                </span>

                <button
                  onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setZoom(1.0)}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-xs font-medium"
                >
                  100%
                </button>

                <button
                  onClick={() => setZoom(1.15)}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-xs font-medium"
                >
                  Fit Width
                </button>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Zoom Controls</span>
            </div>

            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowGrid((g) => !g)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium ${
                    showGrid
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 font-semibold'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Document Grid & Guides</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Visual Guides</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
