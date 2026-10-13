'use client';

import React, { useState, useEffect } from 'react';
import { SaveButton } from '@/components/SaveButton';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { ImageUploadField } from '@/components/ImageUploadField';
import { Factory, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface IndustryCard {
  name: string;
  icon: string;
  summary: string;
  link: string;
  image: string;
}

interface HomeIndustriesSectionProps {
  initialData?: {
    badgeText?: string;
    title?: string;
    subtitle?: string;
    industries?: IndustryCard[];
  };
}

const DEFAULT_INDUSTRIES: IndustryCard[] = [
  {
    name: 'Plastic Injection Molding',
    icon: '🏭',
    summary: 'High-temperature hydraulic stability, non-staining mold rust preventives, and zero plastic contamination.',
    link: '/industries#plastic-injection-molding',
    image: '/images/ind-plastic.png',
  },
  {
    name: 'Paper Mills',
    icon: '📄',
    summary: 'Extreme water washout resistance, anti-emulsification gear oils, and high-speed dryer bearings protection.',
    link: '/industries#paper-mills',
    image: '/images/ind-paper.png',
  },
  {
    name: 'Steel Plants',
    icon: '⚙️',
    summary: 'Ultra-high viscosity ISO VG 680 EP gear oils, furnace fire-resistant fluids, and caster roll lubrication.',
    link: '/industries#steel-plants',
    image: '/images/ind-steel.png',
  },
  {
    name: 'Automotive & Fleet Transport',
    icon: '🚛',
    summary: 'API CK-4 & CI-4 Plus diesel oils, heavy axle gear protection, and ISO 22241 certified AdBlue DEF.',
    link: '/industries#automotive-fleet',
    image: '/images/ind-steel.png',
  },
  {
    name: 'Precision Engineering',
    icon: '🔧',
    summary: 'EDM spark erosion dielectric fluids, solvent rust guards, and VaccuSyn 100 vacuum pump oils.',
    link: '/industries#precision-engineering',
    image: '/images/ind-plastic.png',
  },
];

export function HomeIndustriesSection({ initialData }: HomeIndustriesSectionProps) {
  const [badgeText, setBadgeText] = useState('Sector Expertise');
  const [title, setTitle] = useState('Industries We Serve');
  const [subtitle, setSubtitle] = useState('Australian formulation science tailored to survive high temperatures, extreme shear, and wet contamination.');
  const [industries, setIndustries] = useState<IndustryCard[]>(DEFAULT_INDUSTRIES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.badgeText) setBadgeText(initialData.badgeText);
      if (initialData.title) setTitle(initialData.title);
      if (initialData.subtitle) setSubtitle(initialData.subtitle);
      if (initialData.industries && Array.isArray(initialData.industries) && initialData.industries.length > 0) {
        setIndustries(initialData.industries);
      }
    }
  }, [initialData]);

  const handleIndustryChange = (index: number, field: keyof IndustryCard, value: string) => {
    setIndustries((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAdd = () => {
    setIndustries((prev) => [
      ...prev,
      {
        name: 'New Industry Sector',
        icon: '⚙️',
        summary: 'Specialized industrial lubrication and preventive maintenance.',
        link: '/industries',
        image: '/images/ind-plastic.png',
      },
    ]);
  };

  const handleRemove = (index: number) => {
    setIndustries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'HomeIndustries',
          content: { badgeText, title, subtitle, industries },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Industries showcase section saved successfully!');
      } else {
        toast.error(json.error || 'Failed to save industries section');
      }
    } catch {
      toast.error('Network error saving industries');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-zinc-200">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#ffe000] text-black">
            <Factory className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900 tracking-tight">4. Industries We Serve</h2>
            <p className="text-xs text-zinc-500 font-medium">
              Manage highlighted industrial sectors: Injection Molding, Paper Mills, Steel, Automotive & Fleet.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-zinc-900 hover:bg-black text-[#ffe000] transition cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Sector
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputField
            label="Badge Tag"
            value={badgeText}
            onChange={(e) => setBadgeText(e.target.value)}
          />
          <InputField
            label="Heading *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <InputField
            label="Subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {industries.map((ind, i) => (
            <div key={i} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 relative group">
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-3 right-3 text-zinc-400 hover:text-red-600 transition"
                title="Remove Sector"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-4 gap-2">
                <InputField
                  label="Icon"
                  value={ind.icon}
                  onChange={(e) => handleIndustryChange(i, 'icon', e.target.value)}
                  containerClassName="col-span-1"
                />
                <InputField
                  label="Sector Name"
                  value={ind.name}
                  onChange={(e) => handleIndustryChange(i, 'name', e.target.value)}
                  containerClassName="col-span-3"
                />
              </div>

              <TextAreaField
                label="Sector Summary"
                value={ind.summary}
                onChange={(e) => handleIndustryChange(i, 'summary', e.target.value)}
                rows={2}
              />

              <InputField
                label="Anchor Link"
                value={ind.link}
                onChange={(e) => handleIndustryChange(i, 'link', e.target.value)}
              />

              <ImageUploadField
                label="Cover Image"
                images={ind.image ? [ind.image] : []}
                onImagesChange={(imgs) => handleIndustryChange(i, 'image', typeof imgs[0] === 'string' ? imgs[0] : '')}
                maxImages={1}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <SaveButton loading={loading} label="Save Industries Showcase" />
        </div>
      </form>
    </div>
  );
}
