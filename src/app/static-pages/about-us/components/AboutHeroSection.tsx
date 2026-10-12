'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { ImageUploadField } from '@/components/ImageUploadField';
import { SaveButton } from '@/components/SaveButton';
import { uploadFiles } from '@/lib/uploadHelpers';

export interface AboutHeroData {
  heading?: string;
  tagline?: string;
  description?: string;
  bannerImage?: string;
  altText?: string;
}

export function AboutHeroSection({ initialData }: { initialData?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [images, setImages] = useState<(File | string | null)[]>(['']);
  const [heading, setHeading] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [altText, setAltText] = useState('');

  useEffect(() => {
    if (initialData) {
      if (initialData.bannerImage) setImages([initialData.bannerImage]);
      if (initialData.heading) setHeading(initialData.heading);
      if (initialData.tagline) setTagline(initialData.tagline);
      if (initialData.description) setDescription(initialData.description);
      if (initialData.altText) setAltText(initialData.altText);
    }
  }, [initialData]);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const validImages = images.filter((img): img is File | string => !!img);
      if (validImages.length === 0) {
        toast.error('Please upload a hero banner image.');
        setLoading(false);
        return;
      }

      const [uploadedUrl] = await uploadFiles(validImages);
      const finalImageUrl = uploadedUrl || '';

      const payload: AboutHeroData = {
        heading: heading.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        bannerImage: finalImageUrl,
        altText: altText.trim(),
      };

      const res = await fetch('/api/about-us', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'AboutHero', content: payload }),
      });

      const json = await res.json();
      if (json.success) {
        setSaved(true);
        setImages([finalImageUrl]);
        toast.success('Hero Banner saved successfully');
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error saving hero banner');
    } finally {
      setLoading(false);
    }
  };

  const validCount = images.filter(Boolean).length;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-4 transition-all">
      <SectionHeader
        title="1. Hero Banner"
        description="Set the main heading, tagline, description text, and banner image for the About Us hero section."
        badge={`${validCount} Banner`}
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
            {/* Text fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Heading (Main Title)"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="e.g. Jai Deva Oil Co."
              />
              <InputField
                label="Tagline (Sub-heading)"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Mr. Mayank Goyal – Mentor & Proprietor"
              />
            </div>

            <TextAreaField
              label="Description Paragraph"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief intro shown below the tagline in the hero banner…"
            />

            {/* Image Upload */}
            <ImageUploadField
              label="Hero Banner Image"
              images={images}
              onImagesChange={setImages}
              maxImages={1}
              tooltip="Upload banner image (recommended: 1920×715px or 21:9 aspect ratio)."
            />

            <InputField
              label="Image Alt Text (SEO & Accessibility)"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="e.g. About Jai Deva Oil Co. lubricant warehouse"
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
