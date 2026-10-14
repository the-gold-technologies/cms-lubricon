'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { HelpCircle, Plus, Trash2, ChevronDown } from 'lucide-react';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { SaveButton } from '@/components/SaveButton';

export interface FaqItem {
  q: string;
  a: string;
  tag: string;
}

export interface ContactFaqSectionProps {
  initialData?: any;
  onSave?: (data: any) => Promise<any>;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function ContactFaqSection({
  initialData,
  onSave,
  isOpen: controlledIsOpen,
  onToggle,
}: ContactFaqSectionProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));

  const [badge, setBadge] = useState('');
  const [heading, setHeading] = useState('');
  const [subtitle, setSubtitle] = useState('');
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
        q: '',
        a: '',
        tag: '',
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
    setLoading(true);
    try {
      const payload = {
        badge,
        heading,
        subtitle,
        faqs,
      };

      if (onSave) {
        await onSave(payload);
      } else {
        const res = await fetch('/api/contact-us', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section: 'ContactFaq',
            content: payload,
          }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Failed to save FAQ section');
      }

      setSaved(true);
      toast.success('FAQ section updated successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      toast.error(err.message || 'Error saving FAQs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-zinc-200/80 p-6 sm:p-8 flex flex-col gap-4 transition-all">
      {/* Header bar */}
      <div
        onClick={handleToggle}
        className="flex items-center justify-between cursor-pointer select-none group border-b border-zinc-100 pb-5"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-zinc-900 group-hover:text-amber-600 transition-colors">
              3. Frequently Asked Questions (FAQ)
            </h3>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Manage the accordion FAQ list displayed at the bottom of the contact page
            </p>
          </div>
        </div>

        <div
          className={`w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 transition-transform duration-300 ${
            isOpen ? 'rotate-180 bg-[#ffe000] text-black' : ''
          }`}
        >
          <ChevronDown className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>

      {/* Accordion body */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-4 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Badge Pill"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Help Center"
              />
              <InputField
                label="Section Heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="Frequently Asked Questions"
              />
            </div>

            <TextAreaField
              label="Subtitle / Intro Text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Answers to common questions regarding technical specs..."
              rows={2}
            />

            {/* FAQs List with Add Button (2 in one row) */}
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Questions & Answers ({faqs.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#ffe000] hover:bg-yellow-400 text-black px-3.5 py-1.5 rounded-xl transition cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add FAQ</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50/50 flex flex-col gap-3 relative"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-zinc-700">
                        FAQ #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(idx)}
                        className="text-red-500 hover:text-red-700 transition p-1 cursor-pointer"
                        title="Remove FAQ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <InputField
                          label="Question"
                          value={faq.q}
                          onChange={(e) => handleUpdateFaq(idx, 'q', e.target.value)}
                          placeholder="e.g. What product grades do you offer?"
                        />
                      </div>
                      <div>
                        <InputField
                          label="Tag / Category"
                          value={faq.tag}
                          onChange={(e) => handleUpdateFaq(idx, 'tag', e.target.value)}
                          placeholder="Engine Oils, etc."
                        />
                      </div>
                    </div>

                    <TextAreaField
                      label="Answer"
                      value={faq.a}
                      onChange={(e) => handleUpdateFaq(idx, 'a', e.target.value)}
                      placeholder="Detailed explanation..."
                      rows={3}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-100">
              <SaveButton
                loading={loading}
                saved={saved}
                onClick={handleSave}
                label="Save FAQ Section"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
