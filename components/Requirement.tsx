"use client";

import React, { useState } from "react";
import {
  InquiryItem,
  CreateInquiryInput,
  createInquiry,
  updateInquiryStatus,
  deleteInquiry,
} from "@/lib/api";

interface RequirementProps {
  inquiries: InquiryItem[];
  onStatusUpdated?: () => void;
  onViewAll?: () => void;
  isDashboardWidget?: boolean;
}

export const INTENT_LABELS: Record<string, string> = {
  buy: "Buy",
  rent: "Rent",
  invest: "Invest",
};

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  condo: "Condo",
  house: "House",
  villa: "Villa",
  land: "Land",
  commercial: "Commercial",
};

export const PREFERRED_AREA_LABELS: Record<string, string> = {
  naklua: "Naklua",
  wongamat: "Wongamat",
  "central-pattaya": "Central Pattaya",
  pratumnak: "Pratumnak",
  jomtien: "Jomtien",
  "east-pattaya": "East Pattaya",
  other: "Other",
};

export const BUDGET_LABELS: Record<string, string> = {
  "under-3m": "Under ฿3M",
  "3m-6m": "฿3M - ฿6M",
  "6m-10m": "฿6M - ฿10M",
  "10m-20m": "฿10M - ฿20M",
  "over-20m": "Over ฿20M",
};

export const BEDROOM_LABELS: Record<string, string> = {
  studio: "Studio",
  "1": "1 Bed",
  "2": "2 Beds",
  "3": "3 Beds",
  "4": "4 Beds",
  "5-plus": "5+ Beds",
};

export const TIMELINE_LABELS: Record<string, string> = {
  asap: "ASAP",
  "within-1-month": "Within 1 month",
  "1-3-months": "1 - 3 months",
  "3-6-months": "3 - 6 months",
  browsing: "Browsing",
};

export const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  pending: {
    label: "Pending",
    bg: "bg-[#fef3c7]",
    text: "text-[#b45309]",
    border: "border-[#fde68a]",
    dot: "bg-amber-500",
  },
  resolved: {
    label: "Resolved",
    bg: "bg-[#ecfdf5]",
    text: "text-[#059669]",
    border: "border-[#a7f3d0]",
    dot: "bg-emerald-500",
  },
};

export const normalizeStatus = (status?: string): "pending" | "resolved" => {
  const s = (status || "").toLowerCase();
  if (s === "resolved" || s === "closed") return "resolved";
  return "pending";
};

export const getStatusBadge = (status?: string) => {
  const key = normalizeStatus(status);
  return STATUS_CONFIG[key] || STATUS_CONFIG.pending;
};

