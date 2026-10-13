"use client";

import React, { useState, useEffect } from "react";
import { Wrench, Plus, Trash2, ChevronDown } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { SaveButton } from "@/components/SaveButton";

export interface PlantServiceItem {
  title: string;
  desc: string;
  tag: string;
  deliverable: string;
}

export function IndustriesPlantSupportSection({
  initialData,
  isOpen: controlledIsOpen,
  onToggle,
  onSave,
}: {
  initialData?: any;
  isOpen?: boolean;
  onToggle?: () => void;
  onSave?: (data: any) => Promise<any>;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));

  const [badge, setBadge] = useState("");
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [services, setServices] = useState<PlantServiceItem[]>([]);
  const [consultationBadge, setConsultationBadge] = useState("");
  const [consultationTitle, setConsultationTitle] = useState("");
  const [consultationDesc, setConsultationDesc] = useState("");
  const [callbackBtnText, setCallbackBtnText] = useState("");
  const [callNumber, setCallNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.badge !== undefined) setBadge(initialData.badge);
      if (initialData.heading !== undefined) setHeading(initialData.heading);
      if (initialData.description !== undefined) setDescription(initialData.description);
      if (Array.isArray(initialData.services)) setServices(initialData.services);
      if (initialData.consultationBadge !== undefined) setConsultationBadge(initialData.consultationBadge);
      if (initialData.consultationTitle !== undefined) setConsultationTitle(initialData.consultationTitle);
      if (initialData.consultationDesc !== undefined) setConsultationDesc(initialData.consultationDesc);
      if (initialData.callbackBtnText !== undefined) setCallbackBtnText(initialData.callbackBtnText);
      if (initialData.callNumber !== undefined) setCallNumber(initialData.callNumber);
    }
  }, [initialData]);

  const handleUpdateService = (idx: number, field: keyof PlantServiceItem, val: string) => {
    setServices((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleAddService = () => {
    setServices((prev) => [
      ...prev,
      {
        title: "",
        desc: "",
        tag: "",
        deliverable: "",
      },
    ]);
  };

  const handleRemoveService = (idx: number) => {
    setServices((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        badge,
        heading,
        description,
        services,
        consultationBadge,
        consultationTitle,
        consultationDesc,
        callbackBtnText,
        callNumber,
      };

      if (onSave) {
        await onSave(payload);
      } else {
        const res = await fetch("/api/industries", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            section: "IndustriesPlantSupport",
            content: payload,
          }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to save");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-zinc-200">
      <div
        onClick={handleToggle}
        className="flex items-center justify-between pb-6 border-b border-zinc-100 cursor-pointer select-none group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#ffe000] text-black">
            <Wrench className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900 tracking-tight">
              3. Plant Engineering Services & Support Banner
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
              Configure plant engineering service cards and bottom instant support banner.
            </p>
          </div>
        </div>

        <div
          className={`w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 transition-transform duration-300 ${
            isOpen ? "rotate-180 bg-[#ffe000] text-black" : ""
          }`}
        >
          <ChevronDown className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Badge Pill"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Industrial Engineering Services"
              />
              <InputField
                label="Section Heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="Beyond Lubricants: Complete Plant Support"
              />
            </div>

            <TextAreaField
              label="Section Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />

            <div className="flex flex-col gap-4 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Plant Engineering Services ({services.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddService}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#ffe000] hover:bg-yellow-400 text-black px-3.5 py-1.5 rounded-xl transition cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add Service</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((srv, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50/50 flex flex-col gap-3 relative"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-zinc-700">
                        Card #{idx + 1}: {srv.title || 'New Service'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(idx)}
                        className="text-red-500 hover:text-red-700 transition p-1 cursor-pointer"
                        title="Remove Service"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <InputField
                        label="Service Title"
                        value={srv.title}
                        onChange={(e) => handleUpdateService(idx, "title", e.target.value)}
                        placeholder="Service name..."
                      />
                      <InputField
                        label="Category Tag"
                        value={srv.tag}
                        onChange={(e) => handleUpdateService(idx, "tag", e.target.value)}
                        placeholder="Site Survey, Lab, etc."
                      />
                    </div>

                    <InputField
                      label="Deliverable Badge"
                      value={srv.deliverable}
                      onChange={(e) => handleUpdateService(idx, "deliverable", e.target.value)}
                      placeholder="Machine Audit & Friction Map Report"
                    />

                    <TextAreaField
                      label="Description"
                      value={srv.desc}
                      onChange={(e) => handleUpdateService(idx, "desc", e.target.value)}
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-200 flex flex-col gap-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Bottom Instant Consultation Banner
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Banner Eyebrow"
                  value={consultationBadge}
                  onChange={(e) => setConsultationBadge(e.target.value)}
                />
                <InputField
                  label="Banner Headline"
                  value={consultationTitle}
                  onChange={(e) => setConsultationTitle(e.target.value)}
                />
              </div>
              <TextAreaField
                label="Banner Narrative"
                value={consultationDesc}
                onChange={(e) => setConsultationDesc(e.target.value)}
                rows={2}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Callback Button Text"
                  value={callbackBtnText}
                  onChange={(e) => setCallbackBtnText(e.target.value)}
                />
                <InputField
                  label="Helpline Number"
                  value={callNumber}
                  onChange={(e) => setCallNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-100">
              <SaveButton
                loading={loading}
                saved={saved}
                onClick={handleSave}
                label="Save Plant Support Section"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
