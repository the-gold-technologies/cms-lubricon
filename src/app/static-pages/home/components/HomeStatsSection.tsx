'use client';

import React, { useState, useEffect } from 'react';
import { SaveButton } from '@/components/SaveButton';
import { InputField } from '@/components/InputField';
import { BarChart3, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface StatItem {
  label: string;
  value: number;
  suffix: string;
}

interface HomeStatsSectionProps {
  initialData?: {
    heading?: string;
    subtitle?: string;
    stats?: StatItem[];  };
  isOpen?: boolean;
  onToggle?: () => void;
}


export function HomeStatsSection({
  initialData,
  isOpen: controlledIsOpen,
  onToggle,
}: HomeStatsSectionProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));
  const [heading, setHeading] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.heading) setHeading(initialData.heading);
      if (initialData.subtitle) setSubtitle(initialData.subtitle);
      if (initialData.stats && Array.isArray(initialData.stats) && initialData.stats.length > 0) {
        setStats(initialData.stats);
      }
    }
  }, [initialData]);

  const handleStatChange = (index: number, field: keyof StatItem, value: any) => {
    setStats((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'HomeStats',
          content: { heading, subtitle, stats },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Stats section saved successfully!');
      } else {
        toast.error(json.error || 'Failed to save stats');
      }
    } catch {
      toast.error('Network error saving stats');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-zinc-200">
      <div onClick={handleToggle} className="flex items-center justify-between pb-6 border-b border-zinc-100 cursor-pointer select-none group">
        <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-[#ffe000] text-black">
          <BarChart3 className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-lg font-black text-zinc-900 tracking-tight">2. Stats & Credibility Bar</h2>
          <p className="text-xs text-zinc-500 font-medium">
            Display live verified figures for products, active clients, industry expertise, and QA percentage.
          </p>
        </div>
        </div>
        <div className={`w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 transition-transform duration-300 ${isOpen ? "rotate-180 bg-[#ffe000] text-black" : ""}`}>
          <ChevronDown className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>

      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Section Title"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="Our Stats"
          />
          <InputField
            label="Section Subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="We help you to unleash the power..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
              <span className="text-[10px] font-black uppercase text-zinc-400">Metric {i + 1}</span>
              <InputField
                label="Stat Label"
                value={stat.label}
                onChange={(e) => handleStatChange(i, 'label', e.target.value)}
                placeholder="Active Clients"
              />
              <div className="grid grid-cols-2 gap-2">
                <InputField
                  label="Number"
                  type="number"
                  value={String(stat.value)}
                  onChange={(e) => handleStatChange(i, 'value', parseInt(e.target.value, 10) || 0)}
                  placeholder="800"
                />
                <InputField
                  label="Suffix"
                  value={stat.suffix}
                  onChange={(e) => handleStatChange(i, 'suffix', e.target.value)}
                  placeholder="+"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <SaveButton loading={loading} label="Save Stats Bar" />
        </div>
      </form>
        </div>
      </div>
    </div>
  );
}
