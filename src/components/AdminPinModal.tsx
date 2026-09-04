/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, X, KeyRound, ShieldAlert } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep latest callback references to prevent useEffect from firing on parent re-renders
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  // Auto-focus input and reset state ONLY when modal opens/closes, handle Escape key and body scroll lock
  useEffect(() => {
    if (!isOpen) {
      setPin('');
      setError(false);
      setShake(false);
      return;
    }

    setPin('');
    setError(false);
    setShake(false);

    // Focus input automatically
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 80);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        onCloseRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const validatePin = (valToTest: string) => {
    if (valToTest.length !== 4) return;

    if (valToTest === '5313') {
      setError(false);
      setPin('');
      onSuccessRef.current();
    } else {
      setError(true);
      setShake(true);
      setPin('');
      setTimeout(() => {
        setShake(false);
        inputRef.current?.focus();
      }, 450);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Do not submit or wipe input if 4 digits are not complete
    if (pin.length < 4) {
      return;
    }
    validatePin(pin);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(val);
    if (error) setError(false);

    // Only validate automatically when all 4 digits are complete
    if (val.length === 4) {
      validatePin(val);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (pin.length === 4) {
        validatePin(pin);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className={`relative w-full max-w-sm bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 text-center space-y-5 ${
            shake ? 'animate-shake' : ''
          }`}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal PIN"
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Icon */}
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-200">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Akses Mod Admin
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Sila masukkan 4-digit PIN keselamatan untuk aktifkan mod suntingan admin.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-2.5">
              <input
                ref={inputRef}
                type="password"
                autoFocus
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder="Masukkan 4-digit PIN"
                className={`w-full px-4 py-3.5 text-center text-lg tracking-widest font-extrabold rounded-2xl border-2 transition-all outline-hidden ${
                  error
                    ? 'border-rose-400 bg-rose-50/50 text-rose-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                    : 'border-slate-200 bg-slate-50/80 text-slate-900 placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-semibold placeholder:text-xs focus:border-indigo-600 focus:bg-white focus:ring-3 focus:ring-indigo-100'
                }`}
              />

              {/* 4-digit Visual Indicators */}
              <div className="flex justify-center items-center gap-2 pt-1 pb-0.5">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-200 ${
                      idx < pin.length
                        ? 'w-6 bg-indigo-600'
                        : 'w-2 bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {error && (
                <p className="text-xs font-bold text-rose-600 flex items-center justify-center gap-1.5 pt-1">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>PIN Tidak Sah! Sila cuba lagi.</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={pin.length < 4}
              className={`w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98] text-white rounded-2xl text-xs font-extrabold shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 ${
                pin.length < 4 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Sahkan PIN Admin</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

