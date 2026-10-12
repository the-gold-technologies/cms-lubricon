'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { StringListEditor } from '@/components/StringListEditor';
import { ImagePickerField } from '@/components/ImagePickerField';
import { SaveButton } from '@/components/SaveButton';

export interface HomeHeroData {
  badge: string;
  heading: string;
  description: string;
  primaryBtnLabel: string;
  primaryBtnUrl: string;
  secondaryBtnLabel: string;
  secondaryBtnUrl: string;
  points: string[];
  bgImage: string;
  productImage: string;
}

export const DEFAULT_HOME_HERO_DATA: HomeHeroData = {
  badge: '',
  heading: '',
  description: '',
  primaryBtnLabel: '',
  primaryBtnUrl: '',
  secondaryBtnLabel: '',
  secondaryBtnUrl: '',
  points: [],
  bgImage: '',
  productImage: '',
};

export function HomeHeroSection({ initialData }: { initialData?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState<HomeHeroData>(DEFAULT_HOME_HERO_DATA);

  useEffect(() => {
    if (initialData) {
      setFormData({
        badge: initialData.badge || '',
        heading: initialData.heading || '',
        description: initialData.description || '',
        primaryBtnLabel: initialData.primaryBtnLabel || '',
        primaryBtnUrl: initialData.primaryBtnUrl || '',
        secondaryBtnLabel: initialData.secondaryBtnLabel || '',
        secondaryBtnUrl: initialData.secondaryBtnUrl || '',
        points:
          Array.isArray(initialData.points) && initialData.points.length > 0
            ? initialData.points
            : [],
        bgImage: initialData.bgImage || '',
        productImage: initialData.productImage || '',
      });
    }
  }, [initialData]);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      // 1. Save HomeHero section
      const res = await fetch('/api/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'HomeHero',
          content: formData,
        }),
      });
      const json = await res.json();

      if (json.success) {
        setSaved(true);
        toast.success('Homepage Hero saved successfully!');
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save homepage hero');
      }
    } catch {
      toast.error('Error saving homepage hero');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-4 transition-all">
        <SectionHeader
          title="Homepage Hero Section"
          description="Manage the top centerpiece hero banner, headline, description, 3 feature bullet points, CTA buttons, and imagery."
          badge="Live Hero"
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
              {/* Badge & Headline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Category Badge / Tagline"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="MULTI-BRAND LUBRICANT SOLUTIONS"
                  helperText="Orange accented badge with factory icon"
                />

                <InputField
                  label="Main Hero Headline"
                  value={formData.heading}
                  onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                  placeholder="Reliable lubrication for every industry and application."
                  helperText="Primary bold heading at the top"
                />
              </div>

              {/* Description */}
              <TextAreaField
                label="Hero Description Paragraph"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Jai Deva Oil Co. is a trusted multi-brand industrial and automotive lubricant distributor..."
                helperText="Summary paragraph displayed below the headline"
              />

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 flex flex-col gap-3">
                  <span className="text-xs font-bold text-[#C86218] uppercase tracking-wider">
                    Primary CTA (Orange Button)
                  </span>
                  <InputField
                    label="Button Label"
                    value={formData.primaryBtnLabel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        primaryBtnLabel: e.target.value,
                      })
                    }
                    placeholder="Explore Products"
                  />
                  <InputField
                    label="Button Link / Action"
                    value={formData.primaryBtnUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        primaryBtnUrl: e.target.value,
                      })
                    }
                    placeholder="#products or /products"
                  />
                </div>

                <div className="p-4 bg-slate-50/60 rounded-2xl border border-slate-100 flex flex-col gap-3">
                  <span className="text-xs font-bold text-[#0C356A] uppercase tracking-wider">
                    Secondary CTA (Transparent Button)
                  </span>
                  <InputField
                    label="Button Label"
                    value={formData.secondaryBtnLabel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        secondaryBtnLabel: e.target.value,
                      })
                    }
                    placeholder="Become a Partner"
                  />
                  <InputField
                    label="Button Link / Action"
                    value={formData.secondaryBtnUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        secondaryBtnUrl: e.target.value,
                      })
                    }
                    placeholder="#contact or /contact-us"
                  />
                </div>
              </div>

              {/* 3 Key Feature Bullet Points */}
              <div className="p-4 bg-gray-50/60 rounded-2xl border border-gray-100 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Hero Key Highlights (3 Points)
                    </label>
                    <span className="text-[11px] text-gray-500">
                      Checkmarked bullet points displayed beneath the action buttons
                    </span>
                  </div>
                </div>

                <StringListEditor
                  label="Feature Bullet Points"
                  items={formData.points}
                  onChange={(points) => setFormData({ ...formData, points })}
                  placeholder="e.g. Engine, hydraulic and gear oils"
                />
              </div>

              {/* Images Grid: Background & Featured Product */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ImagePickerField
                  label="Hero Background Banner Image"
                  value={formData.bgImage}
                  onChange={(url) => setFormData({ ...formData, bgImage: url })}
                  helperText="Industrial plant or background wallpaper (high resolution)"
                  folder="jaideva/hero"
                />

                <ImagePickerField
                  label="Featured Product / Drum Image"
                  value={formData.productImage}
                  onChange={(url) => setFormData({ ...formData, productImage: url })}
                  helperText="Featured container/pail/drum shown on desktop right column"
                  folder="jaideva/hero"
                />
              </div>

              {/* Full Width Save Button */}
              <div className="pt-4 border-t border-gray-100">
                <SaveButton
                  loading={loading}
                  saved={saved}
                  onClick={handleSave}
                  label="Save Homepage Hero"
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
