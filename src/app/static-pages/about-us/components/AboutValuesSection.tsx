'use client';

import React, { useState, useEffect } from 'react';
import { SaveButton } from '@/components/SaveButton';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { HeartHandshake, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ValueItem {
  title: string;
  desc: string;
}

export function AboutValuesSection({ initialData }: { initialData?: any }) {
  const [badge, setBadge] = useState('Our Principles');
  const [title, setTitle] = useState('What We Stand For');
  const [subtitle, setSubtitle] = useState('Core commitments driving every barrel of lubricant formulated under the Lubricon standard.');
  const [values, setValues] = useState<ValueItem[]>([
    {
      title: 'Australian Technology',
      desc: 'Formulations rooted in Australian R&D, tailored and field-tested specifically for harsh Indian industrial environments.',
    },
    {
      title: 'Uncompromising Quality',
      desc: 'Every batch undergoes rigorous quality testing adhering to international API, ISO 9001:2015, and OEM standards.',
    },
    {
      title: 'Equipment Protection',
      desc: 'Designed to reduce friction, minimize heat, resist oxidation, and deliver extended drain intervals for peak machine uptime.',
    },
    {
      title: 'Application Excellence',
      desc: 'We do not just sell lubricants — our technical engineering team provides custom lubrication audits and expert consultation.',
    },
  ]);
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
    setValues((prev) => [...prev, { title: 'New Principle', desc: 'Principle description.' }]);
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
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <HeartHandshake size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Core Principles & Values</h2>
            <p className="text-xs text-gray-500">Live 4 core principles: Australian technology, quality, protection, and application excellence.</p>
          </div>
        </div>
        <SaveButton onClick={handleSave} loading={loading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        <InputField label="Badge Text" value={badge} onChange={(e) => setBadge(e.target.value)} />
        <InputField label="Section Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="md:col-span-2">
          <TextAreaField label="Section Subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} rows={2} />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900">Principle Cards</h3>
          <button
            type="button"
            onClick={addValue}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg transition"
          >
            <Plus size={14} /> Add Principle
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {values.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3 relative">
              <button
                type="button"
                onClick={() => removeValue(idx)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
              >
                <Trash2 size={15} />
              </button>
              <InputField
                label="Principle Title"
                value={item.title}
                onChange={(e) => handleValueChange(idx, 'title', e.target.value)}
              />
              <TextAreaField
                label="Description"
                value={item.desc}
                onChange={(e) => handleValueChange(idx, 'desc', e.target.value)}
                rows={3}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
