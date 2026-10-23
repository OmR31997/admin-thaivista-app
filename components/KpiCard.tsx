"use client";

import React from "react";

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: "building" | "inquiry" | "open-inquiry" | "trophy" | "people";
  color?: "blue" | "purple" | "amber" | "emerald";
  onClick?: () => void;
}

export default function KpiCard({
  label,
  value,
  icon,
  color = "blue",
  onClick,
}: KpiCardProps) {
  const getIconClass = () => {
    switch (icon) {
      case "building":
        return "bi-building";
      case "inquiry":
        return "bi-people";
      case "open-inquiry":
        return "bi-envelope-paper";
      case "trophy":
        return "bi-check2-circle";
      case "people":
        return "bi-people";
      default:
        return "bi-bar-chart";
    }
  };

  const getColorStyles = () => {
    switch (color) {
      case "purple":
        return {
          bg: "bg-[#f3e8ff]",
          text: "text-[#9333ea]",
          border: "border-[#e9d5ff]",
        };
      case "amber":
        return {
          bg: "bg-[#fef3c7]",
          text: "text-[#d97706]",
          border: "border-[#fde68a]",
        };
      case "emerald":
        return {
          bg: "bg-[#d1fae5]",
          text: "text-[#059669]",
          border: "border-[#a7f3d0]",
        };
      case "blue":
      default:
        return {
          bg: "bg-[#e0f2fe]",
          text: "text-[#0284c7]",
          border: "border-[#bae6fd]",
        };
    }
  };

  const colorStyle = getColorStyles();

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-[#e8ecef] shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all ${
        onClick ? "cursor-pointer hover:shadow-md hover:border-neutral-300" : ""
      }`}
    >
      {/* Top Icon Badge */}
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-9 h-9 rounded-xl ${colorStyle.bg} ${colorStyle.text} border ${colorStyle.border} flex items-center justify-center shrink-0 shadow-xs`}
        >
          <i className={`bi ${getIconClass()} text-base`} />
        </div>
      </div>

      {/* Metric Count */}
      <div className="font-serif text-3xl font-bold text-neutral-900 tracking-tight mb-1">
        {value}
      </div>

      {/* Label and Chevron */}
      <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
        <span>{label}</span>
        <i className="bi bi-chevron-right text-[11px] text-neutral-400" />
      </div>
    </div>
  );
}
