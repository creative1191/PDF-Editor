import React, { useRef, useState, useEffect } from 'react';
import {
  PDFDocument,
  PDFPage,
  TextBlock,
  Annotation,
  EditorTool,
} from '../types/pdf';
import {
  MessageSquare,
  Trash2,
  Move,
  GripHorizontal,
  X,
  Check,
} from 'lucide-react';

interface DocumentCanvasProps {
  document: PDFDocument;
  currentPageIndex: number;
  setCurrentPageIndex: (idx: number) => void;
  activeTool: EditorTool;
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;
  onUpdateTextBlock: (pageIndex: number, blockId: string, updates: Partial<TextBlock>) => void;
  onDeleteTextBlock: (pageIndex: number, blockId: string) => void;
  onAddTextBlockAt: (pageIndex: number, x: number, y: number) => void;
  onAddAnnotation: (pageIndex: number, annotation: Annotation) => void;
  onDeleteAnnotation: (pageIndex: number, annId: string) => void;
  zoom: number;
  showGrid: boolean;
  activeHighlightColor: string;
  activeDrawColor: string;
  drawStrokeWidth: number;
  searchQuery: string;
}

export const DocumentCanvas: React.FC<DocumentCanvasProps> = ({
  document,
  currentPageIndex,
  setCurrentPageIndex,
  activeTool,
  selectedBlockId,
  setSelectedBlockId,
  onUpdateTextBlock,
  onDeleteTextBlock,
  onAddTextBlockAt,
  onAddAnnotation,
  onDeleteAnnotation,
  zoom,
  showGrid,
  activeHighlightColor,
  activeDrawColor,
  drawStrokeWidth,
  searchQuery,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Dragging / Moving text blocks
  const [draggingBlock, setDraggingBlock] = useState<{
    pageIndex: number;
    blockId: string;
    startX: number;
    startY: number;
    initialBlockX: number;
    initialBlockY: number;
  } | null>(null);

  // Resizing text blocks
  const [resizingBlock, setResizingBlock] = useState<{
    pageIndex: number;
    blockId: string;
    handle: 'se' | 'e' | 's';
    startX: number;
    startY: number;
    initialWidth: number;
    initialHeight: number;
  } | null>(null);

  // Freehand drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);
  const [drawPageIndex, setDrawPageIndex] = useState<number>(0);

  // Area Snip / Drag selection state
  const [snipSelection, setSnipSelection] = useState<{
    pageIndex: number;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  // Selected annotation popover
  const [activeNoteComment, setActiveNoteComment] = useState<{
    pageIndex: number;
    annId: string;
    content: string;
    x: number;
    y: number;
  } | null>(null);

  // Update current page on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const containerTop = containerRef.current.scrollTop;
      const containerHeight = containerRef.current.clientHeight;
      const middleY = containerTop + containerHeight / 3;

      for (let i = 0; i < pageRefs.current.length; i++) {
        const el = pageRefs.current[i];
        if (el) {
          const offsetTop = el.offsetTop;
          const height = el.clientHeight;
          if (middleY >= offsetTop && middleY <= offsetTop + height) {
            setCurrentPageIndex(i);
            break;
          }
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [setCurrentPageIndex]);

  // Handle global mouse move & mouse up for drag, resize, draw, and area snip
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 1. Text Block Dragging
      if (draggingBlock) {
        const pageEl = pageRefs.current[draggingBlock.pageIndex];
        if (!pageEl) return;
        const rect = pageEl.getBoundingClientRect();
        const deltaX = ((e.clientX - draggingBlock.startX) / rect.width) * 100;
        const deltaY = ((e.clientY - draggingBlock.startY) / rect.height) * 100;

        const newX = Math.max(0, Math.min(95, draggingBlock.initialBlockX + deltaX));
        const newY = Math.max(0, Math.min(95, draggingBlock.initialBlockY + deltaY));

        onUpdateTextBlock(draggingBlock.pageIndex, draggingBlock.blockId, {
          x: Math.round(newX * 10) / 10,
          y: Math.round(newY * 10) / 10,
        });
      }

      // 2. Text Block Resizing
      if (resizingBlock) {
        const pageEl = pageRefs.current[resizingBlock.pageIndex];
        if (!pageEl) return;
        const rect = pageEl.getBoundingClientRect();
        const deltaWidth = ((e.clientX - resizingBlock.startX) / rect.width) * 100;
        const deltaHeight = ((e.clientY - resizingBlock.startY) / rect.height) * 100;

        const newW = Math.max(10, Math.min(100, resizingBlock.initialWidth + deltaWidth));
        const newH = Math.max(2, Math.min(100, resizingBlock.initialHeight + deltaHeight));

        onUpdateTextBlock(resizingBlock.pageIndex, resizingBlock.blockId, {
          width: Math.round(newW * 10) / 10,
          height: Math.round(newH * 10) / 10,
        });
      }

      // 3. Freehand Drawing
      if (isDrawing && pageRefs.current[drawPageIndex]) {
        const pageEl = pageRefs.current[drawPageIndex]!;
        const rect = pageEl.getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width) * 100;
        const py = ((e.clientY - rect.top) / rect.height) * 100;
        setCurrentStroke((prev) => [...prev, { x: px, y: py }]);
      }

      // 4. Area Snip / Highlight Drag
      if (snipSelection && pageRefs.current[snipSelection.pageIndex]) {
        const pageEl = pageRefs.current[snipSelection.pageIndex]!;
        const rect = pageEl.getBoundingClientRect();
        const px = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const py = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
        setSnipSelection((prev) => (prev ? { ...prev, currentX: px, currentY: py } : null));
      }
    };

    const handleMouseUp = () => {
      // Finish Dragging Block
      if (draggingBlock) {
        setDraggingBlock(null);
      }

      // Finish Resizing Block
      if (resizingBlock) {
        setResizingBlock(null);
      }

      // Finish Freehand Drawing
      if (isDrawing) {
        if (currentStroke.length > 1) {
          const minX = Math.min(...currentStroke.map((p) => p.x));
          const minY = Math.min(...currentStroke.map((p) => p.y));
          const maxX = Math.max(...currentStroke.map((p) => p.x));
          const maxY = Math.max(...currentStroke.map((p) => p.y));

          const newAnn: Annotation = {
            id: `ann-draw-${Date.now()}`,
            type: 'drawing',
            x: minX,
            y: minY,
            width: Math.max(2, maxX - minX),
            height: Math.max(2, maxY - minY),
            color: activeDrawColor,
            opacity: 1,
            strokeWidth: drawStrokeWidth,
            points: currentStroke,
          };
          onAddAnnotation(drawPageIndex, newAnn);
        }
        setIsDrawing(false);
        setCurrentStroke([]);
      }

      // Finish Snip Selection (Highlight or Redact area)
      if (snipSelection) {
        const x = Math.min(snipSelection.startX, snipSelection.currentX);
        const y = Math.min(snipSelection.startY, snipSelection.currentY);
        const w = Math.abs(snipSelection.currentX - snipSelection.startX);
        const h = Math.abs(snipSelection.currentY - snipSelection.startY);

        if (w > 2 && h > 1) {
          if (activeTool === 'highlight') {
            const newAnn: Annotation = {
              id: `ann-high-${Date.now()}`,
              type: 'highlight',
              x,
              y,
              width: w,
              height: h,
              color: activeHighlightColor,
              opacity: 0.45,
            };
            onAddAnnotation(snipSelection.pageIndex, newAnn);
          } else if (activeTool === 'redact') {
            const newAnn: Annotation = {
              id: `ann-redact-${Date.now()}`,
              type: 'redaction',
              x,
              y,
              width: w,
              height: h,
              color: '#000000',
              opacity: 1,
              isAppliedRedaction: true,
            };
            onAddAnnotation(snipSelection.pageIndex, newAnn);
          } else if (activeTool === 'shape') {
            const newAnn: Annotation = {
              id: `ann-shape-${Date.now()}`,
              type: 'shape',
              shapeType: 'rectangle',
              x,
              y,
              width: w,
              height: h,
              color: '#2563eb',
              opacity: 0.85,
              strokeWidth: 2,
            };
            onAddAnnotation(snipSelection.pageIndex, newAnn);
          }
        }
        setSnipSelection(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    draggingBlock,
    resizingBlock,
    isDrawing,
    currentStroke,
    drawPageIndex,
    snipSelection,
    activeTool,
    activeDrawColor,
    drawStrokeWidth,
    activeHighlightColor,
    onUpdateTextBlock,
    onAddAnnotation,
  ]);

  // Handle click on canvas
  const handlePageMouseDown = (pageIndex: number, e: React.MouseEvent<HTMLDivElement>) => {
    const pageEl = pageRefs.current[pageIndex];
    if (!pageEl) return;
    const rect = pageEl.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Tool: Add Text Box
    if (activeTool === 'add-text') {
      onAddTextBlockAt(pageIndex, clickX, clickY);
      return;
    }

    // Tool: Freehand Drawing
    if (activeTool === 'draw') {
      setIsDrawing(true);
      setDrawPageIndex(pageIndex);
      setCurrentStroke([{ x: clickX, y: clickY }]);
      return;
    }

    // Tool: Sticky Note
    if (activeTool === 'note') {
      const newAnn: Annotation = {
        id: `ann-note-${Date.now()}`,
        type: 'note',
        x: clickX,
        y: clickY,
        width: 3.5,
        height: 3.5,
        color: '#f59e0b',
        opacity: 1,
        content: 'New sticky comment on document layout.',
        author: 'Windows User',
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onAddAnnotation(pageIndex, newAnn);
      setActiveNoteComment({
        pageIndex,
        annId: newAnn.id,
        content: newAnn.content || '',
        x: clickX,
        y: clickY,
      });
      return;
    }

    // Tools with drag rectangle (Highlight, Redact, Shape, Area OCR)
    if (['highlight', 'redact', 'shape', 'ocr-area'].includes(activeTool)) {
      setSnipSelection({
        pageIndex,
        startX: clickX,
        startY: clickY,
        currentX: clickX,
        currentY: clickY,
      });
      return;
    }

    // Click on empty space: clear selected block if not clicking inside one
    if ((e.target as HTMLElement).getAttribute('data-is-text-block') !== 'true') {
      setSelectedBlockId(null);
    }
  };

  // Helper to highlight matching search text
  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-amber-300 text-slate-900 rounded-xs px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      ref={containerRef}
      className={`flex-1 h-full overflow-auto bg-[#525659] dark:bg-[#09090b] flex flex-col items-center py-8 px-4 relative select-text ${
        activeTool === 'hand' ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      style={{ userSelect: activeTool === 'edit-text' ? 'text' : undefined }}
    >
      <div className="flex flex-col items-center gap-8 w-full max-w-5xl">
        {document.pages.map((page, pageIndex) => {
          const baseWidth = 794;
          const baseHeight = 1123;
          const displayWidth = baseWidth * zoom;
          const displayHeight = baseHeight * zoom;

          return (
            <div
              key={page.id}
              ref={(el) => {
                pageRefs.current[pageIndex] = el;
              }}
              onMouseDown={(e) => handlePageMouseDown(pageIndex, e)}
              className="bg-white relative shadow-2xl transition-shadow select-none group"
              style={{
                width: `${displayWidth}px`,
                height: `${displayHeight}px`,
                transformOrigin: 'top center',
              }}
            >
              {/* Optional Grid Background */}
              {showGrid && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-20 z-0"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
                    backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                  }}
                />
              )}

              {/* Scanned Image Layer if present */}
              {page.backgroundImage && (
                <img
                  src={page.backgroundImage}
                  alt={`Scanned page ${page.pageNumber}`}
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
                />
              )}

              {/* Scanned Page Filter / Subtle Texture if isScanned is true */}
              {page.isScanned && (
                <div className="absolute inset-0 bg-[#fbf9f5]/85 mix-blend-multiply pointer-events-none z-0 border border-slate-300/40" />
              )}

              {/* Security Watermark Overlay */}
              {document.security.watermark.enabled && document.security.watermark.text && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-10">
                  <span
                    className="font-black tracking-widest uppercase select-none transform"
                    style={{
                      transform: `rotate(${document.security.watermark.rotation}deg)`,
                      fontSize: `${(document.security.watermark.fontSize || 48) * zoom}px`,
                      color: document.security.watermark.color || '#94a3b8',
                      opacity: document.security.watermark.opacity || 0.18,
                    }}
                  >
                    {document.security.watermark.text}
                  </span>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* LIVE IN-PLACE EDITABLE TEXT BLOCKS                           */}
              {/* ------------------------------------------------------------- */}
              {page.textBlocks.map((block) => {
                const isSelected = selectedBlockId === block.id;
                const isEditing = isSelected && activeTool === 'edit-text';

                return (
                  <div
                    key={block.id}
                    data-is-text-block="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBlockId(block.id);
                    }}
                    className={`absolute transition-all group/block ${
                      isSelected
                        ? 'ring-2 ring-blue-500 z-30 shadow-md bg-white/70 backdrop-blur-2xs'
                        : activeTool === 'edit-text'
                        ? 'hover:ring-1 hover:ring-blue-400 hover:bg-blue-50/20 cursor-text'
                        : 'cursor-default'
                    }`}
                    style={{
                      left: `${block.x}%`,
                      top: `${block.y}%`,
                      width: `${block.width}%`,
                      minHeight: `${block.height}%`,
                    }}
                  >
                    {/* Bounding box move header and resize handles when selected */}
                    {isSelected && (
                      <>
                        {/* Drag Handle Bar */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setDraggingBlock({
                              pageIndex,
                              blockId: block.id,
                              startX: e.clientX,
                              startY: e.clientY,
                              initialBlockX: block.x,
                              initialBlockY: block.y,
                            });
                          }}
                          className="absolute -top-6 left-0 right-0 h-5 bg-blue-600 text-white rounded-t flex items-center justify-between px-1.5 cursor-move z-40 text-[10px] font-sans"
                        >
                          <div className="flex items-center gap-1">
                            <GripHorizontal className="w-3 h-3 opacity-80" />
                            <span>
                              {block.fontFamily} {block.fontSize}pt
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTextBlock(pageIndex, block.id);
                            }}
                            className="p-0.5 hover:bg-blue-700 rounded"
                            title="Delete Block"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {/* Corner Resize Handle */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setResizingBlock({
                              pageIndex,
                              blockId: block.id,
                              handle: 'se',
                              startX: e.clientX,
                              startY: e.clientY,
                              initialWidth: block.width,
                              initialHeight: block.height,
                            });
                          }}
                          className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-600 border border-white rounded-xs cursor-nwse-resize z-40 shadow-xs"
                        />
                      </>
                    )}

                    {/* Direct Text Editor or Static Render with Matching Exact Typography */}
                    {isEditing ? (
                      <textarea
                        value={block.text}
                        onChange={(e) => {
                          onUpdateTextBlock(pageIndex, block.id, {
                            text: e.target.value,
                          });
                        }}
                        autoFocus
                        className="w-full h-full bg-transparent resize-none border-none outline-none p-1 focus:ring-0 whitespace-pre-wrap overflow-hidden"
                        style={{
                          fontFamily: block.fontFamily,
                          fontSize: `${block.fontSize * zoom}px`,
                          fontWeight: block.fontWeight,
                          fontStyle: block.fontStyle,
                          textDecoration: block.textDecoration,
                          color: block.color,
                          textAlign: block.textAlign,
                          lineHeight: block.lineHeight,
                          letterSpacing: block.letterSpacing ? `${block.letterSpacing}px` : undefined,
                        }}
                      />
                    ) : (
                      <div
                        className="w-full h-full p-1 whitespace-pre-wrap select-text break-words"
                        style={{
                          fontFamily: block.fontFamily,
                          fontSize: `${block.fontSize * zoom}px`,
                          fontWeight: block.fontWeight,
                          fontStyle: block.fontStyle,
                          textDecoration: block.textDecoration,
                          color: block.color,
                          textAlign: block.textAlign,
                          lineHeight: block.lineHeight,
                          letterSpacing: block.letterSpacing ? `${block.letterSpacing}px` : undefined,
                        }}
                      >
                        {renderHighlightedText(block.text, searchQuery)}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* ------------------------------------------------------------- */}
              {/* ANNOTATIONS (Highlights, Shapes, Stamps, Signatures, Redaction) */}
              {/* ------------------------------------------------------------- */}
              {page.annotations.map((ann) => {
                if (ann.type === 'highlight') {
                  return (
                    <div
                      key={ann.id}
                      onClick={() => {
                        if (activeTool === 'eraser') {
                          onDeleteAnnotation(pageIndex, ann.id);
                        }
                      }}
                      className={`absolute pointer-events-auto mix-blend-multiply transition-opacity rounded-xs ${
                        activeTool === 'eraser' ? 'hover:opacity-40 cursor-pointer' : ''
                      }`}
                      style={{
                        left: `${ann.x}%`,
                        top: `${ann.y}%`,
                        width: `${ann.width}%`,
                        height: `${ann.height}%`,
                        backgroundColor: ann.color || '#fef08a',
                        opacity: ann.opacity || 0.5,
                        zIndex: 15,
                      }}
                    />
                  );
                }

                if (ann.type === 'redaction') {
                  return (
                    <div
                      key={ann.id}
                      onClick={() => {
                        if (activeTool === 'eraser') {
                          onDeleteAnnotation(pageIndex, ann.id);
                        }
                      }}
                      className="absolute bg-black pointer-events-auto flex items-center justify-center text-[9px] text-white/50 uppercase tracking-widest font-mono select-none"
                      style={{
                        left: `${ann.x}%`,
                        top: `${ann.y}%`,
                        width: `${ann.width}%`,
                        height: `${ann.height}%`,
                        zIndex: 25,
                      }}
                      title="Redacted Confidential Information"
                    >
                      [REDACTED]
                    </div>
                  );
                }

                if (ann.type === 'shape') {
                  return (
                    <div
                      key={ann.id}
                      onClick={() => {
                        if (activeTool === 'eraser') {
                          onDeleteAnnotation(pageIndex, ann.id);
                        }
                      }}
                      className="absolute pointer-events-auto"
                      style={{
                        left: `${ann.x}%`,
                        top: `${ann.y}%`,
                        width: `${ann.width}%`,
                        height: `${ann.height}%`,
                        border: `${ann.strokeWidth || 2}px solid ${ann.color || '#2563eb'}`,
                        borderRadius: ann.shapeType === 'ellipse' ? '9999px' : '2px',
                        opacity: ann.opacity || 0.85,
                        zIndex: 20,
                      }}
                    />
                  );
                }

                if (ann.type === 'stamp') {
                  const isRed = ann.stampType === 'CONFIDENTIAL' || ann.stampType === 'REJECTED';
                  return (
                    <div
                      key={ann.id}
                      onClick={() => {
                        if (activeTool === 'eraser') {
                          onDeleteAnnotation(pageIndex, ann.id);
                        }
                      }}
                      className={`absolute pointer-events-auto border-4 font-black uppercase tracking-wider px-3 py-1 flex items-center justify-center transform -rotate-6 select-none ${
                        isRed
                          ? 'border-red-600 text-red-600 bg-red-50/70'
                          : 'border-emerald-600 text-emerald-600 bg-emerald-50/70'
                      }`}
                      style={{
                        left: `${ann.x}%`,
                        top: `${ann.y}%`,
                        minWidth: `${ann.width}%`,
                        fontSize: `${13 * zoom}px`,
                        zIndex: 25,
                      }}
                    >
                      {ann.stampType || 'APPROVED'}
                    </div>
                  );
                }

                if (ann.type === 'signature') {
                  return (
                    <div
                      key={ann.id}
                      onClick={() => {
                        if (activeTool === 'eraser') {
                          onDeleteAnnotation(pageIndex, ann.id);
                        }
                      }}
                      className="absolute pointer-events-auto p-1 border border-dashed border-blue-400/50 bg-blue-50/20 rounded z-25 flex items-center"
                      style={{
                        left: `${ann.x}%`,
                        top: `${ann.y}%`,
                        width: `${ann.width}%`,
                        height: `${ann.height}%`,
                      }}
                    >
                      {ann.signatureData?.startsWith('data:image') ? (
                        <img
                          src={ann.signatureData}
                          alt="Signature"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span
                          className="italic font-serif text-blue-900 font-bold select-none truncate"
                          style={{ fontSize: `${16 * zoom}px` }}
                        >
                          {ann.signatureData || 'Signature'}
                        </span>
                      )}
                    </div>
                  );
                }

                if (ann.type === 'note') {
                  return (
                    <div
                      key={ann.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (activeTool === 'eraser') {
                          onDeleteAnnotation(pageIndex, ann.id);
                        } else {
                          setActiveNoteComment({
                            pageIndex,
                            annId: ann.id,
                            content: ann.content || '',
                            x: ann.x,
                            y: ann.y,
                          });
                        }
                      }}
                      className="absolute pointer-events-auto cursor-pointer p-1 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-full shadow-md z-30 transition-transform hover:scale-110 flex items-center justify-center"
                      style={{
                        left: `${ann.x}%`,
                        top: `${ann.y}%`,
                        width: `${24 * zoom}px`,
                        height: `${24 * zoom}px`,
                      }}
                      title="View / Edit Sticky Comment"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                  );
                }

                if (ann.type === 'drawing' && ann.points && ann.points.length > 1) {
                  const pathData = ann.points.reduce((acc, pt, idx) => {
                    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
                  }, '');

                  return (
                    <svg
                      key={ann.id}
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      className="absolute inset-0 w-full h-full pointer-events-none z-20"
                    >
                      <path
                        d={pathData}
                        fill="none"
                        stroke={ann.color || '#2563eb'}
                        strokeWidth={((ann.strokeWidth || 2) * 0.25) / zoom}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  );
                }

                return null;
              })}

              {/* Live drawing stroke in progress */}
              {isDrawing && drawPageIndex === pageIndex && currentStroke.length > 1 && (
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full pointer-events-none z-30"
                >
                  <path
                    d={currentStroke.reduce((acc, pt, idx) => {
                      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
                    }, '')}
                    fill="none"
                    stroke={activeDrawColor}
                    strokeWidth={((drawStrokeWidth || 2) * 0.25) / zoom}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}

              {/* Area Snip / Drag Box Overlay */}
              {snipSelection && snipSelection.pageIndex === pageIndex && (
                <div
                  className="absolute border-2 border-dashed border-blue-500 bg-blue-500/15 pointer-events-none z-35"
                  style={{
                    left: `${Math.min(snipSelection.startX, snipSelection.currentX)}%`,
                    top: `${Math.min(snipSelection.startY, snipSelection.currentY)}%`,
                    width: `${Math.abs(snipSelection.currentX - snipSelection.startX)}%`,
                    height: `${Math.abs(snipSelection.currentY - snipSelection.startY)}%`,
                  }}
                />
              )}

              {/* Page Number Label in Margin */}
              <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-slate-300 font-sans pointer-events-none">
                Page {pageIndex + 1} of {document.pages.length}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Note Popover Modal / Bubble */}
      {activeNoteComment && (
        <div
          className="fixed bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg shadow-xl p-3 z-50 w-72 text-xs"
          style={{
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="flex items-center justify-between font-semibold border-b border-slate-200 dark:border-zinc-700 pb-2 mb-2 text-slate-800 dark:text-zinc-100">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-amber-500" />
              <span>Document Sticky Note</span>
            </div>
            <button
              onClick={() => setActiveNoteComment(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <textarea
            value={activeNoteComment.content}
            onChange={(e) =>
              setActiveNoteComment((prev) =>
                prev ? { ...prev, content: e.target.value } : null
              )
            }
            placeholder="Type comment or annotation note here..."
            className="w-full h-24 p-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
          />

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-zinc-700">
            <button
              onClick={() => {
                onDeleteAnnotation(activeNoteComment.pageIndex, activeNoteComment.annId);
                setActiveNoteComment(null);
              }}
              className="text-rose-600 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>

            <button
              onClick={() => {
                onAddAnnotation(activeNoteComment.pageIndex, {
                  id: activeNoteComment.annId,
                  type: 'note',
                  x: activeNoteComment.x,
                  y: activeNoteComment.y,
                  width: 3.5,
                  height: 3.5,
                  color: '#f59e0b',
                  opacity: 1,
                  content: activeNoteComment.content,
                  author: 'Windows User',
                  date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                });
                setActiveNoteComment(null);
              }}
              className="px-3 py-1 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              <span>Save Note</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
