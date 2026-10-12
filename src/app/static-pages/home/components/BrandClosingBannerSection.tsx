'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { SaveButton } from '@/components/SaveButton';

export interface BrandClosingBannerData {
  badge: string;
  title: string;
  description: string;
  highlights: string[];
  btnLabel: string;
  btnUrl: string;
}

export const DEFAULT_BRAND_CLOSING_BANNER: BrandClosingBannerData = {
  badge: '',
  title: '',
  description: '',
  highlights: [],
  btnLabel: '',
  btnUrl: '',
};

export function BrandClosingBannerSection({ initialData }: { initialData?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [data, setData] = useState<BrandClosingBannerData>(DEFAULT_BRAND_CLOSING_BANNER);

  useEffect(() => {
    if (initialData) {
      const highlightsList: string[] = Array.isArray(initialData.highlights)
        ? initialData.highlights.map((item: any) =>
            typeof item === 'string' ? item : String(item?.text || item?.title || item || '')
          )
        : [];

      setData({
        badge: initialData.badge || '',
        title: initialData.title || '',
        description: initialData.description || '',
        highlights: highlightsList,
        btnLabel: initialData.btnLabel || '',
        btnUrl: initialData.btnUrl || '',
      });
    }
  }, [initialData]);

  const handleAddHighlight = () => {
    setData((prev) => ({
      ...prev,
      highlights: [...prev.highlights, ''],
    }));
    toast.success('New feature tag added');
  };

  const handleRemoveHighlight = (idx: number) => {
    const updated = data.highlights.filter((_, i) => i !== idx);
    setData((prev) => ({ ...prev, highlights: updated }));
    toast.success('Feature tag removed');
  };

  const handleHighlightChange = (idx: number, value: string) => {
    const updated = [...data.highlights];
    updated[idx] = value;
    setData((prev) => ({ ...prev, highlights: updated }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const payload = {
        badge: data.badge,
        title: data.title,
        description: data.description,
        highlights: data.highlights,
        btnLabel: data.btnLabel,
        btnUrl: data.btnUrl,
        // Backward-compatibility
        buttonText: data.btnLabel,
        buttonLink: data.btnUrl,
      };

      const res = await fetch('/api/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'BrandClosingBannerSection',
          content: payload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaved(true);
        toast.success('Brand Closing Banner saved successfully!');
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch {
      toast.error('Error saving Brand Closing Banner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-4 transition-all">
        <SectionHeader
          title="Partner Closing Banner (CTA)"
          description="Manage the prominent call-to-action banner (badge, main headline, description, 4 highlight pills, and partner CTA button)."
          badge={`${data.highlights.length} Tag${data.highlights.length === 1 ? '' : 's'}`}
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-6 pt-4">
              {/* Badge & Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Top Badge / Tag"
                  value={data.badge}
                  onChange={(e) => setData((prev) => ({ ...prev, badge: e.target.value }))}
                  placeholder="JAI DEVA OIL CO."
                />

                <InputField
                  label="Headline (Uppercase Title)"
                  value={data.title}
                  onChange={(e) => setData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="YOUR TRUSTED PARTNER IN INDUSTRIAL & AUTOMOTIVE LUBRICATION"
                />
              </div>

              {/* Description Paragraph */}
              <div className="grid grid-cols-1 gap-5">
                <TextAreaField
                  label="Description Paragraph"
                  rows={3}
                  value={data.description}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="With 18+ years of industry experience, a diverse multi-brand portfolio..."
                />
              </div>

              {/* Action Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputField
                  label="CTA Button Label"
                  value={data.btnLabel}
                  onChange={(e) => setData((prev) => ({ ...prev, btnLabel: e.target.value }))}
                  placeholder="PARTNER WITH JAI DEVA OIL CO."
                />

                <InputField
                  label="CTA Button URL"
                  value={data.btnUrl}
                  onChange={(e) => setData((prev) => ({ ...prev, btnUrl: e.target.value }))}
                  placeholder="/contact-us or #contact"
                />
              </div>

              {/* Highlights / Badges List */}
              <div className="border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-[#C86218]" />
                    Feature Highlight Pills ({data.highlights.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddHighlight}
                    className="px-4 py-2 rounded-full border border-dashed border-gray-300 hover:border-[#0C356A] text-xs font-bold text-gray-700 hover:text-[#0C356A] flex items-center gap-1.5 transition-all cursor-pointer bg-white shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C86218]" />
                    Add Tag
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {data.highlights.map((tag, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-2 shadow-2xs hover:border-[#C86218] transition-colors"
                    >
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => handleHighlightChange(idx, e.target.value)}
                        placeholder={`Tag #${idx + 1}`}
                        className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0C356A] w-full focus:outline-none focus:ring-1 focus:ring-[#0C356A]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveHighlight(idx)}
                        title="Delete Tag"
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-gray-100">
                <SaveButton
                  loading={loading}
                  saved={saved}
                  onClick={handleSave}
                  label="Save Changes"
                  className="w-full py-3.5 text-sm font-bold shadow-sm hover:shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
