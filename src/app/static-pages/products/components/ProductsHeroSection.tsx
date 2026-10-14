'use client';

import React, { useState, useEffect } from 'react';
import { SaveButton } from '@/components/SaveButton';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { ImageUploadField } from '@/components/ImageUploadField';
import { uploadFiles } from '@/lib/uploadHelpers';
import { Sparkles, ChevronDown, Award } from 'lucide-react';
import toast from 'react-hot-toast';

interface TrustBadge {
  icon?: string;
  title: string;
  subtitle: string;
}

interface ProductsHeroData {
  badge?: string;
  heading?: string;
  description?: string;
  bannerImage?: string;
  floatingBadgeTitle?: string;
  floatingBadgeTag?: string;
  trustBadges?: TrustBadge[];
}

interface ProductsHeroSectionProps {
  initialData?: ProductsHeroData | null;
  isOpen?: boolean;
  onToggle?: () => void;
  onSaved?: (updated: ProductsHeroData) => void;
}

export function ProductsHeroSection({
  initialData,
  isOpen: controlledIsOpen,
  onToggle,
  onSaved,
}: ProductsHeroSectionProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));

  // All useStates start completely EMPTY
  const [badge, setBadge] = useState('');
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [bannerImages, setBannerImages] = useState<(File | string | null)[]>([]);
  const [floatingBadgeTitle, setFloatingBadgeTitle] = useState('');
  const [floatingBadgeTag, setFloatingBadgeTag] = useState('');
  const [badge1Title, setBadge1Title] = useState('');
  const [badge1Sub, setBadge1Sub] = useState('');
  const [badge2Title, setBadge2Title] = useState('');
  const [badge2Sub, setBadge2Sub] = useState('');
  const [badge3Title, setBadge3Title] = useState('');
  const [badge3Sub, setBadge3Sub] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.badge) setBadge(initialData.badge);
      if (initialData.heading) setHeading(initialData.heading);
      if (initialData.description) setDescription(initialData.description);
      if (initialData.bannerImage) setBannerImages([initialData.bannerImage]);
      if (initialData.floatingBadgeTitle) setFloatingBadgeTitle(initialData.floatingBadgeTitle);
      if (initialData.floatingBadgeTag) setFloatingBadgeTag(initialData.floatingBadgeTag);

      const badges = initialData.trustBadges || [];
      if (badges[0]) {
        setBadge1Title(badges[0].title || '');
        setBadge1Sub(badges[0].subtitle || '');
      }
      if (badges[1]) {
        setBadge2Title(badges[1].title || '');
        setBadge2Sub(badges[1].subtitle || '');
      }
      if (badges[2]) {
        setBadge3Title(badges[2].title || '');
        setBadge3Sub(badges[2].subtitle || '');
      }
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let bannerImageUrl = bannerImages[0] ? String(bannerImages[0]) : '';
      if (bannerImages[0] instanceof File) {
        const uploaded = await uploadFiles([bannerImages[0]]);
        bannerImageUrl = uploaded[0] || '';
      }

      const content: ProductsHeroData = {
        badge,
        heading,
        description,
        bannerImage: bannerImageUrl,
        floatingBadgeTitle,
        floatingBadgeTag,
        trustBadges: [
          { icon: 'flag', title: badge1Title, subtitle: badge1Sub },
          { icon: 'shield', title: badge2Title, subtitle: badge2Sub },
          { icon: 'layers', title: badge3Title, subtitle: badge3Sub },
        ],
      };

      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'ProductsHero',
          content,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('Product Hero section saved successfully!');
        if (onSaved) onSaved(content);
      } else {
        toast.error(json.error || 'Failed to save hero section');
      }
    } catch {
      toast.error('Network error saving hero section');
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
            <Sparkles className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900 tracking-tight">
              Product Page Hero Banner
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
              Manage the top headline, narrative description, 3D packshot visual, and trust badges for the /products catalog page.
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

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Badge & Headline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Pill Badge Tag"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Complete Product Portfolio"
              />
              <InputField
                label="Main Headline *"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="e.g. All Lubricon Formulations"
                required
              />
            </div>

            {/* Narrative Description */}
            <TextAreaField
              label="Narrative Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Explore our comprehensive range of industrial and automotive lubricants..."
            />

            {/* Hero Banner Visual & Floating Badge */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
              <div className="text-xs font-black uppercase tracking-wider text-zinc-800">
                Hero 3D Product Lineup Visual & Floating Pack Badge
              </div>

              <ImageUploadField
                label="Product Lineup Banner Image"
                images={bannerImages}
                onImagesChange={setBannerImages}
                maxImages={1}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Floating Badge Label"
                  value={floatingBadgeTitle}
                  onChange={(e) => setFloatingBadgeTitle(e.target.value)}
                  placeholder="e.g. Commercial & Industrial Packaging"
                />
                <InputField
                  label="Floating Badge Tag"
                  value={floatingBadgeTag}
                  onChange={(e) => setFloatingBadgeTag(e.target.value)}
                  placeholder="e.g. 210L • 20L • 5L"
                />
              </div>
            </div>

            {/* Key Trust Spec Badges */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-800">
                <Award className="w-4 h-4 text-[#ffe000]" />
                <span>3 Key Trust Specification Pills</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Badge 1 */}
                <div className="p-3 rounded-xl bg-white border border-zinc-200 space-y-2">
                  <span className="text-[10px] font-black uppercase text-zinc-500">Pill #1</span>
                  <InputField
                    label="Title"
                    value={badge1Title}
                    onChange={(e) => setBadge1Title(e.target.value)}
                    placeholder="Australian Tech"
                  />
                  <InputField
                    label="Subtitle"
                    value={badge1Sub}
                    onChange={(e) => setBadge1Sub(e.target.value)}
                    placeholder="Tested for Indian Ops"
                  />
                </div>

                {/* Badge 2 */}
                <div className="p-3 rounded-xl bg-white border border-zinc-200 space-y-2">
                  <span className="text-[10px] font-black uppercase text-zinc-500">Pill #2</span>
                  <InputField
                    label="Title"
                    value={badge2Title}
                    onChange={(e) => setBadge2Title(e.target.value)}
                    placeholder="API & ISO Certified"
                  />
                  <InputField
                    label="Subtitle"
                    value={badge2Sub}
                    onChange={(e) => setBadge2Sub(e.target.value)}
                    placeholder="Strict Quality Audit"
                  />
                </div>

                {/* Badge 3 */}
                <div className="p-3 rounded-xl bg-white border border-zinc-200 space-y-2">
                  <span className="text-[10px] font-black uppercase text-zinc-500">Pill #3</span>
                  <InputField
                    label="Title"
                    value={badge3Title}
                    onChange={(e) => setBadge3Title(e.target.value)}
                    placeholder="Pack Sizes"
                  />
                  <InputField
                    label="Subtitle"
                    value={badge3Sub}
                    onChange={(e) => setBadge3Sub(e.target.value)}
                    placeholder="5L, 20L & 210L Drums"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <SaveButton loading={loading} label="Save Product Hero" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
