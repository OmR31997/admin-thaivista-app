"use client";

import React, { useState } from "react";
import {
  PropertyItem,
  PropertyStatus,
  CreatePropertyInput,
  createProperty,
  updateProperty,
  updatePropertyStatus,
  deleteProperty,
} from "@/lib/api";

export const PROPERTY_STATUS_CONFIG: Record<
  PropertyStatus,
  { label: string; bg: string; text: string; border: string; dot: string; ring: string }
> = {
  published: {
    label: "Published",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    ring: "focus:ring-emerald-300",
  },
  pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    ring: "focus:ring-amber-300",
  },
};

export const normalizePropertyStatus = (status?: string): PropertyStatus => {
  const s = (status || "").toLowerCase().trim();
  if (s === "published") return "published";
  return "pending";
};

interface PropertiesViewProps {
  properties: PropertyItem[];
  onRefresh: () => void;
}

export default function PropertiesView({
  properties,
  onRefresh,
}: PropertiesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [statusFilterDropdown, setStatusFilterDropdown] = useState(false);

  // Updating state for inline status change
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Modal States
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view" | null>(
    null
  );
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(
    null
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreatePropertyInput>({
    name: "",
    phone: "",
    email: "",
    lineId: "",
    intent: "sell",
    propertyType: "condo",
    buildingName: "",
    bedrooms: "studio",
    bathrooms: "1",
    sizeSQM: "",
    price: "",
    status: "pending",
    message: "",
    photoPaths: [],
  });
  const [photoLinksText, setPhotoLinksText] = useState("");
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
    setUpdatingStatusId(id);
    await updatePropertyStatus(id, newStatus);
    setUpdatingStatusId(null);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await deleteProperty(id);
    setDeleteConfirmId(null);
    onRefresh();
  };

  const openCreateModal = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      lineId: "",
      intent: "sell",
      propertyType: "condo",
      buildingName: "",
      bedrooms: "studio",
      bathrooms: "1",
      sizeSQM: "",
      price: "",
      status: "pending",
      message: "",
      photoPaths: [],
    });
    setPhotoLinksText("");
    setFormError(null);
    setModalMode("create");
  };

  const openEditModal = (item: PropertyItem) => {
    setSelectedProperty(item);
    setFormData({
      name: item.name || "",
      phone: item.phone || "",
      email: item.email || "",
      lineId: item.lineId || "",
      intent: item.intent || "sell",
      propertyType: item.propertyType || "condo",
      buildingName: item.buildingName || "",
      bedrooms: item.bedrooms || "studio",
      bathrooms: item.bathrooms || "1",
      sizeSQM: item.sizeSQM || "",
      price: item.price || "",
      status: item.status || "pending",
      message: item.message || "",
      photoPaths: item.photoPaths || [],
    });
    setPhotoLinksText((item.photoPaths || []).join("\n"));
    setFormError(null);
    setModalMode("edit");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    const parsedPhotoPaths = photoLinksText
      .split("\n")
      .map((link) => link.trim())
      .filter((link) => link.length > 0);

    const payload: CreatePropertyInput = {
      ...formData,
      photoPaths: parsedPhotoPaths,
    };

    if (modalMode === "create") {
      const res = await createProperty(payload);
      if (!res.success) {
        setFormError(res.error || "Failed to create property");
        setFormSubmitting(false);
        return;
      }
    } else if (modalMode === "edit" && selectedProperty) {
      const res = await updateProperty(selectedProperty._id, payload);
      if (!res.success) {
        setFormError(res.error || "Failed to update property");
        setFormSubmitting(false);
        return;
      }
    }

    setFormSubmitting(false);
    setModalMode(null);
    onRefresh();
  };

  // Filtered properties
  const filteredProperties = properties.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (item.buildingName || "").toLowerCase().includes(term) ||
      (item.name || "").toLowerCase().includes(term) ||
      (item.phone || "").toLowerCase().includes(term) ||
      (item.email || "").toLowerCase().includes(term) ||
      (item.lineId || "").toLowerCase().includes(term) ||
      (item.price || "").toLowerCase().includes(term) ||
      (item.propertyType || "").toLowerCase().includes(term);

    const itemStatus = normalizePropertyStatus(item.status);
    const matchesStatus =
      statusFilter === "all" || itemStatus === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Top Filter Bar (Matches Pic 1) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Pill Counter: ● [N] Properties */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 border border-blue-100 text-xs font-semibold text-blue-700 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>{filteredProperties.length} Properties</span>
          </div>

          {/* Status Dropdown Filter: Status: All ⌄ */}
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
                  {statusFilter}
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
                <div className="absolute left-0 mt-1.5 w-36 rounded-xl bg-white shadow-xl border border-neutral-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  {["all", "published", "pending"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setStatusFilter(st);
                        setStatusFilterDropdown(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left capitalize flex items-center justify-between hover:bg-neutral-50 ${statusFilter === st
                        ? "font-semibold text-neutral-900 bg-neutral-50"
                        : "text-neutral-600"
                        }`}
                    >
                      <span>{st}</span>
                      {statusFilter === st && (
                        <i className="bi bi-check2 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Search & Add Property */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <i className="bi bi-search absolute left-3 top-2 text-neutral-400 text-xs" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search properties..."
              className="pl-8 pr-4 py-1.5 rounded-full border border-[#ecece8] bg-white text-xs w-60 sm:w-72 focus:outline-none focus:border-neutral-400 shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2 text-neutral-400 hover:text-neutral-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <i className="bi bi-plus-lg text-xs" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Datatable (Matches Pic 1 Table Layout) */}
      <div className="bg-white rounded-2xl border border-[#ecece8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#ecece8] text-[11px] font-bold tracking-wider text-neutral-400 uppercase bg-[#fafaf8]">
                <th className="px-6 py-3.5">Building Name</th>
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Created</th>
                <th className="px-6 py-3.5">Updated</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0ec] text-sm">
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3 text-xl">
                      <i className="bi bi-building-slash" />
                    </div>
                    <div className="text-sm font-semibold text-neutral-800">
                      No properties found
                    </div>
                    <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                      {searchTerm || statusFilter !== "all"
                        ? "No properties match your filter criteria. Try searching for a different keyword."
                        : "No properties found. Click 'Add Property' to create your first listing."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProperties.map((item) => {
                  const statusKey = normalizePropertyStatus(item.status);
                  const statusConf = PROPERTY_STATUS_CONFIG[statusKey];
                  const created = formatDateTimeParts(item.createdAt);
                  const updated = formatDateTimeParts(item.updatedAt);

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-[#fafaf8] transition-colors group"
                    >
                      {/* Building Name */}
                      <td className="px-6 py-4">
                        <div
                          className="font-semibold text-neutral-900 text-sm truncate max-w-[280px]"
                          title={item.buildingName}
                        >
                          {item.buildingName || "—"}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-6 py-4">
                        <div
                          className="font-medium text-neutral-900 text-sm truncate max-w-[200px]"
                          title={item.name}
                        >
                          {item.name || "—"}
                        </div>
                      </td>

                      {/* Published / Status Pill */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative inline-flex items-center">
                          <span
                            className={`w-1.5 h-1.5 rounded-full absolute left-3 pointer-events-none z-10 ${statusConf.dot}`}
                          />
                          <select
                            value={statusKey}
                            onChange={(e) =>
                              handleStatusChange(item._id, e.target.value as PropertyStatus)
                            }
                            disabled={updatingStatusId === item._id}
                            title="Click to change status"
                            className={`appearance-none cursor-pointer pl-6 pr-6 py-1 rounded-full text-xs font-semibold border transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-offset-1 ${statusConf.bg} ${statusConf.text} ${statusConf.border} ${statusConf.ring} ${
                              updatingStatusId === item._id
                                ? "opacity-60 cursor-wait"
                                : ""
                            }`}
                          >
                            <option
                              value="published"
                              className="bg-white text-neutral-900 font-medium py-1"
                            >
                              Published
                            </option>
                            <option
                              value="pending"
                              className="bg-white text-neutral-900 font-medium py-1"
                            >
                              Pending
                            </option>
                          </select>
                          <i className="bi bi-chevron-down text-[9px] opacity-60 absolute right-2.5 pointer-events-none z-10" />
                        </div>
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

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            title="View details"
                            onClick={() => {
                              setSelectedProperty(item);
                              setModalMode("view");
                            }}
                            className="w-8 h-8 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-transparent hover:border-neutral-200 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <i className="bi bi-eye text-sm" />
                          </button>
                          <button
                            type="button"
                            title="Edit property"
                            onClick={() => openEditModal(item)}
                            className="w-8 h-8 rounded-lg bg-neutral-50 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 border border-transparent hover:border-neutral-200 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <i className="bi bi-pencil text-xs" />
                          </button>
                          <button
                            type="button"
                            title="Delete property"
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

      {/* Modal: Create & Edit Property */}
      {(modalMode === "create" || modalMode === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-neutral-100 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header (Stable) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0 bg-white">
              <h3 className="font-serif text-xl font-bold text-neutral-900">
                {modalMode === "create" ? "Add Property" : "Edit Property"}
              </h3>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 flex items-center justify-center text-lg cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
              {/* Modal Body (Scrollable) */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {formError}
                  </div>
                )}
              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="e.g. +66 81 234 5678"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="e.g. owner@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    LINE ID (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.lineId || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, lineId: e.target.value })
                    }
                    placeholder="e.g. line_id"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400"
                  />
                </div>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <option value="sell">Sell</option>
                    <option value="rentOut">Rent out</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Property type *
                  </label>
                  <select
                    value={formData.propertyType}
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

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Status *
                  </label>
                  <select
                    value={normalizePropertyStatus(formData.status)}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as PropertyStatus })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400 bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Project or building name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.buildingName}
                  onChange={(e) =>
                    setFormData({ ...formData, buildingName: e.target.value })
                  }
                  placeholder="e.g. The Grand Residence Bangkok"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Bedrooms *
                  </label>
                  <select
                    value={formData.bedrooms}
                    onChange={(e) =>
                      setFormData({ ...formData, bedrooms: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400 bg-white"
                  >
                    <option value="studio">Studio</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5-plus">5+</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Bathrooms *
                  </label>
                  <select
                    value={formData.bathrooms}
                    onChange={(e) =>
                      setFormData({ ...formData, bathrooms: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400 bg-white"
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5+">5+</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Size (sq.m.) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sizeSQM}
                    onChange={(e) =>
                      setFormData({ ...formData, sizeSQM: e.target.value })
                    }
                    placeholder="e.g. 120 sqm"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Expected price or rent *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="e.g. ฿12,000,000"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400"
                  />
                </div>
              </div>

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
                  placeholder="Property message, description or notes..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400 resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-neutral-700">
                    Photo links (optional)
                  </label>
                  <span className="text-[11px] text-neutral-400">
                    One URL per line
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={photoLinksText}
                  onChange={(e) => setPhotoLinksText(e.target.value)}
                  placeholder={"https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg"}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400 font-mono text-[11px] resize-none"
                />
              </div>
            </div>

            {/* Submit Buttons (Stable Footer) */}
            <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-neutral-100 bg-[#fafaf8] shrink-0">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="px-4 py-2 rounded-lg border border-neutral-200 hover:bg-white text-neutral-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formSubmitting}
                className="px-5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-semibold cursor-pointer disabled:opacity-50"
              >
                {formSubmitting
                  ? "Saving..."
                  : modalMode === "create"
                    ? "Create Property"
                    : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

      {/* Modal: View Details */}
      {modalMode === "view" && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-neutral-100 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header (Stable) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0 bg-white">
              <h3 className="font-serif text-lg font-bold text-neutral-900">
                Property Details
              </h3>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 flex items-center justify-center text-lg cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-neutral-700 flex-1">
              {/* Project / Building and Status */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-neutral-400 font-medium">
                    Project or building name:
                  </span>
                  <div className="mt-1">
                    <div className="font-bold text-neutral-900 text-base">
                      {selectedProperty.buildingName || "—"}
                    </div>
                  </div>
                </div>
                {(() => {
                  const viewStatus = normalizePropertyStatus(selectedProperty.status);
                  const viewConf = PROPERTY_STATUS_CONFIG[viewStatus];
                  return (
                    <div>
                      <span className="text-neutral-400 font-medium block mb-1 text-right">
                        Status:
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${viewConf.bg} ${viewConf.text} ${viewConf.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${viewConf.dot}`} />
                        {viewConf.label}
                      </span>
                    </div>
                  );
                })()}
              </div>


              {/* Price & Size */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-neutral-50/70 border border-neutral-100">
                <div>
                  <span className="text-neutral-400 font-medium">
                    Expected price or rent:
                  </span>
                  <div className="font-bold text-neutral-900 text-sm mt-0.5 font-mono">
                    {selectedProperty.price}
                  </div>
                </div>
                <div>
                  <span className="text-neutral-400 font-medium">
                    Size (sq.m.):
                  </span>
                  <div className="font-semibold text-neutral-900 text-sm mt-0.5 font-mono">
                    {selectedProperty.sizeSQM}
                  </div>
                </div>
              </div>

              {/* Intent & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-neutral-400 font-medium">I want to:</span>
                  <div className="font-semibold text-neutral-900 capitalize mt-0.5">
                    {selectedProperty.intent === "rentOut" ? "Rent out" : "Sell"}
                  </div>
                </div>
                <div>
                  <span className="text-neutral-400 font-medium">
                    Property type:
                  </span>
                  <div className="font-semibold text-neutral-900 capitalize mt-0.5">
                    {selectedProperty.propertyType}
                  </div>
                </div>
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-neutral-400 font-medium">Bedrooms:</span>
                  <div className="font-semibold text-neutral-900 mt-0.5 capitalize">
                    {selectedProperty.bedrooms === "5-plus"
                      ? "5+"
                      : selectedProperty.bedrooms}
                  </div>
                </div>
                <div>
                  <span className="text-neutral-400 font-medium">Bathrooms:</span>
                  <div className="font-semibold text-neutral-900 mt-0.5">
                    {selectedProperty.bathrooms}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="pt-2 border-t border-neutral-100">
                <span className="text-neutral-400 font-medium block mb-2 uppercase text-[10px] tracking-wider font-semibold">
                  Contact Information
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-neutral-400 font-medium">Name:</span>
                    <div className="font-semibold text-neutral-900 mt-0.5">
                      {selectedProperty.name || "—"}
                    </div>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-medium">
                      Phone / WhatsApp:
                    </span>
                    <div className="font-semibold text-neutral-900 mt-0.5 font-mono">
                      {selectedProperty.phone || "—"}
                    </div>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-medium">Email:</span>
                    <div className="font-semibold text-neutral-900 mt-0.5 truncate">
                      {selectedProperty.email || "—"}
                    </div>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-medium">
                      LINE ID (optional):
                    </span>
                    <div className="font-semibold text-neutral-900 mt-0.5 font-mono">
                      {selectedProperty.lineId || "—"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              {selectedProperty.message && (
                <div>
                  <span className="text-neutral-400 font-medium">Message:</span>
                  <p className="mt-0.5 text-neutral-600 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 whitespace-pre-wrap">
                    {selectedProperty.message}
                  </p>
                </div>
              )}

              {/* Photo links */}
              {selectedProperty.photoPaths &&
                selectedProperty.photoPaths.length > 0 && (
                  <div>
                    <span className="text-neutral-400 font-medium block mb-1">
                      Photo links (optional) ({selectedProperty.photoPaths.length}):
                    </span>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {selectedProperty.photoPaths.map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 hover:bg-sky-50 border border-neutral-200/80 hover:border-sky-200 text-sky-700 text-xs font-mono transition-colors"
                        >
                          <i className="bi bi-image text-neutral-400 shrink-0" />
                          <span className="truncate flex-1">{link}</span>
                          <i className="bi bi-box-arrow-up-right text-[10px] text-neutral-400 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Modal Footer (Stable) */}
            <div className="flex justify-end px-6 py-3.5 border-t border-neutral-100 bg-[#fafaf8] shrink-0">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-neutral-100 text-center">
            <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 text-lg">
              <i className="bi bi-trash" />
            </div>
            <h4 className="font-semibold text-neutral-900 text-base mb-1">
              Delete Property
            </h4>
            <p className="text-xs text-neutral-500 mb-5">
              Are you sure you want to delete this listing? This action cannot be undone.
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
