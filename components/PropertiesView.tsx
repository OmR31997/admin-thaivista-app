"use client";

import React, { useState } from "react";
import {
  PropertyItem,
  CreatePropertyInput,
  createProperty,
  updateProperty,
  updatePropertyStatus,
  deleteProperty,
} from "@/lib/api";

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

  // Status popover per row
  const [activeStatusId, setActiveStatusId] = useState<string | null>(null);

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
    buildingName: "",
    name: "",
    phone: "",
    email: "",
    lineId: "",
    intent: "sell",
    propertyType: "condo",
    price: "",
    sizeSQM: "",
    bedrooms: "studio",
    bathrooms: "1",
    status: "published",
    message: "",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate();
      const month = d.toLocaleString("en-US", { month: "short" });
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${day} ${month} ${year}, ${hours}:${minutes}`;
    } catch {
      return dateStr;
    }
  };

  const generateTargetUrl = (item: PropertyItem) => {
    const slug = (item.buildingName || item.name || item._id)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return `/properties/${slug || item._id.slice(-6)}`;
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setActiveStatusId(null);
    await updatePropertyStatus(id, newStatus);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await deleteProperty(id);
    setDeleteConfirmId(null);
    onRefresh();
  };

  const openCreateModal = () => {
    setFormData({
      buildingName: "",
      name: "",
      phone: "",
      email: "",
      lineId: "",
      intent: "sell",
      propertyType: "condo",
      price: "฿",
      sizeSQM: "sqm",
      bedrooms: "studio",
      bathrooms: "1",
      status: "published",
      message: "",
    });
    setFormError(null);
    setModalMode("create");
  };

  const openEditModal = (item: PropertyItem) => {
    setSelectedProperty(item);
    setFormData({
      buildingName: item.buildingName || "",
      name: item.name || "",
      phone: item.phone || "",
      email: item.email || "",
      lineId: item.lineId || "",
      intent: item.intent || "sell",
      propertyType: item.propertyType || "condo",
      price: item.price || "",
      sizeSQM: item.sizeSQM || "",
      bedrooms: item.bedrooms || "studio",
      bathrooms: item.bathrooms || "1",
      status: item.status || "published",
      message: item.message || "",
    });
    setFormError(null);
    setModalMode("edit");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    if (modalMode === "create") {
      const res = await createProperty(formData);
      if (!res.success) {
        setFormError(res.error || "Failed to create property");
        setFormSubmitting(false);
        return;
      }
    } else if (modalMode === "edit" && selectedProperty) {
      const res = await updateProperty(selectedProperty._id, formData);
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
    const matchesSearch =
      !searchTerm.trim() ||
      (item.buildingName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.price || "").toLowerCase().includes(searchTerm.toLowerCase());

    const itemStatus = (item.status || "published").toLowerCase();
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
                  {["all", "published", "draft", "archived"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setStatusFilter(st);
                        setStatusFilterDropdown(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left capitalize flex items-center justify-between hover:bg-neutral-50 ${
                        statusFilter === st
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
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* Datatable (Matches Pic 1 Table Layout) */}
      <div className="bg-white rounded-2xl border border-[#ecece8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#f0f0ec] text-[11px] font-semibold tracking-wider text-neutral-400 uppercase bg-[#fafafa]/60">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Targeturl</th>
                <th className="px-6 py-4">Published</th>
                <th className="px-6 py-4">Createdat</th>
                <th className="px-6 py-4">Updatedat</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0ec] text-sm">
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-400">
                    {searchTerm || statusFilter !== "all"
                      ? "No properties match your filter criteria."
                      : "No properties found. Click 'Add Property' to create your first listing."}
                  </td>
                </tr>
              ) : (
                filteredProperties.map((item) => {
                  const targetUrl = generateTargetUrl(item);
                  const isPublished = (item.status || "published") === "published";
                  const isDropdownOpen = activeStatusId === item._id;

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-[#fafaf8] transition-colors"
                    >
                      {/* Title */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-neutral-900">
                          {item.buildingName !== "string" && item.buildingName
                            ? item.buildingName
                            : item.name || `Listing #${item._id.slice(-6)}`}
                        </div>
                        <div className="text-xs text-neutral-400 capitalize mt-0.5">
                          {item.propertyType} • {item.price}
                        </div>
                      </td>

                      {/* Targeturl */}
                      <td className="px-6 py-4 whitespace-nowrap text-neutral-500 font-mono text-xs">
                        {targetUrl}
                      </td>

                      {/* Published / Status Pill (Matches Pic 1) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveStatusId(isDropdownOpen ? null : item._id)
                            }
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                              isPublished
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/60"
                                : item.status === "draft"
                                ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/60"
                                : "bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200/60"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isPublished
                                  ? "bg-emerald-500"
                                  : item.status === "draft"
                                  ? "bg-amber-500"
                                  : "bg-neutral-400"
                              }`}
                            />
                            <span className="capitalize">
                              {item.status || "Published"}
                            </span>
                            <i className="bi bi-chevron-down text-[10px] opacity-70 ml-0.5" />
                          </button>

                          {isDropdownOpen && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setActiveStatusId(null)}
                              />
                              <div className="absolute left-0 mt-1 w-36 rounded-xl bg-white shadow-xl border border-neutral-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStatusChange(item._id, "published")
                                  }
                                  className="w-full px-3 py-1.5 text-left hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Published
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStatusChange(item._id, "draft")
                                  }
                                  className="w-full px-3 py-1.5 text-left hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  Draft
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStatusChange(item._id, "archived")
                                  }
                                  className="w-full px-3 py-1.5 text-left hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                                  Archived
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Createdat */}
                      <td className="px-6 py-4 whitespace-nowrap text-neutral-600 text-xs">
                        {formatDate(item.createdAt)}
                      </td>

                      {/* Updatedat */}
                      <td className="px-6 py-4 whitespace-nowrap text-neutral-600 text-xs">
                        {formatDate(item.updatedAt)}
                      </td>

                      {/* Actions (Matches Pic 1 Icons) */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-2.5">
                          {/* View Preview */}
                          <button
                            type="button"
                            title="View details"
                            onClick={() => {
                              setSelectedProperty(item);
                              setModalMode("view");
                            }}
                            className="text-neutral-500 hover:text-neutral-800 transition-colors p-1 cursor-pointer"
                          >
                            <i className="bi bi-eye text-sm" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            title="Edit property"
                            onClick={() => openEditModal(item)}
                            className="text-neutral-500 hover:text-neutral-800 transition-colors p-1 cursor-pointer"
                          >
                            <i className="bi bi-pencil text-sm" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            title="Delete property"
                            onClick={() => setDeleteConfirmId(item._id)}
                            className="text-neutral-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                          >
                            <i className="bi bi-trash text-sm" />
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
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-neutral-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="font-serif text-xl font-bold text-neutral-900">
                {modalMode === "create" ? "Add New Property" : "Edit Property"}
              </h3>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="text-neutral-400 hover:text-neutral-700 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Building / Project Name *
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

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Owner / Contact Name *
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Intent *
                  </label>
                  <select
                    value={formData.intent}
                    onChange={(e) =>
                      setFormData({ ...formData, intent: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400 bg-white"
                  >
                    <option value="sell">Sell</option>
                    <option value="rentOut">Rent Out</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Property Type *
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
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400 bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Price *
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

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">
                    Size (SQM) *
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
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">
                  Description / Message
                </label>
                <textarea
                  rows={3}
                  value={formData.message || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Property description or details..."
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:border-neutral-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold cursor-pointer"
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
                    ? "Create Listing"
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-100">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-serif text-lg font-bold text-neutral-900">
                Property Details
              </h3>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="text-neutral-400 hover:text-neutral-700 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-neutral-700">
              <div>
                <span className="text-neutral-400 font-medium">Building Name:</span>
                <div className="font-semibold text-neutral-900 text-sm mt-0.5">
                  {selectedProperty.buildingName}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-neutral-400 font-medium">Price:</span>
                  <div className="font-bold text-neutral-900 text-sm mt-0.5">
                    {selectedProperty.price}
                  </div>
                </div>
                <div>
                  <span className="text-neutral-400 font-medium">Size:</span>
                  <div className="font-semibold text-neutral-900 mt-0.5">
                    {selectedProperty.sizeSQM}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-neutral-400 font-medium">Type / Intent:</span>
                  <div className="font-semibold text-neutral-900 capitalize mt-0.5">
                    {selectedProperty.propertyType} • {selectedProperty.intent}
                  </div>
                </div>
                <div>
                  <span className="text-neutral-400 font-medium">Status:</span>
                  <div className="mt-0.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize font-medium">
                      {selectedProperty.status || "published"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-neutral-400 font-medium">Bedrooms:</span>
                  <div className="font-semibold text-neutral-900 mt-0.5">
                    {selectedProperty.bedrooms}
                  </div>
                </div>
                <div>
                  <span className="text-neutral-400 font-medium">Bathrooms:</span>
                  <div className="font-semibold text-neutral-900 mt-0.5">
                    {selectedProperty.bathrooms}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-neutral-400 font-medium">Owner Contact:</span>
                <div className="font-semibold text-neutral-900 mt-0.5">
                  {selectedProperty.name} ({selectedProperty.phone || selectedProperty.email || "No contact"})
                </div>
              </div>

              {selectedProperty.message && (
                <div>
                  <span className="text-neutral-400 font-medium">Description:</span>
                  <p className="mt-0.5 text-neutral-600 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                    {selectedProperty.message}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="px-4 py-2 rounded-lg bg-neutral-900 text-white font-semibold text-xs cursor-pointer"
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
