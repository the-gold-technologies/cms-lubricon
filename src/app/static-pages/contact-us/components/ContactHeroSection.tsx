'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ImageUploadField } from '@/components/ImageUploadField';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { SaveButton } from '@/components/SaveButton';
import { Headphones } from 'lucide-react';

export function ContactHeroSection({ initialData, onSave }: { initialData?: any; onSave?: (data: any) => Promise<any> }) {
  const [badge, setBadge] = useState('24/7 Technical Support & Dispatch');
  const [heading, setHeading] = useState('Contact Lubricon Specialities India');
  const [description, setDescription] = useState(
    'Speak with our lubrication specialists, request on-site oil analysis, or submit institutional tenders and wholesale supply inquiries.'
  );
  const [helpline, setHelpline] = useState('1800 569 6363');
  const [email, setEmail] = useState('info@lubricon.in');
  const [address, setAddress] = useState('Lubricon Specialities India, Industrial Area, Haryana / Delhi NCR, India');
  const [images, setImages] = useState<(File | string | null)[]>(['/images/contact-hero.jpg']);
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
      const imageStr = typeof firstImg === 'string' ? firstImg : '/images/contact-hero.jpg';

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
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Headphones size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Contact Hero & Direct Channels</h2>
            <p className="text-xs text-gray-500">Live banner text, Australian engineer spotlight image, and toll-free helpline.</p>
          </div>
        </div>
        <SaveButton onClick={handleSave} loading={loading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
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
    </div>
  );
}
