"use client";

import React, { useState } from "react";

interface SignOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export default function SignOutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: SignOutConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden p-6 text-center">
        {/* Warning Icon Badge */}
        <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center text-xl mb-4 shadow-xs">
          <i className="bi bi-box-arrow-right" />
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-neutral-900 mb-1.5 font-sans">
          Sign out of ThaiVista Admin?
        </h3>
        <p className="text-xs text-neutral-500 leading-relaxed mb-6">
          Your active session will be invalidated on the server and all local
          browser cache, storage tokens, and temporary files will be wiped clean.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-xs font-semibold text-neutral-600 hover:text-neutral-800 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <i className="bi bi-arrow-clockwise animate-spin text-sm" />
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-right text-xs" />
                <span>Sign Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
