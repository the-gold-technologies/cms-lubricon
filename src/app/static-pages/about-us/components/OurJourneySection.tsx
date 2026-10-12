'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Clock } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { SaveButton } from '@/components/SaveButton';

interface Milestone {
  year: string;
  icon: string;
  title: string;
  description: string;
}

const ICON_OPTIONS = [
  'Calendar',
  'Layers',
  'Boxes',
  'ShieldCheck',
  'Users',
  'Clock',
  'Truck',
  'Factory',
];

const EMPTY_MILESTONE: Milestone = { year: '', icon: 'Calendar', title: '', description: '' };

export function OurJourneySection({ initialData }: { initialData?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [eyebrow, setEyebrow] = useState('');
  const [heading, setHeading] = useState('');
  const [intro, setIntro] = useState('');
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    if (initialData) {
      setEyebrow(initialData.eyebrow || '');
      setHeading(initialData.heading || '');
      setIntro(initialData.intro || '');
      setMilestones(initialData.milestones || []);
    }
  }, [initialData]);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch('/api/about-us', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'OurJourneySection',
          content: {
            eyebrow: eyebrow.trim(),
            heading: heading.trim(),
            intro: intro.trim(),
            milestones,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSaved(true);
        toast.success('Journey timeline saved successfully');
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error saving journey');
    } finally {
      setLoading(false);
    }
  };

  const addMilestone = () => setMilestones([...milestones, { ...EMPTY_MILESTONE }]);

  const removeMilestone = (idx: number) => {
    if (milestones.length <= 1) {
      toast.error('At least one milestone is required.');
      return;
    }
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const updateMilestone = (idx: number, field: keyof Milestone, val: string) => {
    const updated = [...milestones];
    updated[idx] = { ...updated[idx], [field]: val };
    setMilestones(updated);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-4 transition-all">
      <SectionHeader
        title="4. Our Journey"
        description="Set the timeline heading, intro text, and edit each milestone card."
        badge={`${milestones.length} Milestones`}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />

      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-6 pt-4">
            {/* Header fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <InputField
                label="Eyebrow Label"
                value={eyebrow}
                onChange={(e) => setEyebrow(e.target.value)}
                placeholder="Our Journey"
              />
              <div className="md:col-span-2">
                <InputField
                  label="Section Heading"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  placeholder="Building Trust Since 2007"
                />
              </div>
            </div>

            <TextAreaField
              label="Intro Paragraph"
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              rows={2}
              placeholder="Every milestone below reflects a step in how we grew…"
            />

            {/* Milestones */}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#0C356A]">
                  <Clock className="w-4 h-4 text-[#C86218]" />
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Milestones ({milestones.length})
                  </label>
                </div>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#C86218] hover:text-[#0C356A] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Milestone
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-gray-50/80 rounded-2xl border border-gray-200/70 flex flex-col gap-4"
                  >
                    {/* Milestone header row */}
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-full bg-[#0C356A] text-white text-xs font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMilestone(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all cursor-pointer"
                        title="Remove milestone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <InputField
                        label="Year / Period"
                        value={m.year}
                        onChange={(e) => updateMilestone(idx, 'year', e.target.value)}
                        placeholder="2007"
                      />
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600">Icon</label>
                        <select
                          value={m.icon}
                          onChange={(e) => updateMilestone(idx, 'icon', e.target.value)}
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
                      value={m.title}
                      onChange={(e) => updateMilestone(idx, 'title', e.target.value)}
                      placeholder="Company Founded"
                    />

                    <TextAreaField
                      label="Description"
                      value={m.description}
                      onChange={(e) => updateMilestone(idx, 'description', e.target.value)}
                      rows={2}
                      placeholder="Brief summary of this milestone…"
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
