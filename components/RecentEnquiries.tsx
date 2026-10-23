"use client";

import React, { useState } from "react";
import { InquiryItem, updateInquiryStatus } from "@/lib/api";

interface RecentEnquiriesProps {
  inquiries: InquiryItem[];
  onStatusUpdated?: () => void;
  onViewAll?: () => void;
  isDashboardWidget?: boolean;
}

export default function RecentEnquiries({
  inquiries,
  onStatusUpdated,
  onViewAll,
  isDashboardWidget = false,
}: RecentEnquiriesProps) {
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterIntent, setFilterIntent] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate();
      const month = d.toLocaleString("en-US", { month: "short" });
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${day} ${month}, ${hours}:${minutes}`;
    } catch {
      return dateStr;
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    setActiveDropdownId(null);
    await updateInquiryStatus(id, newStatus);
    setUpdatingId(null);
    if (onStatusUpdated) onStatusUpdated();
  };

  const getStatusBadge = (status: string) => {
    const raw = (status || "new").toLowerCase();
    if (raw === "contacted") {
      return {
        label: "Contacted",
        bg: "bg-[#eff6ff]",
        text: "text-[#2563eb]",
        border: "border-[#bfdbfe]",
        dot: "bg-blue-500",
      };
    }
    if (raw === "qualified") {
      return {
        label: "Qualified",
        bg: "bg-[#f5f3ff]",
        text: "text-[#7c3aed]",
        border: "border-[#ddd6fe]",
        dot: "bg-purple-500",
      };
    }
    if (raw === "closed") {
      return {
        label: "Closed / Won",
        bg: "bg-[#ecfdf5]",
        text: "text-[#059669]",
        border: "border-[#a7f3d0]",
        dot: "bg-emerald-500",
      };
    }
    if (raw === "spam") {
      return {
        label: "Archived",
        bg: "bg-[#f3f4f6]",
        text: "text-[#6b7280]",
        border: "border-[#e5e7eb]",
        dot: "bg-neutral-400",
      };
    }
    // Default 'new' or 'pending'
    return {
      label: "Pending",
      bg: "bg-[#fef3c7]",
      text: "text-[#b45309]",
      border: "border-[#fde68a]",
      dot: "bg-amber-500",
    };
  };

  const getInitial = (name?: string) => {
    if (!name) return "C";
    return name.trim().charAt(0).toUpperCase();
  };

  const getDetailsSummary = (inquiry: InquiryItem) => {
    const intent = (inquiry.intent || "General").toUpperCase();
    const type = inquiry.propertyType ? ` · ${inquiry.propertyType}` : "";
    const area = inquiry.preferredArea ? ` (${inquiry.preferredArea})` : "";
    return `${intent}${type}${area}`;
  };

  // Filtered inquiries for full view
  const filteredInquiries = inquiries.filter((item) => {
    if (filterIntent !== "all" && item.intent !== filterIntent) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = item.contact?.name?.toLowerCase() || "";
      const email = item.contact?.email?.toLowerCase() || "";
      const phone = item.contact?.phoneWhatsApp?.toLowerCase() || "";
      const area = item.preferredArea?.toLowerCase() || "";
      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        area.includes(q)
      );
    }
    return true;
  });

  // If used as the Dashboard Left-panel widget (matches screenshot)
  if (isDashboardWidget) {
    const recentList = inquiries.slice(0, 6);

    return (
      <div className="bg-white rounded-2xl border border-[#e8ecef] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#f1f3f5]">
          <div>
            <h2 className="font-serif text-lg font-bold text-neutral-900 tracking-tight">
              Recent enquiries
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Follow up with prospective buyers and tenants
            </p>
          </div>
          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            >
              View all
            </button>
          )}
        </div>

        {/* List of Enquiries matching the screenshot rows */}
        <div className="divide-y divide-[#f1f3f5]">
          {recentList.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              No recent enquiries received yet.
            </div>
          ) : (
            recentList.map((item) => {
              const badge = getStatusBadge(item.status);
              const isDropdownOpen = activeDropdownId === item._id;
              const isUpdating = updatingId === item._id;

              return (
                <div
                  key={item._id}
                  className="py-3.5 flex items-center justify-between gap-3 hover:bg-[#fafaf8] transition-colors rounded-xl px-2 -mx-2"
                >
                  {/* Left: Avatar with Initial & Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#e8f1fd] text-blue-700 border border-[#d2e3fc] flex items-center justify-center font-bold text-sm shrink-0">
                      {getInitial(item.contact?.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-neutral-900 truncate">
                        {item.contact?.name || "Client"}
                      </div>
                      <div className="text-xs text-neutral-500 truncate capitalize">
                        {getDetailsSummary(item)}
                      </div>
                    </div>
                  </div>

                  {/* Right: Pill Badge with Status changer */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDropdownId(
                          isDropdownOpen ? null : item._id
                        )
                      }
                      disabled={isUpdating}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        badge.bg
                      } ${badge.text} ${badge.border} ${
                        isUpdating ? "opacity-50" : "hover:brightness-95"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      <span>{isUpdating ? "..." : badge.label}</span>
                      <i className="bi bi-chevron-down text-[9px] opacity-70 ml-0.5" />
                    </button>

                    {/* Status Dropdown Popover */}
                    {isDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setActiveDropdownId(null)}
                        />
                        <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white shadow-xl border border-neutral-200 py-1.5 z-50">
                          <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                            Set Status
                          </div>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(item._id, "new")}
                            className="w-full px-3 py-1.5 text-xs text-left hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Pending / New
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(item._id, "contacted")
                            }
                            className="w-full px-3 py-1.5 text-xs text-left hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Contacted
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(item._id, "qualified")
                            }
                            className="w-full px-3 py-1.5 text-xs text-left hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            Qualified
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(item._id, "closed")
                            }
                            className="w-full px-3 py-1.5 text-xs text-left hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Closed / Won
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // Full Page View for Inquiries Tab
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-[#e8ecef] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <i className="bi bi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs" />
          <input
            type="text"
            placeholder="Search by client name, email, phone, area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Intent Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["all", "buy", "rent", "invest"].map((intent) => (
            <button
              key={intent}
              type="button"
              onClick={() => setFilterIntent(intent)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                filterIntent === intent
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {intent === "all" ? "All Enquiries" : intent}
            </button>
          ))}
        </div>
      </div>

      {/* Full Enquiries Table */}
      <div className="bg-white rounded-2xl border border-[#e8ecef] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#f1f3f5] text-[11px] font-bold tracking-wider text-neutral-400 uppercase bg-[#fafaf8]">
                <th className="px-6 py-4">Received</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Intent & Property</th>
                <th className="px-6 py-4">Area & Budget</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f3f5] text-xs">
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-400">
                    No enquiries match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((item) => {
                  const badge = getStatusBadge(item.status);
                  const isDropdownOpen = activeDropdownId === item._id;
                  const isUpdating = updatingId === item._id;

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-[#fafaf8] transition-colors"
                    >
                      {/* Received Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-neutral-500 font-normal">
                        {formatDate(item.createdAt)}
                      </td>

                      {/* Client Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#e8f1fd] text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {getInitial(item.contact?.name)}
                          </div>
                          <div>
                            <div className="font-semibold text-neutral-900 text-xs">
                              {item.contact?.name || "Anonymous Client"}
                            </div>
                            <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                              <i className="bi bi-chat-dots text-[10px] text-neutral-400 shrink-0" />
                              <span>
                                {item.contact?.phoneWhatsApp ||
                                  item.contact?.email ||
                                  item.contact?.lineId ||
                                  "No phone provided"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Intent & Type */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-neutral-100 text-neutral-700 capitalize border border-neutral-200">
                          {item.intent || "buy"} · {item.propertyType || "property"}
                        </span>
                      </td>

                      {/* Area & Budget */}
                      <td className="px-6 py-4 whitespace-nowrap text-neutral-600 capitalize">
                        <div>{item.preferredArea || "Any area"}</div>
                        <div className="text-[11px] text-neutral-400">
                          {item.budget || "Standard"}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveDropdownId(
                                isDropdownOpen ? null : item._id
                              )
                            }
                            disabled={isUpdating}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                              badge.bg
                            } ${badge.text} ${badge.border} ${
                              isUpdating ? "opacity-50" : "hover:brightness-95"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}
                            />
                            <span>{isUpdating ? "Updating..." : badge.label}</span>
                            <i className="bi bi-chevron-down text-[9px] opacity-70 ml-0.5" />
                          </button>

                          {isDropdownOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setActiveDropdownId(null)}
                              />
                              <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white shadow-xl border border-neutral-200 py-1.5 z-50">
                                <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                                  Change Status
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStatusChange(item._id, "new")
                                  }
                                  className="w-full px-3 py-1.5 text-xs text-left hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  Pending / New
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStatusChange(item._id, "contacted")
                                  }
                                  className="w-full px-3 py-1.5 text-xs text-left hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                  Contacted
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStatusChange(item._id, "qualified")
                                  }
                                  className="w-full px-3 py-1.5 text-xs text-left hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                  Qualified
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStatusChange(item._id, "closed")
                                  }
                                  className="w-full px-3 py-1.5 text-xs text-left hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Closed / Won
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
