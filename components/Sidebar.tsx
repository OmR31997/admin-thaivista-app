"use client";

import React, { useState, useEffect } from "react";
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
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
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
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(false);
  const [isServicesOpen, setIsServicesOpen] = useState<boolean>(true);

  // Load saved collapse state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("thaivista_sidebar_collapsed");
      if (saved !== null) {
        setInternalCollapsed(saved === "true");
      }
    } catch {
      // Ignore localStorage read errors in SSR/sandboxed mode
    }
  }, []);

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const toggleSidebar = () => {
    const nextVal = !isCollapsed;
    if (controlledCollapsed === undefined) {
      setInternalCollapsed(nextVal);
      try {
        localStorage.setItem("thaivista_sidebar_collapsed", String(nextVal));
      } catch {
        // Ignore localStorage write errors
      }
    }
    onToggleCollapse?.(nextVal);
  };

  return (
    <aside
      className={`bg-[#0c1322] text-neutral-300 flex flex-col h-screen sticky top-0 shrink-0 border-r border-[#1a2337] select-none z-30 transition-[width] duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div
        className={`border-b border-[#1a2337]/80 shrink-0 h-[65px] flex items-center relative transition-all duration-300 ${
          isCollapsed ? "px-0 justify-center" : "px-4 justify-between"
        }`}
      >
        {!isCollapsed ? (
          /* Expanded Brand Header */
          <>
            <div className="flex items-center gap-3 overflow-hidden min-w-0">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[#162035] border border-[#22304d] flex items-center justify-center shrink-0 shadow-xs p-1">
                <Image
                  src="/assets/Settings/thaivista-logo-transparent.png"
                  alt="Thai Vista Logo"
                  width={64}
                  height={64}
                  priority
                  unoptimized
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div className="min-w-0">
                <h1 className="font-serif text-base font-bold tracking-tight text-white leading-tight truncate">
                  Thai Vista
                </h1>
                <p className="text-[10px] font-semibold tracking-wider text-amber-400 uppercase truncate">
                  Properties · Admin
                </p>
              </div>
            </div>

            {/* Collapse Button inside header when expanded */}
            <button
              type="button"
              onClick={toggleSidebar}
              title="Collapse sidebar"
              className="w-7 h-7 rounded-lg bg-[#162035]/60 hover:bg-[#1f2d48] text-neutral-400 hover:text-amber-400 border border-[#22304d] hover:border-amber-400/40 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs"
              aria-label="Collapse sidebar"
            >
              <i className="bi bi-chevron-left text-xs" />
            </button>
          </>
        ) : (
          /* Collapsed Brand Header: Clean centered logo + Floating border toggle */
          <div className="w-full flex items-center justify-center relative">
            {/* Centered Brand Logo Button */}
            <button
              type="button"
              onClick={toggleSidebar}
              title="Click to expand sidebar"
              className="relative w-9 h-9 rounded-xl overflow-hidden bg-[#162035] hover:bg-[#1c2942] border border-[#22304d] hover:border-amber-400/50 flex items-center justify-center shrink-0 shadow-xs transition-all cursor-pointer group p-1"
            >
              <Image
                src="/assets/Settings/thaivista-logo-transparent.png"
                alt="Thai Vista Logo"
                width={72}
                height={72}
                priority
                unoptimized
                className="w-7 h-7 object-contain transition-transform duration-200 group-hover:scale-105 transform-gpu [backface-visibility:hidden]"
              />
            </button>

            {/* Floating Expand Toggle on Right Border */}
            <button
              type="button"
              onClick={toggleSidebar}
              title="Expand sidebar"
              className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#131d31] hover:bg-amber-400 text-amber-400 hover:text-amber-950 border border-[#22304d] hover:border-amber-400 shadow-md flex items-center justify-center transition-all cursor-pointer z-40 group"
              aria-label="Expand sidebar"
            >
              <i className="bi bi-chevron-right text-[10px] font-bold transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Navigation with Optimized Proportional Spacing */}
      <div className="flex-1 px-2.5 py-3 space-y-3 overflow-y-auto overflow-x-hidden custom-sidebar-scroll">
        {/* Top Overview Item */}
        <div>
          <div className="relative group">
            <button
              type="button"
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2"
              } rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-[#1c2942] text-white shadow-xs border border-[#2b3c5e]"
                  : "text-neutral-400 hover:text-white hover:bg-[#131d31]"
              }`}
              title={isCollapsed ? "Overview" : undefined}
            >
              <i className="bi bi-grid-fill text-base text-sky-400 shrink-0" />
              {!isCollapsed && <span className="truncate">Overview</span>}
            </button>

            {/* Floating Tooltip in Collapsed Mode */}
            {isCollapsed && (
              <div className="hidden group-hover:flex absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#0e172a] text-white text-xs font-medium rounded-lg shadow-xl border border-[#22304d] whitespace-nowrap z-50 pointer-events-none items-center gap-2">
                <span>Overview</span>
              </div>
            )}
          </div>
        </div>

        {/* SECTION: SERVICES */}
        <div className="pt-1">
          {/* Section Header */}
          {!isCollapsed ? (
            <button
              type="button"
              onClick={() => setIsServicesOpen(!isServicesOpen)}
              className="w-full flex items-center justify-between px-3 pb-1.5 text-[10px] font-bold tracking-widest text-neutral-400 hover:text-neutral-200 uppercase transition-colors cursor-pointer group"
              title={isServicesOpen ? "Collapse Services section" : "Expand Services section"}
            >
              <span>Services</span>
              <i
                className={`bi bi-chevron-down text-[10px] transition-transform duration-200 text-neutral-500 group-hover:text-neutral-300 ${
                  isServicesOpen ? "" : "-rotate-90"
                }`}
              />
            </button>
          ) : (
            <div className="my-2 border-t border-[#1a2337]/80 mx-1" />
          )}

          {/* Section Items */}
          {(isServicesOpen || isCollapsed) && (
            <div className="space-y-1">
              {/* Properties Nav Item */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setActiveTab("properties")}
                  className={`w-full flex items-center ${
                    isCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2"
                  } rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeTab === "properties"
                      ? "bg-[#1c2942] text-white font-semibold border border-[#2b3c5e]"
                      : "text-neutral-400 hover:text-white hover:bg-[#131d31]"
                  }`}
                  title={isCollapsed ? `List Property (${propertiesCount})` : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <i className="bi bi-building text-sm shrink-0" />
                    {!isCollapsed && <span className="truncate">List Property</span>}
                  </div>
                  {!isCollapsed && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#162035] text-neutral-300 font-mono shrink-0">
                      {propertiesCount}
                    </span>
                  )}

                  {/* Collapsed Badge Indicator */}
                  {isCollapsed && propertiesCount > 0 && (
                    <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-sky-400 ring-2 ring-[#0c1322]" />
                  )}
                </button>

                {/* Floating Tooltip in Collapsed Mode */}
                {isCollapsed && (
                  <div className="hidden group-hover:flex absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#0e172a] text-white text-xs font-medium rounded-lg shadow-xl border border-[#22304d] whitespace-nowrap z-50 pointer-events-none items-center gap-2">
                    <span>List Property</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#162035] text-neutral-300 font-mono">
                      {propertiesCount}
                    </span>
                  </div>
                )}
              </div>

              {/* Requirements Nav Item */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setActiveTab("requirements")}
                  className={`w-full flex items-center ${
                    isCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2"
                  } rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeTab === "requirements"
                      ? "bg-[#1c2942] text-white font-semibold border border-[#2b3c5e]"
                      : "text-neutral-400 hover:text-white hover:bg-[#131d31]"
                  }`}
                  title={isCollapsed ? `Requirements (${requirementsCount})` : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <i className="bi bi-card-checklist text-sm shrink-0" />
                    {!isCollapsed && <span className="truncate">Requirements</span>}
                  </div>
                  {!isCollapsed && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono shrink-0 ${
                        requirementsCount > 0
                          ? "bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30"
                          : "bg-[#162035] text-neutral-400"
                      }`}
                    >
                      {requirementsCount}
                    </span>
                  )}

                  {/* Collapsed Badge Indicator */}
                  {isCollapsed && requirementsCount > 0 && (
                    <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#0c1322]" />
                  )}
                </button>

                {/* Floating Tooltip in Collapsed Mode */}
                {isCollapsed && (
                  <div className="hidden group-hover:flex absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#0e172a] text-white text-xs font-medium rounded-lg shadow-xl border border-[#22304d] whitespace-nowrap z-50 pointer-events-none items-center gap-2">
                    <span>Requirements</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {requirementsCount}
                    </span>
                  </div>
                )}
              </div>

              {/* Inquiries Nav Item */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setActiveTab("inquiries")}
                  className={`w-full flex items-center ${
                    isCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2"
                  } rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeTab === "inquiries"
                      ? "bg-[#1c2942] text-white font-semibold border border-[#2b3c5e]"
                      : "text-neutral-400 hover:text-white hover:bg-[#131d31]"
                  }`}
                  title={isCollapsed ? `Enquiries (${inquiriesCount})` : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <i className="bi bi-envelope-paper text-sm shrink-0" />
                    {!isCollapsed && <span className="truncate">Enquiries</span>}
                  </div>
                  {!isCollapsed && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono shrink-0 ${
                        inquiriesCount > 0
                          ? "bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30"
                          : "bg-[#162035] text-neutral-400"
                      }`}
                    >
                      {inquiriesCount}
                    </span>
                  )}

                  {/* Collapsed Badge Indicator */}
                  {isCollapsed && inquiriesCount > 0 && (
                    <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-blue-400 ring-2 ring-[#0c1322]" />
                  )}
                </button>

                {/* Floating Tooltip in Collapsed Mode */}
                {isCollapsed && (
                  <div className="hidden group-hover:flex absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#0e172a] text-white text-xs font-medium rounded-lg shadow-xl border border-[#22304d] whitespace-nowrap z-50 pointer-events-none items-center gap-2">
                    <span>Enquiries</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {inquiriesCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Profile & Actions Card */}
      <div className="p-2 border-t border-[#1a2337]/80 bg-[#0a101d] space-y-1.5 shrink-0">
        {/* Expanded Mode Profile Capsule */}
        {!isCollapsed ? (
          <>
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#131d31] border border-[#22304d]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  <i className="bi bi-person-fill" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">
                    {userName}
                  </div>
                  <div className="text-[9px] font-bold text-amber-400 tracking-wider uppercase truncate">
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
          </>
        ) : (
          /* Collapsed Mode Profile and Actions */
          <div className="flex flex-col items-center space-y-1 py-1">
            {/* User Avatar with Tooltip */}
            <div className="relative group">
              <div
                className="w-8 h-8 rounded-lg bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-sm shadow-xs cursor-default"
                title={`${userName} (${userRole})`}
              >
                <i className="bi bi-person-fill" />
              </div>
              <div className="hidden group-hover:flex absolute left-full ml-3 bottom-0 px-2.5 py-1.5 bg-[#0e172a] text-white text-xs font-medium rounded-lg shadow-xl border border-[#22304d] whitespace-nowrap z-50 pointer-events-none flex-col">
                <span className="font-semibold text-white">{userName}</span>
                <span className="text-[10px] text-amber-400 font-bold uppercase">{userRole}</span>
              </div>
            </div>

            {/* Live Site Link */}
            <div className="relative group">
              <a
                href="https://www.thaivistaproperties.com/"
                target="_blank"
                rel="noopener noreferrer"
                title="View Live Site"
                className="w-8 h-8 rounded-lg bg-[#162035] hover:bg-amber-400/20 text-neutral-400 hover:text-amber-400 border border-[#22304d] hover:border-amber-400/40 flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <i className="bi bi-box-arrow-up-right text-xs" />
              </a>
              <div className="hidden group-hover:flex absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#0e172a] text-white text-xs font-medium rounded-lg shadow-xl border border-[#22304d] whitespace-nowrap z-50 pointer-events-none">
                <span>View Live Site</span>
              </div>
            </div>

            {/* Change Password Button */}
            <div className="relative group">
              <button
                type="button"
                onClick={onChangePassword}
                title="Change password"
                className="w-8 h-8 rounded-lg bg-[#162035]/60 hover:bg-[#162035] text-neutral-400 hover:text-white border border-[#22304d] flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="bi bi-key text-xs" />
              </button>
              <div className="hidden group-hover:flex absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#0e172a] text-white text-xs font-medium rounded-lg shadow-xl border border-[#22304d] whitespace-nowrap z-50 pointer-events-none">
                <span>Change password</span>
              </div>
            </div>

            {/* Sign Out Button */}
            <div className="relative group">
              <button
                type="button"
                onClick={onSignOut}
                title="Sign out"
                className="w-8 h-8 rounded-lg bg-[#162035]/60 hover:bg-rose-500/20 text-rose-400/90 hover:text-rose-300 border border-[#22304d] hover:border-rose-500/30 flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="bi bi-box-arrow-right text-xs" />
              </button>
              <div className="hidden group-hover:flex absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#0e172a] text-rose-300 text-xs font-medium rounded-lg shadow-xl border border-rose-500/30 whitespace-nowrap z-50 pointer-events-none">
                <span>Sign out</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

