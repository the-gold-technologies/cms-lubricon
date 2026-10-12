'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';
import { SaveButton } from '@/components/SaveButton';

interface StatItem {
  value: string;
  label: string;
}

export function BrandsStatsBandSection({
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

  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    if (initialData) {
      const loaded = initialData.stats;
      if (Array.isArray(loaded)) {
        setStats(loaded);
      }
    }
  }, [initialData]);

  const handleStatChange = (index: number, field: keyof StatItem, val: string) => {
    const updated = [...stats];
    updated[index] = { ...updated[index], [field]: val };
    setStats(updated);
  };

  const handleAddStat = () => {
    setStats([...stats, { value: '', label: '' }]);
  };

  const handleRemoveStat = (index: number) => {
    if (stats.length <= 1) {
      toast.error('At least one metric is required.');
      return;
    }
    setStats(stats.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const payload = { stats };

      const res = await fetch('/api/brands', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'BrandsStatsBand', content: payload }),
      });

      const json = await res.json();
      if (json.success) {
        setSaved(true);
        toast.success('Scale & Growth Statistics saved successfully');
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch {
      toast.error('Error saving Statistics section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6 transition-all">
      <SectionHeader
        title="2. Key Industry Statistics Band"
        description="Configure high-impact metrics (CAGR, growth, headcount) displayed across the stat ribbon."
        badge={`${stats.length} Metrics`}
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#0C356A]">
                <TrendingUp className="w-4 h-4 text-[#C86218]" />
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Scale & Performance Cards ({stats.length})
                </label>
              </div>
              <button
                type="button"
                onClick={handleAddStat}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#C86218] hover:text-[#0C356A] transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Stat
              </button>
            </div>

            {/* 2 in a row grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="p-5 bg-gray-50/80 rounded-2xl border border-gray-200/70 flex flex-col gap-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-[#0C356A] text-white text-xs font-black flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStat(index)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all cursor-pointer"
                      title="Remove Stat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="Metric Value"
                      value={stat.value}
                      onChange={(e) => handleStatChange(index, 'value', e.target.value)}
                      placeholder="e.g. 91% or 1.9X"
                    />
                    <InputField
                      label="Metric Label"
                      value={stat.label}
                      onChange={(e) => handleStatChange(index, 'label', e.target.value)}
                      placeholder="e.g. Growth in 3 Years"
                    />
                  </div>
                </div>
              ))}
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
