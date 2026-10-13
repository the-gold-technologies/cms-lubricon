'use client';

import React, { useState, useEffect } from 'react';
import { SectionHeader } from '@/components/SectionHeader';
import { SaveButton } from '@/components/SaveButton';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { ImageUploadField } from '@/components/ImageUploadField';
import { ShieldCheck, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ValuePillar {
  title: string;
  icon: string;
  desc: string;
}

export function AboutHeroSection({
  initialData,
  isOpen: controlledIsOpen,
  onToggle,
}: {
  initialData?: any;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  const [internalOpen, setInternalOpen] = useState(true);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));
  const [badge, setBadge] = useState('Australian Formulation Heritage • Indian Leadership');
  const [heading, setHeading] = useState('Redefining Lubrication for Indian Industry');
  const [narrative, setNarrative] = useState(
    'At Lubricon Specialities India, we engineer high-performance lubrication solutions that withstand extreme heat, high pressures, and punishing duty cycles. Powered by cutting-edge Australian formulations, we empower Indian manufacturers, fleet operators, and heavy industries to achieve peak uptime.'
  );
  const [secondaryText, setSecondaryText] = useState(
    'With dedicated technical engineers and a pan-India logistics network, we deliver customized audits, high-viscosity formulations, and responsive delivery directly to industrial plant gates.'
  );
  const [images, setImages] = useState<(File | string | null)[]>(['https://res.cloudinary.com/dpa93copz/image/upload/v1791888280/lubricon/images/aboutlubricon.jpg']);
  const [officeBadge, setOfficeBadge] = useState('Lubricon India HQ');
  const [cardTag, setCardTag] = useState('Australian Technology');
  const [cardSubtag, setCardSubtag] = useState('Tailored for Indian Operations');
  const [isoBadgeTitle, setIsoBadgeTitle] = useState('ISO & API');
  const [isoBadgeSub, setIsoBadgeSub] = useState('Certified');
  const [tollFree, setTollFree] = useState('1800 569 6363');
  const [primaryBtnText, setPrimaryBtnText] = useState('Explore Products');
  const [primaryBtnLink, setPrimaryBtnLink] = useState('/products');
  const [secondaryBtnText, setSecondaryBtnText] = useState('Request TDS & Quote');
  const [secondaryBtnLink, setSecondaryBtnLink] = useState('/contact');
  const [valuePillars, setValuePillars] = useState<ValuePillar[]>([
    {
      title: 'Australian R&D',
      icon: 'cpu',
      desc: 'International additive science tailored for local conditions.',
    },
    {
      title: 'Zero-Wear Film',
      icon: 'shield',
      desc: 'Anti-wear barrier extending severe-duty machine life.',
    },
    {
      title: '40+ Formulations',
      icon: 'factory',
      desc: 'Speciality oils, greases, coolants, and neat fluids.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.badge !== undefined) setBadge(initialData.badge);
      if (initialData.heading !== undefined) setHeading(initialData.heading);
      if (initialData.narrative !== undefined) setNarrative(initialData.narrative);
      if (initialData.secondaryText !== undefined) setSecondaryText(initialData.secondaryText);
      if (initialData.image !== undefined) setImages([initialData.image]);
      if (initialData.officeBadge !== undefined) setOfficeBadge(initialData.officeBadge);
      if (initialData.cardTag !== undefined) setCardTag(initialData.cardTag);
      if (initialData.cardSubtag !== undefined) setCardSubtag(initialData.cardSubtag);
      if (initialData.isoBadgeTitle !== undefined) setIsoBadgeTitle(initialData.isoBadgeTitle);
      if (initialData.isoBadgeSub !== undefined) setIsoBadgeSub(initialData.isoBadgeSub);
      if (initialData.tollFree !== undefined) setTollFree(initialData.tollFree);
      if (initialData.primaryBtnText !== undefined) setPrimaryBtnText(initialData.primaryBtnText);
      if (initialData.primaryBtnLink !== undefined) setPrimaryBtnLink(initialData.primaryBtnLink);
      if (initialData.secondaryBtnText !== undefined) setSecondaryBtnText(initialData.secondaryBtnText);
      if (initialData.secondaryBtnLink !== undefined) setSecondaryBtnLink(initialData.secondaryBtnLink);
      if (Array.isArray(initialData.valuePillars)) setValuePillars(initialData.valuePillars);
    }
  }, [initialData]);

  const handlePillarChange = (index: number, field: keyof ValuePillar, val: string) => {
    setValuePillars((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const addPillar = () => {
    setValuePillars((prev) => [...prev, { title: 'New Pillar', icon: 'shield', desc: 'Description' }]);
  };

  const removePillar = (index: number) => {
    setValuePillars((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const firstImg = images[0];
      const imageStr = typeof firstImg === 'string' ? firstImg : 'https://res.cloudinary.com/dpa93copz/image/upload/v1791888280/lubricon/images/aboutlubricon.jpg';

      const payload = {
        badge,
        heading,
        narrative,
        secondaryText,
        image: imageStr,
        officeBadge,
        cardTag,
        cardSubtag,
        isoBadgeTitle,
        isoBadgeSub,
        tollFree,
        primaryBtnText,
        primaryBtnLink,
        secondaryBtnText,
        secondaryBtnLink,
        valuePillars,
      };

      const res = await fetch('/api/about-us', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'AboutHero',
          content: payload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('About Hero section saved successfully!');
      } else {
        toast.error(json.error || 'Failed to save About Hero');
      }
    } catch {
      toast.error('Network error saving About Hero');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-4 transition-all">
      <SectionHeader
        title="1. Hero & Company Narrative"
        description="Live hero banner, Australian technology card, and core value pillars."
        badge={images[0] ? 'Image Set' : 'No Image'}
        isOpen={isOpen}
        onToggle={handleToggle}
      />

      <div
        className={"grid transition-all duration-300 ease-in-out " + (isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Badge Text" value={badge} onChange={(e) => setBadge(e.target.value)} />
              <InputField label="Hero Heading" value={heading} onChange={(e) => setHeading(e.target.value)} />

              <div className="md:col-span-2">
                <TextAreaField label="Main Company Narrative" value={narrative} onChange={(e) => setNarrative(e.target.value)} rows={3} />
              </div>

              <div className="md:col-span-2">
                <TextAreaField label="Secondary Supporting Text" value={secondaryText} onChange={(e) => setSecondaryText(e.target.value)} rows={2} />
              </div>

              <div className="md:col-span-2">
                <ImageUploadField
                  label="Office / Factory Hero Banner Graphic"
                  images={images}
                  onImagesChange={setImages}
                  maxImages={1}
                  folder="lubricon/about"
                />
              </div>

              <InputField label="Card Tag" value={cardTag} onChange={(e) => setCardTag(e.target.value)} />
              <InputField label="Card Subtag" value={cardSubtag} onChange={(e) => setCardSubtag(e.target.value)} />
              <InputField label="Office Badge" value={officeBadge} onChange={(e) => setOfficeBadge(e.target.value)} />
            </div>

            <InputField label="ISO Badge Title" value={isoBadgeTitle} onChange={(e) => setIsoBadgeTitle(e.target.value)} />
            <InputField label="ISO Badge Subtitle" value={isoBadgeSub} onChange={(e) => setIsoBadgeSub(e.target.value)} />
            <InputField label="Toll-Free Helpline" value={tollFree} onChange={(e) => setTollFree(e.target.value)} />
            <InputField label="Primary Button Text" value={primaryBtnText} onChange={(e) => setPrimaryBtnText(e.target.value)} />
            <InputField label="Primary Button Link" value={primaryBtnLink} onChange={(e) => setPrimaryBtnLink(e.target.value)} />
            <InputField label="Secondary Button Text" value={secondaryBtnText} onChange={(e) => setSecondaryBtnText(e.target.value)} />
            <InputField label="Secondary Button Link" value={secondaryBtnLink} onChange={(e) => setSecondaryBtnLink(e.target.value)} />

            {/* Value Pillars List */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900">Value Pillars (3 Cards)</h3>
                <button
                  type="button"
                  onClick={addPillar}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg transition"
                >
                  <Plus size={14} /> Add Pillar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {valuePillars.map((pillar, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3 relative group">
                    <button
                      type="button"
                      onClick={() => removePillar(idx)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                    <InputField
                      label="Pillar Title"
                      value={pillar.title}
                      onChange={(e) => handlePillarChange(idx, 'title', e.target.value)}
                    />
                    <InputField
                      label="Icon (cpu, shield, factory)"
                      value={pillar.icon}
                      onChange={(e) => handlePillarChange(idx, 'icon', e.target.value)}
                    />
                    <TextAreaField
                      label="Description"
                      value={pillar.desc}
                      onChange={(e) => handlePillarChange(idx, 'desc', e.target.value)}
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <SaveButton onClick={handleSave} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
