'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  HelpCircle,
  Calendar,
  Layers,
  Boxes,
  ShieldCheck,
  Users,
  Clock,
  Sparkles,
  Award,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';
import { SaveButton } from '@/components/SaveButton';

const AVAILABLE_ICONS = [
  { label: 'Calendar (Experience)', value: 'Calendar' },
  { label: 'Layers (Multi-Brand)', value: 'Layers' },
  { label: 'Boxes (Product Range)', value: 'Boxes' },
  { label: 'ShieldCheck (Quality)', value: 'ShieldCheck' },
  { label: 'Users (Experienced Team)', value: 'Users' },
  { label: 'Clock (Reliable Service)', value: 'Clock' },
  { label: 'Sparkles (Premium)', value: 'Sparkles' },
  { label: 'Award (Certified)', value: 'Award' },
  { label: 'CheckCircle (Guaranteed)', value: 'CheckCircle' },
];

export interface WhyPointItem {
  id?: string;
  title: string;
  desc: string;
  icon: string;
  color?: string;
}

export interface WhyJaiDevaData {
  title: string;
  subtitle: string;
  points: WhyPointItem[];
}

export const DEFAULT_WHY_JAIDEVA_DATA: WhyJaiDevaData = {
  title: '',
  subtitle: '',
  points: [],
};

export function WhyJaiDevaSection({ initialData }: { initialData?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [data, setData] = useState<WhyJaiDevaData>(DEFAULT_WHY_JAIDEVA_DATA);

  useEffect(() => {
    if (initialData) {
      const rawPoints = Array.isArray(initialData.points) ? initialData.points : [];

      const pointsList: WhyPointItem[] = rawPoints.map((item: any, i: number) => ({
        id: item.id || `pt-${i}`,
        title: item.title || '',
        desc: item.desc || '',
        icon: item.icon || 'ShieldCheck',
        color: item.color || '',
      }));

      setData({
        title: initialData.title || '',
        subtitle: initialData.subtitle || '',
        points: pointsList,
      });
    }
  }, [initialData]);

  const handleAddPoint = () => {
    const newPoint: WhyPointItem = {
      id: `pt-${Date.now()}`,
      title: '',
      desc: '',
      icon: 'ShieldCheck',
    };
    setData((prev) => ({
      ...prev,
      points: [...prev.points, newPoint],
    }));
    toast.success('New feature point added');
  };

  const handleRemovePoint = (idx: number) => {
    const updated = data.points.filter((_, i) => i !== idx);
    setData((prev) => ({ ...prev, points: updated }));
    toast.success('Feature point removed');
  };

  const handlePointChange = (idx: number, field: keyof WhyPointItem, value: string) => {
    const updated = [...data.points];
    updated[idx] = { ...updated[idx], [field]: value };
    setData((prev) => ({ ...prev, points: updated }));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const payload = {
        title: data.title,
        subtitle: data.subtitle,
        points: data.points,
      };

      const res = await fetch('/api/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'WhyJaiDevaSection',
          content: payload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaved(true);
        toast.success('Why Jai Deva section saved successfully!');
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch {
      toast.error('Error saving Why Jai Deva section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-4 transition-all">
        <SectionHeader
          title="Why Jai Deva Oil Co. Section"
          description="Manage the 6 value proposition feature cards (18+ Years Experience, Multi-Brand, Reliable Service, etc.)."
          badge={`${data.points.length} Point${data.points.length === 1 ? '' : 's'}`}
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
                  placeholder="WHY JAI DEVA OIL CO.?"
                  helperText="Main uppercase heading"
                />

                <InputField
                  label="Section Subtitle (Orange Tagline)"
                  value={data.subtitle}
                  onChange={(e) => setData((prev) => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Your Trusted Lubrication Partner Since 2008"
                  helperText="Highlighted subtitle"
                />
              </div>

              {/* Feature Points Editor */}
              <div className="border-t border-gray-100 pt-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[#C86218]" />
                    Feature Cards ({data.points.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddPoint}
                    className="px-4 py-2 rounded-full border border-dashed border-gray-300 hover:border-[#0C356A] text-xs font-bold text-gray-700 hover:text-[#0C356A] flex items-center gap-1.5 transition-all cursor-pointer bg-white shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#C86218]" />
                    Add Feature Card
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.points.map((pt, idx) => (
                    <div
                      key={pt.id || `pt-${idx}`}
                      className="bg-gray-50/70 border border-gray-200/90 rounded-2xl p-4 flex flex-col gap-3.5 shadow-2xs hover:border-[#C86218] transition-all"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-gray-200/60 pb-2">
                        <span className="text-xs font-bold text-[#0C356A]">Card #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePoint(idx)}
                          title="Delete Card"
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Icon Selector */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-gray-600">Icon</label>
                        <select
                          value={pt.icon}
                          onChange={(e) => handlePointChange(idx, 'icon', e.target.value)}
                          className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0C356A]"
                        >
                          {AVAILABLE_ICONS.map((ic) => (
                            <option key={ic.value} value={ic.value}>
                              {ic.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Title */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-gray-600">Card Title</label>
                        <input
                          type="text"
                          value={pt.title}
                          onChange={(e) => handlePointChange(idx, 'title', e.target.value)}
                          placeholder="e.g. 18+ Years of Experience"
                          className="bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#0C356A] focus:outline-none focus:ring-1 focus:ring-[#0C356A]"
                        />
                      </div>

                      {/* Description */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-bold text-gray-600">Description</label>
                        <textarea
                          rows={3}
                          value={pt.desc}
                          onChange={(e) => handlePointChange(idx, 'desc', e.target.value)}
                          placeholder="Short description of this strength..."
                          className="bg-white border border-gray-200 rounded-lg p-2.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0C356A] resize-none"
                        />
                      </div>
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
