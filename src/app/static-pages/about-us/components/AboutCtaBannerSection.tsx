'use client';

import React, { useState, useEffect } from 'react';
import { SaveButton } from '@/components/SaveButton';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';

export function AboutCtaBannerSection({ initialData }: { initialData?: any }) {
  const [heading, setHeading] = useState('Ready to Upgrade Your Industrial Lubrication?');
  const [subtext, setSubtext] = useState(
    'Get customized quotation lists, bulk drum price rates, and engineering estimates for your machinery specifications. Request a quote or get product technical sheets directly from our lubrication specialists.'
  );
  const [buttonText, setButtonText] = useState('Get Custom Quote');
  const [buttonLink, setButtonLink] = useState('/contact');
  const [phone, setPhone] = useState('1800 569 6363');
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
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Megaphone size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Closing Call To Action Banner</h2>
            <p className="text-xs text-gray-500">Live bottom banner prompting quotes, bulk drum price lists, and phone helpline.</p>
          </div>
        </div>
        <SaveButton onClick={handleSave} loading={loading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        <div className="md:col-span-2">
          <InputField label="Banner Headline" value={heading} onChange={(e) => setHeading(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <TextAreaField label="Description Text" value={subtext} onChange={(e) => setSubtext(e.target.value)} rows={3} />
        </div>
        <InputField label="Button Text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
        <InputField label="Button Link" value={buttonLink} onChange={(e) => setButtonLink(e.target.value)} />
        <InputField label="Phone Helpline" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
    </div>
  );
}
