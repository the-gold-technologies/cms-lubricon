'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { ImageUploadField } from '@/components/ImageUploadField';
import { SaveButton } from '@/components/SaveButton';
import { uploadFiles } from '@/lib/uploadHelpers';

export function IndustriesHeroSection({
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

  const [badge, setBadge] = useState('');
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [ctaPrimaryText, setCtaPrimaryText] = useState('');
  const [ctaPrimaryUrl, setCtaPrimaryUrl] = useState('');
  const [ctaSecondaryText, setCtaSecondaryText] = useState('');
  const [images, setImages] = useState<(File | string | null)[]>(['']);
  const [stats, setStats] = useState<{ value: string; label: string; highlight?: boolean }[]>([]);

  useEffect(() => {
    if (initialData) {
      if (initialData.badge) setBadge(initialData.badge);
      if (initialData.heading) setHeading(initialData.heading);
      if (initialData.description) setDescription(initialData.description);
      if (initialData.ctaPrimaryText) setCtaPrimaryText(initialData.ctaPrimaryText);
      if (initialData.ctaPrimaryUrl) setCtaPrimaryUrl(initialData.ctaPrimaryUrl);
      if (initialData.ctaSecondaryText) setCtaSecondaryText(initialData.ctaSecondaryText);

      const banner = initialData.bannerImage;
      if (banner) setImages([banner]);

      if (Array.isArray(initialData.stats)) {
        setStats(initialData.stats);
      }
    }
  }, [initialData]);

  const handleStatChange = (index: number, field: string, val: any) => {
    setStats((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleAddStat = () => {
    setStats((prev) => [...prev, { value: '', label: '', highlight: false }]);
  };

  const handleRemoveStat = (index: number) => {
    setStats((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const validImages = images.filter((img): img is File | string => !!img);
      let bannerImageUrl = '';
      if (validImages.length > 0) {
        const [uploaded] = await uploadFiles(validImages);
        bannerImageUrl = uploaded || '';
      }

      const payload = {
        badge: badge.trim(),
        heading: heading.trim(),
        description: description.trim(),
        ctaPrimaryText: ctaPrimaryText.trim(),
        ctaPrimaryUrl: ctaPrimaryUrl.trim(),
        ctaSecondaryText: ctaSecondaryText.trim(),
        bannerImage: bannerImageUrl,
        stats: stats
          .filter((s) => s.value.trim() || s.label.trim())
          .map((s) => ({
            value: s.value.trim(),
            label: s.label.trim(),
            highlight: Boolean(s.highlight),
          })),
      };

      const res = await fetch('/api/industries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'IndustriesHero', content: payload }),
      });

      const json = await res.json();
      if (json.success) {
        setSaved(true);
        if (bannerImageUrl) setImages([bannerImageUrl]);
        toast.success('Industries Hero Banner saved successfully');
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch {
      toast.error('Error saving Industries Hero section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6 transition-all">
      <SectionHeader
        title="1. Industries Hero & Quick Metrics Band"
        description="Manage the main headline, tagline badge, introduction narrative, CTA buttons, background banner, and the 4 metric chips below."
        badge={images[0] ? 'Image Set' : 'No Image'}
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
                label="Authority / Badge Text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Jai Deva Oil Co. • Less You Burn, the More You Earn"
              />
              <InputField
                label="Hero Heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="Industrial Lubricants Engineered For Peak Efficiency."
              />
            </div>

            <TextAreaField
              label="Hero Introduction Paragraph"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Refinery-certified multi-brand oils, greases, and fluids tailored to minimize friction..."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <InputField
                label="Primary Button Text"
                value={ctaPrimaryText}
                onChange={(e) => setCtaPrimaryText(e.target.value)}
                placeholder="Explore Industries"
              />
              <InputField
                label="Primary Button Link / Anchor"
                value={ctaPrimaryUrl}
                onChange={(e) => setCtaPrimaryUrl(e.target.value)}
                placeholder="#sector-stage"
              />
              <InputField
                label="Secondary Button Text"
                value={ctaSecondaryText}
                onChange={(e) => setCtaSecondaryText(e.target.value)}
                placeholder="Request Plant Quote"
              />
            </div>

            <ImageUploadField
              label="Hero Background Banner Image"
              images={images}
              onImagesChange={setImages}
              maxImages={1}
              tooltip="Upload high-res industrial plant hero photo (recommended: 1920×720px)."
            />

            {/* Quick Metrics Band */}
            <div className="flex flex-col gap-4 border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    Quick Metrics Band (Stats Below Hero)
                  </h4>
                  <p className="text-xs text-gray-500">
                    Key proof metrics displayed in the white strip directly beneath the hero banner.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddStat}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#C86218] hover:text-[#0C356A] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Metric
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((st, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200/70 flex flex-col gap-2 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-gray-400">
                        Metric #{sIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStat(sIdx)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <InputField
                      label="Value"
                      value={st.value}
                      onChange={(e) => handleStatChange(sIdx, 'value', e.target.value)}
                      placeholder="e.g. 11+ Sectors"
                    />
                    <InputField
                      label="Label"
                      value={st.label}
                      onChange={(e) => handleStatChange(sIdx, 'label', e.target.value)}
                      placeholder="e.g. Heavy to Precision Plants"
                    />
                    <label className="flex items-center gap-2 text-xs text-gray-600 mt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(st.highlight)}
                        onChange={(e) => handleStatChange(sIdx, 'highlight', e.target.checked)}
                        className="rounded border-gray-300 text-[#C86218] focus:ring-[#C86218]"
                      />
                      <span>Highlight in Orange</span>
                    </label>
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
