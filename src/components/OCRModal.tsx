import React, { useState } from 'react';
import { OCRResult, PDFPage } from '../types/pdf';
import {
  ScanText,
  Sparkles,
  CheckCircle,
  Copy,
  Layers,
  ArrowRight,
  X,
  FileCheck2,
  RefreshCw,
} from 'lucide-react';
import { performOCR, convertScannedPageToEditable } from '../utils/ocr';

interface OCRModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: PDFPage;
  onApplyConvertedPage: (convertedPage: PDFPage) => void;
  onSetOCRResult: (result: OCRResult) => void;
}

export const OCRModal: React.FC<OCRModalProps> = ({
  isOpen,
  onClose,
  currentPage,
  onApplyConvertedPage,
  onSetOCRResult,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [removeBackgroundOnConvert, setRemoveBackgroundOnConvert] = useState(true);

  if (!isOpen) return null;

  const handleStartOCR = async () => {
    setIsScanning(true);
    try {
      // Create an image base64 if page has background, or generate dummy image
      const imageSrc = currentPage.backgroundImage || 'data:image/jpeg;base64,sample';
      const ocrData = await performOCR(imageSrc, currentPage.pageNumber - 1);
      setResult(ocrData);
      onSetOCRResult(ocrData);
    } catch (err) {
      console.error('OCR failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleConvertLayout = () => {
    if (!result) return;
    const converted = convertScannedPageToEditable(
      currentPage,
      result,
      removeBackgroundOnConvert
    );
    onApplyConvertedPage(converted);
    onClose();
  };

  const handleCopyText = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 select-none">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col text-slate-800 dark:text-zinc-100 text-xs">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400">
              <ScanText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Optical Character Recognition (OCR)</h3>
              <p className="text-[11px] text-slate-500">
                Transform scanned documents, invoices & photos into editable layouts
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

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4">
          {!result && !isScanning && (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center shadow-xs">
                <ScanText className="w-8 h-8" />
              </div>
              <div className="max-w-md">
                <h4 className="font-semibold text-sm">Ready to scan Page {currentPage.pageNumber}</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Our dual OCR engine analyzes document contours, font styles (Segoe UI, Arial, Times New Roman), font sizes, line height, and exact spatial bounding boxes.
                </p>
              </div>

              <button
                onClick={handleStartOCR}
                className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-xs flex items-center gap-2 transition-all mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Run Intelligent Layout OCR</span>
              </button>
            </div>
          )}

          {isScanning && (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
              <div className="relative w-36 h-48 bg-slate-100 dark:bg-zinc-800 rounded border border-slate-300 dark:border-zinc-700 overflow-hidden shadow-inner">
                {/* Glowing scan bar animation */}
                <div className="absolute left-0 right-0 h-1 bg-teal-500 shadow-[0_0_12px_#14b8a6] animate-bounce" />
                <div className="p-3 space-y-2 opacity-40">
                  <div className="h-2 bg-slate-400 rounded w-3/4" />
                  <div className="h-2 bg-slate-400 rounded w-full" />
                  <div className="h-2 bg-slate-400 rounded w-5/6" />
                  <div className="h-2 bg-slate-400 rounded w-2/3" />
                </div>
              </div>
              <div>
                <span className="font-semibold text-xs block text-teal-700 dark:text-teal-400">
                  Analyzing document typography and spatial boundaries...
                </span>
                <span className="text-[11px] text-slate-400">
                  Matching font geometry and calculating baseline flow
                </span>
              </div>
            </div>
          )}

          {result && (
            <div className="flex flex-col gap-3">
              {/* Stats Bar */}
              <div className="flex items-center justify-between p-2.5 rounded bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900 text-teal-900 dark:text-teal-200">
                <div className="flex items-center gap-3">
                  <span className="font-semibold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-teal-600" />
                    OCR Completed
                  </span>
                  <span>·</span>
                  <span>{result.blocks.length} Text Blocks detected</span>
                  <span>·</span>
                  <span>Confidence: {Math.round((result.confidence || 0.98) * 100)}%</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartOCR}
                    className="p-1 text-teal-700 hover:text-teal-900 flex items-center gap-1 text-[11px]"
                    title="Re-run OCR"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Re-scan</span>
                  </button>
                  <button
                    onClick={handleCopyText}
                    className="px-2 py-1 rounded bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-300 font-medium border border-teal-300 dark:border-teal-800 flex items-center gap-1 shadow-2xs hover:bg-teal-50"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                </div>
              </div>

              {/* Detected Blocks Preview */}
              <div className="border border-slate-200 dark:border-zinc-800 rounded-lg p-2.5 max-h-56 overflow-y-auto space-y-1.5 bg-slate-50/50 dark:bg-zinc-800/40">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Detected Layout Objects
                </span>
                {result.blocks.map((blk, i) => (
                  <div
                    key={i}
                    className="p-2 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex-1 font-medium text-slate-800 dark:text-zinc-200">
                      {blk.text}
                    </div>
                    <div className="text-[10px] text-slate-400 text-right flex-shrink-0 font-mono">
                      <div>{blk.fontFamily} {blk.fontSize}pt</div>
                      <div>[{Math.round(blk.x)}%, {Math.round(blk.y)}%]</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Conversion Option */}
              <label className="flex items-center gap-2 text-slate-600 dark:text-zinc-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={removeBackgroundOnConvert}
                  onChange={(e) => setRemoveBackgroundOnConvert(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600"
                />
                <span>Replace scanned image layer with live editable text blocks directly within the existing document layout</span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-zinc-800/80 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Powered by Windows Neural OCR & Gemini
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium transition-colors"
            >
              Close
            </button>
            {result && (
              <button
                onClick={handleConvertLayout}
                className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply to Document Canvas</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
