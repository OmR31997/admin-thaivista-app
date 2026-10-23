"use client";

import React from "react";

interface DashboardHeaderProps {
  activeTab: "dashboard" | "properties" | "requirements" | "inquiries";
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
}: DashboardHeaderProps) {
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
          title: "List Property",
        };
      case "requirements":
        return {
          eyebrow: "CLIENT REQUIREMENTS",
          title: "Property Requirements",
        };
      case "inquiries":
        return {
          eyebrow: "CLIENT RELATIONS",
          title: "Client Enquiries",
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
        {/* <button
          type="button"
          title="Notifications"
          className="relative w-9 h-9 rounded-full bg-white border border-[#e8ecef] hover:border-neutral-300 hover:bg-[#fafaf8] text-neutral-600 flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          <i className="bi bi-bell text-sm" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
            1
          </span>
        </button> */}

        {/* Sync/Refresh button */}
        <button
          type="button"
          onClick={onRefresh}
          title="Refresh Data"
          disabled={loading}
          className="w-9 h-9 rounded-full bg-white border border-[#e8ecef] hover:border-neutral-300 hover:bg-[#fafaf8] text-neutral-600 flex items-center justify-center transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          <i
            className={`bi bi-arrow-clockwise text-sm text-neutral-700 ${loading ? "animate-spin text-amber-600" : ""
              }`}
          />
        </button>

        {/* User Chip */}
        <div className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-white border border-[#e8ecef] shadow-xs select-none">
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
        </div>
      </div>
    </header>
  );
}
