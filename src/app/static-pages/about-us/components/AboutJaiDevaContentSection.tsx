'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { BookOpen, UserCheck } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { SaveButton } from '@/components/SaveButton';
import { ImageUploadField } from '@/components/ImageUploadField';
import { uploadFiles } from '@/lib/uploadHelpers';

export function AboutJaiDevaContentSection({ initialData }: { initialData?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [mainTitle, setMainTitle] = useState('');
  const [mentorSubHeader, setMentorSubHeader] = useState('');
  const [paragraphsText, setParagraphsText] = useState('');
  const [images, setImages] = useState<(File | string | null)[]>(['']);

  // Dynamic Founder Card & Badge Fields
  const [estBadge, setEstBadge] = useState('');
  const [founderRole, setFounderRole] = useState('');
  const [founderName, setFounderName] = useState('');
  const [founderNote, setFounderNote] = useState('');

  useEffect(() => {
    if (initialData) {
      setMainTitle(initialData.title || '');
      setMentorSubHeader(initialData.subtitle || '');
      setEstBadge(initialData.estBadge || '');
      setFounderRole(initialData.founderRole || '');
      setFounderName(initialData.founderName || '');
      setFounderNote(initialData.founderNote || '');

      if (initialData.image) {
        setImages([initialData.image]);
      }
      if (Array.isArray(initialData.paragraphs)) {
        setParagraphsText(initialData.paragraphs.join('\n\n'));
      } else if (typeof initialData.paragraphs === 'string') {
        setParagraphsText(initialData.paragraphs);
      }
    }
  }, [initialData]);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      let finalImageUrl = '';
      const validImages = images.filter((img): img is File | string => !!img);
      if (validImages.length > 0) {
        const [uploadedUrl] = await uploadFiles(validImages);
        if (uploadedUrl) finalImageUrl = uploadedUrl;
      }

      const paragraphs = paragraphsText
        .split('\n\n')
        .map((p) => p.trim())
        .filter(Boolean);

      const payload = {
        title: mainTitle.trim(),
        subtitle: mentorSubHeader.trim(),
        paragraphs,
        image: finalImageUrl,
        estBadge: estBadge.trim(),
        founderRole: founderRole.trim(),
        founderName: founderName.trim(),
        founderNote: founderNote.trim(),
      };

      const res = await fetch('/api/about-us', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'AboutJaiDevaContent',
          content: payload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaved(true);
        toast.success('About Jai Deva story & mentor details saved successfully');
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch {
      toast.error('Error saving about content');
    } finally {
      setLoading(false);
    }
  };

  const paragraphCount = paragraphsText
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean).length;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6 transition-all">
      <SectionHeader
        title="2. Company Story & Mentor Profile"
        description="Edit the company background, mentor leadership, founder photo, and narrative paragraphs."
        badge={`${paragraphCount} Paragraphs`}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />

      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-8 pt-4">
            {/* Header Titles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Section Heading / Title"
                value={mainTitle}
                onChange={(e) => setMainTitle(e.target.value)}
                placeholder="e.g. ABOUT JAI DEVA OIL CO."
              />
              <InputField
                label="Mentor / Leadership Sub-header"
                value={mentorSubHeader}
                onChange={(e) => setMentorSubHeader(e.target.value)}
                placeholder="e.g. Mr. Mayank Goyal – Mentor & Proprietor, Jai Deva Oil Co."
              />
            </div>

            {/* Paragraphs */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[#0C356A]">
                <BookOpen className="w-4 h-4 text-[#C86218]" />
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Company Background & Mentorship Narrative
                </label>
              </div>
              <TextAreaField
                label="Story Paragraphs (Separate distinct paragraphs with a blank empty line)"
                value={paragraphsText}
                onChange={(e) => setParagraphsText(e.target.value)}
                rows={8}
                placeholder="Enter paragraph 1...&#10;&#10;Enter paragraph 2...&#10;&#10;Enter paragraph 3..."
              />
            </div>

            {/* Section Image */}
            <div>
              <ImageUploadField
                label="Founder / Mentor Photograph"
                images={images}
                onImagesChange={setImages}
                maxImages={1}
                tooltip="Upload photo of founder/mentor."
              />
            </div>

            {/* Dynamic Card & Badge Overlay Fields (Fully Connected to CMS) */}
            <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[#0C356A]">
                <UserCheck className="w-4 h-4 text-[#C86218]" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Photo Card Overlays &amp; Established Badge (CMS Driven)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputField
                  label="Established Badge"
                  value={estBadge}
                  onChange={(e) => setEstBadge(e.target.value)}
                  placeholder="e.g. Est. 2007"
                />
                <InputField
                  label="Leader Role / Eyebrow"
                  value={founderRole}
                  onChange={(e) => setFounderRole(e.target.value)}
                  placeholder="e.g. Mentor &amp; Proprietor"
                />
                <InputField
                  label="Leader Full Name"
                  value={founderName}
                  onChange={(e) => setFounderName(e.target.value)}
                  placeholder="e.g. Mr. Mayank Goyal"
                />
                <InputField
                  label="Leader Caption / Tagline"
                  value={founderNote}
                  onChange={(e) => setFounderNote(e.target.value)}
                  placeholder="e.g. Jai Deva Oil Co. — Trusted Lubricant Distribution"
                />
              </div>
            </div>

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
