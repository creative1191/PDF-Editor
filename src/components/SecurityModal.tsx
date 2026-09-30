import React, { useState } from 'react';
import {
  PDFSecuritySettings,
} from '../types/pdf';
import {
  Shield,
  Lock,
  Unlock,
  KeyRound,
  Printer,
  Copy,
  FileEdit,
  Sparkles,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  X,
} from 'lucide-react';
import {
  generateSalt,
  hashPassword,
  checkPasswordStrength,
} from '../utils/security';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  security: PDFSecuritySettings;
  onSaveSecurity: (newSecurity: PDFSecuritySettings) => void;
  onSanitize: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  security,
  onSaveSecurity,
  onSanitize,
}) => {
  const [activeTab, setActiveTab] = useState<'password' | 'permissions' | 'watermark' | 'sanitize'>('password');
  const [isProtected, setIsProtected] = useState(security.isPasswordProtected);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordHint, setPasswordHint] = useState(security.passwordHint || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [sanitizedSuccess, setSanitizedSuccess] = useState(false);

  // Permissions state
  const [permissions, setPermissions] = useState(security.permissions);

  // Watermark state
  const [watermark, setWatermark] = useState(security.watermark);

  if (!isOpen) return null;

  const strength = checkPasswordStrength(password);

  const handleApply = async () => {
    setErrorMessage('');

    if (isProtected) {
      if (!password && !security.openPasswordHash) {
        setErrorMessage('Please enter an encryption password to protect the document.');
        return;
      }

      if (password && password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter.');
        return;
      }
    }

    let passwordHash = security.openPasswordHash;
    let salt = security.passwordSalt;

    if (isProtected && password) {
      salt = generateSalt();
      passwordHash = await hashPassword(password, salt);
    } else if (!isProtected) {
      passwordHash = undefined;
      salt = undefined;
    }

    const newSecurity: PDFSecuritySettings = {
      isPasswordProtected: isProtected,
      openPasswordHash: passwordHash,
      passwordSalt: salt,
      passwordHint: isProtected ? passwordHint : undefined,
      encryptionLevel: 'AES-256',
      isEncrypted: isProtected,
      permissions,
      watermark,
    };

    onSaveSecurity(newSecurity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col text-slate-800 dark:text-zinc-100 text-xs">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Windows PDF Security Center</h3>
              <p className="text-[11px] text-slate-500">
                AES-256 Encryption, Permissions Control & Document Watermarking
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900">
          <button
            onClick={() => setActiveTab('password')}
            className={`px-3 py-1.5 font-medium rounded-t border-b-2 transition-colors ${
              activeTab === 'password'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Password & Encryption
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-3 py-1.5 font-medium rounded-t border-b-2 transition-colors ${
              activeTab === 'permissions'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Permissions Matrix
          </button>
          <button
            onClick={() => setActiveTab('watermark')}
            className={`px-3 py-1.5 font-medium rounded-t border-b-2 transition-colors ${
              activeTab === 'watermark'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Watermark Protection
          </button>
          <button
            onClick={() => setActiveTab('sanitize')}
            className={`px-3 py-1.5 font-medium rounded-t border-b-2 transition-colors ${
              activeTab === 'sanitize'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sanitization
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex-1 min-h-[300px]">
          {/* TAB 1: Password Protection */}
          {activeTab === 'password' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-800/40">
                <div className="flex items-center gap-2.5">
                  {isProtected ? (
                    <Lock className="w-5 h-5 text-rose-600" />
                  ) : (
                    <Unlock className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <span className="font-semibold text-xs block">
                      Require a password to open this document
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Standard AES-256 military-grade encryption with PBKDF2 key derivation.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isProtected}
                  onChange={(e) => setIsProtected(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
              </div>

              {isProtected && (
                <div className="flex flex-col gap-3 p-3.5 border border-slate-200 dark:border-zinc-800 rounded-lg">
                  <div>
                    <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                      Document Open Password:
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={security.openPasswordHash ? '(Password already set. Enter new to change)' : 'Enter strong password...'}
                        className="w-full bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded px-2.5 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {password && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden flex">
                          <div
                            className={`h-full transition-all ${strength.color}`}
                            style={{ width: `${(strength.score / 4) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {strength.label}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                      Confirm Password:
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password to verify..."
                      className="w-full bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                      Password Hint (optional):
                    </label>
                    <input
                      type="text"
                      value={passwordHint}
                      onChange={(e) => setPasswordHint(e.target.value)}
                      placeholder="e.g. Corporate quarterly pass or department code"
                      className="w-full bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                    />
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-1.5 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Permissions Matrix */}
          {activeTab === 'permissions' && (
            <div className="flex flex-col gap-3">
              <span className="text-slate-500 text-[11px]">
                Define user rights when viewing this file. Restricting actions blocks unauthorized printing, extracting, or modifications.
              </span>

              <div className="grid grid-cols-1 gap-2.5 mt-1">
                <label className="flex items-center justify-between p-2.5 rounded border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Printer className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="font-medium block">Allow Printing</span>
                      <span className="text-[10px] text-slate-400">
                        Permit users to print high-resolution physical copies
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.printingAllowed}
                    onChange={(e) =>
                      setPermissions({ ...permissions, printingAllowed: e.target.checked })
                    }
                    className="w-4 h-4 accent-blue-600"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Copy className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-medium block">Allow Copying of Text & Graphics</span>
                      <span className="text-[10px] text-slate-400">
                        Permit selecting and copying text to external clipboards
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.copyingAllowed}
                    onChange={(e) =>
                      setPermissions({ ...permissions, copyingAllowed: e.target.checked })
                    }
                    className="w-4 h-4 accent-blue-600"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FileEdit className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="font-medium block">Allow Annotating & Comments</span>
                      <span className="text-[10px] text-slate-400">
                        Permit adding highlights, sticky notes, and stamps
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.annotatingAllowed}
                    onChange={(e) =>
                      setPermissions({ ...permissions, annotatingAllowed: e.target.checked })
                    }
                    className="w-4 h-4 accent-blue-600"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <div>
                      <span className="font-medium block">Allow Page Modifications & Editing</span>
                      <span className="text-[10px] text-slate-400">
                        Permit editing existing layout, rotating, and inserting pages
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.pageModificationsAllowed}
                    onChange={(e) =>
                      setPermissions({
                        ...permissions,
                        pageModificationsAllowed: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-blue-600"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: Watermark Protection */}
          {activeTab === 'watermark' && (
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 p-2.5 rounded border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={watermark.enabled}
                  onChange={(e) => setWatermark({ ...watermark, enabled: e.target.checked })}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="font-semibold">Enable Security Watermark on All Pages</span>
              </label>

              {watermark.enabled && (
                <div className="flex flex-col gap-3 p-3 border border-slate-200 dark:border-zinc-800 rounded-lg">
                  <div>
                    <label className="font-medium block mb-1">Watermark Text:</label>
                    <input
                      type="text"
                      value={watermark.text}
                      onChange={(e) => setWatermark({ ...watermark, text: e.target.value })}
                      placeholder="e.g. CONFIDENTIAL, DRAFT, INTERNAL ONLY"
                      className="w-full bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-medium block mb-1">
                        Opacity: {Math.round(watermark.opacity * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0.05"
                        max="0.5"
                        step="0.02"
                        value={watermark.opacity}
                        onChange={(e) =>
                          setWatermark({ ...watermark, opacity: parseFloat(e.target.value) })
                        }
                        className="w-full accent-blue-600"
                      />
                    </div>

                    <div>
                      <label className="font-medium block mb-1">
                        Rotation: {watermark.rotation}°
                      </label>
                      <input
                        type="range"
                        min="-90"
                        max="90"
                        step="5"
                        value={watermark.rotation}
                        onChange={(e) =>
                          setWatermark({ ...watermark, rotation: parseInt(e.target.value) })
                        }
                        className="w-full accent-blue-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="font-medium">Color:</label>
                      <input
                        type="color"
                        value={watermark.color}
                        onChange={(e) => setWatermark({ ...watermark, color: e.target.value })}
                        className="w-6 h-6 rounded cursor-pointer border border-slate-300 p-0"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="font-medium">Size: {watermark.fontSize}pt</label>
                      <input
                        type="range"
                        min="24"
                        max="72"
                        step="2"
                        value={watermark.fontSize}
                        onChange={(e) =>
                          setWatermark({ ...watermark, fontSize: parseInt(e.target.value) })
                        }
                        className="w-24 accent-blue-600"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Sanitization */}
          {activeTab === 'sanitize' && (
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-xs">
                <span className="font-semibold block mb-1">Document Sanitization & Metadata Scrubbing</span>
                Sanitizing removes embedded author names, organization metadata, creation timestamps, and hidden revision tags from comments and sticky notes before distributing externally.
              </div>

              <div className="p-4 border border-slate-200 dark:border-zinc-800 rounded-lg flex flex-col items-center justify-center gap-3 text-center">
                <Sparkles className="w-8 h-8 text-amber-500" />
                <div>
                  <h4 className="font-semibold text-xs">Scrub Hidden Identification Data</h4>
                  <p className="text-[11px] text-slate-500 max-w-sm mt-0.5">
                    This permanently replaces author names with "Anonymous" and updates metadata to safe enterprise standards.
                  </p>
                </div>

                <button
                  onClick={() => {
                    onSanitize();
                    setSanitizedSuccess(true);
                    setTimeout(() => setSanitizedSuccess(false), 3000);
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sanitize Document Now</span>
                </button>

                {sanitizedSuccess && (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Document metadata scrubbed successfully!
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-zinc-800/80 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            FIPS 140-2 AES-256 Encryption Compliant
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs transition-colors"
            >
              Save Security Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
