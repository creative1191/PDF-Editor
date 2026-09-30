import React, { useRef, useState, useEffect } from 'react';
import { FileSignature, PenTool, Type, Upload, RotateCcw, Check, X } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySignature: (signatureData: string, type: 'drawn' | 'typed' | 'image') => void;
}

const CURSIVE_FONTS = [
  { name: 'Brush Script', font: 'cursive, "Brush Script MT", "Segoe Script"' },
  { name: 'Classic Script', font: 'Georgia, serif, italic' },
  { name: 'Modern Signature', font: '"Segoe UI", sans-serif, italic' },
];

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onApplySignature,
}) => {
  const [mode, setMode] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedName, setTypedName] = useState('David K. Vance');
  const [selectedFontIndex, setSelectedFontIndex] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (isOpen && mode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e3a8a'; // Windows deep blue ink
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleApply = () => {
    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return;
      const dataUrl = canvas.toDataURL('image/png');
      onApplySignature(dataUrl, 'drawn');
    } else if (mode === 'type') {
      if (!typedName.trim()) return;
      onApplySignature(typedName, 'typed');
    } else if (mode === 'upload') {
      if (!uploadedImage) return;
      onApplySignature(uploadedImage, 'image');
    }
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 select-none">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-slate-800 dark:text-zinc-100 text-xs">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Create Digital E-Signature</h3>
              <p className="text-[11px] text-slate-500">
                Sign legal documents, contracts & approvals
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

        {/* Tab switcher */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 dark:border-zinc-800">
          <button
            onClick={() => setMode('draw')}
            className={`px-3 py-1.5 font-medium rounded-t border-b-2 flex items-center gap-1.5 transition-colors ${
              mode === 'draw'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Draw</span>
          </button>
          <button
            onClick={() => setMode('type')}
            className={`px-3 py-1.5 font-medium rounded-t border-b-2 flex items-center gap-1.5 transition-colors ${
              mode === 'type'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Type Name</span>
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`px-3 py-1.5 font-medium rounded-t border-b-2 flex items-center gap-1.5 transition-colors ${
              mode === 'upload'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 flex-1 min-h-[220px]">
          {mode === 'draw' && (
            <div className="flex flex-col gap-2">
              <div className="relative border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-lg bg-slate-50/50 dark:bg-zinc-800/40 overflow-hidden cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={170}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full h-40 block"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
                    Sign with mouse or touch here
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="px-2.5 py-1 text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Signature</span>
                </button>
              </div>
            </div>
          )}

          {mode === 'type' && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                  Your Full Legal Name:
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-2 mt-1">
                <span className="text-[11px] text-slate-500">Choose Signature Style:</span>
                {CURSIVE_FONTS.map((font, idx) => (
                  <button
                    key={font.name}
                    onClick={() => setSelectedFontIndex(idx)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedFontIndex === idx
                        ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-zinc-700 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className="text-lg text-blue-900 dark:text-blue-200 block"
                      style={{ fontStyle: 'italic', fontFamily: font.font }}
                    >
                      {typedName || 'Your Name'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 block">{font.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'upload' && (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-lg bg-slate-50/50 text-center gap-3">
              {uploadedImage ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={uploadedImage}
                    alt="Uploaded signature"
                    className="max-h-24 object-contain border p-2 bg-white rounded"
                  />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="text-rose-600 hover:underline text-[11px]"
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-400" />
                  <div>
                    <span className="font-semibold text-xs block">
                      Upload transparent PNG signature
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Recommended: High contrast black/blue ink on white or transparent background
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-xs"
                  />
                </>
              )}
            </div>
          )}
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
            className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Signature to Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
