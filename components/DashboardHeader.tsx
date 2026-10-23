"use client";

import React from "react";

interface DashboardHeaderProps {
  activeTab: "dashboard" | "properties" | "inquiries";
  loading: boolean;
  onRefresh: () => void;
  userName?: string;
  userRole?: string;
  onChangePassword?: () => void;
  onSignOut?: () => void;
}

export default function DashboardHeader({
  activeTab,
  loading,
  onRefresh,
  userName = "Super Admin",
  userRole = "SUPER ADMIN",
  onChangePassword,
  onSignOut,
}: DashboardHeaderProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getHeaderInfo = () => {
    switch (activeTab) {
      case "properties":
        return {
          eyebrow: "PROPERTY MANAGEMENT",
          title: "All Properties",
        };
      case "inquiries":
        return {
          eyebrow: "CLIENT RELATIONS",
          title: "Property Enquiries",
        };
      default:
        return {
          eyebrow: "REAL ESTATE ADMINISTRATION",
          title: `${getGreeting()}, Administrator`,
        };
    }
  };

  const { eyebrow, title } = getHeaderInfo();

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-2">
      {/* Eyebrow & Title */}
      <div>
        <span className="text-[11px] font-bold tracking-wider text-amber-700 uppercase font-sans">
          {eyebrow}
        </span>
        <h1 className="font-serif text-2xl lg:text-3xl font-bold tracking-tight text-neutral-900 mt-0.5">
          {title}
        </h1>
      </div>

      {/* Top Right Controls */}
      <div className="flex items-center gap-3">
        {/* Notification Bell with unread badge */}
        <button
          type="button"
          title="Notifications"
          className="relative w-9 h-9 rounded-full bg-white border border-[#e8ecef] hover:border-neutral-300 hover:bg-[#fafaf8] text-neutral-600 flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          <i className="bi bi-bell text-sm" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
            1
          </span>
        </button>

        {/* Sync/Refresh button */}
        <button
          type="button"
          onClick={onRefresh}
          title="Refresh Data"
          disabled={loading}
          className="w-9 h-9 rounded-full bg-white border border-[#e8ecef] hover:border-neutral-300 hover:bg-[#fafaf8] text-neutral-600 flex items-center justify-center transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <i
            className={`bi bi-arrow-clockwise text-sm text-neutral-700 ${
              loading ? "animate-spin text-amber-600" : ""
            }`}
          />
        </button>

        {/* User Chip with Profile Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-white border border-[#e8ecef] hover:border-neutral-300 shadow-xs cursor-pointer transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-xs font-bold shadow-xs">
              <i className="bi bi-person-fill" />
            </div>
            <div className="text-left leading-tight">
              <span className="block text-xs font-semibold text-neutral-900">
                {userName}
              </span>
              <span className="block text-[9px] font-semibold text-neutral-400 tracking-wider uppercase">
                {userRole}
              </span>
            </div>
            <i className={`bi bi-chevron-down text-[10px] text-neutral-400 ml-1 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {/* User Menu Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-neutral-100 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-2 border-b border-neutral-100">
                <div className="text-xs font-semibold text-neutral-900 truncate">
                  {userName}
                </div>
                <div className="text-[10px] text-neutral-400 font-mono">
                  {userRole}
                </div>
              </div>

              <div className="p-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onChangePassword?.();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <i className="bi bi-key text-neutral-500 text-sm" />
                  <span>Change Password</span>
                </button>

                <a
                  href="https://www.thaivistaproperties.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <i className="bi bi-box-arrow-up-right text-neutral-500 text-xs" />
                  <span>View Live Site</span>
                </a>
              </div>

              <div className="p-1 pt-1 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onSignOut?.();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <i className="bi bi-box-arrow-right text-rose-500 text-xs" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
