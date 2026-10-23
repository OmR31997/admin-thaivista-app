"use client";

import React, { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import Sidebar from "@/components/Sidebar";
import KpiCard from "@/components/KpiCard";
import RecentEnquiries from "@/components/RecentEnquiries";
import PropertiesView from "@/components/PropertiesView";
import DashboardHeader from "@/components/DashboardHeader";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import SignOutConfirmModal from "@/components/SignOutConfirmModal";
import LoginView from "@/components/LoginView";
import {
  fetchProperties,
  fetchInquiries,
  fetchStorageUsage,
  getAuthToken,
  getStoredUser,
  subscribeAuth,
  logoutAdmin,
  PropertyItem,
  InquiryItem,
  StorageUsageData,
} from "@/lib/api";

const emptySubscribe = () => () => {};

export default function AdminDashboardPage() {
  // Clean client mount check without cascading render warnings
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Sync token and user with storage & custom events
  const token = useSyncExternalStore(
    subscribeAuth,
    () => getAuthToken(),
    () => null
  );

  const currentUser = useSyncExternalStore(
    subscribeAuth,
    () => getStoredUser(),
    () => null
  );

  const [loginNotice, setLoginNotice] = useState<string | null>(null);

  // Modal states
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);

  // Dashboard tab and data state
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "properties" | "inquiries"
  >("dashboard");
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [storageUsage, setStorageUsage] = useState<StorageUsageData>({
    provider: "Cloud Storage",
    rawProvider: "cloud",
    usedFormatted: "0 Bytes",
    limitFormatted: "20 GB",
    remainingFormatted: "20 GB",
    percentUsed: 0,
    hasQuota: true,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setRefreshIndex((prev) => prev + 1);
  }, []);

  const handleLoginSuccess = () => {
    setLoginNotice(null);
    setRefreshIndex((prev) => prev + 1);
  };

  const handleSignOutConfirm = async () => {
    try {
      await logoutAdmin(token || undefined);
    } finally {
      setProperties([]);
      setInquiries([]);
      setIsSignOutConfirmOpen(false);
      setLoginNotice("You have been signed out. All local browser cache and session tokens have been cleared.");
    }
  };

  const handleChangePasswordSuccess = async () => {
    try {
      await logoutAdmin(token || undefined);
    } finally {
      setIsChangePasswordOpen(false);
      setProperties([]);
      setInquiries([]);
      setLoginNotice("Password changed successfully! Please sign in with your new password.");
    }
  };

  useEffect(() => {
    let isCancelled = false;

    async function loadDashboardData() {
      try {
        const [propsRes, inqRes, usageRes] = await Promise.all([
          fetchProperties(),
          fetchInquiries(),
          fetchStorageUsage(),
        ]);

        if (isCancelled) return;

        setProperties(propsRes.properties);
        setInquiries(inqRes.inquiries);
        setStorageUsage(usageRes);
      } catch (err) {
        console.error("Error loading data from API:", err);
        if (!isCancelled) {
          setProperties([]);
          setInquiries([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadDashboardData();

    return () => {
      isCancelled = true;
    };
  }, [refreshIndex]);

  // Real dynamic KPI calculations from live API data
  const activePropertiesCount = properties.length;
  const totalEnquiriesCount = inquiries.length;

  const openEnquiriesCount = inquiries.filter(
    (inq) => (inq.status || "new") === "new" || inq.status === "contacted"
  ).length;

  const closedDealsCount = inquiries.filter(
    (inq) => inq.status === "closed"
  ).length;

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold mb-4 shadow-[0_0_25px_rgba(251,191,36,0.25)]">
          <i className="bi bi-building-fill-check text-2xl" />
        </div>
        <div className="text-xs text-neutral-400 font-sans flex items-center gap-2.5">
          <i className="bi bi-arrow-clockwise animate-spin text-amber-400 text-sm" />
          <span>Verifying administrative session...</span>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        noticeMessage={loginNotice}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4f6f8] text-neutral-800 antialiased font-sans">
      {/* Dark Sidebar with Properly Separated Sections */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        propertiesCount={activePropertiesCount}
        inquiriesCount={totalEnquiriesCount}
        userName={currentUser?.name || "Super Admin"}
        userRole={currentUser?.role || "SUPER ADMIN"}
        onChangePassword={() => setIsChangePasswordOpen(true)}
        onSignOut={() => setIsSignOutConfirmOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto overflow-y-auto">
        {/* Executive Header matching screenshot */}
        <DashboardHeader
          activeTab={activeTab}
          loading={loading}
          onRefresh={handleRefresh}
          userName={currentUser?.name || "Super Admin"}
          userRole={currentUser?.role || "SUPER ADMIN"}
          onChangePassword={() => setIsChangePasswordOpen(true)}
          onSignOut={() => setIsSignOutConfirmOpen(true)}
        />

        {/* Tab 1: Dashboard Overview */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Top 4 KPI Metrics Row (Real counts from API) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                label="Properties"
                value={activePropertiesCount}
                icon="building"
                color="blue"
                onClick={() => setActiveTab("properties")}
              />
              <KpiCard
                label="Total enquiries"
                value={totalEnquiriesCount}
                icon="people"
                color="purple"
                onClick={() => setActiveTab("inquiries")}
              />
              <KpiCard
                label="Open enquiries"
                value={openEnquiriesCount}
                icon="open-inquiry"
                color="amber"
                onClick={() => setActiveTab("inquiries")}
              />
              <KpiCard
                label="Closed deals"
                value={closedDealsCount}
                icon="trophy"
                color="emerald"
                onClick={() => setActiveTab("inquiries")}
              />
            </div>

            {/* Cloud Storage Resource Bar dynamically supporting Cloudinary & AWS S3 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-3.5 rounded-2xl bg-white border border-[#e8ecef] shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
                  <i className="bi bi-cloud text-base" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-neutral-800 flex items-center gap-2">
                    <span>Cloud Storage</span>
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                      {storageUsage.provider}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[11px] text-neutral-500 font-mono">
                      Used: {storageUsage.usedFormatted}
                      {storageUsage.hasQuota && storageUsage.limitFormatted
                        ? ` / ${storageUsage.limitFormatted}`
                        : ""}
                    </span>
                    {/* Progress bar matching the screenshot */}
                    {storageUsage.hasQuota && (
                      <div className="w-28 sm:w-36 h-1.5 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              Math.max(storageUsage.percentUsed, 1.5),
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs shrink-0">
                {storageUsage.hasQuota && storageUsage.remainingFormatted ? (
                  <span className="text-[11px] text-emerald-700 font-mono font-medium">
                    Remaining: {storageUsage.remainingFormatted} (
                    {Number(100 - storageUsage.percentUsed).toFixed(1)}%)
                  </span>
                ) : (
                  <span className="text-[11px] text-neutral-500 font-mono">
                    Active Storage
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleRefresh}
                  title="Refresh Storage Usage"
                  className="w-7 h-7 rounded-full bg-neutral-50 hover:bg-neutral-100 text-neutral-500 flex items-center justify-center transition-colors cursor-pointer border border-neutral-200"
                >
                  <i
                    className={`bi bi-arrow-clockwise text-xs ${
                      loading ? "animate-spin text-amber-600" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Two-Column Overview: Recent Enquiries (Left) & Quick Actions (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Recent Enquiries List (matches left card in screenshot) */}
              <div className="lg:col-span-8">
                <RecentEnquiries
                  inquiries={inquiries}
                  onStatusUpdated={handleRefresh}
                  onViewAll={() => setActiveTab("inquiries")}
                  isDashboardWidget={true}
                />
              </div>

              {/* Right Column: Quick Actions Card (matches right card in screenshot) */}
              <div className="lg:col-span-4">
                <div className="bg-white rounded-2xl border border-[#e8ecef] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
                  <h3 className="font-serif text-lg font-bold text-neutral-900 tracking-tight mb-4">
                    Quick actions
                  </h3>

                  <div className="space-y-3">
                    {/* Action 1: Add Property */}
                    <button
                      type="button"
                      onClick={() => setActiveTab("properties")}
                      className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-[#fafaf8] border border-transparent hover:border-[#e8ecef] transition-all text-left cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#fef3c7] text-[#d97706] border border-[#fde68a] flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                        <i className="bi bi-plus-lg" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-neutral-900">
                          Add property
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Create a new property listing
                        </div>
                      </div>
                    </button>

                    {/* Action 2: View Enquiries */}
                    <button
                      type="button"
                      onClick={() => setActiveTab("inquiries")}
                      className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-[#fafaf8] border border-transparent hover:border-[#e8ecef] transition-all text-left cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#fef3c7] text-[#d97706] border border-[#fde68a] flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                        <i className="bi bi-plus-lg" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-neutral-900">
                          View enquiries
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Follow up with client requests
                        </div>
                      </div>
                    </button>

                    {/* Action 3: Pattaya Areas */}
                    <button
                      type="button"
                      onClick={() => setActiveTab("properties")}
                      className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-[#fafaf8] border border-transparent hover:border-[#e8ecef] transition-all text-left cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#fef3c7] text-[#d97706] border border-[#fde68a] flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                        <i className="bi bi-plus-lg" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-neutral-900">
                          Pattaya areas
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Explore Naklua, Jomtien & Wongamat
                        </div>
                      </div>
                    </button>

                    {/* Action 4: Customer Portal */}
                    <a
                      href="http://localhost:3000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-[#fafaf8] border border-transparent hover:border-[#e8ecef] transition-all text-left cursor-pointer group block"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#fef3c7] text-[#d97706] border border-[#fde68a] flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                        <i className="bi bi-box-arrow-up-right" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-neutral-900">
                          Customer portal
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Preview the live public website
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Properties View */}
        {activeTab === "properties" && (
          <PropertiesView
            properties={properties}
            onRefresh={handleRefresh}
          />
        )}

        {/* Tab 3: Full Enquiries View */}
        {activeTab === "inquiries" && (
          <RecentEnquiries
            inquiries={inquiries}
            onStatusUpdated={handleRefresh}
            isDashboardWidget={false}
          />
        )}
      </main>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSuccessLogout={handleChangePasswordSuccess}
        token={token || undefined}
      />

      {/* Sign Out Confirmation Modal */}
      <SignOutConfirmModal
        isOpen={isSignOutConfirmOpen}
        onClose={() => setIsSignOutConfirmOpen(false)}
        onConfirm={handleSignOutConfirm}
      />
    </div>
  );
}
