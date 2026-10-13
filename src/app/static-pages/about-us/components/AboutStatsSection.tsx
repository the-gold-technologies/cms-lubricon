'use client';

import React, { useState, useEffect } from 'react';
import { SectionHeader } from '@/components/SectionHeader';
import { SaveButton } from '@/components/SaveButton';
import { InputField } from '@/components/InputField';
import { BarChart3, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface StatItem {
  label: string;
  value: number;
  suffix: string;
}

export function AboutStatsSection({
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
  const [heading, setHeading] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [stats, setStats] = useState<StatItem[]>([]);
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
    setStats((prev) => [...prev, { label: '', value: 0, suffix: '' }]);
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
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-4 transition-all">
      <SectionHeader
        title="2. Key Statistics Strip"
        description="Highlight company figures, client counts, and track record."
        badge={stats.length + ' Metrics'}
        isOpen={isOpen}
        onToggle={handleToggle}
      />

      <div
        className={"grid transition-all duration-300 ease-in-out " + (isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Section Title" value={heading} onChange={(e) => setHeading(e.target.value)} />
              <InputField label="Section Subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Stat Numbers ({stats.length})</span>
                <button
                  type="button"
                  onClick={addStat}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg transition"
                >
                  <Plus size={14} /> Add Metric
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

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <SaveButton onClick={handleSave} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
