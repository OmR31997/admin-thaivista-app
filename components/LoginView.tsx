"use client";

import React, { useState } from "react";
import Image from "next/image";
import { loginAdmin, AuthSession } from "@/lib/api";

interface LoginViewProps {
  onLoginSuccess: (session: AuthSession) => void;
  noticeMessage?: string | null;
}

export default function LoginView({
  onLoginSuccess,
  noticeMessage,
}: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await loginAdmin(email.trim(), password);
      if (!res.success || !res.data) {
        setErrorMsg(res.error || "Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      onLoginSuccess(res.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in";
      setErrorMsg(msg);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-[#f8f9fa] via-[#f3f5f8] to-[#edf1f5] select-none z-50 font-sans">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Luxury Card */}
      <div className="relative w-full max-w-[410px] bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(12,19,34,0.08)] border border-[#e8ecef] p-7 sm:p-9 my-auto">
        {/* Prominent High-Visibility Brand Logo from public/assets/Settings */}
        <div className="flex items-center justify-center mb-5">
          <div className="relative h-14 w-56">
            <Image
              src="/assets/Settings/ThaiVistaLogo.png"
              alt="ThaiVista Properties"
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>

        {/* Eyebrow & Title */}
        <div className="text-center mb-6">
          <span className="text-[10px] font-bold tracking-widest text-amber-700 uppercase font-sans">
            Real Estate Administration
          </span>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#0c1322] mt-0.5">
            Admin Sign In
          </h1>
          <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
            Authorised credentials required to access the console
          </p>
        </div>

        {/* Notice Message (after password change or logout) */}
        {noticeMessage && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-2 animate-in fade-in">
            <i className="bi bi-info-circle text-amber-600 text-sm shrink-0" />
            <span className="font-medium leading-tight">{noticeMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
            <i className="bi bi-exclamation-circle-fill text-rose-600 text-sm mt-0.5 shrink-0" />
            <div className="font-medium leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <i className="bi bi-envelope text-sm" />
              </div>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@thaivistaproperties.com"
                disabled={loading}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-[#fbfcfd] border border-[#dce1e7] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <i className="bi bi-lock text-sm" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-[#fbfcfd] border border-[#dce1e7] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all disabled:opacity-60 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} text-sm`} />
              </button>
            </div>
          </div>

          {/* ThaiVista Signature Deep Navy CTA Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-xs text-white bg-[#0c1322] hover:bg-[#162238] active:bg-[#070d18] shadow-[0_4px_16px_rgba(12,19,34,0.18)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <i className="bi bi-arrow-clockwise animate-spin text-sm" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <i className="bi bi-shield-lock-fill text-amber-400 text-xs" />
                <span>Sign in securely</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center mt-6 text-[11px] text-neutral-400">
          ThaiVista Properties Co., Ltd. &bull; Secure Administrative Access
        </div>
      </div>
    </div>
  );
}
