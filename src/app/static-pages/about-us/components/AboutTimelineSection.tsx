'use client';

import React, { useState, useEffect } from 'react';
import { SectionHeader } from '@/components/SectionHeader';
import { SaveButton } from '@/components/SaveButton';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { Clock, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface MilestoneItem {
  year: string;
  title: string;
  description: string;
}

export function AboutTimelineSection({
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
  const [badge, setBadge] = useState('Our Journey');
  const [title, setTitle] = useState('Over a Decade of Industrial Excellence');
  const [subtitle, setSubtitle] = useState('The key milestones that built Lubricon into one of India’s most trusted specialty lubrication brands.');
  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    {
      year: '2014',
      title: 'Company Foundation',
      description: 'Lubricon Specialities India established with exclusive Australian formulation technology and licensing.',
    },
    {
      year: '2016',
      title: 'First Industrial Supply',
      description: 'Commenced commercial supply of heavy duty neat and soluble metalworking fluids to industrial manufacturers.',
    },
    {
      year: '2019',
      title: 'Pan-India Distribution',
      description: 'Expanded direct warehouse distribution network across 15+ states with dedicated technical field support.',
    },
    {
      year: '2022',
      title: 'AdBlue DEF Compliance',
      description: 'Introduced ISO 22241-standard AdBlue AUS32 for India Euro 6 emission standards and clean transport.',
    },
    {
      year: '2024',
      title: '500+ Clients Milestone',
      description: 'Surpassed 500+ active enterprise clients across paper, steel, plastic injection, and fleet operations.',
    },
    {
      year: '2025',
      title: 'Next-Gen CK-4 Range',
      description: 'Rolled out latest API CK-4 and ACEA E9 low-SAPS high performance heavy diesel engine oils.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.badge !== undefined) setBadge(initialData.badge);
      if (initialData.title !== undefined) setTitle(initialData.title);
      if (initialData.subtitle !== undefined) setSubtitle(initialData.subtitle);
      if (Array.isArray(initialData.milestones)) setMilestones(initialData.milestones);
    }
  }, [initialData]);

  const handleMilestoneChange = (index: number, field: keyof MilestoneItem, val: string) => {
    setMilestones((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const addMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      { year: '2026', title: 'New Milestone', description: 'Milestone description.' },
    ]);
  };

  const removeMilestone = (index: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        badge,
        title,
        subtitle,
        milestones,
      };

      const res = await fetch('/api/about-us', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'AboutTimeline',
          content: payload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('About Timeline section saved successfully!');
      } else {
        toast.error(json.error || 'Failed to save About Timeline');
      }
    } catch {
      toast.error('Network error saving About Timeline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-4 transition-all">
      <SectionHeader
        title="5. Historical Timeline (Our Journey)"
        description="Live milestones: 2014 founding to 2025 next-gen releases."
        badge={milestones.length + ' Milestones'}
        isOpen={isOpen}
        onToggle={handleToggle}
      />

      <div
        className={"grid transition-all duration-300 ease-in-out " + (isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Badge Text" value={badge} onChange={(e) => setBadge(e.target.value)} />
              <InputField label="Section Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <div className="md:col-span-2">
                <TextAreaField label="Section Subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} rows={2} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Milestones ({milestones.length})</span>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg transition"
                >
                  <Plus size={14} /> Add Milestone
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {milestones.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeMilestone(idx)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                    <InputField
                      label="Year / Period"
                      value={m.year}
                      onChange={(e) => handleMilestoneChange(idx, 'year', e.target.value)}
                    />
                    <InputField
                      label="Milestone Title"
                      value={m.title}
                      onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                    />
                    <TextAreaField
                      label="Description"
                      value={m.description}
                      onChange={(e) => handleMilestoneChange(idx, 'description', e.target.value)}
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <SaveButton onClick={handleSave} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
