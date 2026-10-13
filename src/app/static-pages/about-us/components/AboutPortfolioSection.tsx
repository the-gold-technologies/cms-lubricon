'use client';

import React, { useState, useEffect } from 'react';
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

export function AboutPortfolioSection({ initialData }: { initialData?: any }) {
  const [badge, setBadge] = useState('Comprehensive Range');
  const [title, setTitle] = useState('Complete Lubrication Portfolio Summary');
  const [subtitle, setSubtitle] = useState('High-performance formulations engineered for extreme industrial and automotive operating conditions.');
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([
    {
      title: 'Engine Oils',
      icon: '🛢️',
      items: ['CK-4, CI-4 Plus, CI-4, CH-4, CF-4', 'SAE 15W40 heavy duty multigrade range', 'API-certified performance & soot control'],
      link: '/products?cat=engine-oil',
    },
    {
      title: 'Gear Oils',
      icon: '⚙️',
      items: ['Automotive GL-5: 80W90, 85W140', 'Industrial EP: ISO VG 100 to 680', 'Hypoid, worm, and spur gear formulations'],
      link: '/products?cat=gear-oil',
    },
    {
      title: 'ATF & Steering Fluids',
      icon: '🔄',
      items: ['Dexron III ATF automatic transmission', 'ATF Type A for power steering systems', 'Smooth gear engagement & seal protection'],
      link: '/products?cat=atf',
    },
    {
      title: 'Industrial Specialties',
      icon: '🏭',
      items: ['Neat & Soluble CNC Cutting Oils', 'High-Pressure Anti-Wear Hydraulic Oils', 'VaccuSyn Vacuum Pump & Compressor Fluids'],
      link: '/products?cat=industrial',
    },
    {
      title: 'DEF & Coolants',
      icon: '💧',
      items: ['ISO 22241 AdBlue 32.5% (AUS32)', 'Heavy duty radiator coolants', 'Euro 4/5/6 SCR emission compliance'],
      link: '/products?cat=fluids',
    },
    {
      title: 'Greases & Maintenance',
      icon: '🔧',
      items: ['High-temperature lithium complex greases', 'Moly extreme pressure chassis grease', 'Wheel bearing & industrial ball bearing protection'],
      link: '/products',
    },
  ]);
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
      copy[cardIdx] = { ...copy[cardIdx], items: [...copy[cardIdx].items, 'New bullet point'] };
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
      { title: 'New Category', icon: '📦', items: ['Specification 1'], link: '/products' },
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
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Package size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Portfolio Overview Grid</h2>
            <p className="text-xs text-gray-500">Live 6 product categories: Engine Oils, Gear Oils, ATF, Industrial, DEF, Greases.</p>
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
          <h3 className="text-sm font-bold text-gray-900">Product Categories (6 Cards)</h3>
          <button
            type="button"
            onClick={addCard}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg transition"
          >
            <Plus size={14} /> Add Category
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolios.map((card, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3 relative">
              <button
                type="button"
                onClick={() => removeCard(idx)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"
              >
                <Trash2 size={15} />
              </button>
              <InputField
                label="Card Title"
                value={card.title}
                onChange={(e) => handleCardChange(idx, 'title', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <InputField
                  label="Icon Emoji"
                  value={card.icon}
                  onChange={(e) => handleCardChange(idx, 'icon', e.target.value)}
                />
                <InputField
                  label="Link"
                  value={card.link || ''}
                  onChange={(e) => handleCardChange(idx, 'link', e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-700">Bullets</span>
                  <button
                    type="button"
                    onClick={() => addBullet(idx)}
                    className="text-[11px] text-amber-600 hover:underline"
                  >
                    + Add bullet
                  </button>
                </div>
                {card.items.map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-center gap-1.5 mb-1.5">
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) => handleBulletChange(idx, bIdx, e.target.value)}
                      className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeBullet(idx, bIdx)}
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
    </div>
  );
}
