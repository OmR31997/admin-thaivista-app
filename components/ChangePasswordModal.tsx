"use client";

import React, { useState } from "react";
import { changePassword, ChangePasswordInput } from "@/lib/api";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogout: () => void;
  token?: string;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  onSuccessLogout,
  token,
}: ChangePasswordModalProps) {
  const [formData, setFormData] = useState<ChangePasswordInput & { confirmPassword: string }>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const { currentPassword, newPassword, confirmPassword } = formData;

  const isMinLength = newPassword.length >= 8;
  const isDifferent = newPassword.length > 0 && newPassword !== currentPassword;
  const isMatching = newPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit =
    currentPassword.length >= 8 &&
    isMinLength &&
    isDifferent &&
    isMatching &&
    !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword) {
      setErrorMsg("Please enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMsg("New password cannot be the same as current password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirm password do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword(
        {
          currentPassword,
          newPassword,
        },
        token
      );

      if (!res.success) {
        setErrorMsg(res.error || "Failed to change password. Please check your current password.");
        setLoading(false);
        return;
      }

      setSuccessMsg(
        "Password changed successfully! For security, your session will now be terminated and cache cleared."
      );

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // After a brief delay to let user read the success alert, trigger logout & cache clear
      setTimeout(() => {
        onSuccessLogout();
      }, 1800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header with Dark Navy / Gold Banner */}
        <div className="px-6 py-5 bg-[#0d1527] text-white flex items-center justify-between border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center text-lg shrink-0">
              <i className="bi bi-shield-lock" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Change Password
              </h2>
              <p className="text-xs text-neutral-400">
                Update your administrative portal credentials
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
          >
            <i className="bi bi-x-lg text-sm" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Error Alert */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs flex items-start gap-2.5">
                <i className="bi bi-exclamation-circle-fill text-rose-600 text-sm mt-0.5 shrink-0" />
              <div className="leading-relaxed font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <i className="bi bi-check-circle-fill text-emerald-600 text-sm mt-0.5 shrink-0" />
              <div className="leading-relaxed font-medium">{successMsg}</div>
            </div>
          )}

          {/* Current Password Field */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <i className="bi bi-key text-sm" />
              </div>
              <input
                type={showCurrent ? "text" : "password"}
                required
                value={formData.currentPassword}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                placeholder="Enter current password"
                disabled={loading || Boolean(successMsg)}
                className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl bg-neutral-50/70 border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all disabled:opacity-60"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
              >
                <i className={`bi ${showCurrent ? "bi-eye-slash" : "bi-eye"} text-sm`} />
              </button>
            </div>
          </div>

          {/* New Password Field */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <i className="bi bi-lock text-sm" />
              </div>
              <input
                type={showNew ? "text" : "password"}
                required
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                placeholder="Enter new password (min. 8 characters)"
                disabled={loading || Boolean(successMsg)}
                className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl bg-neutral-50/70 border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all disabled:opacity-60"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
              >
                <i className={`bi ${showNew ? "bi-eye-slash" : "bi-eye"} text-sm`} />
              </button>
            </div>
          </div>

          {/* Confirm New Password Field */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <i className="bi bi-check2-circle text-sm" />
              </div>
              <input
                type={showConfirm ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                placeholder="Confirm your new password"
                disabled={loading || Boolean(successMsg)}
                className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl bg-neutral-50/70 border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all disabled:opacity-60"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
              >
                <i className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"} text-sm`} />
              </button>
            </div>
          </div>

          {/* Real-time Validation Criteria Checklist */}
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1.5 text-[11px]">
            <div
              className={`flex items-center gap-2 transition-colors ${
                isMinLength ? "text-emerald-700 font-medium" : "text-neutral-500"
              }`}
            >
              <i
                className={`bi ${
                  isMinLength ? "bi-check-circle-fill text-emerald-600" : "bi-circle text-neutral-300"
                }`}
              />
              <span>At least 8 characters long</span>
            </div>
            <div
              className={`flex items-center gap-2 transition-colors ${
                isDifferent && currentPassword.length > 0
                  ? "text-emerald-700 font-medium"
                  : "text-neutral-500"
              }`}
            >
              <i
                className={`bi ${
                  isDifferent && currentPassword.length > 0
                    ? "bi-check-circle-fill text-emerald-600"
                    : "bi-circle text-neutral-300"
                }`}
              />
              <span>Different from current password</span>
            </div>
            <div
              className={`flex items-center gap-2 transition-colors ${
                isMatching && confirmPassword.length > 0
                  ? "text-emerald-700 font-medium"
                  : "text-neutral-500"
              }`}
            >
              <i
                className={`bi ${
                  isMatching && confirmPassword.length > 0
                    ? "bi-check-circle-fill text-emerald-600"
                    : "bi-circle text-neutral-300"
                }`}
              />
              <span>Passwords match</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-neutral-100 bg-[#fafaf8] shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-800 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit || Boolean(successMsg)}
            className="px-5 py-2 text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <i className="bi bi-arrow-clockwise animate-spin text-sm" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <i className="bi bi-check2 text-sm font-bold" />
                <span>Update Password</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
  );
}
