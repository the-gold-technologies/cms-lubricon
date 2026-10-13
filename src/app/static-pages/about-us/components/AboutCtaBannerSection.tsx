'use client';

import React, { useState, useEffect } from 'react';
import { SectionHeader } from '@/components/SectionHeader';
import { SaveButton } from '@/components/SaveButton';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';

export function AboutCtaBannerSection({
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
  const [heading, setHeading] = useState('');
  const [subtext, setSubtext] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonLink, setButtonLink] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.heading !== undefined) setHeading(initialData.heading);
      if (initialData.subtext !== undefined) setSubtext(initialData.subtext);
      if (initialData.buttonText !== undefined) setButtonText(initialData.buttonText);
      if (initialData.buttonLink !== undefined) setButtonLink(initialData.buttonLink);
      if (initialData.phone !== undefined) setPhone(initialData.phone);
    }
  }, [initialData]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        heading,
        subtext,
        buttonText,
        buttonLink,
        phone,
      };

      const res = await fetch('/api/about-us', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'AboutCtaBanner',
          content: payload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('About CTA Banner saved successfully!');
      } else {
        toast.error(json.error || 'Failed to save About CTA Banner');
      }
    } catch {
      toast.error('Network error saving About CTA Banner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-4 transition-all">
      <SectionHeader
        title="6. Closing Call To Action Banner"
        description="Live bottom banner prompting quotes, bulk drum price lists, and phone helpline."
        isOpen={isOpen}
        onToggle={handleToggle}
      />

      <div
        className={"grid transition-all duration-300 ease-in-out " + (isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <InputField label="Banner Headline" value={heading} onChange={(e) => setHeading(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <TextAreaField label="Supporting Paragraph" value={subtext} onChange={(e) => setSubtext(e.target.value)} rows={3} />
              </div>
              <InputField label="Primary Button Text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
              <InputField label="Primary Button Link" value={buttonLink} onChange={(e) => setButtonLink(e.target.value)} />
              <InputField label="Toll-Free Helpline Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
