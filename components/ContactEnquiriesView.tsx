"use client";

import React, { useState } from "react";
import {
  InquiryItem,
  CreateInquiryInput,
  createInquiry,
  updateInquiryStatus,
  deleteInquiry,
} from "@/lib/api";

interface ContactEnquiriesViewProps {
  enquiries: InquiryItem[];
  onRefresh: () => void;
}

const STATUS_CONFIG: Record<
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

const normalizeStatus = (status?: string): "pending" | "resolved" => {
  const s = (status || "").toLowerCase();
  if (s === "resolved" || s === "closed") return "resolved";
  return "pending";
};

const getStatusBadge = (status?: string) => {
  const key = normalizeStatus(status);
  return STATUS_CONFIG[key] || STATUS_CONFIG.pending;
};

export default function ContactEnquiriesView({
  enquiries,
  onRefresh,
}: ContactEnquiriesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [statusFilterDropdown, setStatusFilterDropdown] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Modals
  const [selectedEnquiry, setSelectedEnquiry] = useState<InquiryItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const initialForm: CreateInquiryInput = {
    intent: "contact",
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

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    await updateInquiryStatus(id, newStatus);
    setUpdatingId(null);
    if (selectedEnquiry && selectedEnquiry._id === id) {
      setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
    }
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await deleteInquiry(id);
    setDeleteConfirmId(null);
    if (selectedEnquiry && selectedEnquiry._id === id) {
      setSelectedEnquiry(null);
    }
    onRefresh();
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
    const res = await createInquiry({
      ...formData,
      intent: "contact",
    });
    if (!res.success) {
      setFormError(res.error || "Failed to create enquiry");
      setFormSubmitting(false);
      return;
    }
    setFormSubmitting(false);
    setIsCreateOpen(false);
    setFormData(initialForm);
    onRefresh();
  };

  const getInitial = (name?: string) => {
    if (!name) return "C";
    return name.trim().charAt(0).toUpperCase();
  };

  // Filtered enquiries (only intent === "contact")
  const filteredEnquiries = enquiries.filter((item) => {
    // Only contact inquiries
    if ((item.intent || "").toLowerCase() !== "contact") return false;

    // Status filter
    if (statusFilter !== "all" && normalizeStatus(item.status) !== statusFilter) {
      return false;
    }

    // Search query filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const name = item.contact?.name?.toLowerCase() || "";
      const email = item.contact?.email?.toLowerCase() || "";
      const phone = item.contact?.phoneWhatsApp?.toLowerCase() || "";
      const lineId = item.contact?.lineId?.toLowerCase() || "";
      const msg = item.message?.toLowerCase() || "";
      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        lineId.includes(q) ||
        msg.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Pill Counter */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 border border-blue-100 text-xs font-semibold text-blue-700 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>{filteredEnquiries.length} Enquiries</span>
          </div>

          {/* Status Dropdown Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setStatusFilterDropdown(!statusFilterDropdown)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#ecece8] text-xs font-medium text-neutral-700 hover:bg-neutral-50 shadow-2xs cursor-pointer transition-colors"
            >
              <i className="bi bi-sliders text-neutral-400 text-xs" />
              <span>
                Status:{" "}
                <strong className="font-semibold capitalize">
                  {statusFilter === "all" ? "All" : STATUS_CONFIG[normalizeStatus(statusFilter)]?.label || statusFilter}
                </strong>
              </span>
              <i className="bi bi-chevron-down text-[10px] text-neutral-400 ml-0.5" />
            </button>

            {statusFilterDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setStatusFilterDropdown(false)}
                />
                <div className="absolute left-0 mt-1.5 w-40 rounded-xl bg-white shadow-xl border border-neutral-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  {[
                    { key: "all", label: "All Statuses" },
                    { key: "pending", label: "Pending" },
                    { key: "resolved", label: "Resolved" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setStatusFilter(key);
                        setStatusFilterDropdown(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left capitalize flex items-center justify-between hover:bg-neutral-50 cursor-pointer ${statusFilter === key
                          ? "font-semibold text-neutral-900 bg-neutral-50"
                          : "text-neutral-600"
                        }`}
                    >
                      <span>{label}</span>
                      {statusFilter === key && (
                        <i className="bi bi-check2 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Search & Add Enquiry Button */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <i className="bi bi-search absolute left-3 top-2 text-neutral-400 text-xs" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search enquiries..."
              className="pl-8 pr-4 py-1.5 rounded-full border border-[#ecece8] bg-white text-xs w-60 sm:w-72 focus:outline-none focus:border-neutral-400 shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
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

      {/* Datatable: Name, Intent, Email, Contact, Created, Updated, Status, Action */}
      <div className="bg-white rounded-2xl border border-[#ecece8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#ecece8] text-[11px] font-bold tracking-wider text-neutral-400 uppercase bg-[#fafaf8]">
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Contact</th>
                <th className="px-6 py-3.5">Created</th>
                <th className="px-6 py-3.5">Updated</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0ec] text-sm">
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3 text-xl">
                      <i className="bi bi-chat-left-dots" />
                    </div>
                    <div className="text-sm font-semibold text-neutral-800">
                      No enquiries found
                    </div>
                    <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                      {searchTerm || statusFilter !== "all"
                        ? "No enquiries match your filter criteria. Try searching for a different keyword."
                        : "No contact enquiries received yet."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((item) => {
                  const badge = getStatusBadge(item.status);
                  const isUpdating = updatingId === item._id;
                  const created = formatDateTimeParts(item.createdAt);
                  const updated = formatDateTimeParts(item.updatedAt);

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-[#fafaf8] transition-colors group"
                    >
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#e8f1fd] text-blue-700 border border-[#d2e3fc] flex items-center justify-center font-bold text-xs shrink-0">
                            {getInitial(item.contact?.name)}
                          </div>
                          <div
                            className="font-semibold text-neutral-900 text-sm truncate max-w-[180px]"
                            title={item.contact?.name}
                          >
                            {item.contact?.name || "Client"}
                          </div>
                        </div>
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

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative inline-flex items-center">
                          <span
                            className={`w-1.5 h-1.5 rounded-full absolute left-3 pointer-events-none z-10 ${badge.dot}`}
                          />
                          <select
                            value={normalizeStatus(item.status)}
                            onChange={(e) =>
                              handleStatusChange(item._id, e.target.value)
                            }
                            disabled={isUpdating}
                            title="Click to change status"
                            className={`appearance-none cursor-pointer pl-6 pr-6 py-1 rounded-full text-xs font-semibold border transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-offset-1 ${badge.bg
                              } ${badge.text} ${badge.border} ${isUpdating
                                ? "opacity-60 cursor-wait"
                                : "hover:brightness-95"
                              }`}
                          >
                            <option
                              value="pending"
                              className="bg-white text-neutral-900 font-medium py-1"
                            >
                              Pending
                            </option>
                            <option
                              value="resolved"
                              className="bg-white text-neutral-900 font-medium py-1"
                            >
                              Resolved
                            </option>
                          </select>
                          <i className="bi bi-chevron-down text-[9px] opacity-70 absolute right-2.5 pointer-events-none z-10" />
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            title="View details"
                            onClick={() => setSelectedEnquiry(item)}
                            className="w-8 h-8 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-transparent hover:border-neutral-200 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <i className="bi bi-eye text-sm" />
                          </button>
                          <button
                            type="button"
                            title="Delete enquiry"
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
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-100 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header (Stable) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0 bg-white">
              <h3 className="font-serif text-lg font-bold text-neutral-900">
                Enquiry Details
              </h3>
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 flex items-center justify-center text-lg cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-neutral-700 flex-1">
              {/* Contact Information */}
              <div className="p-3.5 rounded-xl bg-neutral-50/70 border border-neutral-100 space-y-3">
                <span className="text-neutral-400 font-semibold block uppercase text-[10px] tracking-wider">
                  Contact Details
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-neutral-400 font-medium">Name:</span>
                    <div className="font-semibold text-neutral-900 text-sm mt-0.5">
                      {selectedEnquiry.contact?.name || "—"}
                    </div>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-medium">Phone / WhatsApp:</span>
                    <div className="font-semibold text-neutral-900 mt-0.5 font-mono">
                      {selectedEnquiry.contact?.phoneWhatsApp ? (
                        <a
                          href={`tel:${selectedEnquiry.contact.phoneWhatsApp}`}
                          className="text-blue-600 hover:underline"
                        >
                          {selectedEnquiry.contact.phoneWhatsApp}
                        </a>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-medium">Email:</span>
                    <div className="font-semibold text-neutral-900 mt-0.5 truncate">
                      {selectedEnquiry.contact?.email ? (
                        <a
                          href={`mailto:${selectedEnquiry.contact.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {selectedEnquiry.contact.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-medium">LINE ID:</span>
                    <div className="font-semibold text-neutral-900 mt-0.5 font-mono">
                      {selectedEnquiry.contact?.lineId || "—"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              {selectedEnquiry.message && (
                <div>
                  <span className="text-neutral-400 font-medium">Message:</span>
                  <p className="mt-1 text-neutral-700 bg-neutral-50 p-3 rounded-xl border border-neutral-100 whitespace-pre-wrap leading-relaxed">
                    {selectedEnquiry.message}
                  </p>
                </div>
              )}

              {/* Timestamps */}
              <div className="pt-3 border-t border-neutral-100 text-[11px] text-neutral-400">
                Created:{" "}
                <span className="font-medium text-neutral-700">
                  {formatDateTimeParts(selectedEnquiry.createdAt).date}{" "}
                  {formatDateTimeParts(selectedEnquiry.createdAt).time}
                </span>
              </div>
            </div>

            {/* Modal Footer (Stable) */}
            <div className="flex justify-end px-6 py-3.5 border-t border-neutral-100 bg-[#fafaf8] shrink-0">
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Enquiry */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-100 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header (Stable) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0 bg-white">
              <div>
                <h3 className="font-serif text-lg font-bold text-neutral-900">
                  Add Enquiry
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Record a client contact enquiry
                </p>
              </div>
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
              <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {formError}
                  </div>
                )}

                {/* Name */}
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
                    placeholder="e.g. Somchai Prasert"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400"
                  />
                </div>

                {/* Phone / WhatsApp */}
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

                {/* Email */}
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
                    placeholder="e.g. somchai@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400"
                  />
                </div>

                {/* LINE ID */}
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    LINE ID
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
                    placeholder="e.g. somchai_line"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400 font-mono"
                  />
                </div>

                {/* Message */}
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
                    placeholder="Client notes or enquiry message..."
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
                  {formSubmitting ? "Saving..." : "Create Enquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-neutral-100 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 text-xl">
              <i className="bi bi-trash3" />
            </div>
            <h4 className="font-serif text-base font-bold text-neutral-900">
              Delete Enquiry?
            </h4>
            <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
              This action cannot be undone. Are you sure you want to permanently remove this enquiry?
            </p>
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs cursor-pointer"
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
