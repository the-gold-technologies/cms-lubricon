'use client';

import React, { useState, useEffect } from 'react';
import { SaveButton } from '@/components/SaveButton';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { Package, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface HomeProductShowcaseSectionProps {
  initialData?: {
    tagline?: string;
    heading?: string;
    subtitle?: string;
    ctaText?: string;
    ctaLink?: string;  };
  isOpen?: boolean;
  onToggle?: () => void;
}

export function HomeProductShowcaseSection({
  initialData,
  isOpen: controlledIsOpen,
  onToggle,
}: HomeProductShowcaseSectionProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));
  const [tagline, setTagline] = useState('ENGINEERED EXCELLENCE');
  const [heading, setHeading] = useState('Comprehensive Industrial & Automotive Lubrication');
  const [subtitle, setSubtitle] = useState(
    'Formulated to API, ISO and OEM specifications with high-viscosity synthetic bases and shear-stable polymers.'
  );
  const [ctaText, setCtaText] = useState('Browse Full Catalog');
  const [ctaLink, setCtaLink] = useState('/products');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.tagline) setTagline(initialData.tagline);
      if (initialData.heading) setHeading(initialData.heading);
      if (initialData.subtitle) setSubtitle(initialData.subtitle);
      if (initialData.ctaText) setCtaText(initialData.ctaText);
      if (initialData.ctaLink) setCtaLink(initialData.ctaLink);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'HomeProductShowcase',
          content: { tagline, heading, subtitle, ctaText, ctaLink },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Product Showcase section saved successfully!');
      } else {
        toast.error(json.error || 'Failed to save section');
      }
    } catch {
      toast.error('Network error saving section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-zinc-200">
      <div onClick={handleToggle} className="flex items-center justify-between pb-6 border-b border-zinc-100 cursor-pointer select-none group">
        <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-[#ffe000] text-black">
          <Package className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 tracking-tight">6. Product Portfolio Showcase</h2>
          <p className="text-xs text-zinc-500 font-medium">
            Manage heading, intro copy, and catalog link for the homepage product cards showcase.
          </p>
        </div>
        </div>
        <div className={`w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 transition-transform duration-300 ${isOpen ? "rotate-180 bg-[#ffe000] text-black" : ""}`}>
          <ChevronDown className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>

      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Tagline Badge"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
          <InputField
            label="Section Heading *"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            required
          />
        </div>

        <TextAreaField
          label="Subtitle Copy"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          rows={2}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Catalog Button Text"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
          />
          <InputField
            label="Catalog Button Link"
            value={ctaLink}
            onChange={(e) => setCtaLink(e.target.value)}
          />
        </div>

        <div className="flex justify-end pt-2">
          <SaveButton loading={loading} label="Save Product Showcase" />
        </div>
      </form>
        </div>
      </div>
    </div>
  );
}
