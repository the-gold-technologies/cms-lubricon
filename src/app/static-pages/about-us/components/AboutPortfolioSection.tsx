'use client';

import React, { useState, useEffect } from 'react';
import { SectionHeader } from '@/components/SectionHeader';
import { SaveButton } from '@/components/SaveButton';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { Package, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface PortfolioItem {
  title: string;
  icon: string;
  items: string[];
  link?: string;
}

export function AboutPortfolioSection({
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
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.badge !== undefined) setBadge(initialData.badge);
      if (initialData.title !== undefined) setTitle(initialData.title);
      if (initialData.subtitle !== undefined) setSubtitle(initialData.subtitle);
      if (Array.isArray(initialData.portfolios)) setPortfolios(initialData.portfolios);
    }
  }, [initialData]);

  const handleCardChange = (index: number, field: keyof PortfolioItem, val: any) => {
    setPortfolios((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleBulletChange = (cardIdx: number, bulletIdx: number, val: string) => {
    setPortfolios((prev) => {
      const copy = [...prev];
      const items = [...copy[cardIdx].items];
      items[bulletIdx] = val;
      copy[cardIdx] = { ...copy[cardIdx], items };
      return copy;
    });
  };

  const addBullet = (cardIdx: number) => {
    setPortfolios((prev) => {
      const copy = [...prev];
      copy[cardIdx] = { ...copy[cardIdx], items: [...copy[cardIdx].items, ''] };
      return copy;
    });
  };

  const removeBullet = (cardIdx: number, bulletIdx: number) => {
    setPortfolios((prev) => {
      const copy = [...prev];
      copy[cardIdx] = { ...copy[cardIdx], items: copy[cardIdx].items.filter((_, i) => i !== bulletIdx) };
      return copy;
    });
  };

  const addCard = () => {
    setPortfolios((prev) => [
      ...prev,
      { title: '', icon: '', items: [], link: '' },
    ]);
  };

  const removeCard = (index: number) => {
    setPortfolios((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        badge,
        title,
        subtitle,
        portfolios,
      };

      const res = await fetch('/api/about-us', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'AboutPortfolio',
          content: payload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('About Portfolio section saved successfully!');
      } else {
        toast.error(json.error || 'Failed to save About Portfolio');
      }
    } catch {
      toast.error('Network error saving About Portfolio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-4 transition-all">
      <SectionHeader
        title="4. Complete Lubrication Portfolio Summary"
        description="Live 6 product categories: Engine Oils, Gear Oils, ATF, Industrial, DEF, Greases."
        badge={portfolios.length + ' Categories'}
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

            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Portfolio Cards ({portfolios.length})</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {portfolios.map((item, cIdx) => (
                  <div key={cIdx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                    <InputField
                      label="Category Title"
                      value={item.title}
                      onChange={(e) => handleCardChange(cIdx, 'title', e.target.value)}
                    />
                    <InputField
                      label="Emoji / Icon"
                      value={item.icon}
                      onChange={(e) => handleCardChange(cIdx, 'icon', e.target.value)}
                    />
                    <InputField
                      label="Catalog Link"
                      value={item.link || ''}
                      onChange={(e) => handleCardChange(cIdx, 'link', e.target.value)}
                    />

                    <div className="space-y-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-500">Bullet Highlights</span>
                        <button
                          type="button"
                          onClick={() => addBullet(cIdx)}
                          className="text-[11px] font-bold text-amber-600 hover:text-amber-700"
                        >
                          + Add Bullet
                        </button>
                      </div>
                      {item.items.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => handleBulletChange(cIdx, bIdx, e.target.value)}
                            className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeBullet(cIdx, bIdx)}
                            className="text-gray-400 hover:text-red-500 p-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
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
