'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, LayoutGrid } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { ImageUploadField } from '@/components/ImageUploadField';
import { SaveButton } from '@/components/SaveButton';
import { uploadFiles } from '@/lib/uploadHelpers';

interface Facility {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  desc: string;
  image: string;
  icon: string;
  badges: string[];
  _imageFile?: (File | string | null)[];
}

const ICON_OPTIONS = [
  'Warehouse',
  'Building2',
  'ShieldCheck',
  'Truck',
  'Factory',
  'Boxes',
  'Globe2',
];

const EMPTY_FACILITY = (): Facility => ({
  id: `facility-${Date.now()}`,
  title: '',
  subtitle: '',
  category: '',
  desc: '',
  image: '',
  icon: 'Warehouse',
  badges: ['', ''],
  _imageFile: [''],
});

export function AboutImageGallerySection({ initialData }: { initialData?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [eyebrow, setEyebrow] = useState('');
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [stockBadge, setStockBadge] = useState('');
  const [bannerEyebrow, setBannerEyebrow] = useState('');
  const [bannerHeading, setBannerHeading] = useState('');
  const [bannerDescription, setBannerDescription] = useState('');
  const [bannerButtonText, setBannerButtonText] = useState('');
  const [facilities, setFacilities] = useState<Facility[]>([]);

  useEffect(() => {
    if (initialData) {
      setEyebrow(initialData.eyebrow || '');
      setHeading(initialData.heading || '');
      setDescription(initialData.description || '');
      setStockBadge(initialData.stockBadge || '');
      setBannerEyebrow(initialData.bannerEyebrow || '');
      setBannerHeading(initialData.bannerHeading || '');
      setBannerDescription(initialData.bannerDescription || '');
      setBannerButtonText(initialData.bannerButtonText || '');
      setFacilities(
        (initialData.facilities || []).map((f: any) => ({
          ...f,
          _imageFile: [f.image || ''],
        }))
      );
    }
  }, [initialData]);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      // Upload any new facility images first
      const resolvedFacilities = await Promise.all(
        facilities.map(async (f) => {
          const imageFiles = f._imageFile || [f.image || ''];
          const valid = imageFiles.filter((x): x is File | string => !!x);
          let finalImage = f.image;
          if (valid.length > 0) {
            const [uploaded] = await uploadFiles(valid);
            if (uploaded) finalImage = uploaded;
          }
          const { _imageFile, ...rest } = f;
          return { ...rest, image: finalImage };
        })
      );

      const res = await fetch('/api/about-us', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'AboutImageGallerySection',
          content: {
            eyebrow: eyebrow.trim(),
            heading: heading.trim(),
            description: description.trim(),
            stockBadge: stockBadge.trim(),
            bannerEyebrow: bannerEyebrow.trim(),
            bannerHeading: bannerHeading.trim(),
            bannerDescription: bannerDescription.trim(),
            bannerButtonText: bannerButtonText.trim(),
            facilities: resolvedFacilities,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSaved(true);
        toast.success('Facilities gallery saved successfully');
        // Sync resolved URLs back into state
        setFacilities(resolvedFacilities.map((f) => ({ ...f, _imageFile: [f.image || ''] })));
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error saving');
    } finally {
      setLoading(false);
    }
  };

  const addFacility = () => setFacilities([...facilities, EMPTY_FACILITY()]);

  const removeFacility = (idx: number) => {
    if (facilities.length <= 1) {
      toast.error('At least one facility card is required.');
      return;
    }
    setFacilities(facilities.filter((_, i) => i !== idx));
  };

  const updateFacility = (idx: number, field: keyof Facility, val: any) => {
    const updated = [...facilities];
    updated[idx] = { ...updated[idx], [field]: val };
    setFacilities(updated);
  };

  const addBadge = (facilityIdx: number) => {
    const updated = [...facilities];
    updated[facilityIdx] = {
      ...updated[facilityIdx],
      badges: [...(updated[facilityIdx].badges || []), ''],
    };
    setFacilities(updated);
  };

  const removeBadge = (facilityIdx: number, badgeIdx: number) => {
    const updated = [...facilities];
    updated[facilityIdx] = {
      ...updated[facilityIdx],
      badges: updated[facilityIdx].badges.filter((_, i) => i !== badgeIdx),
    };
    setFacilities(updated);
  };

  const updateBadge = (facilityIdx: number, badgeIdx: number, val: string) => {
    const updated = [...facilities];
    const badges = [...updated[facilityIdx].badges];
    badges[badgeIdx] = val;
    updated[facilityIdx] = { ...updated[facilityIdx], badges };
    setFacilities(updated);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-4 transition-all">
      <SectionHeader
        title="5. Facilities & Image Gallery"
        description="Configure the infrastructure section header, bottom CTA banner, and all facility cards with image uploads."
        badge={`${facilities.length} Cards`}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />

      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-8 pt-4">
            {/* Section Header Fields */}
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Eyebrow Label"
                  value={eyebrow}
                  onChange={(e) => setEyebrow(e.target.value)}
                  placeholder="Infrastructure & Operations"
                />
                <InputField
                  label="Stock Badge Text"
                  value={stockBadge}
                  onChange={(e) => setStockBadge(e.target.value)}
                  placeholder="Over 500+ SKUs Stocked & Ready for Dispatch"
                />
              </div>
              <InputField
                label="Section Heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="Our Facilities & Operational Hubs"
              />
              <TextAreaField
                label="Section Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Take a visual tour inside Jai Deva Oil Co.'s modern logistics infrastructure…"
              />
            </div>

            {/* Bottom CTA Banner */}
            <div className="pt-6 border-t border-gray-100 flex flex-col gap-5">
              <div className="flex items-center gap-2 text-[#0C356A]">
                <LayoutGrid className="w-4 h-4 text-[#C86218]" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Bottom CTA Banner</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Banner Eyebrow"
                  value={bannerEyebrow}
                  onChange={(e) => setBannerEyebrow(e.target.value)}
                  placeholder="Pan-India Supply Reliability"
                />
                <InputField
                  label="Button Text"
                  value={bannerButtonText}
                  onChange={(e) => setBannerButtonText(e.target.value)}
                  placeholder="Schedule a Supply Consultation"
                />
              </div>
              <InputField
                label="Banner Heading"
                value={bannerHeading}
                onChange={(e) => setBannerHeading(e.target.value)}
                placeholder="Equipped for Bulk Industrial Deliveries…"
              />
              <TextAreaField
                label="Banner Description"
                value={bannerDescription}
                onChange={(e) => setBannerDescription(e.target.value)}
                rows={2}
                placeholder="Whether you need a single 210-liter barrel…"
              />
            </div>

            {/* Facility Cards */}
            <div className="pt-6 border-t border-gray-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Facility Cards ({facilities.length})
                </label>
                <button
                  type="button"
                  onClick={addFacility}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#C86218] hover:text-[#0C356A] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Facility
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {facilities.map((f, idx) => (
                  <div
                    key={f.id || idx}
                    className="p-5 bg-gray-50/80 rounded-2xl border border-gray-200/70 flex flex-col gap-4"
                  >
                    {/* Card header */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#C86218] uppercase tracking-widest">
                        {f.category || `Card ${idx + 1}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFacility(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all cursor-pointer"
                        title="Remove facility"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Image Upload */}
                    <ImageUploadField
                      label="Facility Image"
                      images={f._imageFile || [f.image || '']}
                      onImagesChange={(imgs) => updateFacility(idx, '_imageFile' as any, imgs)}
                      maxImages={1}
                      tooltip="Upload facility image (recommended: 800×600px). Uploaded to Cloudinary automatically on save."
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <InputField
                        label="Title"
                        value={f.title}
                        onChange={(e) => updateFacility(idx, 'title', e.target.value)}
                        placeholder="Central Logistics Depot"
                      />
                      <InputField
                        label="Subtitle"
                        value={f.subtitle}
                        onChange={(e) => updateFacility(idx, 'subtitle', e.target.value)}
                        placeholder="High-Capacity Storage"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField
                        label="Category"
                        value={f.category}
                        onChange={(e) => updateFacility(idx, 'category', e.target.value)}
                        placeholder="Warehousing & Inventory"
                      />
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600">Icon</label>
                        <select
                          value={f.icon}
                          onChange={(e) => updateFacility(idx, 'icon', e.target.value)}
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
                      value={f.desc}
                      onChange={(e) => updateFacility(idx, 'desc', e.target.value)}
                      rows={2}
                      placeholder="Covered, temperature-regulated depot…"
                    />

                    {/* Badges */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-gray-600">Badges</label>
                        <button
                          type="button"
                          onClick={() => addBadge(idx)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C86218] hover:text-[#0C356A] transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Badge
                        </button>
                      </div>
                      {(f.badges || []).map((badge, bIdx) => (
                        <div key={bIdx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={badge}
                            onChange={(e) => updateBadge(idx, bIdx, e.target.value)}
                            placeholder={`Badge ${bIdx + 1}`}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0C356A]/30"
                          />
                          <button
                            type="button"
                            onClick={() => removeBadge(idx, bIdx)}
                            className="p-1 text-gray-300 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
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
