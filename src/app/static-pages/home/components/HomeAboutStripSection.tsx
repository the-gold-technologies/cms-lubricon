'use client';

import React, { useState, useEffect } from 'react';
import { SaveButton } from '@/components/SaveButton';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { ImageUploadField } from '@/components/ImageUploadField';
import { StringListEditor } from '@/components/StringListEditor';
import { BookOpen, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface HomeAboutStripSectionProps {
  initialData?: {
    badgeText?: string;
    headline?: string;
    primaryParagraph?: string;
    secondaryParagraph?: string;
    keyBullets?: string[];
    primaryBtnText?: string;
    primaryBtnLink?: string;
    secondaryBtnText?: string;
    secondaryBtnLink?: string;
    photoImage?: string;
    badgeTitle?: string;
    badgeSubtitle?: string;
  };
  isOpen?: boolean;
  onToggle?: () => void;
}

export function HomeAboutStripSection({
  initialData,
  isOpen: controlledIsOpen,
  onToggle,
}: HomeAboutStripSectionProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));
  const [badgeText, setBadgeText] = useState('');
  const [headline, setHeadline] = useState('');
  const [primaryParagraph, setPrimaryParagraph] = useState('');
  const [secondaryParagraph, setSecondaryParagraph] = useState('');
  const [keyBullets, setKeyBullets] = useState<string[]>([]);
  const [primaryBtnText, setPrimaryBtnText] = useState('');
  const [primaryBtnLink, setPrimaryBtnLink] = useState('');
  const [secondaryBtnText, setSecondaryBtnText] = useState('');
  const [secondaryBtnLink, setSecondaryBtnLink] = useState('');
  const [photoImage, setPhotoImage] = useState('');
  const [badgeTitle, setBadgeTitle] = useState('');
  const [badgeSubtitle, setBadgeSubtitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.badgeText) setBadgeText(initialData.badgeText);
      if (initialData.headline) setHeadline(initialData.headline);
      if (initialData.primaryParagraph) setPrimaryParagraph(initialData.primaryParagraph);
      if (initialData.secondaryParagraph) setSecondaryParagraph(initialData.secondaryParagraph);
      if (initialData.keyBullets && Array.isArray(initialData.keyBullets))
        setKeyBullets(initialData.keyBullets);
      if (initialData.primaryBtnText) setPrimaryBtnText(initialData.primaryBtnText);
      if (initialData.primaryBtnLink) setPrimaryBtnLink(initialData.primaryBtnLink);
      if (initialData.secondaryBtnText) setSecondaryBtnText(initialData.secondaryBtnText);
      if (initialData.secondaryBtnLink) setSecondaryBtnLink(initialData.secondaryBtnLink);
      if (initialData.photoImage) setPhotoImage(initialData.photoImage);
      if (initialData.badgeTitle) setBadgeTitle(initialData.badgeTitle);
      if (initialData.badgeSubtitle) setBadgeSubtitle(initialData.badgeSubtitle);
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
          section: 'HomeAboutStrip',
          content: {
            badgeText,
            headline,
            primaryParagraph,
            secondaryParagraph,
            keyBullets,
            primaryBtnText,
            primaryBtnLink,
            secondaryBtnText,
            secondaryBtnLink,
            photoImage,
            badgeTitle,
            badgeSubtitle,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('About Lubricon Strip section saved successfully!');
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
      <div
        onClick={handleToggle}
        className="flex items-center justify-between pb-6 border-b border-zinc-100 cursor-pointer select-none group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#ffe000] text-black">
            <BookOpen className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900 tracking-tight">
              5. About Lubricon Narrative Strip
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
              Manage company introduction narrative, Australian tech bullet points, and framed
              facility photo.
            </p>
          </div>
        </div>
        <div
          className={`w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-[#ffe000] text-black' : ''}`}
        >
          <ChevronDown className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Tagline Badge"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
              />
              <InputField
                label="Main Headline *"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                required
              />
            </div>

            <TextAreaField
              label="Primary Narrative Paragraph"
              value={primaryParagraph}
              onChange={(e) => setPrimaryParagraph(e.target.value)}
              rows={3}
            />

            <TextAreaField
              label="Secondary Narrative Paragraph"
              value={secondaryParagraph}
              onChange={(e) => setSecondaryParagraph(e.target.value)}
              rows={3}
            />

            <StringListEditor
              label="Key Feature Bullets"
              items={keyBullets}
              onChange={setKeyBullets}
              placeholder="e.g. Australian Formulation Science"
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-200">
              <div className="sm:col-span-1">
                <ImageUploadField
                  label="Framed Profile Photo"
                  images={photoImage ? [photoImage] : []}
                  onImagesChange={(imgs) =>
                    setPhotoImage(typeof imgs[0] === 'string' ? imgs[0] : '')
                  }
                  maxImages={1}
                />
              </div>
              <div className="sm:col-span-2 space-y-3">
                <InputField
                  label="Floating Card Title"
                  value={badgeTitle}
                  onChange={(e) => setBadgeTitle(e.target.value)}
                />
                <InputField
                  label="Floating Card Subtitle"
                  value={badgeSubtitle}
                  onChange={(e) => setBadgeSubtitle(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <SaveButton loading={loading} label="Save About Strip" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
