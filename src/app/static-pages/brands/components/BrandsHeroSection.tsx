'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { ImageUploadField } from '@/components/ImageUploadField';
import { SaveButton } from '@/components/SaveButton';
import { uploadFiles } from '@/lib/uploadHelpers';

export function BrandsHeroSection({
  initialData,
  isOpen: controlledIsOpen,
  onToggle,
}: {
  initialData?: any;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [badge, setBadge] = useState('');
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [ctaPrimaryText, setCtaPrimaryText] = useState('');
  const [ctaPrimaryUrl, setCtaPrimaryUrl] = useState('');
  const [ctaSecondaryText, setCtaSecondaryText] = useState('');
  const [images, setImages] = useState<(File | string | null)[]>(['']);

  useEffect(() => {
    if (initialData) {
      if (initialData.badge) setBadge(initialData.badge);
      if (initialData.heading) setHeading(initialData.heading);
      if (initialData.description) setDescription(initialData.description);
      if (initialData.ctaPrimaryText) setCtaPrimaryText(initialData.ctaPrimaryText);
      if (initialData.ctaPrimaryUrl) setCtaPrimaryUrl(initialData.ctaPrimaryUrl);
      if (initialData.ctaSecondaryText) setCtaSecondaryText(initialData.ctaSecondaryText);

      const banner = initialData.bannerImage;
      if (banner) setImages([banner]);
    }
  }, [initialData]);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const validImages = images.filter((img): img is File | string => !!img);
      let bannerImageUrl = '';
      if (validImages.length > 0) {
        const [uploaded] = await uploadFiles(validImages);
        bannerImageUrl = uploaded || '';
      }

      const payload = {
        badge: badge.trim(),
        heading: heading.trim(),
        description: description.trim(),
        ctaPrimaryText: ctaPrimaryText.trim(),
        ctaPrimaryUrl: ctaPrimaryUrl.trim(),
        ctaSecondaryText: ctaSecondaryText.trim(),
        bannerImage: bannerImageUrl,
      };

      const res = await fetch('/api/brands', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'BrandsHero', content: payload }),
      });

      const json = await res.json();
      if (json.success) {
        setSaved(true);
        if (bannerImageUrl) setImages([bannerImageUrl]);
        toast.success('Brands Hero Banner saved successfully');
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch {
      toast.error('Error saving Brands Hero section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6 transition-all">
      <SectionHeader
        title="1. Brands Hero Banner"
        description="Manage headline, authority badge, introduction narrative, CTA buttons, and background banner image."
        badge={images[0] ? 'Image Set' : 'No Image'}
        isOpen={isOpen}
        onToggle={handleToggle}
      />

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Authority / Badge Text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Authorized Multi-Brand Distribution Partner"
              />
              <InputField
                label="Hero Heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="Brands That Power Every Industrial Move."
              />
            </div>

            <TextAreaField
              label="Hero Introduction Paragraph"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Jai Deva Oil Co. brings together the world’s most trusted lubricant manufacturers..."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <InputField
                label="Primary Button Text"
                value={ctaPrimaryText}
                onChange={(e) => setCtaPrimaryText(e.target.value)}
                placeholder="Explore Brand Portfolio"
              />
              <InputField
                label="Primary Button Link / Anchor"
                value={ctaPrimaryUrl}
                onChange={(e) => setCtaPrimaryUrl(e.target.value)}
                placeholder="#brand-showcase"
              />
              <InputField
                label="Secondary Button Text"
                value={ctaSecondaryText}
                onChange={(e) => setCtaSecondaryText(e.target.value)}
                placeholder="Consult a Specialist"
              />
            </div>

            <ImageUploadField
              label="Hero Background Banner Image"
              images={images}
              onImagesChange={setImages}
              maxImages={1}
              tooltip="Upload high-res lubricant/engine hero photo (recommended: 1920×720px)."
            />

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
  );
}
