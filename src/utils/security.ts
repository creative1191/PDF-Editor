import { PDFDocument } from '../types/pdf';

// Helper: Convert string to ArrayBuffer
function stringToBuffer(str: string): BufferSource {
  return new TextEncoder().encode(str) as unknown as BufferSource;
}

// Helper: Convert ArrayBuffer to hex string
function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper: Convert hex string to Uint8Array
function hexToBuffer(hex: string): BufferSource {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes as unknown as BufferSource;
}

/**
 * Generate a cryptographically secure random salt (16 bytes)
 */
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return bufferToHex(salt.buffer);
}

/**
 * Hash password using PBKDF2 with SHA-256 (10,000 iterations)
 */
export async function hashPassword(password: string, saltHex: string): Promise<string> {
  const salt = hexToBuffer(saltHex);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    stringToBuffer(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 10000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return bufferToHex(derivedBits);
}

/**
 * Verify password against stored hash and salt
 */
export async function verifyPassword(
  attempt: string,
  storedHash: string,
  saltHex: string
): Promise<boolean> {
  try {
    const attemptHash = await hashPassword(attempt, saltHex);
    return attemptHash === storedHash;
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

/**
 * Encrypt arbitrary text/data using AES-256-GCM derived from password
 */
export async function encryptData(data: string, password: string, saltHex: string): Promise<{ cipherHex: string; ivHex: string }> {
  const salt = hexToBuffer(saltHex);
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    stringToBuffer(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 10000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    stringToBuffer(data)
  );

  return {
    cipherHex: bufferToHex(encryptedBuffer),
    ivHex: bufferToHex(iv.buffer),
  };
}

/**
 * Decrypt AES-256-GCM cipher using password and salt
 */
export async function decryptData(
  cipherHex: string,
  ivHex: string,
  password: string,
  saltHex: string
): Promise<string> {
  const salt = hexToBuffer(saltHex);
  const iv = hexToBuffer(ivHex);
  const cipher = hexToBuffer(cipherHex);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    stringToBuffer(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 10000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    cipher
  );

  return new TextDecoder().decode(decryptedBuffer);
}

/**
 * Sanitize document: strips author, creation timestamps, and hidden metadata
 */
export function sanitizeDocument(doc: PDFDocument): PDFDocument {
  return {
    ...doc,
    author: 'Anonymous / Sanitized',
    subject: undefined,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    pages: doc.pages.map((p) => ({
      ...p,
      annotations: p.annotations.map((a) => ({
        ...a,
        author: undefined, // remove author tag from comments/sticky notes
      })),
    })),
  };
}

/**
 * Calculate password strength score 0-4
 */
export function checkPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: 'Empty', color: 'bg-slate-200' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

  switch (score) {
    case 1:
      return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    case 2:
      return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    case 3:
      return { score: 3, label: 'Good', color: 'bg-emerald-500' };
    case 4:
      return { score: 4, label: 'Strong (AES-256 recommended)', color: 'bg-teal-500' };
    default:
      return { score: 0, label: 'Very Weak', color: 'bg-rose-400' };
  }
}