export default function Requirement({
  inquiries,
  onStatusUpdated,
  onViewAll,
  isDashboardWidget = false,
}: RequirementProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterIntent, setFilterIntent] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const initialForm: CreateInquiryInput = {
    intent: "invest",
    propertyType: "condo",
    preferredArea: "central-pattaya",
    budget: "3m-6m",
    bedrooms: "1",
    timeline: "1-3-months",
    contact: {
      name: "",
      phoneWhatsApp: "",
      email: "",
      lineId: "",
    },
    message: "",
  };

  const [formData, setFormData] = useState<CreateInquiryInput>(initialForm);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const formatDateTimeParts = (dateStr?: string) => {
    if (!dateStr) return { date: "—", time: "" };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { date: dateStr, time: "" };
      const day = d.getDate();
      const month = d.toLocaleString("en-US", { month: "short" });
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return {
        date: `${day} ${month} ${year}`,
        time: `${hours}:${minutes}`,
      };
    } catch {
      return { date: dateStr, time: "" };
    }
  };

  const formatDate = (dateStr?: string) => {
    const parts = formatDateTimeParts(dateStr);
    return parts.time ? `${parts.date}, ${parts.time}` : parts.date;
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    await updateInquiryStatus(id, newStatus);
    setUpdatingId(null);
    if (selectedInquiry && selectedInquiry._id === id) {
      setSelectedInquiry({ ...selectedInquiry, status: newStatus });
    }
    if (onStatusUpdated) onStatusUpdated();
  };

  const handleDelete = async (id: string) => {
    await deleteInquiry(id);
    setDeleteConfirmId(null);
    if (selectedInquiry && selectedInquiry._id === id) {
      setSelectedInquiry(null);
    }
    if (onStatusUpdated) onStatusUpdated();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contact.name.trim()) {
      setFormError("Please enter client name.");
      return;
    }
    if (!formData.contact.email?.trim() && !formData.contact.phoneWhatsApp?.trim()) {
      setFormError("Please provide either Phone / WhatsApp or Email.");
      return;
    }
    setFormSubmitting(true);
    setFormError(null);
    const res = await createInquiry(formData);
    if (!res.success) {
      setFormError(res.error || "Failed to create requirement");
      setFormSubmitting(false);
      return;
    }
    setFormSubmitting(false);
    setIsCreateOpen(false);
    setFormData(initialForm);
    if (onStatusUpdated) onStatusUpdated();
  };

  // getStatusBadge is defined at module scope

  const getInitial = (name?: string) => {
    if (!name) return "C";
    return name.trim().charAt(0).toUpperCase();
  };

  // Filtered requirements for full view (exclude intent === "contact")
  const filteredInquiries = inquiries.filter((item) => {
    if ((item.intent || "").toLowerCase() === "contact") return false;
    if (filterIntent !== "all" && item.intent !== filterIntent) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = item.contact?.name?.toLowerCase() || "";
      const email = item.contact?.email?.toLowerCase() || "";
      const phone = item.contact?.phoneWhatsApp?.toLowerCase() || "";
      const lineId = item.contact?.lineId?.toLowerCase() || "";
      const area = item.preferredArea?.toLowerCase() || "";
      const propType = item.propertyType?.toLowerCase() || "";
      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        lineId.includes(q) ||
        area.includes(q) ||
        propType.includes(q)
      );
    }
    return true;
  });

  // =========================================================
  // 1. Dashboard Widget (Compact view on main Dashboard tab)
  // =========================================================
  if (isDashboardWidget) {
    const recentList = inquiries.slice(0, 6);

    return (
      <div className="bg-white rounded-2xl border border-[#ecece8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-6 h-full flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
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

        {/* List of Enquiries matching dashboard layout */}
        <div className="divide-y divide-neutral-100 flex-1 flex flex-col justify-around py-1">
          {recentList.length === 0 ? (
            <div className="py-12 flex-1 flex flex-col items-center justify-center text-center text-xs text-neutral-400">
              No recent enquiries received yet.
            </div>
          ) : (
            recentList.map((item) => {
              const badge = getStatusBadge(item.status);
              const isUpdating = updatingId === item._id;

              return (
                <div
                  key={item._id}
                  className="py-3.5 flex items-center justify-between gap-3 hover:bg-[#fafaf8] transition-colors rounded-xl px-2 -mx-2"
                >
                  {/* Left: Avatar with Initial & Info (Clickable to view details) */}
                  <button
                    type="button"
                    onClick={() => setSelectedInquiry(item)}
                    className="flex items-center gap-3.5 min-w-0 text-left cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#e8f1fd] text-blue-700 border border-[#d2e3fc] flex items-center justify-center font-bold text-sm shrink-0">
                      {getInitial(item.contact?.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-neutral-900 truncate hover:text-blue-600 transition-colors">
                        {item.contact?.name || "Client"}
                      </div>
                      <div className="text-xs text-neutral-500 truncate">
                        <span className="capitalize font-medium">
                          {INTENT_LABELS[item.intent] || item.intent}
                        </span>
                        {" · "}
                        <span className="capitalize">
                          {item.propertyType ? PROPERTY_TYPE_LABELS[item.propertyType] || item.propertyType : "—"}
                        </span>
                        {item.preferredArea && (
                          <span className="text-neutral-400">
                            {" "}
                            ({PREFERRED_AREA_LABELS[item.preferredArea] || item.preferredArea})
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Right: Actions */}
                  <div className="relative shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedInquiry(item)}
                      title="View Details"
                      className="w-8 h-8 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <i className="bi bi-eye text-sm" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* View Details Modal for Dashboard Widget */}
        {selectedInquiry && renderViewModal(selectedInquiry, () => setSelectedInquiry(null), handleStatusChange, () => setDeleteConfirmId(selectedInquiry._id))}
      </div>
    );
  }

  // =========================================================
  // 2. Full Page Enquiries View (Tab 3)
  // =========================================================
  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Pill Counter: ● [N] Requirements */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 border border-blue-100 text-xs font-semibold text-blue-700 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>{filteredInquiries.length} Requirements</span>
          </div>

          {/* Intent Filter Pills */}
          <div className="inline-flex items-center p-0.5 rounded-full bg-neutral-100 border border-neutral-200/80 text-xs">
            {["all", "buy", "rent", "invest"].map((it) => (
              <button
                key={it}
                type="button"
                onClick={() => setFilterIntent(it)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all cursor-pointer ${filterIntent === it
                    ? "bg-white text-neutral-900 font-semibold shadow-2xs"
                    : "text-neutral-600 hover:text-neutral-900"
                  }`}
              >
                {it === "all" ? "All" : INTENT_LABELS[it] || it}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Add Enquiry */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <i className="bi bi-search absolute left-3 top-2 text-neutral-400 text-xs" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search requirements..."
              className="pl-8 pr-4 py-1.5 rounded-full border border-[#ecece8] bg-white text-xs w-60 sm:w-72 focus:outline-none focus:border-neutral-400 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2 text-neutral-400 hover:text-neutral-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setFormData(initialForm);
              setFormError(null);
              setIsCreateOpen(true);
            }}
            className="px-4 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <i className="bi bi-plus-lg text-xs" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Datatable */}
      <div className="bg-white rounded-2xl border border-[#ecece8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#ecece8] text-[11px] font-bold tracking-wider text-neutral-400 uppercase bg-[#fafaf8]">
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Intent</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Contact</th>
                <th className="px-6 py-3.5">Created</th>
                <th className="px-6 py-3.5">Updated</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0ec] text-sm">
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3 text-xl">
                      <i className="bi bi-chat-left-dots" />
                    </div>
                    <div className="text-sm font-semibold text-neutral-800">
                      No requirements found
                    </div>
                    <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                      {searchQuery || filterIntent !== "all"
                        ? "No requirements match your filter criteria. Try searching for a different keyword."
                        : "No property requirements received yet."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((item) => {
                  const badge = getStatusBadge(item.status);
                  const isUpdating = updatingId === item._id;
                  const created = formatDateTimeParts(item.createdAt);
                  const updated = formatDateTimeParts(item.updatedAt);
                  const intentLower = (item.intent || "").toLowerCase();

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-[#fafaf8] transition-colors group"
                    >
                      {/* Name */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {getInitial(item.contact?.name)}
                          </div>
                          <div className="min-w-0">
                            <div
                              className="font-semibold text-neutral-900 text-xs truncate max-w-[160px]"
                              title={item.contact?.name}
                            >
                              {item.contact?.name || "Client"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Intent */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            intentLower === "buy"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : intentLower === "rent"
                              ? "bg-teal-50 text-teal-700 border-teal-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {INTENT_LABELS[item.intent] || item.intent}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        {item.contact?.email ? (
                          <a
                            href={`mailto:${item.contact.email}`}
                            className="text-xs text-blue-600 hover:underline truncate block max-w-[180px]"
                            title={item.contact.email}
                          >
                            {item.contact.email}
                          </a>
                        ) : (
                          <span className="text-neutral-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Contact (Phone / WhatsApp) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.contact?.phoneWhatsApp ? (
                          <a
                            href={`tel:${item.contact.phoneWhatsApp}`}
                            className="text-xs text-neutral-800 hover:text-blue-600 font-mono"
                          >
                            {item.contact.phoneWhatsApp}
                          </a>
                        ) : (
                          <span className="text-neutral-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-medium text-neutral-800">
                          {created.date}
                        </div>
                        {created.time && (
                          <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                            {created.time}
                          </div>
                        )}
                      </td>

                      {/* Updated */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-medium text-neutral-800">
                          {updated.date}
                        </div>
                        {updated.time && (
                          <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                            {updated.time}
                          </div>
                        )}
                      </td>



                      {/* Action */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            title="View details"
                            onClick={() => setSelectedInquiry(item)}
                            className="w-8 h-8 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-transparent hover:border-neutral-200 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <i className="bi bi-eye text-sm" />
                          </button>
                          <button
                            type="button"
                            title="Delete requirement"
                            onClick={() => setDeleteConfirmId(item._id)}
                            className="w-8 h-8 rounded-lg bg-neutral-50 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 border border-transparent hover:border-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <i className="bi bi-trash3 text-xs" />
                          </button>
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

      {/* Modal: View Details */}
      {selectedInquiry &&
        renderViewModal(
          selectedInquiry,
          () => setSelectedInquiry(null),
          handleStatusChange,
          () => setDeleteConfirmId(selectedInquiry._id)
        )}

      {/* Modal: Add Requirement */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-neutral-100 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header (Stable) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0 bg-white">
              <h3 className="font-serif text-xl font-bold text-neutral-900">
                Add New Requirement
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 flex items-center justify-center text-lg cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
              {/* Modal Body (Scrollable) */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {formError}
                  </div>
                )}
              {/* Row 1: I want to & Property type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    I want to *
                  </label>
                  <select
                    value={formData.intent}
                    onChange={(e) =>
                      setFormData({ ...formData, intent: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400 bg-white"
                  >
                    <option value="invest">Invest</option>
                    <option value="buy">Buy</option>
                    <option value="rent">Rent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Property type *
                  </label>
                  <select
                    value={formData.propertyType || "condo"}
                    onChange={(e) =>
                      setFormData({ ...formData, propertyType: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400 bg-white"
                  >
                    <option value="condo">Condo</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="land">Land</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Preferred area & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Preferred area *
                  </label>
                  <select
                    value={formData.preferredArea || "central-pattaya"}
                    onChange={(e) =>
                      setFormData({ ...formData, preferredArea: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400 bg-white"
                  >
                    <option value="naklua">Naklua</option>
                    <option value="wongamat">Wongamat</option>
                    <option value="central-pattaya">Central Pattaya</option>
                    <option value="pratumnak">Pratumnak</option>
                    <option value="jomtien">Jomtien</option>
                    <option value="east-pattaya">East Pattaya</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Budget *
                  </label>
                  <select
                    value={formData.budget || "3m-6m"}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400 bg-white font-mono"
                  >
                    <option value="under-3m">Under ฿3M</option>
                    <option value="3m-6m">฿3M - ฿6M</option>
                    <option value="6m-10m">฿6M - ฿10M</option>
                    <option value="10m-20m">฿10M - ฿20M</option>
                    <option value="over-20m">Over ฿20M</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Bedrooms & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Bedrooms
                  </label>
                  <select
                    value={formData.bedrooms || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, bedrooms: e.target.value || null })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400 bg-white"
                  >
                    <option value="">Select…</option>
                    <option value="studio">Studio</option>
                    <option value="1">1 Bed</option>
                    <option value="2">2 Beds</option>
                    <option value="3">3 Beds</option>
                    <option value="4">4 Beds</option>
                    <option value="5-plus">5+ Beds</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Timeline *
                  </label>
                  <select
                    value={formData.timeline || "1-3-months"}
                    onChange={(e) =>
                      setFormData({ ...formData, timeline: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400 bg-white"
                  >
                    <option value="asap">ASAP</option>
                    <option value="within-1-month">Within 1 month</option>
                    <option value="1-3-months">1 - 3 months</option>
                    <option value="3-6-months">3 - 6 months</option>
                    <option value="browsing">Browsing</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Contact Details (Name & Phone) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contact.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: { ...formData.contact, name: e.target.value },
                      })
                    }
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.contact.phoneWhatsApp || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: {
                          ...formData.contact,
                          phoneWhatsApp: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. +66 81 234 5678"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400 font-mono"
                  />
                </div>
              </div>

              {/* Row 5: Email & LINE ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.contact.email || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: { ...formData.contact, email: e.target.value },
                      })
                    }
                    placeholder="e.g. client@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    LINE ID (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.contact.lineId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact: { ...formData.contact, lineId: e.target.value },
                      })
                    }
                    placeholder="e.g. john_line"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400 font-mono"
                  />
                </div>
              </div>

              {/* Row 6: Message */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={3}
                  value={formData.message || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Client requirements or special notes..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400 resize-none"
                />
              </div>
            </div>

            {/* Submit Buttons (Stable Footer) */}
            <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-neutral-100 bg-[#fafaf8] shrink-0">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-lg border border-neutral-200 hover:bg-white text-neutral-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formSubmitting}
                className="px-5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-semibold cursor-pointer disabled:opacity-50"
              >
                {formSubmitting ? "Saving..." : "Create Requirement"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

      {/* Modal: Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-neutral-100 text-center">
            <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 text-lg">
              <i className="bi bi-trash" />
            </div>
            <h4 className="font-semibold text-neutral-900 text-base mb-1">
              Delete Requirement
            </h4>
            <p className="text-xs text-neutral-500 mb-5">
              Are you sure you want to delete this property requirement? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================
// Reusable View Details Modal (Strictly matches website familiarity)
// =========================================================
function renderViewModal(
  inquiry: InquiryItem,
  onClose: () => void,
  onStatusChange: (id: string, status: string) => Promise<void>,
  onDeleteClick: () => void
) {
  const badge = getStatusBadge(inquiry.status);
  const created = (inquiry.createdAt ? new Date(inquiry.createdAt) : new Date()).toLocaleString(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-100 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header (Stable) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0 bg-white">
          <h3 className="font-serif text-lg font-bold text-neutral-900">
            Requirement Details
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 flex items-center justify-center text-lg cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-neutral-700 flex-1">
          {/* Section 1: Property Requirements */}
          <div className="p-3.5 rounded-xl bg-neutral-50/70 border border-neutral-100 space-y-3">
            <span className="text-neutral-400 font-semibold block uppercase text-[10px] tracking-wider">
              Property Requirements
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-neutral-400 font-medium">I want to:</span>
                <div className="font-bold text-neutral-900 text-sm mt-0.5 capitalize">
                  {INTENT_LABELS[inquiry.intent] || inquiry.intent}
                </div>
              </div>
              <div>
                <span className="text-neutral-400 font-medium">Property type:</span>
                <div className="font-bold text-neutral-900 text-sm mt-0.5 capitalize">
                  {inquiry.propertyType ? PROPERTY_TYPE_LABELS[inquiry.propertyType] || inquiry.propertyType : "—"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-neutral-400 font-medium">Preferred area:</span>
                <div className="font-semibold text-neutral-900 mt-0.5">
                  {inquiry.preferredArea ? PREFERRED_AREA_LABELS[inquiry.preferredArea] || inquiry.preferredArea : "Any area"}
                </div>
              </div>
              <div>
                <span className="text-neutral-400 font-medium">Budget:</span>
                <div className="font-semibold text-neutral-900 mt-0.5 font-mono">
                  {inquiry.budget ? BUDGET_LABELS[inquiry.budget] || inquiry.budget : "—"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-neutral-400 font-medium">Bedrooms:</span>
                <div className="font-semibold text-neutral-900 mt-0.5">
                  {inquiry.bedrooms ? BEDROOM_LABELS[inquiry.bedrooms] || inquiry.bedrooms : "Any"}
                </div>
              </div>
              <div>
                <span className="text-neutral-400 font-medium">Timeline:</span>
                <div className="font-semibold text-neutral-900 mt-0.5">
                  {inquiry.timeline ? TIMELINE_LABELS[inquiry.timeline] || inquiry.timeline : "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Details */}
          <div>
            <span className="text-neutral-400 font-semibold block mb-2 uppercase text-[10px] tracking-wider">
              Contact Details
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-neutral-400 font-medium">Name:</span>
                <div className="font-semibold text-neutral-900 mt-0.5">
                  {inquiry.contact?.name || "—"}
                </div>
              </div>
              <div>
                <span className="text-neutral-400 font-medium">Phone / WhatsApp:</span>
                <div className="font-semibold text-neutral-900 mt-0.5 font-mono">
                  {inquiry.contact?.phoneWhatsApp ? (
                    <a
                      href={`tel:${inquiry.contact.phoneWhatsApp}`}
                      className="text-blue-600 hover:underline"
                    >
                      {inquiry.contact.phoneWhatsApp}
                    </a>
                  ) : (
                    "—"
                  )}
                </div>
              </div>
              <div>
                <span className="text-neutral-400 font-medium">Email:</span>
                <div className="font-semibold text-neutral-900 mt-0.5 truncate">
                  {inquiry.contact?.email ? (
                    <a
                      href={`mailto:${inquiry.contact.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {inquiry.contact.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </div>
              </div>
              <div>
                <span className="text-neutral-400 font-medium">LINE ID (optional):</span>
                <div className="font-semibold text-neutral-900 mt-0.5 font-mono">
                  {inquiry.contact?.lineId || "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Message */}
          {inquiry.message && (
            <div>
              <span className="text-neutral-400 font-medium">Message:</span>
              <p className="mt-1 text-neutral-700 bg-neutral-50 p-3 rounded-xl border border-neutral-100 whitespace-pre-wrap leading-relaxed">
                {inquiry.message}
              </p>
            </div>
          )}

          {/* Section 4: Timestamps */}
          <div className="pt-3 border-t border-neutral-100 text-[11px] text-neutral-400">
            Created: <span className="font-medium text-neutral-700">{created}</span>
          </div>
        </div>

        {/* Modal Footer (Stable) */}
        <div className="flex justify-end px-6 py-3.5 border-t border-neutral-100 bg-[#fafaf8] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
