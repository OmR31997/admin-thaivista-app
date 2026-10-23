"use client";

import React from "react";
import Image from "next/image";

interface SidebarProps {
  activeTab: "dashboard" | "properties" | "inquiries";
  setActiveTab: (tab: "dashboard" | "properties" | "inquiries") => void;
  propertiesCount?: number;
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
  inquiriesCount = 0,
  userName = "Super Admin",
  userRole = "SUPER ADMIN",
  onChangePassword,
  onSignOut,
}: SidebarProps) {
  return (
    <aside className="w-64 bg-[#0c1322] text-neutral-300 flex flex-col min-h-screen shrink-0 border-r border-[#1a2337] select-none">
      {/* Brand Header */}
      <div className="p-5 pb-6 border-b border-[#1a2337]/80">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-[#162035] border border-[#22304d] flex items-center justify-center shrink-0 shadow-sm">
            <Image
              src="/assets/Settings/thaivista-logo-transparent.png"
              alt="Thai Vista Logo"
              width={26}
              height={26}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold tracking-tight text-white leading-tight">
              Thai Vista
            </h1>
            <p className="text-[10px] font-semibold tracking-wider text-amber-400 uppercase">
              Properties · Admin
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation with Properly Separated Sections */}
      <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {/* Top Overview Item */}
        <div>
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${activeTab === "dashboard"
              ? "bg-[#1c2942] text-white shadow-sm border border-[#2b3c5e]"
              : "text-neutral-400 hover:text-white hover:bg-[#131d31]"
              }`}
          >
            <i className="bi bi-grid-fill text-sm text-sky-400" />
            <span>Overview</span>
          </button>
        </div>

        {/* SECTION: PROPERTIES */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
            Properties
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
                <span>All Properties</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#162035] text-neutral-300 font-mono">
                {propertiesCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("properties")}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-[#131d31] transition-all cursor-pointer"
            >
              <i className="bi bi-plus-circle text-sm" />
              <span>Add Property</span>
            </button>
          </div>
        </div>

        {/* SECTION: ENQUIRIES (Matching schema & screenshot) */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
            Enquiries
          </div>
          <div className="space-y-1">
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
                <span>Recent Enquiries</span>
              </div>
              {inquiriesCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold font-mono border border-amber-500/30">
                  {inquiriesCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("inquiries")}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-[#131d31] transition-all cursor-pointer"
            >
              <i className="bi bi-calendar-event text-sm" />
              <span>Viewing Schedule</span>
            </button>
          </div>
        </div>

        {/* SECTION: RESOURCE */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
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
        </div>

        {/* SECTION: SYSTEM */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
            System
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-[#131d31] transition-all cursor-pointer">
              <i className="bi bi-shield-lock text-sm" />
              <span>Administrators</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Profile & Actions Card */}
      <div className="p-3 border-t border-[#1a2337]/80 bg-[#0a101d] space-y-2">
        {/* Super Admin User Capsule with Live Site bootstrap icon beside Super */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#131d31] border border-[#22304d]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
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

          {/* Beside Super Admin: Quick link to live site */}
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
        <div className="space-y-0.5 pt-1">
          <button
            type="button"
            onClick={onChangePassword}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-[#162035] text-left cursor-pointer"
          >
            <i className="bi bi-key text-xs" />
            <span>Change password</span>
          </button>

          <button
            type="button"
            onClick={onSignOut}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400/90 hover:text-rose-300 transition-colors rounded-lg hover:bg-[#162035] text-left cursor-pointer"
          >
            <i className="bi bi-box-arrow-right text-xs" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
