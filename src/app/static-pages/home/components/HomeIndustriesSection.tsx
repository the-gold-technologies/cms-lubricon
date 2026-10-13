'use client';

import React, { useState, useEffect } from 'react';
import { SaveButton } from '@/components/SaveButton';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { ImageUploadField } from '@/components/ImageUploadField';
import { Factory, Plus, Trash2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface IndustryCard {
  title: string;
  category: string;
  description: string;
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
  isOpen?: boolean;
  onToggle?: () => void;
}


export function HomeIndustriesSection({
  initialData,
  isOpen: controlledIsOpen,
  onToggle,
}: HomeIndustriesSectionProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));
  const [badgeText, setBadgeText] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [industries, setIndustries] = useState<IndustryCard[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.badgeText) setBadgeText(initialData.badgeText);
      if (initialData.title) setTitle(initialData.title);
      if (initialData.subtitle) setSubtitle(initialData.subtitle);
      if (initialData.industries && Array.isArray(initialData.industries) && initialData.industries.length > 0) {
        setIndustries(
          initialData.industries.map((ind: any) => ({
            title: ind.title || '',
            category: ind.category || '',
            description: ind.description || '',
            link: ind.link || '',
            image: ind.image || '',
          }))
        );
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
        title: '',
        category: '',
        description: '',
        link: '',
        image: '',
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
      <div onClick={handleToggle} className="flex items-center justify-between pb-6 border-b border-zinc-100 cursor-pointer select-none group">
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

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAdd();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-zinc-900 hover:bg-black text-[#ffe000] transition cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Sector
          </button>
          <div className={`w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 transition-transform duration-300 ${isOpen ? "rotate-180 bg-[#ffe000] text-black" : ""}`}>
            <ChevronDown className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
      </div>

      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
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

                  <InputField
                    label="Category"
                    value={ind.category}
                    onChange={(e) => handleIndustryChange(i, 'category', e.target.value)}
                    placeholder="e.g. Injection Molding"
                  />

                  <InputField
                    label="Sector Title"
                    value={ind.title}
                    onChange={(e) => handleIndustryChange(i, 'title', e.target.value)}
                    placeholder="e.g. Plastic Injection Molding"
                    required
                  />

                  <TextAreaField
                    label="Description"
                    value={ind.description}
                    onChange={(e) => handleIndustryChange(i, 'description', e.target.value)}
                    rows={3}
                    placeholder="Sector description..."
                  />

                  <InputField
                    label="Anchor Link"
                    value={ind.link}
                    onChange={(e) => handleIndustryChange(i, 'link', e.target.value)}
                    placeholder="/industries#plastic-injection-molding"
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
      </div>
    </div>
  );
}
