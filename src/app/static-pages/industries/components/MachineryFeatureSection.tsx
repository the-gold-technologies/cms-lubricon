'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Cog } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { ImageUploadField } from '@/components/ImageUploadField';
import { SaveButton } from '@/components/SaveButton';
import { uploadFiles } from '@/lib/uploadHelpers';

interface MachinerySystemItem {
  id: string;
  icon: string;
  title: string;
  spec: string;
  image: string;
  desc: string;
  oilHighlight: string;
  benefitsText: string;
}

const ICON_OPTIONS = ['Cog', 'Gauge', 'Wind', 'Disc', 'Wrench', 'Factory'];

export function MachineryFeatureSection({
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
  const [protectionLabel, setProtectionLabel] = useState('');
  const [formulationsLabel, setFormulationsLabel] = useState('');
  const [buttonText, setButtonText] = useState('');

  const [systems, setSystems] = useState<MachinerySystemItem[]>([]);
  const [systemImages, setSystemImages] = useState<Record<number, (File | string | null)[]>>({});

  useEffect(() => {
    if (initialData) {
      if (initialData.eyebrow) setEyebrow(initialData.eyebrow);
      if (initialData.heading) setHeading(initialData.heading);
      if (initialData.description) setDescription(initialData.description);
      if (initialData.protectionLabel) setProtectionLabel(initialData.protectionLabel);
      if (initialData.formulationsLabel) setFormulationsLabel(initialData.formulationsLabel);
      if (initialData.buttonText) setButtonText(initialData.buttonText);

      const loadedSystems = initialData.systems;
      if (Array.isArray(loadedSystems)) {
        const formatted: MachinerySystemItem[] = loadedSystems.map((sys: any) => ({
          id: sys.id || '',
          icon: typeof sys.icon === 'string' ? sys.icon : 'Cog',
          title: sys.title || '',
          spec: sys.spec || '',
          image: sys.image || '',
          desc: sys.desc || '',
          oilHighlight: sys.oilHighlight || '',
          benefitsText: Array.isArray(sys.benefits)
            ? sys.benefits.join('\n')
            : sys.benefitsText || '',
        }));

        setSystems(formatted);
        const imgMap: Record<number, (File | string | null)[]> = {};
        formatted.forEach((item, idx) => {
          if (item.image) imgMap[idx] = [item.image];
        });
        setSystemImages(imgMap);
      }
    }
  }, [initialData]);

  const handleSystemChange = (index: number, field: keyof MachinerySystemItem, val: string) => {
    const updated = [...systems];
    updated[index] = { ...updated[index], [field]: val };
    setSystems(updated);
  };

  const handleImageChange = (index: number, newImgs: (File | string | null)[]) => {
    setSystemImages((prev) => ({ ...prev, [index]: newImgs }));
  };

  const handleAddSystem = () => {
    const newIdx = systems.length;
    setSystems([
      ...systems,
      {
        id: `system-${Date.now()}`,
        icon: 'Cog',
        title: '',
        spec: '',
        image: '',
        desc: '',
        oilHighlight: '',
        benefitsText: '',
      },
    ]);
    setSystemImages((prev) => ({ ...prev, [newIdx]: [''] }));
  };

  const handleRemoveSystem = (index: number) => {
    if (systems.length <= 1) {
      toast.error('At least one machinery system is required.');
      return;
    }
    setSystems(systems.filter((_, idx) => idx !== index));
    const newImgMap: Record<number, (File | string | null)[]> = {};
    let cursor = 0;
    systems.forEach((_, i) => {
      if (i !== index) {
        if (systemImages[i]) newImgMap[cursor] = systemImages[i];
        cursor++;
      }
    });
    setSystemImages(newImgMap);
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const updatedSystems = await Promise.all(
        systems.map(async (sys, idx) => {
          const imgs = (systemImages[idx] || []).filter((im): im is File | string => !!im);
          let finalImg = sys.image || '';
          if (imgs.length > 0) {
            const [uploaded] = await uploadFiles(imgs);
            if (uploaded) finalImg = uploaded;
          }

          const benefitsArray = sys.benefitsText
            .split('\n')
            .map((b) => b.trim())
            .filter(Boolean);

          return {
            id: sys.id || sys.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            icon: sys.icon || 'Cog',
            title: sys.title.trim(),
            spec: sys.spec.trim(),
            image: finalImg,
            desc: sys.desc.trim(),
            oilHighlight: sys.oilHighlight.trim(),
            benefits: benefitsArray,
          };
        })
      );

      const payload = {
        eyebrow: eyebrow.trim(),
        heading: heading.trim(),
        description: description.trim(),
        protectionLabel: protectionLabel.trim(),
        formulationsLabel: formulationsLabel.trim(),
        buttonText: buttonText.trim(),
        systems: updatedSystems,
      };

      const res = await fetch('/api/industries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'MachineryFeatureSection',
          content: payload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaved(true);
        toast.success('Critical Plant Machinery section saved successfully');
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch {
      toast.error('Error saving Machinery section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6 transition-all">
      <SectionHeader
        title="4. Critical Plant Machinery Deep-Dive"
        description="Configure tabbed machinery systems (Gearboxes, Hydraulics, Turbines, Compressors) with high-res photography and specifications."
        badge={`${systems.length} Systems`}
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
                placeholder="CRITICAL EQUIPMENT DEEP-DIVE"
              />
              <InputField
                label="Section Heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="Engineered For the Most Demanding Plant Systems"
              />
            </div>

            <TextAreaField
              label="Intro Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="High-load industrial systems demand specialized fluid formulations..."
            />

            {/* Feature Box Labels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 bg-gray-50/70 rounded-2xl border border-gray-100">
              <InputField
                label="Protection Profile Label"
                value={protectionLabel}
                onChange={(e) => setProtectionLabel(e.target.value)}
                placeholder="Machinery Protection Profile"
              />
              <InputField
                label="Equivalent Formulations Label"
                value={formulationsLabel}
                onChange={(e) => setFormulationsLabel(e.target.value)}
                placeholder="Equivalent Industrial Formulations:"
              />
              <InputField
                label="Action Button Text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="Request Spec Sheet & Quote"
              />
            </div>

            {/* Dynamic Machinery Cards (2 in a row) */}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#0C356A]">
                  <Cog className="w-4 h-4 text-[#C86218]" />
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Machinery System Cards ({systems.length})
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleAddSystem}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#C86218] hover:text-[#0C356A] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add System
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {systems.map((sys, index) => (
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
                        onClick={() => handleRemoveSystem(index)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all cursor-pointer"
                        title="Remove System"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <InputField
                        label="System Title"
                        value={sys.title}
                        onChange={(e) => handleSystemChange(index, 'title', e.target.value)}
                        placeholder="Heavy Industrial Gearboxes"
                      />
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600">Icon</label>
                        <select
                          value={sys.icon}
                          onChange={(e) => handleSystemChange(index, 'icon', e.target.value)}
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

                    <div className="grid grid-cols-2 gap-3">
                      <InputField
                        label="Specifications & Standards"
                        value={sys.spec}
                        onChange={(e) => handleSystemChange(index, 'spec', e.target.value)}
                        placeholder="ISO VG 150 to 680 • FVA 54 Certified"
                      />
                      <InputField
                        label="Recommended Lubricants"
                        value={sys.oilHighlight}
                        onChange={(e) => handleSystemChange(index, 'oilHighlight', e.target.value)}
                        placeholder="HP Parthan EP / Mobilgear 600 XP"
                      />
                    </div>

                    <TextAreaField
                      label="Description"
                      value={sys.desc}
                      onChange={(e) => handleSystemChange(index, 'desc', e.target.value)}
                      rows={2}
                      placeholder="Formulated with sulfur-phosphorus EP chemistry..."
                    />

                    <TextAreaField
                      label="Benefits & Approvals (One per line)"
                      value={sys.benefitsText}
                      onChange={(e) => handleSystemChange(index, 'benefitsText', e.target.value)}
                      rows={3}
                      placeholder="Zero micropitting under extreme shock loads&#10;Superior demulsibility against mill water ingress&#10;Flender, David Brown & Danieli approved"
                    />

                    <ImageUploadField
                      label="Equipment Photo"
                      images={systemImages[index] || (sys.image ? [sys.image] : [''])}
                      onImagesChange={(imgs) => handleImageChange(index, imgs)}
                      maxImages={1}
                      tooltip="Upload clear machinery or gearbox photo."
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
