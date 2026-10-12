'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { SaveButton } from '@/components/SaveButton';

export interface SolutionStep {
  num: string;
  name: string;
  desc: string;
  icon?: string;
}

export interface MultiBrandSolutionsData {
  badge: string;
  title: string;
  titleHighlight: string;
  paragraph1: string;
  paragraph2: string;
  btnLabel: string;
  btnUrl: string;
  steps: SolutionStep[];
}

export const DEFAULT_SOLUTIONS_DATA: MultiBrandSolutionsData = {
  badge: '',
  title: '',
  titleHighlight: '',
  paragraph1: '',
  paragraph2: '',
  btnLabel: '',
  btnUrl: '',
  steps: [],
};

export function MultiBrandSolutionsSection({ initialData }: { initialData?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [data, setData] = useState<MultiBrandSolutionsData>(DEFAULT_SOLUTIONS_DATA);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialData) {
      const steps = Array.isArray(initialData.steps) ? initialData.steps : [];

      setData({
        badge: initialData.badge || '',
        title: initialData.title || '',
        titleHighlight: initialData.titleHighlight || '',
        paragraph1: initialData.paragraph1 || '',
        paragraph2: initialData.paragraph2 || '',
        btnLabel: initialData.btnLabel || '',
        btnUrl: initialData.btnUrl || '',
        steps,
      });

      const initExpanded: Record<string, boolean> = {};
      steps.forEach((_: any, index: number) => {
        initExpanded[`step-${index}`] = index === 0;
      });
      setExpandedIds(initExpanded);
    }
  }, [initialData]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddStep = () => {
    const nextNum = String(data.steps.length + 1);
    const newStep: SolutionStep = {
      num: nextNum,
      name: '',
      desc: '',
      icon: 'Search',
    };
    setData((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
    setExpandedIds((prev) => ({
      ...prev,
      [`step-${data.steps.length}`]: true,
    }));
    toast.success('New process step added');
  };

  const handleRemoveStep = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = data.steps.filter((_, i) => i !== idx);
    setData((prev) => ({ ...prev, steps: updated }));
    toast.success('Process step removed');
  };

  const handleStepChange = (idx: number, field: keyof SolutionStep, value: string) => {
    const updated = [...data.steps];
    updated[idx] = { ...updated[idx], [field]: value };
    setData((prev) => ({ ...prev, steps: updated }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const payload = {
        badge: data.badge,
        title: data.title,
        titleHighlight: data.titleHighlight,
        paragraph1: data.paragraph1,
        paragraph2: data.paragraph2,
        btnLabel: data.btnLabel,
        btnUrl: data.btnUrl,
        steps: data.steps,
      };

      const res = await fetch('/api/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'MultiBrandSolutionsSection',
          content: payload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaved(true);
        toast.success('Multi-Brand Solutions section saved successfully!');
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch {
      toast.error('Error saving Multi-Brand Solutions section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-4 transition-all">
        <SectionHeader
          title="Multi-Brand Solutions Section"
          description="Manage the multi-brand partner narrative, orange highlighted headline, and 4-step process timeline cards."
          badge={`${data.steps.length} Step${data.steps.length === 1 ? '' : 's'}`}
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-6 pt-4">
              {/* Badge & Title */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <InputField
                  label="Section Badge / Tag"
                  value={data.badge}
                  onChange={(e) => setData((prev) => ({ ...prev, badge: e.target.value }))}
                  placeholder="MULTI-BRAND LUBRICANT SOLUTIONS"
                  helperText="Top uppercase badge"
                />

                <InputField
                  label="Headline (Main Text)"
                  value={data.title}
                  onChange={(e) => setData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Multiple Brands."
                  helperText="First part of headline"
                />

                <InputField
                  label="Headline (Orange Highlight)"
                  value={data.titleHighlight}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      titleHighlight: e.target.value,
                    }))
                  }
                  placeholder="One Reliable Partner."
                  helperText="Highlighted orange text"
                />
              </div>

              {/* Narrative Paragraphs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <TextAreaField
                  label="Paragraph 1 (Company Narrative)"
                  rows={3}
                  value={data.paragraph1}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      paragraph1: e.target.value,
                    }))
                  }
                  placeholder="At Jai Deva Oil Co., we bring together a diverse portfolio..."
                  helperText="First paragraph on the left column"
                />

                <TextAreaField
                  label="Paragraph 2 (Approach & Scope)"
                  rows={3}
                  value={data.paragraph2}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      paragraph2: e.target.value,
                    }))
                  }
                  placeholder="Our multi-brand approach allows us to cater..."
                  helperText="Second paragraph on the left column"
                />
              </div>

              {/* Action Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputField
                  label="CTA Button Label"
                  value={data.btnLabel}
                  onChange={(e) => setData((prev) => ({ ...prev, btnLabel: e.target.value }))}
                  placeholder="Explore Our Brands"
                />

                <InputField
                  label="CTA Button URL"
                  value={data.btnUrl}
                  onChange={(e) => setData((prev) => ({ ...prev, btnUrl: e.target.value }))}
                  placeholder="#brands or /about-us"
                  helperText="Destination link for the button"
                />
              </div>

              {/* Process Steps Header */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-5">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#C86218]" />
                  Process Timeline Steps ({data.steps.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="px-4 py-2 rounded-full border border-dashed border-gray-300 hover:border-[#0C356A] text-xs font-bold text-gray-700 hover:text-[#0C356A] flex items-center gap-1.5 transition-all cursor-pointer bg-white shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C86218]" />
                  Add Step
                </button>
              </div>

              {/* Process Steps Accordion */}
              <div className="flex flex-col gap-4">
                {data.steps.map((step, idx) => {
                  const stepKey = `step-${idx}`;
                  const isItemExpanded = !!expandedIds[stepKey];

                  return (
                    <div
                      key={stepKey}
                      className="bg-gray-50/80 rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs transition-all"
                    >
                      <div
                        onClick={() => toggleExpand(stepKey)}
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100/70 transition-colors select-none"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-[#0C356A] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                            0{step.num || idx + 1}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-[#0C356A] uppercase tracking-wide truncate">
                              {step.name || `Step #${idx + 1}`}
                            </span>
                            <span className="text-[11px] text-gray-500 truncate">
                              {step.desc || 'No description set'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {data.steps.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => handleRemoveStep(idx, e)}
                              title="Delete Step"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <div
                            className={`p-1.5 rounded-lg text-gray-500 hover:bg-gray-200/70 transition-transform duration-200 ${
                              isItemExpanded ? 'rotate-180' : ''
                            }`}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      <div
                        className={`grid transition-all duration-200 ease-in-out border-t border-gray-200/60 ${
                          isItemExpanded
                            ? 'grid-rows-[1fr] opacity-100 p-5 bg-white'
                            : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="overflow-hidden flex flex-col gap-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                              label="Step Number / Order"
                              value={step.num}
                              onChange={(e) => handleStepChange(idx, 'num', e.target.value)}
                              placeholder="1"
                            />
                            <InputField
                              label="Step Name"
                              value={step.name}
                              onChange={(e) => handleStepChange(idx, 'name', e.target.value)}
                              placeholder="e.g. Understand"
                            />
                          </div>

                          <TextAreaField
                            label="Step Description"
                            rows={2}
                            value={step.desc}
                            onChange={(e) => handleStepChange(idx, 'desc', e.target.value)}
                            placeholder="Analyze machinery and operating conditions..."
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Save Button */}
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
    </section>
  );
}
