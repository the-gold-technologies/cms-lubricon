'use client';

import React, { useState, useEffect } from 'react';
import { SectionHeader } from '@/components/SectionHeader';
import { SaveButton } from '@/components/SaveButton';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { HeartHandshake, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ValueItem {
  title: string;
  desc: string;
}

export function AboutValuesSection({
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
  const [badge, setBadge] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [values, setValues] = useState<ValueItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.badge !== undefined) setBadge(initialData.badge);
      if (initialData.title !== undefined) setTitle(initialData.title);
      if (initialData.subtitle !== undefined) setSubtitle(initialData.subtitle);
      if (Array.isArray(initialData.values)) setValues(initialData.values);
    }
  }, [initialData]);

  const handleValueChange = (index: number, field: keyof ValueItem, val: string) => {
    setValues((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const addValue = () => {
    setValues((prev) => [...prev, { title: '', desc: '' }]);
  };

  const removeValue = (index: number) => {
    setValues((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        badge,
        title,
        subtitle,
        values,
      };

      const res = await fetch('/api/about-us', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'AboutValues',
          content: payload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('About Values section saved successfully!');
      } else {
        toast.error(json.error || 'Failed to save About Values');
      }
    } catch {
      toast.error('Network error saving About Values');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-4 transition-all">
      <SectionHeader
        title="3. Core Principles & Values"
        description="Live 4 core principles: Australian technology, quality, protection, and application excellence."
        badge={values.length + ' Principles'}
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
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Value Cards ({values.length})</span>
                <button
                  type="button"
                  onClick={addValue}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg transition"
                >
                  <Plus size={14} /> Add Principle
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {values.map((v, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeValue(idx)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                    <InputField
                      label="Title"
                      value={v.title}
                      onChange={(e) => handleValueChange(idx, 'title', e.target.value)}
                    />
                    <TextAreaField
                      label="Description"
                      value={v.desc}
                      onChange={(e) => handleValueChange(idx, 'desc', e.target.value)}
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
