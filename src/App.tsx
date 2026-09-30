import React, { useState, useEffect, useCallback } from 'react';
import {
  PDFDocument,
  PDFPage,
  TextBlock,
  Annotation,
  RibbonTab,
  EditorTool,
  SidebarTab,
  OCRResult,
  PDFSecuritySettings,
} from './types/pdf';
import { SAMPLE_DOCUMENTS } from './data/sampleDocuments';
import { TitleBar } from './components/TitleBar';
import { Ribbon } from './components/Ribbon';
import { Sidebar } from './components/Sidebar';
import { DocumentCanvas } from './components/DocumentCanvas';
import { StatusBar } from './components/StatusBar';
import { SecurityModal } from './components/SecurityModal';
import { PasswordPromptModal } from './components/PasswordPromptModal';
import { OCRModal } from './components/OCRModal';
import { SignatureModal } from './components/SignatureModal';
import { StampModal } from './components/StampModal';
import { PageOrganizerModal } from './components/PageOrganizerModal';
import { FindReplaceBar } from './components/FindReplaceBar';
import { exportToPDFBlob, downloadBlob } from './utils/exportPdf';
import { sanitizeDocument } from './utils/security';
import { convertScannedPageToEditable, performOCR } from './utils/ocr';

export default function App() {
  // Document state
  const [doc, setDoc] = useState<PDFDocument>(SAMPLE_DOCUMENTS[0]);
  const [history, setHistory] = useState<PDFDocument[]>([SAMPLE_DOCUMENTS[0]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // View & Tool state
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [activeRibbonTab, setActiveRibbonTab] = useState<RibbonTab>('home');
  const [activeTool, setActiveTool] = useState<EditorTool>('edit-text');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1.05);
  const [showGrid, setShowGrid] = useState(false);

  // Navigation sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('thumbnails');

  // Markup tool settings
  const [activeHighlightColor, setActiveHighlightColor] = useState('#fef08a');
  const [activeDrawColor, setActiveDrawColor] = useState('#2563eb');
  const [drawStrokeWidth, setDrawStrokeWidth] = useState(2);

  // OCR state
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);

  // Modals state
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);
  const [pendingLockedDoc, setPendingLockedDoc] = useState<PDFDocument | null>(null);
  const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isStampModalOpen, setIsStampModalOpen] = useState(false);
  const [isPageOrganizerOpen, setIsPageOrganizerOpen] = useState(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);

  // Search & Replace state
  const [searchQuery, setSearchQuery] = useState('');

  // Helper to commit state to Undo/Redo history
  const pushState = useCallback((newDoc: PDFDocument) => {
    setDoc(newDoc);
    setHasUnsavedChanges(true);
    setHistory((prev) => {
      const nextHistory = prev.slice(0, historyIndex + 1);
      return [...nextHistory, newDoc];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Undo / Redo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevDoc = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setDoc(prevDoc);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextDoc = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setDoc(nextDoc);
    }
  }, [historyIndex, history]);

  // Keyboard Shortcuts: Ctrl+Z, Ctrl+Y, Ctrl+F, Ctrl+S, Delete, Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFindReplaceOpen(true);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        setSelectedBlockId(null);
        setIsFindReplaceOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Current page & selected text block reference
  const currentPage = doc.pages[currentPageIndex] || doc.pages[0];
  const selectedBlock =
    currentPage?.textBlocks.find((b) => b.id === selectedBlockId) || null;

  // Switch sample document with password gate check
  const handleSelectSample = (docId: string) => {
    const target = SAMPLE_DOCUMENTS.find((d) => d.id === docId);
    if (!target) return;

    if (target.security.isPasswordProtected) {
      setPendingLockedDoc(target);
      setIsPasswordPromptOpen(true);
    } else {
      setDoc(target);
      setHistory([target]);
      setHistoryIndex(0);
      setCurrentPageIndex(0);
      setSelectedBlockId(null);
      setHasUnsavedChanges(false);
      setOcrResult(null);
    }
  };

  const handleUnlockSuccess = () => {
    if (pendingLockedDoc) {
      setDoc(pendingLockedDoc);
      setHistory([pendingLockedDoc]);
      setHistoryIndex(0);
      setCurrentPageIndex(0);
      setSelectedBlockId(null);
      setHasUnsavedChanges(false);
      setPendingLockedDoc(null);
    }
    setIsPasswordPromptOpen(false);
  };

  // Create new blank document
  const handleNewBlankDoc = () => {
    const newDoc: PDFDocument = {
      id: `doc-${Date.now()}`,
      title: 'Untitled_Document.pdf',
      author: 'Windows User',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      version: 1,
      security: {
        isPasswordProtected: false,
        encryptionLevel: 'AES-256',
        isEncrypted: false,
        permissions: {
          printingAllowed: true,
          copyingAllowed: true,
          annotatingAllowed: true,
          formFillingAllowed: true,
          pageModificationsAllowed: true,
        },
        watermark: {
          enabled: false,
          text: 'CONFIDENTIAL',
          opacity: 0.15,
          fontSize: 48,
          color: '#94a3b8',
          rotation: -45,
        },
      },
      pages: [
        {
          id: `page-${Date.now()}-1`,
          pageNumber: 1,
          width: 794,
          height: 1123,
          rotation: 0,
          textBlocks: [
            {
              id: `tb-init-${Date.now()}`,
              text: 'Click here or press Edit Text to start typing your document layout...',
              x: 10,
              y: 10,
              width: 80,
              height: 5,
              fontSize: 14,
              fontFamily: 'Segoe UI',
              fontWeight: 'normal',
              fontStyle: 'normal',
              textDecoration: 'none',
              color: '#334155',
              textAlign: 'left',
              lineHeight: 1.4,
            },
          ],
          annotations: [],
        },
      ],
    };
    pushState(newDoc);
    setCurrentPageIndex(0);
    setSelectedBlockId(null);
  };

  // Open uploaded file (JSON project or image/scanned PDF)
  const handleOpenFile = (file: File) => {
    const reader = new FileReader();

    if (file.name.endsWith('.json')) {
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (parsed.pages) {
            pushState(parsed);
            setCurrentPageIndex(0);
          }
        } catch (err) {
          alert('Invalid WinPDF project file.');
        }
      };
      reader.readAsText(file);
    } else {
      // Image or Scanned document
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const newDoc: PDFDocument = {
          id: `doc-imported-${Date.now()}`,
          title: file.name,
          author: 'Windows User',
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          version: 1,
          security: {
            isPasswordProtected: false,
            encryptionLevel: 'AES-256',
            isEncrypted: false,
            permissions: {
              printingAllowed: true,
              copyingAllowed: true,
              annotatingAllowed: true,
              formFillingAllowed: true,
              pageModificationsAllowed: true,
            },
            watermark: {
              enabled: false,
              text: 'CONFIDENTIAL',
              opacity: 0.15,
              fontSize: 48,
              color: '#94a3b8',
              rotation: -45,
            },
          },
          pages: [
            {
              id: `page-import-1`,
              pageNumber: 1,
              width: 794,
              height: 1123,
              rotation: 0,
              isScanned: true,
              backgroundImage: dataUrl,
              textBlocks: [
                {
                  id: `tb-import-${Date.now()}`,
                  text: 'Scanned Document Loaded. Click "OCR & AI Tools" -> "Convert Scanned Page to Editable Layout" to extract and edit text.',
                  x: 10,
                  y: 5,
                  width: 80,
                  height: 4,
                  fontSize: 12,
                  fontFamily: 'Segoe UI',
                  fontWeight: 'bold',
                  fontStyle: 'normal',
                  textDecoration: 'none',
                  color: '#1e3a8a',
                  textAlign: 'center',
                  lineHeight: 1.3,
                },
              ],
              annotations: [],
            },
          ],
        };
        pushState(newDoc);
        setCurrentPageIndex(0);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save document
  const handleSave = () => {
    setHasUnsavedChanges(false);
    // Export JSON project backup
    const blob = new Blob([JSON.stringify(doc, null, 2)], {
      type: 'application/json',
    });
    downloadBlob(blob, `${doc.title.replace(/\.[^/.]+$/, '')}_project.json`);
  };

  // Export to Real PDF
  const handleExportPDF = async () => {
    try {
      const pdfBlob = await exportToPDFBlob(doc);
      downloadBlob(pdfBlob, doc.title.endsWith('.pdf') ? doc.title : `${doc.title}.pdf`);
    } catch (err) {
      console.error('PDF Export error:', err);
      alert('Failed to generate PDF. Check document elements.');
    }
  };

  // Print Document
  const handlePrint = () => {
    if (!doc.security.permissions.printingAllowed) {
      alert('Printing is restricted on this document by Windows Security Policy.');
      return;
    }
    window.print();
  };

  // In-Place Text Editing Handlers
  const handleUpdateTextBlock = (
    pageIndex: number,
    blockId: string,
    updates: Partial<TextBlock>
  ) => {
    const updatedPages = doc.pages.map((p, idx) => {
      if (idx !== pageIndex) return p;
      return {
        ...p,
        textBlocks: p.textBlocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b)),
      };
    });
    pushState({ ...doc, pages: updatedPages, modifiedAt: new Date().toISOString() });
  };

  const handleDeleteTextBlock = (pageIndex: number, blockId: string) => {
    const updatedPages = doc.pages.map((p, idx) => {
      if (idx !== pageIndex) return p;
      return {
        ...p,
        textBlocks: p.textBlocks.filter((b) => b.id !== blockId),
      };
    });
    setSelectedBlockId(null);
    pushState({ ...doc, pages: updatedPages, modifiedAt: new Date().toISOString() });
  };

  const handleAddNewTextBlock = (pageIndex?: number, x?: number, y?: number) => {
    const targetIdx = pageIndex ?? currentPageIndex;
    const newBlock: TextBlock = {
      id: `tb-${Date.now()}`,
      text: 'New editable text line...',
      x: x !== undefined ? Math.max(5, Math.min(80, x)) : 15,
      y: y !== undefined ? Math.max(5, Math.min(85, y)) : 30,
      width: 50,
      height: 4,
      fontSize: 12,
      fontFamily: 'Segoe UI',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      color: '#0f172a',
      textAlign: 'left',
      lineHeight: 1.4,
    };

    const updatedPages = doc.pages.map((p, idx) => {
      if (idx !== targetIdx) return p;
      return {
        ...p,
        textBlocks: [...p.textBlocks, newBlock],
      };
    });

    setSelectedBlockId(newBlock.id);
    setActiveTool('edit-text');
    pushState({ ...doc, pages: updatedPages, modifiedAt: new Date().toISOString() });
  };

  // Annotation Handlers
  const handleAddAnnotation = (pageIndex: number, annotation: Annotation) => {
    if (!doc.security.permissions.annotatingAllowed) {
      alert('Adding annotations is restricted on this document by Windows Security Policy.');
      return;
    }
    const updatedPages = doc.pages.map((p, idx) => {
      if (idx !== pageIndex) return p;
      // replace if existing or append
      const exists = p.annotations.some((a) => a.id === annotation.id);
      return {
        ...p,
        annotations: exists
          ? p.annotations.map((a) => (a.id === annotation.id ? annotation : a))
          : [...p.annotations, annotation],
      };
    });
    pushState({ ...doc, pages: updatedPages, modifiedAt: new Date().toISOString() });
  };

  const handleDeleteAnnotation = (pageIndex: number, annId: string) => {
    const updatedPages = doc.pages.map((p, idx) => {
      if (idx !== pageIndex) return p;
      return {
        ...p,
        annotations: p.annotations.filter((a) => a.id !== annId),
      };
    });
    pushState({ ...doc, pages: updatedPages, modifiedAt: new Date().toISOString() });
  };

  // Security Handlers
  const handleSaveSecurity = (newSecurity: PDFSecuritySettings) => {
    pushState({ ...doc, security: newSecurity, modifiedAt: new Date().toISOString() });
  };

  const handleSanitize = () => {
    const sanitized = sanitizeDocument(doc);
    pushState(sanitized);
  };

  // OCR: Convert Scanned Page to Editable Layout
  const handleConvertScannedToEditable = async () => {
    let resultToUse = ocrResult;
    if (!resultToUse) {
      const imageSrc = currentPage.backgroundImage || 'sample';
      resultToUse = await performOCR(imageSrc, currentPageIndex);
      setOcrResult(resultToUse);
    }

    const converted = convertScannedPageToEditable(currentPage, resultToUse, true);
    const updatedPages = doc.pages.map((p, idx) => (idx === currentPageIndex ? converted : p));
    pushState({ ...doc, pages: updatedPages, modifiedAt: new Date().toISOString() });
    setActiveTool('edit-text');
    setActiveSidebarTab('ocr-results');
  };

  // E-Signature
  const handleApplySignature = (
    sigData: string,
    sigType: 'drawn' | 'typed' | 'image'
  ) => {
    const newAnn: Annotation = {
      id: `ann-sig-${Date.now()}`,
      type: 'signature',
      x: 55,
      y: 75,
      width: 32,
      height: 7,
      color: '#1e3a8a',
      opacity: 1,
      signatureData: sigData,
      signatureType: sigType,
    };
    handleAddAnnotation(currentPageIndex, newAnn);
  };

  // Stamps
  const handleApplyStamp = (
    stampType: 'APPROVED' | 'CONFIDENTIAL' | 'DRAFT' | 'URGENT' | 'REJECTED' | 'OFFICIAL' | 'CUSTOM',
    customText?: string
  ) => {
    const newAnn: Annotation = {
      id: `ann-stamp-${Date.now()}`,
      type: 'stamp',
      x: 60,
      y: 20,
      width: 28,
      height: 6.5,
      color: stampType === 'REJECTED' ? '#dc2626' : '#16a34a',
      opacity: 0.95,
      stampType,
      content: customText,
    };
    handleAddAnnotation(currentPageIndex, newAnn);
  };

  // Page Operations
  const handleInsertBlankPage = () => {
    const newPage: PDFPage = {
      id: `page-${Date.now()}`,
      pageNumber: doc.pages.length + 1,
      width: 794,
      height: 1123,
      rotation: 0,
      textBlocks: [],
      annotations: [],
    };
    const updatedPages = [...doc.pages, newPage];
    pushState({ ...doc, pages: updatedPages });
    setCurrentPageIndex(updatedPages.length - 1);
  };

  const handleRotateCurrentPage = () => {
    const updatedPages = doc.pages.map((p, idx) => {
      if (idx !== currentPageIndex) return p;
      return { ...p, rotation: (p.rotation + 90) % 360 };
    });
    pushState({ ...doc, pages: updatedPages });
  };

  const handleDeleteCurrentPage = () => {
    if (doc.pages.length <= 1) return;
    const updatedPages = doc.pages
      .filter((_, idx) => idx !== currentPageIndex)
      .map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    pushState({ ...doc, pages: updatedPages });
    setCurrentPageIndex((prev) => Math.max(0, prev - 1));
  };

  const handleDuplicatePage = (pageIndex: number) => {
    const target = doc.pages[pageIndex];
    const duplicated: PDFPage = {
      ...target,
      id: `page-dup-${Date.now()}`,
      pageNumber: target.pageNumber + 1,
      textBlocks: target.textBlocks.map((b) => ({ ...b, id: `tb-${Date.now()}-${b.id}` })),
      annotations: target.annotations.map((a) => ({ ...a, id: `ann-${Date.now()}-${a.id}` })),
    };
    const updated = [...doc.pages];
    updated.splice(pageIndex + 1, 0, duplicated);
    const renumbered = updated.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    pushState({ ...doc, pages: renumbered });
    setCurrentPageIndex(pageIndex + 1);
  };

  // Search & Replace Handlers
  const countSearchMatches = () => {
    if (!searchQuery.trim()) return 0;
    let count = 0;
    const regex = new RegExp(searchQuery, 'gi');
    for (const page of doc.pages) {
      for (const b of page.textBlocks) {
        const matches = b.text.match(regex);
        if (matches) count += matches.length;
      }
    }
    return count;
  };

  const handleReplaceOne = (find: string, replaceWith: string) => {
    if (!find) return;
    let replaced = false;
    const updatedPages = doc.pages.map((page) => ({
      ...page,
      textBlocks: page.textBlocks.map((b) => {
        if (!replaced && b.text.includes(find)) {
          replaced = true;
          return { ...b, text: b.text.replace(find, replaceWith) };
        }
        return b;
      }),
    }));
    if (replaced) {
      pushState({ ...doc, pages: updatedPages });
    }
  };

  const handleReplaceAll = (find: string, replaceWith: string) => {
    if (!find) return;
    const regex = new RegExp(find, 'g');
    const updatedPages = doc.pages.map((page) => ({
      ...page,
      textBlocks: page.textBlocks.map((b) => ({
        ...b,
        text: b.text.replace(regex, replaceWith),
      })),
    }));
    pushState({ ...doc, pages: updatedPages });
  };

  // Copy / Paste text block
  const handleCopySelected = () => {
    if (selectedBlock) {
      navigator.clipboard.writeText(selectedBlock.text);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleAddNewTextBlock(currentPageIndex, 20, 20);
      }
    } catch {
      handleAddNewTextBlock(currentPageIndex, 20, 20);
    }
  };

  const totalTextBlocks = doc.pages.reduce((acc, p) => acc + p.textBlocks.length, 0);
  const totalAnnotations = doc.pages.reduce((acc, p) => acc + p.annotations.length, 0);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f3f4f6] dark:bg-[#18181b] font-sans antialiased text-slate-800 dark:text-zinc-100 select-none">
      {/* 1. Windows 11 Title Bar */}
      <TitleBar
        document={doc}
        onSelectSample={handleSelectSample}
        onNewBlankDoc={handleNewBlankDoc}
        onOpenFile={handleOpenFile}
        onSave={handleSave}
        onExportPDF={handleExportPDF}
        onPrint={handlePrint}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        hasUnsavedChanges={hasUnsavedChanges}
        onOpenSecurity={() => setIsSecurityModalOpen(true)}
        onToggleSearch={() => setIsFindReplaceOpen((prev) => !prev)}
      />

      {/* 2. Windows Fluent Ribbon Command Center */}
      <Ribbon
        activeTab={activeRibbonTab}
        setActiveTab={setActiveRibbonTab}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        selectedBlock={selectedBlock}
        onUpdateSelectedBlock={(updates) => {
          if (selectedBlock) {
            handleUpdateTextBlock(currentPageIndex, selectedBlock.id, updates);
          }
        }}
        onDeleteSelectedBlock={() => {
          if (selectedBlock) {
            handleDeleteTextBlock(currentPageIndex, selectedBlock.id);
          }
        }}
        onAddNewTextBlock={() => handleAddNewTextBlock(currentPageIndex)}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        onOpenOCRModal={() => setIsOCRModalOpen(true)}
        onConvertScannedToEditable={handleConvertScannedToEditable}
        onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
        onOpenStampModal={() => setIsStampModalOpen(true)}
        onOpenPageOrganizer={() => setIsPageOrganizerOpen(true)}
        onInsertBlankPage={handleInsertBlankPage}
        onRotateCurrentPage={handleRotateCurrentPage}
        onDeleteCurrentPage={handleDeleteCurrentPage}
        zoom={zoom}
        setZoom={setZoom}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        activeHighlightColor={activeHighlightColor}
        setActiveHighlightColor={setActiveHighlightColor}
        activeDrawColor={activeDrawColor}
        setActiveDrawColor={setActiveDrawColor}
        drawStrokeWidth={drawStrokeWidth}
        setDrawStrokeWidth={setDrawStrokeWidth}
        canCopy={Boolean(selectedBlock)}
        onCopySelected={handleCopySelected}
        onPaste={handlePaste}
      />

      {/* 3. Main Workspace: Collapsible Sidebar + Canvas Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          activeSidebarTab={activeSidebarTab}
          setActiveSidebarTab={setActiveSidebarTab}
          document={doc}
          currentPageIndex={currentPageIndex}
          onSelectPage={setCurrentPageIndex}
          onDeleteAnnotation={handleDeleteAnnotation}
          ocrResult={ocrResult}
          onConvertScannedToEditable={handleConvertScannedToEditable}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResultsCount={countSearchMatches()}
        />

        {/* Central Document Canvas with Exact Layout & Typography In-Place Editing */}
        <DocumentCanvas
          document={doc}
          currentPageIndex={currentPageIndex}
          setCurrentPageIndex={setCurrentPageIndex}
          activeTool={activeTool}
          selectedBlockId={selectedBlockId}
          setSelectedBlockId={setSelectedBlockId}
          onUpdateTextBlock={handleUpdateTextBlock}
          onDeleteTextBlock={handleDeleteTextBlock}
          onAddTextBlockAt={handleAddNewTextBlock}
          onAddAnnotation={handleAddAnnotation}
          onDeleteAnnotation={handleDeleteAnnotation}
          zoom={zoom}
          showGrid={showGrid}
          activeHighlightColor={activeHighlightColor}
          activeDrawColor={activeDrawColor}
          drawStrokeWidth={drawStrokeWidth}
          searchQuery={searchQuery}
        />

        {/* Floating Find & Replace Toolbar */}
        <FindReplaceBar
          isOpen={isFindReplaceOpen}
          onClose={() => setIsFindReplaceOpen(false)}
          document={doc}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onReplaceOne={handleReplaceOne}
          onReplaceAll={handleReplaceAll}
          matchesCount={countSearchMatches()}
        />
      </div>

      {/* 4. Windows 11 Bottom Status Bar */}
      <StatusBar
        currentPageIndex={currentPageIndex}
        totalPages={doc.pages.length}
        onJumpToPage={setCurrentPageIndex}
        activeTool={activeTool}
        security={doc.security}
        onOpenSecurity={() => setIsSecurityModalOpen(true)}
        zoom={zoom}
        setZoom={setZoom}
        textBlocksCount={totalTextBlocks}
        annotationsCount={totalAnnotations}
      />

      {/* 5. Modals & Dialogs */}
      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        security={doc.security}
        onSaveSecurity={handleSaveSecurity}
        onSanitize={handleSanitize}
      />

      <PasswordPromptModal
        isOpen={isPasswordPromptOpen}
        docTitle={pendingLockedDoc?.title || ''}
        passwordHash={pendingLockedDoc?.security.openPasswordHash}
        passwordSalt={pendingLockedDoc?.security.passwordSalt}
        passwordHint={pendingLockedDoc?.security.passwordHint}
        onSuccess={handleUnlockSuccess}
        onCancel={() => {
          setIsPasswordPromptOpen(false);
          setPendingLockedDoc(null);
        }}
      />

      <OCRModal
        isOpen={isOCRModalOpen}
        onClose={() => setIsOCRModalOpen(false)}
        currentPage={currentPage}
        onApplyConvertedPage={(convertedPage) => {
          const updated = doc.pages.map((p, idx) =>
            idx === currentPageIndex ? convertedPage : p
          );
          pushState({ ...doc, pages: updated, modifiedAt: new Date().toISOString() });
          setActiveTool('edit-text');
        }}
        onSetOCRResult={setOcrResult}
      />

      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onApplySignature={handleApplySignature}
      />

      <StampModal
        isOpen={isStampModalOpen}
        onClose={() => setIsStampModalOpen(false)}
        onApplyStamp={handleApplyStamp}
      />

      <PageOrganizerModal
        isOpen={isPageOrganizerOpen}
        onClose={() => setIsPageOrganizerOpen(false)}
        document={doc}
        onReorderPages={(newPages) => pushState({ ...doc, pages: newPages })}
        onInsertBlankPage={handleInsertBlankPage}
        onRotatePage={(pIdx, deg) => {
          const updated = doc.pages.map((p, idx) =>
            idx === pIdx ? { ...p, rotation: (p.rotation + deg) % 360 } : p
          );
          pushState({ ...doc, pages: updated });
        }}
        onDeletePage={(pIdx) => {
          if (doc.pages.length <= 1) return;
          const updated = doc.pages.filter((_, idx) => idx !== pIdx);
          pushState({ ...doc, pages: updated });
        }}
        onDuplicatePage={handleDuplicatePage}
      />
    </div>
  );
}
