'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Award } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { SaveButton } from '@/components/SaveButton';

interface ImpactPillarItem {
  metric: string;
  title: string;
  desc: string;
  icon: string;
}

const ICON_OPTIONS = [
  'ThermometerSnowflake',
  'Clock',
  'TrendingDown',
  'ShieldCheck',
  'Award',
  'Sparkles',
  'Zap',
];

export function LessYouBurnImpactSection({
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
  const [subtitle, setSubtitle] = useState('');
  const [pillars, setPillars] = useState<ImpactPillarItem[]>([]);

  useEffect(() => {
    if (initialData) {
      if (initialData.badge) setBadge(initialData.badge);
      if (initialData.heading) setHeading(initialData.heading);
      if (initialData.subtitle) setSubtitle(initialData.subtitle);

      const loadedPillars = initialData.pillars;
      if (Array.isArray(loadedPillars)) {
        setPillars(loadedPillars);
      }
    }
  }, [initialData]);

  const handlePillarChange = (index: number, field: keyof ImpactPillarItem, val: string) => {
    const updated = [...pillars];
    updated[index] = { ...updated[index], [field]: val };
    setPillars(updated);
  };

  const handleAddPillar = () => {
    setPillars([
      ...pillars,
      {
        metric: '',
        title: '',
        desc: '',
        icon: 'TrendingDown',
      },
    ]);
  };

  const handleRemovePillar = (index: number) => {
    if (pillars.length <= 1) {
      toast.error('At least one impact metric is required.');
      return;
    }
    setPillars(pillars.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const payload = {
        badge: badge.trim(),
        heading: heading.trim(),
        subtitle: subtitle.trim(),
        pillars,
      };

      const res = await fetch('/api/industries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'LessYouBurnImpactSection',
          content: payload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaved(true);
        toast.success('Impact & Efficiency metrics saved successfully');
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch {
      toast.error('Error saving Impact section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6 transition-all">
      <SectionHeader
        title="3. 'Less You Burn' Impact & Metrics Strip"
        description="Configure the high-visibility metrics strip showcasing sump temperature drops, extended drain intervals, and TCO reduction."
        badge={`${pillars.length} Metrics`}
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
                label="Eyebrow Badge"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="The Jai Deva Operating Standard"
              />
              <InputField
                label="Headline"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder='"Less You Burn, The More You Earn"'
              />
            </div>

            <TextAreaField
              label="Tagline / Subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              rows={2}
              placeholder="How optimal viscosity control, high thermal stability, and refinery-direct lubricant purity transform plant profitability."
            />

            {/* Dynamic Metric Pillars (2 in a row) */}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#0C356A]">
                  <Award className="w-4 h-4 text-[#C86218]" />
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Impact Metric Cards ({pillars.length})
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleAddPillar}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#C86218] hover:text-[#0C356A] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Metric
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
                        title="Remove Metric"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <InputField
                        label="Metric Stat"
                        value={pillar.metric}
                        onChange={(e) => handlePillarChange(index, 'metric', e.target.value)}
                        placeholder="-15°C to -22°C"
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

                    <InputField
                      label="Title"
                      value={pillar.title}
                      onChange={(e) => handlePillarChange(index, 'title', e.target.value)}
                      placeholder="Reduced Sump Operating Heat"
                    />

                    <TextAreaField
                      label="Description"
                      value={pillar.desc}
                      onChange={(e) => handlePillarChange(index, 'desc', e.target.value)}
                      rows={2}
                      placeholder="High-VI synthetic base stocks cut internal fluid shear..."
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
