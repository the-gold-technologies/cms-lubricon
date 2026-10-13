'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { SectionHeader } from '@/components/SectionHeader';
import { ImageUploadField } from '@/components/ImageUploadField';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { SaveButton } from '@/components/SaveButton';

export interface ContactHeroSectionProps {
  initialData?: any;
  onSave?: (data: any) => Promise<any>;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function ContactHeroSection({
  initialData,
  onSave,
  isOpen: controlledIsOpen,
  onToggle,
}: ContactHeroSectionProps) {
  const [internalOpen, setInternalOpen] = useState(true);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));

  const [badge, setBadge] = useState('24/7 Technical Support & Dispatch');
  const [heading, setHeading] = useState('Contact Lubricon Specialities India');
  const [description, setDescription] = useState(
    'Speak with our lubrication specialists, request on-site oil analysis, or submit institutional tenders and wholesale supply inquiries.'
  );
  const [helpline, setHelpline] = useState('1800 569 6363');
  const [email, setEmail] = useState('info@lubricon.in');
  const [address, setAddress] = useState('Lubricon Specialities India, Industrial Area, Haryana / Delhi NCR, India');
  const [images, setImages] = useState<(File | string | null)[]>(['https://res.cloudinary.com/dpa93copz/image/upload/v1791888282/lubricon/images/contact-hero.jpg']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.badge !== undefined) setBadge(initialData.badge);
      if (initialData.heading !== undefined) setHeading(initialData.heading);
      if (initialData.title !== undefined && !initialData.heading) setHeading(initialData.title);
      if (initialData.description !== undefined) setDescription(initialData.description);
      if (initialData.subtitle !== undefined && !initialData.description) setDescription(initialData.subtitle);
      if (initialData.helpline !== undefined) setHelpline(initialData.helpline);
      if (initialData.email !== undefined) setEmail(initialData.email);
      if (initialData.address !== undefined) setAddress(initialData.address);
      if (initialData.image !== undefined) setImages([initialData.image]);
    }
  }, [initialData]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const firstImg = images[0];
      const imageStr = typeof firstImg === 'string' ? firstImg : 'https://res.cloudinary.com/dpa93copz/image/upload/v1791888282/lubricon/images/contact-hero.jpg';

      const payload = {
        badge,
        heading,
        title: heading,
        description,
        subtitle: description,
        helpline,
        email,
        address,
        image: imageStr,
      };

      if (onSave) {
        await onSave(payload);
      } else {
        const res = await fetch('/api/contact-us', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section: 'ContactHero',
            content: payload,
          }),
        });
        const json = await res.json();
        if (json.success) {
          toast.success('Contact Hero updated successfully!');
        } else {
          toast.error(json.error || 'Failed to save Contact Hero');
        }
      }
    } catch {
      toast.error('Network error saving Contact Hero');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-4 transition-all">
      <SectionHeader
        title="1. Contact Hero & Direct Channels"
        description="Live banner text, Australian engineer spotlight image, and toll-free helpline."
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
              <InputField label="Eyebrow Badge" value={badge} onChange={(e) => setBadge(e.target.value)} />
              <InputField label="Hero Heading" value={heading} onChange={(e) => setHeading(e.target.value)} />

              <div className="md:col-span-2">
                <TextAreaField label="Description Narrative" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>

              <InputField label="Toll-Free Helpline" value={helpline} onChange={(e) => setHelpline(e.target.value)} />
              <InputField label="Direct Support Email" value={email} onChange={(e) => setEmail(e.target.value)} />

              <div className="md:col-span-2">
                <InputField label="Corporate Address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>

              <div className="md:col-span-2">
                <ImageUploadField
                  label="Engineer Spotlight Graphic"
                  images={images}
                  onImagesChange={setImages}
                  maxImages={1}
                  folder="lubricon/contact"
                />
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
