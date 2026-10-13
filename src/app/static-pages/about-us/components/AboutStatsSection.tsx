'use client';

import React, { useState, useEffect } from 'react';
import { SaveButton } from '@/components/SaveButton';
import { InputField } from '@/components/InputField';
import { BarChart3, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface StatItem {
  label: string;
  value: number;
  suffix: string;
}

export function AboutStatsSection({ initialData }: { initialData?: any }) {
  const [heading, setHeading] = useState('Our Stats');
  const [subtitle, setSubtitle] = useState('We help you to unleash the power within your machinery and industrial operations.');
  const [stats, setStats] = useState<StatItem[]>([
    { label: 'Advanced Products', value: 40, suffix: '+' },
    { label: 'Active Clients', value: 800, suffix: '+' },
    { label: 'Years of Excellence', value: 15, suffix: '+' },
    { label: 'Quality Assurance', value: 100, suffix: '%' },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.heading !== undefined) setHeading(initialData.heading);
      if (initialData.subtitle !== undefined) setSubtitle(initialData.subtitle);
      if (Array.isArray(initialData.stats)) setStats(initialData.stats);
    }
  }, [initialData]);

  const handleStatChange = (index: number, field: keyof StatItem, val: any) => {
    setStats((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const addStat = () => {
    setStats((prev) => [...prev, { label: 'New Metric', value: 10, suffix: '+' }]);
  };

  const removeStat = (index: number) => {
    setStats((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        heading,
        subtitle,
        stats,
      };

      const res = await fetch('/api/about-us', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'AboutStats',
          content: payload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('About Stats section saved successfully!');
      } else {
        toast.error(json.error || 'Failed to save About Stats');
      }
    } catch {
      toast.error('Network error saving About Stats');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <BarChart3 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">About Stats Strip</h2>
            <p className="text-xs text-gray-500">Live operational numbers: products, clients, years of excellence, quality assurance.</p>
          </div>
        </div>
        <SaveButton onClick={handleSave} loading={loading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        <InputField label="Section Heading" value={heading} onChange={(e) => setHeading(e.target.value)} />
        <InputField label="Section Subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900">Key Statistics (4 Metrics)</h3>
          <button
            type="button"
            onClick={addStat}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg transition"
          >
            <Plus size={14} /> Add Stat
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3 relative">
              <button
                type="button"
                onClick={() => removeStat(idx)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
              >
                <Trash2 size={15} />
              </button>
              <InputField
                label="Label"
                value={item.label}
                onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <InputField
                  label="Value (number)"
                  value={String(item.value)}
                  onChange={(e) => handleStatChange(idx, 'value', Number(e.target.value) || 0)}
                />
                <InputField
                  label="Suffix (+ / %)"
                  value={item.suffix}
                  onChange={(e) => handleStatChange(idx, 'suffix', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
