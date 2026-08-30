'use client';

import { CheckCircle2, AlertTriangle, XCircle, Info, X, Building2, Phone } from 'lucide-react';

interface ModalAlertProps {
  isOpen: boolean;
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
  onConfirm?: () => void;
  isConfirm?: boolean;
  companyName?: string;
  companyPhone?: string;
}

export default function ModalAlert({
  isOpen,
  type = 'info',
  title,
  message,
  onClose,
  confirmText = 'Confirm',
  onConfirm,
  isConfirm = false,
  companyName,
  companyPhone,
}: ModalAlertProps) {
  if (!isOpen) return null;

  const bgGlowStyles = {
    success: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
    error: 'bg-rose-50 text-rose-600 border-rose-200/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
    info: 'bg-orange-50 text-orange-600 border-orange-200/80',
  };

  const icons = {
    success: <CheckCircle2 className="h-7 w-7 text-emerald-600" />,
    error: <XCircle className="h-7 w-7 text-rose-600" />,
    warning: <AlertTriangle className="h-7 w-7 text-amber-600" />,
    info: <Info className="h-7 w-7 text-orange-600" />,
  };

  const defaultTitles = {
    success: 'Success',
    error: 'Action Required',
    warning: 'Notice',
    info: 'Information',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md shadow-2xl border border-zinc-200/90 dark:border-zinc-800 p-6 sm:p-8 text-[#111827] dark:text-white transform transition-all duration-300 scale-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-700 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center space-y-3 mb-4">
          <div className={`p-4 rounded-2xl border ${bgGlowStyles[type]} shadow-sm`}>
            {icons[type]}
          </div>
          <h3 className="text-xl font-black tracking-tight text-[#111827] dark:text-white">
            {title || defaultTitles[type]}
          </h3>
        </div>

        {/* Message Body */}
        <p className="text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-300 leading-relaxed text-center mb-6">
          {message}
        </p>

        {/* Company Details snippet if present */}
        {companyName && (
          <div className="mb-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-zinc-800 dark:text-zinc-200">
              <Building2 className="h-4 w-4 text-orange-600" />
              <span>{companyName}</span>
            </div>
            {companyPhone && (
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                <Phone className="h-3.5 w-3.5 text-zinc-500" />
                <span>Contact Support: {companyPhone}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          {isConfirm ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 py-3 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onConfirm) onConfirm();
                  onClose();
                }}
                className="flex-1 rounded-2xl bg-[#111827] hover:bg-zinc-800 dark:bg-orange-600 dark:hover:bg-orange-700 text-white py-3 text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl bg-[#111827] hover:bg-zinc-800 dark:bg-orange-600 dark:hover:bg-orange-700 text-white py-3.5 text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
