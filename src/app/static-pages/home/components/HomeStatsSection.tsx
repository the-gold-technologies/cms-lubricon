'use client';

import React, { useState, useEffect } from 'react';
import { SaveButton } from '@/components/SaveButton';
import { InputField } from '@/components/InputField';
import { BarChart3 } from 'lucide-react';
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
    stats?: StatItem[];
  };
}

const DEFAULT_STATS: StatItem[] = [
  { label: 'Advanced Products', value: 40, suffix: '+' },
  { label: 'Active Clients', value: 800, suffix: '+' },
  { label: 'Years of Excellence', value: 15, suffix: '+' },
  { label: 'Quality Assurance', value: 100, suffix: '%' },
];

export function HomeStatsSection({ initialData }: HomeStatsSectionProps) {
  const [heading, setHeading] = useState('Our Stats');
  const [subtitle, setSubtitle] = useState(
    'We help you to unleash the power within your machinery and industrial operations.'
  );
  const [stats, setStats] = useState<StatItem[]>(DEFAULT_STATS);
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
      <div className="flex items-center gap-3 pb-6 border-b border-zinc-100">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
  );
}
