'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PhoneCall, ChevronDown } from 'lucide-react';
import { ImageUploadField } from '@/components/ImageUploadField';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { SaveButton } from '@/components/SaveButton';
import { uploadFiles } from '@/lib/uploadHelpers';

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

  const [badge, setBadge] = useState('');
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [helpline, setHelpline] = useState('');
  const [email, setEmail] = useState('');
  const [images, setImages] = useState<(File | string | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.badge !== undefined) setBadge(initialData.badge);
      if (initialData.heading !== undefined) setHeading(initialData.heading);
      if (initialData.description !== undefined) setDescription(initialData.description);
      if (initialData.helpline !== undefined) setHelpline(initialData.helpline);
      if (initialData.email !== undefined) setEmail(initialData.email);
      if (initialData.image !== undefined) setImages(initialData.image ? [initialData.image] : []);
    }
  }, [initialData]);

  const handleSave = async () => {
    setLoading(true);
    try {
      let finalImg = '';
      const validImages = images.filter((im): im is File | string => !!im);
      if (validImages.length > 0) {
        if (typeof validImages[0] === 'string') {
          finalImg = validImages[0];
        } else {
          const [uploaded] = await uploadFiles([validImages[0]]);
          if (uploaded) finalImg = uploaded;
        }
      }

      const payload = {
        badge,
        heading,
        description,
        helpline,
        email,
        image: finalImg,
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
        if (!json.success) throw new Error(json.error || 'Failed to save Contact Hero');
      }

      setSaved(true);
      toast.success('Contact Hero updated successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      toast.error(err.message || 'Error saving Contact Hero');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-zinc-200/80 p-6 sm:p-8 flex flex-col gap-4 transition-all">
      {/* Header bar */}
      <div
        onClick={handleToggle}
        className="flex items-center justify-between cursor-pointer select-none group border-b border-zinc-100 pb-5"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <PhoneCall className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-zinc-900 group-hover:text-amber-600 transition-colors">
              1. Contact Hero & Direct Channels
            </h3>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Live banner text, Australian engineer spotlight image, and toll-free helpline
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

      {/* Accordion body */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-4 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Eyebrow Badge Pill"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="24/7 Technical Support & Dispatch"
              />
              <InputField
                label="Main Headline"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="Contact Lubricon Specialities India"
              />
            </div>

            <TextAreaField
              label="Narrative Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Speak with our lubrication specialists..."
              rows={2}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Toll-Free Helpline"
                value={helpline}
                onChange={(e) => setHelpline(e.target.value)}
                placeholder="1800 569 6363"
              />
              <InputField
                label="Support Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@lubricon.in"
              />
            </div>

            <ImageUploadField
              label="Contact Hero Spotlight Graphic"
              images={images}
              onImagesChange={setImages}
              maxImages={1}
              folder="lubricon/contact"
            />

            <div className="flex justify-end pt-4 border-t border-zinc-100">
              <SaveButton
                loading={loading}
                saved={saved}
                onClick={handleSave}
                label="Save Contact Hero"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
