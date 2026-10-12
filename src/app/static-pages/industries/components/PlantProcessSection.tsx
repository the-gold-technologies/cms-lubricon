'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Milestone } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { SaveButton } from '@/components/SaveButton';

interface ProcessStepItem {
  step: string;
  title: string;
  tagline: string;
  icon: string;
  desc: string;
}

const ICON_OPTIONS = ['TestTube2', 'FileCheck2', 'Boxes', 'Truck', 'ShieldCheck', 'Cog'];

export function PlantProcessSection({
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
  const [steps, setSteps] = useState<ProcessStepItem[]>([]);

  useEffect(() => {
    if (initialData) {
      if (initialData.eyebrow) setEyebrow(initialData.eyebrow);
      if (initialData.heading) setHeading(initialData.heading);
      if (initialData.description) setDescription(initialData.description);

      const loadedSteps = initialData.steps;
      if (Array.isArray(loadedSteps)) {
        setSteps(loadedSteps);
      }
    }
  }, [initialData]);

  const handleStepChange = (index: number, field: keyof ProcessStepItem, val: string) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: val };
    setSteps(updated);
  };

  const handleAddStep = () => {
    const nextNum = (steps.length + 1).toString().padStart(2, '0');
    setSteps([
      ...steps,
      {
        step: nextNum,
        title: '',
        tagline: '',
        icon: 'TestTube2',
        desc: '',
      },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) {
      toast.error('At least one workflow step is required.');
      return;
    }
    setSteps(steps.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const payload = {
        eyebrow: eyebrow.trim(),
        heading: heading.trim(),
        description: description.trim(),
        steps,
      };

      const res = await fetch('/api/industries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'PlantProcessSection',
          content: payload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaved(true);
        toast.success('Plant Lubrication Workflow saved successfully');
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch {
      toast.error('Error saving Process section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6 transition-all">
      <SectionHeader
        title="5. Plant Lubrication Management Cycle"
        description="Configure the connected 01-04 workflow timeline (sampling, lab testing, SKU consolidation, emergency dispatch)."
        badge={`${steps.length} Steps`}
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
                placeholder="01-04 ENGINEERING WORKFLOW"
              />
              <InputField
                label="Section Heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="The Plant Lubrication Management Cycle"
              />
            </div>

            <TextAreaField
              label="Intro Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="From oil sampling to bulk barrel dispatch, our certified engineers..."
            />

            {/* Dynamic Step Cards (2 in a row) */}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#0C356A]">
                  <Milestone className="w-4 h-4 text-[#C86218]" />
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Workflow Step Cards ({steps.length})
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#C86218] hover:text-[#0C356A] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Step
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {steps.map((st, index) => (
                  <div
                    key={index}
                    className="p-5 bg-gray-50/80 rounded-2xl border border-gray-200/70 flex flex-col gap-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-full bg-[#0C356A] text-white text-xs font-black flex items-center justify-center shrink-0">
                        {st.step || index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(index)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all cursor-pointer"
                        title="Remove Step"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <InputField
                        label="Step Number"
                        value={st.step}
                        onChange={(e) => handleStepChange(index, 'step', e.target.value)}
                        placeholder="01"
                      />
                      <InputField
                        label="Tagline / Badge"
                        value={st.tagline}
                        onChange={(e) => handleStepChange(index, 'tagline', e.target.value)}
                        placeholder="Field Inspection"
                      />
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600">Icon</label>
                        <select
                          value={st.icon}
                          onChange={(e) => handleStepChange(index, 'icon', e.target.value)}
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
                      label="Step Title"
                      value={st.title}
                      onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                      placeholder="On-Site Oil Sampling"
                    />

                    <TextAreaField
                      label="Description"
                      value={st.desc}
                      onChange={(e) => handleStepChange(index, 'desc', e.target.value)}
                      rows={2}
                      placeholder="Our lubrication engineers draw hot operating oil samples..."
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
