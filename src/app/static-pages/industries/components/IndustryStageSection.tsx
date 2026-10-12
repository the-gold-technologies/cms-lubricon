'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Factory } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { ImageUploadField } from '@/components/ImageUploadField';
import { SaveButton } from '@/components/SaveButton';
import { uploadFiles } from '@/lib/uploadHelpers';

interface SectorStageCMSItem {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  plantImage: string;
  oilImage: string;
  headline: string;
  promise: string;
  operatingCondition: string;
  equipmentText: string;
  productName: string;
  productGrade: string;
  productOem: string;
  productHighlight: string;
}

const ICON_OPTIONS = [
  'Factory',
  'Building2',
  'Zap',
  'Car',
  'UtensilsCrossed',
  'Shirt',
  'FileText',
  'Wrench',
  'Cog',
];

export function IndustryStageSection({
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
  const [selectorHint, setSelectorHint] = useState('');
  const [promiseLabel, setPromiseLabel] = useState('');
  const [productBadge, setProductBadge] = useState('');
  const [recommendedLabel, setRecommendedLabel] = useState('');
  const [oemPrefix, setOemPrefix] = useState('');
  const [buttonText, setButtonText] = useState('');

  const [sectors, setSectors] = useState<SectorStageCMSItem[]>([]);
  const [sectorImages, setSectorImages] = useState<Record<number, (File | string | null)[]>>({});

  useEffect(() => {
    if (initialData) {
      if (initialData.eyebrow) setEyebrow(initialData.eyebrow);
      if (initialData.heading) setHeading(initialData.heading);
      if (initialData.description) setDescription(initialData.description);
      if (initialData.selectorHint) setSelectorHint(initialData.selectorHint);
      if (initialData.promiseLabel) setPromiseLabel(initialData.promiseLabel);
      if (initialData.productBadge) setProductBadge(initialData.productBadge);
      if (initialData.recommendedLabel) setRecommendedLabel(initialData.recommendedLabel);
      if (initialData.oemPrefix) setOemPrefix(initialData.oemPrefix);
      if (initialData.buttonText) setButtonText(initialData.buttonText);

      const loadedSectors = initialData.sectors;
      if (Array.isArray(loadedSectors)) {
        const formatted: SectorStageCMSItem[] = loadedSectors.map((s: any) => ({
          id: s.id || '',
          name: s.name || '',
          shortName: s.shortName || '',
          icon: typeof s.icon === 'string' ? s.icon : 'Factory',
          plantImage: s.plantImage || '',
          oilImage: s.oilImage || '',
          headline: s.headline || '',
          promise: s.promise || '',
          operatingCondition: s.operatingCondition || '',
          equipmentText: Array.isArray(s.equipment)
            ? s.equipment.join(', ')
            : s.equipmentText || '',
          productName: s.recommendedProduct?.name || s.productName || '',
          productGrade: s.recommendedProduct?.grade || s.productGrade || '',
          productOem: s.recommendedProduct?.oemMatch || s.productOem || '',
          productHighlight: s.recommendedProduct?.highlight || s.productHighlight || '',
        }));

        setSectors(formatted);
        const imgMap: Record<number, (File | string | null)[]> = {};
        formatted.forEach((item, idx) => {
          if (item.plantImage) imgMap[idx] = [item.plantImage];
        });
        setSectorImages(imgMap);
      }
    }
  }, [initialData]);

  const handleSectorChange = (index: number, field: keyof SectorStageCMSItem, val: string) => {
    const updated = [...sectors];
    updated[index] = { ...updated[index], [field]: val };
    setSectors(updated);
  };

  const handleImageChange = (index: number, newImgs: (File | string | null)[]) => {
    setSectorImages((prev) => ({ ...prev, [index]: newImgs }));
  };

  const handleAddSector = () => {
    const newIdx = sectors.length;
    setSectors([
      ...sectors,
      {
        id: `sector-${Date.now()}`,
        name: '',
        shortName: '',
        icon: 'Factory',
        plantImage: '',
        oilImage: '',
        headline: '',
        promise: '',
        operatingCondition: '',
        equipmentText: '',
        productName: '',
        productGrade: '',
        productOem: '',
        productHighlight: '',
      },
    ]);
    setSectorImages((prev) => ({ ...prev, [newIdx]: [''] }));
  };

  const handleRemoveSector = (index: number) => {
    if (sectors.length <= 1) {
      toast.error('At least one industry sector is required.');
      return;
    }
    setSectors(sectors.filter((_, idx) => idx !== index));
    const newImgMap: Record<number, (File | string | null)[]> = {};
    let cursor = 0;
    sectors.forEach((_, i) => {
      if (i !== index) {
        if (sectorImages[i]) newImgMap[cursor] = sectorImages[i];
        cursor++;
      }
    });
    setSectorImages(newImgMap);
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const updatedSectors = await Promise.all(
        sectors.map(async (sec, idx) => {
          const imgs = (sectorImages[idx] || []).filter((im): im is File | string => !!im);
          let finalImg = sec.plantImage || '';
          if (imgs.length > 0) {
            const [uploaded] = await uploadFiles(imgs);
            if (uploaded) finalImg = uploaded;
          }

          const equipmentArray = sec.equipmentText
            .split(',')
            .map((e) => e.trim())
            .filter(Boolean);

          return {
            id: sec.id || sec.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            name: sec.name.trim(),
            shortName: sec.shortName.trim() || sec.name.trim(),
            icon: sec.icon || 'Factory',
            plantImage: finalImg,
            oilImage: sec.oilImage || '',
            headline: sec.headline.trim(),
            promise: sec.promise.trim(),
            operatingCondition: sec.operatingCondition.trim(),
            equipment: equipmentArray,
            recommendedProduct: {
              name: sec.productName.trim(),
              grade: sec.productGrade.trim(),
              oemMatch: sec.productOem.trim(),
              highlight: sec.productHighlight.trim(),
            },
          };
        })
      );

      const payload = {
        eyebrow: eyebrow.trim(),
        heading: heading.trim(),
        description: description.trim(),
        selectorHint: selectorHint.trim() || 'Select a sector to explore',
        promiseLabel: promiseLabel.trim() || 'The Jai Deva Promise',
        productBadge: productBadge.trim() || 'Refinery Certified',
        recommendedLabel: recommendedLabel.trim() || 'Recommended Industrial Formulation',
        oemPrefix: oemPrefix.trim() || 'OEM Compliance:',
        buttonText: buttonText.trim() || 'Request Spec Sheet & Quote',
        sectors: updatedSectors,
      };

      const res = await fetch('/api/industries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'IndustryStageSection',
          content: payload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaved(true);
        toast.success('Sector Lubrication Stages saved successfully');
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch {
      toast.error('Error saving Industry Stage section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6 transition-all">
      <SectionHeader
        title="2. Interactive Industry Sectors"
        description="Configure industry tabs, plant operating challenges, machinery wear risks, and recommended product formulations."
        badge={`${sectors.length} Sectors`}
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
                placeholder="SECTOR LUBRICATION STAGES"
              />
              <InputField
                label="Section Heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="Application-Matched Formulations for High-Load Machinery"
              />
            </div>

            <TextAreaField
              label="Intro Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Select a sector below to explore operating conditions, machinery wear risks..."
            />

            {/* Dynamic Sector Cards (2 in a row) */}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#0C356A]">
                  <Factory className="w-4 h-4 text-[#C86218]" />
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Sector Stage Profiles ({sectors.length})
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleAddSector}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#C86218] hover:text-[#0C356A] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Sector
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {sectors.map((sec, index) => (
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
                        onClick={() => handleRemoveSector(index)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all cursor-pointer"
                        title="Remove Sector"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <InputField
                        label="Sector Name"
                        value={sec.name}
                        onChange={(e) => handleSectorChange(index, 'name', e.target.value)}
                        placeholder="Steel & Hot Rolling Mills"
                      />
                      <InputField
                        label="Short Tab Label"
                        value={sec.shortName}
                        onChange={(e) => handleSectorChange(index, 'shortName', e.target.value)}
                        placeholder="Steel Mills"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600">Icon</label>
                        <select
                          value={sec.icon}
                          onChange={(e) => handleSectorChange(index, 'icon', e.target.value)}
                          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0C356A]/20"
                        >
                          {ICON_OPTIONS.map((ic) => (
                            <option key={ic} value={ic}>
                              {ic}
                            </option>
                          ))}
                        </select>
                      </div>
                      <InputField
                        label="Headline"
                        value={sec.headline}
                        onChange={(e) => handleSectorChange(index, 'headline', e.target.value)}
                        placeholder="Extreme Shock Loads & Descaling Water Ingress"
                      />
                    </div>

                    <InputField
                      label="Efficiency Promise (Less You Burn...)"
                      value={sec.promise}
                      onChange={(e) => handleSectorChange(index, 'promise', e.target.value)}
                      placeholder="e.g. Cuts journal bearing wear by 42%..."
                    />

                    <TextAreaField
                      label="Operating Condition & Environment"
                      value={sec.operatingCondition}
                      onChange={(e) =>
                        handleSectorChange(index, 'operatingCondition', e.target.value)
                      }
                      rows={2}
                      placeholder="Describe temperatures, moisture, dust..."
                    />

                    <InputField
                      label="Equipment Handled (Comma-separated)"
                      value={sec.equipmentText}
                      onChange={(e) => handleSectorChange(index, 'equipmentText', e.target.value)}
                      placeholder="Rolling Stands, Chock Bearings, Pinion Gearboxes"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <InputField
                        label="Recommended Product"
                        value={sec.productName}
                        onChange={(e) => handleSectorChange(index, 'productName', e.target.value)}
                        placeholder="HP Parthan EP / Mobilgear 600 XP"
                      />
                      <InputField
                        label="Viscosity / Grade"
                        value={sec.productGrade}
                        onChange={(e) => handleSectorChange(index, 'productGrade', e.target.value)}
                        placeholder="ISO VG 320 / 460"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <InputField
                        label="OEM / Spec Match"
                        value={sec.productOem}
                        onChange={(e) => handleSectorChange(index, 'productOem', e.target.value)}
                        placeholder="DIN 51517-3 (CLP), FVA 54"
                      />
                      <InputField
                        label="Highlight Benefit"
                        value={sec.productHighlight}
                        onChange={(e) =>
                          handleSectorChange(index, 'productHighlight', e.target.value)
                        }
                        placeholder="Rapid water demulsibility"
                      />
                    </div>

                    <InputField
                      label="Spotlight Lubricant Image URL"
                      value={sec.oilImage}
                      onChange={(e) => handleSectorChange(index, 'oilImage', e.target.value)}
                      placeholder="https://res.cloudinary.com/.../industrial-gear-oil.jpg"
                    />
                    <ImageUploadField
                      label="Plant / Factory Photo"
                      images={sectorImages[index] || (sec.plantImage ? [sec.plantImage] : [''])}
                      onImagesChange={(imgs) => handleImageChange(index, imgs)}
                      maxImages={1}
                      tooltip="Upload high-res factory operating environment photo."
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
