'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Factory } from 'lucide-react';
import toast from 'react-hot-toast';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { SaveButton } from '@/components/SaveButton';

export interface IndustryItem {
  id?: string;
  name: string;
  icon?: string;
}

export interface IndustriesWeServeData {
  title: string;
  subtitle: string;
  leadText: string;
  description: string;
  btnLabel: string;
  btnUrl: string;
  industries: IndustryItem[];
}

export const DEFAULT_INDUSTRIES_DATA: IndustriesWeServeData = {
  title: '',
  subtitle: '',
  leadText: '',
  description: '',
  btnLabel: '',
  btnUrl: '',
  industries: [],
};

export function IndustriesWeServeSection({ initialData }: { initialData?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [data, setData] = useState<IndustriesWeServeData>(DEFAULT_INDUSTRIES_DATA);

  useEffect(() => {
    if (initialData) {
      const list: IndustryItem[] = Array.isArray(initialData.industries)
        ? initialData.industries.map((item: any, i: number) =>
            typeof item === 'string'
              ? { id: `ind-${i}`, name: item, icon: 'Factory' }
              : {
                  id: item.id || `ind-${i}`,
                  name: item.name || '',
                  icon: item.icon || 'Factory',
                }
          )
        : [];

      setData({
        title: initialData.title || '',
        subtitle: initialData.subtitle || '',
        leadText: initialData.leadText || '',
        description: initialData.description || '',
        btnLabel: initialData.btnLabel || '',
        btnUrl: initialData.btnUrl || '',
        industries: list,
      });
    }
  }, [initialData]);

  const handleAddIndustry = () => {
    const newItem: IndustryItem = {
      id: `ind-${Date.now()}`,
      name: '',
      icon: 'Factory',
    };
    setData((prev) => ({
      ...prev,
      industries: [...prev.industries, newItem],
    }));
    toast.success('New industry added');
  };

  const handleRemoveIndustry = (idx: number) => {
    const updated = data.industries.filter((_, i) => i !== idx);
    setData((prev) => ({ ...prev, industries: updated }));
    toast.success('Industry removed');
  };

  const handleIndustryChange = (idx: number, value: string) => {
    const updated = [...data.industries];
    updated[idx] = { ...updated[idx], name: value };
    setData((prev) => ({ ...prev, industries: updated }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const payload = {
        title: data.title,
        subtitle: data.subtitle,
        leadText: data.leadText,
        description: data.description,
        btnLabel: data.btnLabel,
        btnUrl: data.btnUrl,
        industries: data.industries,
      };

      const res = await fetch('/api/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'IndustriesWeServeSection',
          content: payload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaved(true);
        toast.success('Industries We Serve section saved successfully!');
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch {
      toast.error('Error saving Industries We Serve section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-4 transition-all">
        <SectionHeader
          title="Industries We Serve Section"
          description="Manage the industries grid cards (Steel, Cement, Power, etc.), lead text, description, and CTA button."
          badge={`${data.industries.length} Industr${data.industries.length === 1 ? 'y' : 'ies'}`}
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
              {/* Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Section Title"
                  value={data.title}
                  onChange={(e) => setData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="INDUSTRIES WE SERVE"
                  helperText="Main uppercase heading"
                />

                <InputField
                  label="Section Subtitle (Orange Tagline)"
                  value={data.subtitle}
                  onChange={(e) => setData((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Lubrication Solutions for Diverse Industries"
                  helperText="Highlighted subtitle"
                />
              </div>

              {/* Lead Text & Paragraph */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <TextAreaField
                  label="Lead Intro Text"
                  rows={2}
                  value={data.leadText}
                  onChange={(e) => setData((prev) => ({ ...prev, leadText: e.target.value }))}
                  placeholder="Our extensive lubricant portfolio serves the requirements of various industries, including:"
                  helperText="Short sentence before the grid cards"
                />

                <TextAreaField
                  label="Description (Bottom Paragraph)"
                  rows={2}
                  value={data.description}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="We provide lubrication products for industrial machinery..."
                  helperText="Paragraph displayed below the grid cards"
                />
              </div>

              {/* Action Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputField
                  label="CTA Button Label"
                  value={data.btnLabel}
                  onChange={(e) => setData((prev) => ({ ...prev, btnLabel: e.target.value }))}
                  placeholder="Explore Industries"
                />

                <InputField
                  label="CTA Button URL"
                  value={data.btnUrl}
                  onChange={(e) => setData((prev) => ({ ...prev, btnUrl: e.target.value }))}
                  placeholder="#industries or /products"
                  helperText="Destination link for the action button"
                />
              </div>

              {/* Industries Grid Editor */}
              <div className="border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Factory className="w-4 h-4 text-[#C86218]" />
                    Industry Cards ({data.industries.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddIndustry}
                    className="px-4 py-2 rounded-full border border-dashed border-gray-300 hover:border-[#0C356A] text-xs font-bold text-gray-700 hover:text-[#0C356A] flex items-center gap-1.5 transition-all cursor-pointer bg-white shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C86218]" />
                    Add Industry
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {data.industries.map((ind, idx) => (
                    <div
                      key={ind.id || `ind-${idx}`}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-2 shadow-2xs hover:border-[#C86218] transition-colors"
                    >
                      <input
                        type="text"
                        value={ind.name}
                        onChange={(e) => handleIndustryChange(idx, e.target.value)}
                        placeholder={`Industry #${idx + 1}`}
                        className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0C356A] w-full focus:outline-none focus:ring-1 focus:ring-[#0C356A]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveIndustry(idx)}
                        title="Delete Industry"
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
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
