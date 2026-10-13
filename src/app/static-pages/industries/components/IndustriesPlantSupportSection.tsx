"use client";

import React, { useState, useEffect } from "react";
import { Wrench, Plus, Trash2 } from "lucide-react";
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

  const [badge, setBadge] = useState("Industrial Engineering Services");
  const [heading, setHeading] = useState("Beyond Lubricants: Complete Plant Support");
  const [description, setDescription] = useState(
    "We do not just deliver barrels — our Australian formulation specialists partner directly with your plant managers to reduce unscheduled maintenance, optimize drain cycles, and eliminate costly downtime."
  );
  const [services, setServices] = useState<PlantServiceItem[]>([
    {
      title: "On-Site Plant Lubrication Audits",
      desc: "Our technical field engineers conduct comprehensive machine-by-machine surveys, mapping thermal loads, cycle pressures, and friction points across your entire facility.",
      tag: "Site Survey",
      deliverable: "Machine Audit & Friction Map Report",
    },
    {
      title: "Used Oil Laboratory Analysis",
      desc: "Regular laboratory spectrographic testing tracking elemental wear metals (Fe, Cu, Cr), water contamination, viscosity drift, and TAN/TBN depletion to prevent sudden failure.",
      tag: "Preventive Lab",
      deliverable: "Spectrographic Lab Wear Certificate",
    },
    {
      title: "SKU Rationalization & Consolidation",
      desc: "Streamline dozens of legacy oils down to a core set of Australian high-performance Lubricon formulations, cutting inventory holding capital by up to 30%.",
      tag: "Cost Reduction",
      deliverable: "Consolidated SKU Reduction Matrix",
    },
    {
      title: "Bulk Storage & Dispensing Solutions",
      desc: "Turnkey supply of 1,000L IBCs, high-flow pneumatic dispensing stations, and contamination-free color-coded transfer systems for spotless plant maintenance.",
      tag: "Turnkey Setup",
      deliverable: "Turnkey Storage & Dispensing Blueprint",
    },
  ]);

  const [consultationBadge, setConsultationBadge] = useState("● Get Instant Support");
  const [consultationTitle, setConsultationTitle] = useState("You are a few minutes away from the help you need.");
  const [consultationDesc, setConsultationDesc] = useState(
    "At Lubricon Specialities India, we redefine performance, reliability, and innovation in lubrication solutions. Powered by cutting-edge Australian technology, we deliver products that enhance efficiency and protect your machinery."
  );
  const [callbackBtnText, setCallbackBtnText] = useState("Get A Callback");
  const [callNumber, setCallNumber] = useState("1800 569 6363");

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
        tag: "Service",
        deliverable: "Report",
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
    <div className="border border-slate-200 rounded-3xl bg-white overflow-hidden shadow-xs">
      <SectionHeader
        title="Plant Engineering Services & Support Banner"
        description="Configure the 4 plant engineering service cards (Audits, Lab analysis, SKU rationalization, Bulk storage) and bottom instant support banner."
        badge="Services & Support"
        isOpen={isOpen}
        onToggle={handleToggle}
      />

      {isOpen && (
        <div className="p-7 sm:p-9 border-t border-slate-100 flex flex-col gap-6">
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
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-50 text-[#C86218] hover:bg-[#C86218] hover:text-white px-3.5 py-1.5 rounded-xl transition cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Service</span>
              </button>
            </div>

            <div className="space-y-4">
              {services.map((srv, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col gap-3 relative"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-black text-slate-400">Card #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(idx)}
                      className="text-red-500 hover:text-red-700 transition p-1 cursor-pointer"
                      title="Remove Service"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <InputField
                        label="Service Title"
                        value={srv.title}
                        onChange={(e) => handleUpdateService(idx, "title", e.target.value)}
                        placeholder="Service name..."
                      />
                    </div>
                    <div>
                      <InputField
                        label="Category Tag"
                        value={srv.tag}
                        onChange={(e) => handleUpdateService(idx, "tag", e.target.value)}
                        placeholder="Site Survey, Lab, etc."
                      />
                    </div>
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

          <div className="pt-6 border-t border-slate-200 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-slate-900">Bottom Instant Consultation Banner</h4>
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

          <div className="pt-4 border-t border-slate-100">
            <SaveButton
              loading={loading}
              saved={saved}
              onClick={handleSave}
              label="Save Plant Support Section"
              className="w-full py-3.5 rounded-2xl font-bold text-sm shadow-md"
            />
          </div>
        </div>
      )}
    </div>
  );
}
