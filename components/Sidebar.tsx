"use client";

import React from "react";
import Image from "next/image";

export type TabType = "dashboard" | "properties" | "requirements" | "inquiries";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  propertiesCount?: number;
  requirementsCount?: number;
  inquiriesCount?: number;
  userName?: string;
  userRole?: string;
  onChangePassword?: () => void;
  onSignOut?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  propertiesCount = 0,
  requirementsCount = 0,
  inquiriesCount = 0,
  userName = "Super Admin",
  userRole = "SUPER ADMIN",
  onChangePassword,
  onSignOut,
}: SidebarProps) {
  return (
    <aside className="w-64 bg-[#0c1322] text-neutral-300 flex flex-col h-screen sticky top-0 shrink-0 border-r border-[#1a2337] select-none z-30">
      {/* Brand Header */}
      <div className="px-4 py-3.5 border-b border-[#1a2337]/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[#162035] border border-[#22304d] flex items-center justify-center shrink-0 shadow-xs">
            <Image
              src="/assets/Settings/thaivista-logo-transparent.png"
              alt="Thai Vista Logo"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-base font-bold tracking-tight text-white leading-tight truncate">
              Thai Vista
            </h1>
            <p className="text-[10px] font-semibold tracking-wider text-amber-400 uppercase">
              Properties · Admin
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation with Optimized Proportional Spacing */}
      <div className="flex-1 px-3 py-3 space-y-3.5 overflow-y-auto custom-sidebar-scroll">
        {/* Top Overview Item */}
        <div>
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${activeTab === "dashboard"
              ? "bg-[#1c2942] text-white shadow-xs border border-[#2b3c5e]"
              : "text-neutral-400 hover:text-white hover:bg-[#131d31]"
              }`}
          >
            <i className="bi bi-grid-fill text-sm text-sky-400" />
            <span>Overview</span>
          </button>
        </div>

        {/* SECTION: SERVICES */}
        <div>
          <div className="px-3 pb-1 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
            Services
          </div>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab("properties")}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${activeTab === "properties"
                ? "bg-[#1c2942] text-white font-semibold border border-[#2b3c5e]"
                : "text-neutral-400 hover:text-white hover:bg-[#131d31]"
                }`}
            >
              <div className="flex items-center gap-3">
                <i className="bi bi-building text-sm" />
                <span>List Property</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#162035] text-neutral-300 font-mono">
                {propertiesCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("requirements")}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${activeTab === "requirements"
                ? "bg-[#1c2942] text-white font-semibold border border-[#2b3c5e]"
                : "text-neutral-400 hover:text-white hover:bg-[#131d31]"
                }`}
            >
              <div className="flex items-center gap-3">
                <i className="bi bi-card-checklist text-sm" />
                <span>Requirements</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${requirementsCount > 0
                  ? "bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30"
                  : "bg-[#162035] text-neutral-400"
                  }`}
              >
                {requirementsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("inquiries")}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${activeTab === "inquiries"
                ? "bg-[#1c2942] text-white font-semibold border border-[#2b3c5e]"
                : "text-neutral-400 hover:text-white hover:bg-[#131d31]"
                }`}
            >
              <div className="flex items-center gap-3">
                <i className="bi bi-envelope-paper text-sm" />
                <span>Enquiries</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${inquiriesCount > 0
                  ? "bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30"
                  : "bg-[#162035] text-neutral-400"
                  }`}
              >
                {inquiriesCount}
              </span>
            </button>
          </div>
        </div>

        {/* SECTION: RESOURCE */}
        {/* <div>
          <div className="px-3 pb-1 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
            Resource
          </div>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab("properties")}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-[#131d31] transition-all cursor-pointer"
            >
              <i className="bi bi-images text-sm" />
              <span>Photo Gallery</span>
            </button>
          </div>
        </div> */}
      </div>

      {/* Bottom Profile & Actions Card */}
      <div className="p-2.5 border-t border-[#1a2337]/80 bg-[#0a101d] space-y-1.5 shrink-0">
        {/* Super Admin User Capsule */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#131d31] border border-[#22304d]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              <i className="bi bi-person-fill" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {userName}
              </div>
              <div className="text-[9px] font-bold text-amber-400 tracking-wider uppercase">
                {userRole}
              </div>
            </div>
          </div>

          {/* Quick link to live site */}
          <a
            href="https://www.thaivistaproperties.com/"
            target="_blank"
            rel="noopener noreferrer"
            title="View Live Site"
            className="w-7 h-7 rounded-lg bg-[#162035] hover:bg-amber-400/20 text-neutral-400 hover:text-amber-400 border border-[#22304d] hover:border-amber-400/40 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs group"
          >
            <i className="bi bi-box-arrow-up-right text-xs transition-transform group-hover:scale-110" />
          </a>
        </div>

        {/* Footer Links */}
        <div className="space-y-0.5 pt-0.5">
          <button
            type="button"
            onClick={onChangePassword}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-[#162035] text-left cursor-pointer"
          >
            <i className="bi bi-key text-xs" />
            <span>Change password</span>
          </button>

          <button
            type="button"
            onClick={onSignOut}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-400/90 hover:text-rose-300 transition-colors rounded-lg hover:bg-[#162035] text-left cursor-pointer"
          >
            <i className="bi bi-box-arrow-right text-xs" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
