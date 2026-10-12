'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { ImageUploadField } from '@/components/ImageUploadField';
import { SaveButton } from '@/components/SaveButton';
import { uploadFiles } from '@/lib/uploadHelpers';

export function BrandsCtaSection({
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

  const [eyebrowBadge, setEyebrowBadge] = useState('');
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [phoneText, setPhoneText] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [images, setImages] = useState<(File | string | null)[]>(['']);

  useEffect(() => {
    if (initialData) {
      if (initialData.badge) setEyebrowBadge(initialData.badge);
      if (initialData.heading) setHeading(initialData.heading);
      if (initialData.description) setDescription(initialData.description);
      if (initialData.buttonText) setButtonText(initialData.buttonText);
      if (initialData.phoneText) setPhoneText(initialData.phoneText);
      if (initialData.phoneNumber) setPhoneNumber(initialData.phoneNumber);

      const bgImg = initialData.image;
      if (bgImg) setImages([bgImg]);
    }
  }, [initialData]);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const validImages = images.filter((img): img is File | string => !!img);
      let bgImageUrl = '';
      if (validImages.length > 0) {
        const [uploaded] = await uploadFiles(validImages);
        bgImageUrl = uploaded || '';
      }

      const payload = {
        badge: eyebrowBadge.trim(),
        heading: heading.trim(),
        description: description.trim(),
        buttonText: buttonText.trim(),
        phoneText: phoneText.trim(),
        phoneNumber: phoneNumber.trim(),
        image: bgImageUrl,
      };

      const res = await fetch('/api/brands', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'BrandsCtaSection', content: payload }),
      });

      const json = await res.json();
      if (json.success) {
        setSaved(true);
        if (bgImageUrl) setImages([bgImageUrl]);
        toast.success('Consultation CTA banner saved successfully');
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch {
      toast.error('Error saving Consultation CTA section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6 transition-all">
      <SectionHeader
        title="5. Consultation & Recommendation CTA"
        description="Configure the call-to-action banner shown at the bottom of the Brands page."
        badge={images[0] ? 'Background Set' : 'No Background'}
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
                label="Eyebrow Badge"
                value={eyebrowBadge}
                onChange={(e) => setEyebrowBadge(e.target.value)}
                placeholder="Certified Lubrication Engineering Advisory"
              />
              <InputField
                label="Banner Heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="Need an Engine Oil Recommendation or Brand Consultation?"
              />
            </div>

            <TextAreaField
              label="Banner Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Our lubrication engineers map OEM engine viscosities..."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <InputField
                label="Action Button Text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="Request Engine Oil Quote"
              />
              <InputField
                label="Phone Label / Caption"
                value={phoneText}
                onChange={(e) => setPhoneText(e.target.value)}
                placeholder="Direct Dispatch Desk"
              />
              <InputField
                label="Contact Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98111 23456"
              />
            </div>

            <ImageUploadField
              label="CTA Background Image"
              images={images}
              onImagesChange={setImages}
              maxImages={1}
              tooltip="Upload ambient background photo (e.g. oil bottles or refinery reflection)."
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
