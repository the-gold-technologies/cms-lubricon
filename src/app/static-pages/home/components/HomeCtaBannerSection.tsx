'use client';

import React, { useState, useEffect } from 'react';
import { SaveButton } from '@/components/SaveButton';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { ImageUploadField } from '@/components/ImageUploadField';
import { StringListEditor } from '@/components/StringListEditor';
import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface HomeCtaBannerSectionProps {
  initialData?: {
    subTag?: string;
    headline?: string;
    description?: string;
    primaryBtnText?: string;
    primaryBtnLink?: string;
    secondaryBtnText?: string;
    secondaryBtnLink?: string;
    trustMarkers?: string[];
    archImage?: string;
    floaterTitle?: string;
    floaterSubtitle?: string;
  };
}

const DEFAULT_TRUST_MARKERS = [
  'Australian Formulation',
  'API & ISO Certified',
  'Pan-India Dispatch',
];

export function HomeCtaBannerSection({ initialData }: HomeCtaBannerSectionProps) {
  const [subTag, setSubTag] = useState('Engineered for Maximum Machine Uptime');
  const [headline, setHeadline] = useState(
    'Your machinery deserves peak protection. So does your business.'
  );
  const [description, setDescription] = useState(
    'Whether you operate heavy plastic injection presses, high-speed paper mills, or automotive fleets, Lubricon delivers precision Australian formulations designed to reduce friction and eliminate costly downtime.'
  );
  const [primaryBtnText, setPrimaryBtnText] = useState('Explore Products');
  const [primaryBtnLink, setPrimaryBtnLink] = useState('/products');
  const [secondaryBtnText, setSecondaryBtnText] = useState('Get in Touch');
  const [secondaryBtnLink, setSecondaryBtnLink] = useState('/contact');
  const [trustMarkers, setTrustMarkers] = useState<string[]>(DEFAULT_TRUST_MARKERS);
  const [archImage, setArchImage] = useState('/images/ind-steel.png');
  const [floaterTitle, setFloaterTitle] = useState('Australian Precision');
  const [floaterSubtitle, setFloaterSubtitle] = useState('100% Quality');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.subTag) setSubTag(initialData.subTag);
      if (initialData.headline) setHeadline(initialData.headline);
      if (initialData.description) setDescription(initialData.description);
      if (initialData.primaryBtnText) setPrimaryBtnText(initialData.primaryBtnText);
      if (initialData.primaryBtnLink) setPrimaryBtnLink(initialData.primaryBtnLink);
      if (initialData.secondaryBtnText) setSecondaryBtnText(initialData.secondaryBtnText);
      if (initialData.secondaryBtnLink) setSecondaryBtnLink(initialData.secondaryBtnLink);
      if (initialData.trustMarkers && Array.isArray(initialData.trustMarkers)) setTrustMarkers(initialData.trustMarkers);
      if (initialData.archImage) setArchImage(initialData.archImage);
      if (initialData.floaterTitle) setFloaterTitle(initialData.floaterTitle);
      if (initialData.floaterSubtitle) setFloaterSubtitle(initialData.floaterSubtitle);
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
          section: 'HomeCtaBanner',
          content: {
            subTag,
            headline,
            description,
            primaryBtnText,
            primaryBtnLink,
            secondaryBtnText,
            secondaryBtnLink,
            trustMarkers,
            archImage,
            floaterTitle,
            floaterSubtitle,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Arch CTA Banner section saved successfully!');
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
      <div className="flex items-center gap-3 pb-6 border-b border-zinc-100">
        <div className="p-2.5 rounded-xl bg-[#ffe000] text-black">
          <Sparkles className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 tracking-tight">8. Modern Arch CTA Banner</h2>
          <p className="text-xs text-zinc-500 font-medium">
            Manage the bottom high-conversion banner, dual pill buttons, trust badges, and organic arch graphic.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Category Sub-Tag"
            value={subTag}
            onChange={(e) => setSubTag(e.target.value)}
          />
          <InputField
            label="Banner Headline *"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            required
          />
        </div>

        <TextAreaField
          label="Banner Description Copy"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InputField
            label="Primary Button Text"
            value={primaryBtnText}
            onChange={(e) => setPrimaryBtnText(e.target.value)}
          />
          <InputField
            label="Primary Button Link"
            value={primaryBtnLink}
            onChange={(e) => setPrimaryBtnLink(e.target.value)}
          />
          <InputField
            label="Secondary Button Text"
            value={secondaryBtnText}
            onChange={(e) => setSecondaryBtnText(e.target.value)}
          />
          <InputField
            label="Secondary Button Link"
            value={secondaryBtnLink}
            onChange={(e) => setSecondaryBtnLink(e.target.value)}
          />
        </div>

        <StringListEditor
          label="Footer Trust Markers"
          items={trustMarkers}
          onChange={setTrustMarkers}
          placeholder="e.g. Pan-India Dispatch"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-200">
          <div className="sm:col-span-1">
            <ImageUploadField
              label="Arch Visual Cutout"
              images={archImage ? [archImage] : []}
              onImagesChange={(imgs) => setArchImage(typeof imgs[0] === 'string' ? imgs[0] : '')}
              maxImages={1}
            />
          </div>
          <div className="sm:col-span-2 space-y-3">
            <InputField
              label="Floater Card Title"
              value={floaterTitle}
              onChange={(e) => setFloaterTitle(e.target.value)}
            />
            <InputField
              label="Floater Card Subtitle"
              value={floaterSubtitle}
              onChange={(e) => setFloaterSubtitle(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <SaveButton loading={loading} label="Save CTA Banner" />
        </div>
      </form>
    </div>
  );
}
