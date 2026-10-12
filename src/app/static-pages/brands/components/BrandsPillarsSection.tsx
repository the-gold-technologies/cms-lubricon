'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, ShieldCheck } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { ImageUploadField } from '@/components/ImageUploadField';
import { SaveButton } from '@/components/SaveButton';
import { uploadFiles } from '@/lib/uploadHelpers';

interface PillarItem {
  title: string;
  description: string;
  icon: string;
}

const ICON_OPTIONS = [
  'Factory',
  'Wrench',
  'Truck',
  'ShieldCheck',
  'CheckCircle2',
  'Boxes',
  'Layers',
  'Award',
];

export function BrandsPillarsSection({
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

  const [eyebrow, setEyebrow] = useState('');
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');

  // Guarantee Side Card
  const [images, setImages] = useState<(File | string | null)[]>(['']);
  const [verifiedBadge, setVerifiedBadge] = useState('');
  const [guaranteeTitle, setGuaranteeTitle] = useState('');
  const [guaranteeTag, setGuaranteeTag] = useState('');
  const [guaranteeHeadline, setGuaranteeHeadline] = useState('');
  const [guaranteeDesc, setGuaranteeDesc] = useState('');

  const [pillars, setPillars] = useState<PillarItem[]>([]);

  useEffect(() => {
    if (initialData) {
      if (initialData.eyebrow) setEyebrow(initialData.eyebrow);
      if (initialData.heading) setHeading(initialData.heading);
      if (initialData.description) setDescription(initialData.description);

      const sideImg = initialData.image;
      if (sideImg) setImages([sideImg]);

      if (initialData.verifiedBadge) setVerifiedBadge(initialData.verifiedBadge);
      if (initialData.guaranteeTitle) setGuaranteeTitle(initialData.guaranteeTitle);
      if (initialData.guaranteeTag) setGuaranteeTag(initialData.guaranteeTag);
      if (initialData.guaranteeHeadline) setGuaranteeHeadline(initialData.guaranteeHeadline);
      if (initialData.guaranteeDesc) setGuaranteeDesc(initialData.guaranteeDesc);

      const loadedPillars = initialData.pillars;
      if (Array.isArray(loadedPillars)) {
        setPillars(loadedPillars);
      }
    }
  }, [initialData]);

  const handlePillarChange = (index: number, field: keyof PillarItem, val: string) => {
    const updated = [...pillars];
    updated[index] = { ...updated[index], [field]: val };
    setPillars(updated);
  };

  const handleAddPillar = () => {
    setPillars([...pillars, { title: '', description: '', icon: 'ShieldCheck' }]);
  };

  const handleRemovePillar = (index: number) => {
    if (pillars.length <= 1) {
      toast.error('At least one pillar is required.');
      return;
    }
    setPillars(pillars.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const validImages = images.filter((img): img is File | string => !!img);
      let sideImageUrl = '';
      if (validImages.length > 0) {
        const [uploaded] = await uploadFiles(validImages);
        sideImageUrl = uploaded || '';
      }

      const payload = {
        eyebrow: eyebrow.trim(),
        heading: heading.trim(),
        description: description.trim(),
        image: sideImageUrl,
        sideImage: sideImageUrl,
        verifiedBadge: verifiedBadge.trim(),
        guaranteeTitle: guaranteeTitle.trim(),
        guaranteeTag: guaranteeTag.trim(),
        guaranteeHeadline: guaranteeHeadline.trim(),
        guaranteeDesc: guaranteeDesc.trim(),
        pillars,
      };

      const res = await fetch('/api/brands', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'BrandsPillarsSection',
          content: payload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaved(true);
        if (sideImageUrl) setImages([sideImageUrl]);
        toast.success('Brand Value Pillars saved successfully');
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch {
      toast.error('Error saving Pillars section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6 transition-all">
      <SectionHeader
        title="3. Brand Value Pillars & Refinery Guarantee"
        description="Edit the core distribution pillars, side visual card, and refinery assurance certificate badge."
        badge={`${pillars.length} Pillars`}
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
                label="Eyebrow Subtitle"
                value={eyebrow}
                onChange={(e) => setEyebrow(e.target.value)}
                placeholder="ENGINEERING RELIABILITY"
              />
              <InputField
                label="Section Heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="STRONG BRANDS. BETTER OPERATIONS."
              />
            </div>

            <TextAreaField
              label="Intro Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="A trusted brand behind a lubricant isn't a formality — it's the difference between predictable maintenance..."
            />

            {/* Side Card & Guarantee Settings */}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Side Feature Showcase Card
              </label>

              <ImageUploadField
                label="Refinery / Barrel Staging Photo"
                images={images}
                onImagesChange={setImages}
                maxImages={1}
                tooltip="Upload side image (e.g. sealed barrels or refinery stock)."
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField
                  label="Floating Badge Text"
                  value={verifiedBadge}
                  onChange={(e) => setVerifiedBadge(e.target.value)}
                  placeholder="AUTHORIZED REFINERY STOCKS"
                />
                <InputField
                  label="Guarantee Badge Title"
                  value={guaranteeTitle}
                  onChange={(e) => setGuaranteeTitle(e.target.value)}
                  placeholder="REFINERY STOCK GUARANTEE"
                />
                <InputField
                  label="Viscosity / Specs Tag"
                  value={guaranteeTag}
                  onChange={(e) => setGuaranteeTag(e.target.value)}
                  placeholder="ISO VG 32 to 680"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Guarantee Headline"
                  value={guaranteeHeadline}
                  onChange={(e) => setGuaranteeHeadline(e.target.value)}
                  placeholder="Direct Factory-Sealed Distribution"
                />
                <InputField
                  label="Guarantee Summary"
                  value={guaranteeDesc}
                  onChange={(e) => setGuaranteeDesc(e.target.value)}
                  placeholder="Over 10,000+ barrels and lubricants buffered..."
                />
              </div>
            </div>

            {/* Dynamic Value Pillars (2 in a row) */}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#0C356A]">
                  <ShieldCheck className="w-4 h-4 text-[#C86218]" />
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Core Pillars ({pillars.length})
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleAddPillar}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#C86218] hover:text-[#0C356A] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Pillar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pillars.map((pillar, index) => (
                  <div
                    key={index}
                    className="p-5 bg-gray-50/80 rounded-2xl border border-gray-200/70 flex flex-col gap-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-full bg-[#0C356A] text-white text-xs font-black flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePillar(index)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all cursor-pointer"
                        title="Remove Pillar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <InputField
                        label="Pillar Title"
                        value={pillar.title}
                        onChange={(e) => handlePillarChange(index, 'title', e.target.value)}
                        placeholder="Refinery-Direct Authenticity"
                      />
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600">Icon</label>
                        <select
                          value={pillar.icon}
                          onChange={(e) => handlePillarChange(index, 'icon', e.target.value)}
                          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0C356A]/20"
                        >
                          {ICON_OPTIONS.map((ic) => (
                            <option key={ic} value={ic}>
                              {ic}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <TextAreaField
                      label="Description"
                      value={pillar.description}
                      onChange={(e) => handlePillarChange(index, 'description', e.target.value)}
                      rows={2}
                      placeholder="Summary of this pillar..."
                    />
                  </div>
                ))}
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
