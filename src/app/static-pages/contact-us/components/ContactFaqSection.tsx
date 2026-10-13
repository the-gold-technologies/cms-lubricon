"use client";

import React, { useState, useEffect } from "react";
import { HelpCircle, Plus, Trash2 } from "lucide-react";
import { InputField } from "@/components/InputField";
import { TextAreaField } from "@/components/TextAreaField";
import { SaveButton } from "@/components/SaveButton";

export interface FaqItem {
  q: string;
  a: string;
  tag: string;
}

export function ContactFaqSection({
  initialData,
  onSave,
}: {
  initialData?: any;
  onSave?: (data: any) => Promise<any>;
}) {
  const [badge, setBadge] = useState("Help Center");
  const [heading, setHeading] = useState("Frequently Asked Questions");
  const [subtitle, setSubtitle] = useState(
    "Answers to common questions regarding technical specs, delivery logistics, and commercial supply."
  );
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.badge !== undefined) setBadge(initialData.badge);
      if (initialData.heading !== undefined) setHeading(initialData.heading);
      if (initialData.subtitle !== undefined) setSubtitle(initialData.subtitle);
      if (Array.isArray(initialData.faqs)) setFaqs(initialData.faqs);
    }
  }, [initialData]);

  const handleAddFaq = () => {
    setFaqs((prev) => [
      ...prev,
      {
        q: "",
        a: "",
        tag: "General",
      },
    ]);
  };

  const handleUpdateFaq = (index: number, field: keyof FaqItem, value: string) => {
    setFaqs((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!onSave) return;
    setLoading(true);
    try {
      await onSave({
        badge,
        heading,
        subtitle,
        faqs,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full border border-slate-200 rounded-3xl bg-white p-7 sm:p-9 shadow-xs flex flex-col gap-6">
      <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#C86218] flex items-center justify-center">
          <HelpCircle size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg">5. Frequently Asked Questions (FAQ)</h3>
          <p className="text-xs text-slate-500">
            Manage the accordion FAQ list displayed at the bottom of the contact page.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputField
          label="Badge Pill"
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
          placeholder="Help Center"
        />
        <InputField
          label="Heading"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          placeholder="Frequently Asked Questions"
        />
      </div>

      <TextAreaField
        label="Subtitle / Intro Text"
        value={subtitle}
        onChange={(e) => setSubtitle(e.target.value)}
        rows={2}
      />

      <div className="flex flex-col gap-4 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Questions & Answers ({faqs.length})
          </label>
          <button
            type="button"
            onClick={handleAddFaq}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-50 text-[#C86218] hover:bg-[#C86218] hover:text-white px-3.5 py-1.5 rounded-xl transition cursor-pointer"
          >
            <Plus size={14} />
            <span>Add FAQ</span>
          </button>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col gap-3 relative"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-black text-slate-400">#{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFaq(idx)}
                  className="text-red-500 hover:text-red-700 transition p-1 cursor-pointer"
                  title="Remove FAQ"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <InputField
                    label="Question"
                    value={faq.q}
                    onChange={(e) => handleUpdateFaq(idx, "q", e.target.value)}
                    placeholder="Enter question..."
                  />
                </div>
                <div>
                  <InputField
                    label="Category Tag"
                    value={faq.tag}
                    onChange={(e) => handleUpdateFaq(idx, "tag", e.target.value)}
                    placeholder="Engine Oils, Industrial, etc."
                  />
                </div>
              </div>

              <TextAreaField
                label="Answer"
                value={faq.a}
                onChange={(e) => handleUpdateFaq(idx, "a", e.target.value)}
                placeholder="Enter detailed answer..."
                rows={2}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <SaveButton
          loading={loading}
          saved={saved}
          onClick={handleSave}
          label="Save FAQ Section"
          className="w-full py-3.5 rounded-2xl font-bold text-sm shadow-md"
        />
      </div>
    </div>
  );
}
