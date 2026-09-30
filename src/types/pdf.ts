export interface TextBlock {
  id: string;
  text: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  width: number; // percentage (0 - 100)
  height: number; // percentage (0 - 100)
  fontSize: number; // in pt / px (e.g. 11, 14, 24)
  fontFamily: string; // 'Segoe UI' | 'Arial' | 'Times New Roman' | 'Courier New' | 'Georgia' | 'Calibri' | 'Trebuchet MS'
  fontWeight: 'normal' | 'bold' | '600' | '300';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number; // multiplier, e.g. 1.25, 1.4
  letterSpacing?: number; // in px
  isLocked?: boolean;
}

export interface Annotation {
  id: string;
  type: 'highlight' | 'underline' | 'strikethrough' | 'drawing' | 'shape' | 'note' | 'stamp' | 'signature' | 'redaction';
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
  color: string;
  opacity: number;
  strokeWidth?: number;
  content?: string; // sticky note or comment
  author?: string;
  date?: string;
  resolved?: boolean;
  shapeType?: 'rectangle' | 'ellipse' | 'arrow' | 'line' | 'callout';
  stampType?: 'APPROVED' | 'CONFIDENTIAL' | 'DRAFT' | 'URGENT' | 'REJECTED' | 'OFFICIAL' | 'CUSTOM';
  signatureData?: string; // data URL or cursive text
  signatureType?: 'drawn' | 'typed' | 'image';
  points?: { x: number; y: number }[]; // for freehand drawings (in percentages)
  isAppliedRedaction?: boolean;
}

export interface PDFPage {
  id: string;
  pageNumber: number;
  width: number; // standard points: 794 (A4 approx at 96 DPI)
  height: number; // 1123
  backgroundImage?: string; // data URL for scanned background
  isScanned?: boolean;
  textBlocks: TextBlock[];
  annotations: Annotation[];
  rotation: number; // 0, 90, 180, 270
}

export interface PDFSecuritySettings {
  isPasswordProtected: boolean;
  openPasswordHash?: string;
  passwordSalt?: string;
  passwordHint?: string;
  encryptionLevel: 'AES-256' | 'AES-128';
  isEncrypted: boolean;
  permissions: {
    printingAllowed: boolean;
    copyingAllowed: boolean;
    annotatingAllowed: boolean;
    formFillingAllowed: boolean;
    pageModificationsAllowed: boolean;
  };
  watermark: {
    enabled: boolean;
    text: string;
    opacity: number;
    fontSize: number;
    color: string;
    rotation: number;
  };
}

export interface PDFDocument {
  id: string;
  title: string;
  author: string;
  subject?: string;
  createdAt: string;
  modifiedAt: string;
  pages: PDFPage[];
  security: PDFSecuritySettings;
  version: number;
}

export type EditorTool =
  | 'select'
  | 'hand'
  | 'edit-text'
  | 'add-text'
  | 'highlight'
  | 'draw'
  | 'shape'
  | 'note'
  | 'stamp'
  | 'signature'
  | 'redact'
  | 'ocr-area'
  | 'eraser';

export type RibbonTab =
  | 'home'
  | 'edit'
  | 'annotate'
  | 'ocr'
  | 'security'
  | 'pages'
  | 'view';

export type SidebarTab =
  | 'thumbnails'
  | 'bookmarks'
  | 'annotations'
  | 'ocr-results'
  | 'search';

export interface OCRDetectedBlock {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  color: string;
}

export interface OCRResult {
  blocks: OCRDetectedBlock[];
  fullText: string;
  documentType?: string;
  language?: string;
  confidence?: number;
}
