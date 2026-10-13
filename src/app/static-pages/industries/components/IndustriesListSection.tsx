'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Factory, Plus, Trash2, ChevronDown } from 'lucide-react';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { ImageUploadField } from '@/components/ImageUploadField';
import { SaveButton } from '@/components/SaveButton';
import { uploadFiles } from '@/lib/uploadHelpers';

export interface IndustryItem {
  id?: string;
  name: string;
  slug?: string;
  icon?: string;
  image?: string;
  description: string;
  challenges: string[];
  solutions: string[];
  order?: number;
}

interface IndustriesListSectionProps {
  initialIndustries?: IndustryItem[];
  isOpen?: boolean;
  onToggle?: () => void;
}

export function IndustriesListSection({
  initialIndustries,
  isOpen: controlledIsOpen,
  onToggle,
}: IndustriesListSectionProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));

  const [industries, setIndustries] = useState<IndustryItem[]>([]);
  const [industryImages, setIndustryImages] = useState<Record<number, (File | string | null)[]>>({});
  const [openSectors, setOpenSectors] = useState<Record<number, boolean>>({ 0: true });
  const [loading, setLoading] = useState(false);

  const toggleSector = (index: number) => {
    setOpenSectors((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    if (initialIndustries && Array.isArray(initialIndustries)) {
      setIndustries(initialIndustries);
      const imgMap: Record<number, (File | string | null)[]> = {};
      initialIndustries.forEach((ind, idx) => {
        if (ind.image) {
          imgMap[idx] = [ind.image];
        }
      });
      setIndustryImages(imgMap);
    }
  }, [initialIndustries]);

  const handleFieldChange = (index: number, field: keyof IndustryItem, value: any) => {
    setIndustries((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddIndustry = () => {
    setIndustries((prev) => {
      const nextIndex = prev.length;
      setOpenSectors((s) => ({ ...s, [nextIndex]: true }));
      return [
        ...prev,
        {
          id: '',
          name: '',
          slug: '',
          icon: '',
          image: '',
          description: '',
          challenges: [],
          solutions: [],
          order: nextIndex + 1,
        },
      ];
    });
  };

  const handleRemoveIndustry = (index: number) => {
    setIndustries((prev) => prev.filter((_, i) => i !== index));
    setIndustryImages((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
  };

  const handleAddBullet = (industryIdx: number, field: 'challenges' | 'solutions') => {
    setIndustries((prev) => {
      const copy = [...prev];
      const list = copy[industryIdx][field] ? [...copy[industryIdx][field]] : [];
      list.push('');
      copy[industryIdx] = { ...copy[industryIdx], [field]: list };
      return copy;
    });
  };

  const handleBulletChange = (
    industryIdx: number,
    field: 'challenges' | 'solutions',
    bulletIdx: number,
    val: string
  ) => {
    setIndustries((prev) => {
      const copy = [...prev];
      const list = [...copy[industryIdx][field]];
      list[bulletIdx] = val;
      copy[industryIdx] = { ...copy[industryIdx], [field]: list };
      return copy;
    });
  };

  const handleRemoveBullet = (
    industryIdx: number,
    field: 'challenges' | 'solutions',
    bulletIdx: number
  ) => {
    setIndustries((prev) => {
      const copy = [...prev];
      const list = copy[industryIdx][field].filter((_, i) => i !== bulletIdx);
      copy[industryIdx] = { ...copy[industryIdx], [field]: list };
      return copy;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const processedIndustries = await Promise.all(
        industries.map(async (ind, idx) => {
          const imgs = (industryImages[idx] || []).filter((im): im is File | string => !!im);
          let finalImg = ind.image || '';
          if (imgs.length > 0) {
            if (typeof imgs[0] === 'string') {
              finalImg = imgs[0];
            } else {
              const [uploaded] = await uploadFiles(imgs);
              if (uploaded) finalImg = uploaded;
            }
          }

          return {
            ...ind,
            image: finalImg,
            challenges: (ind.challenges || []).filter((c) => c.trim().length > 0),
            solutions: (ind.solutions || []).filter((s) => s.trim().length > 0),
            order: idx + 1,
          };
        })
      );

      const res = await fetch('/api/industries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industries: processedIndustries }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('Industries list saved successfully!');
        setIndustries(processedIndustries);
      } else {
        toast.error(json.error || 'Failed to save industries list');
      }
    } catch {
      toast.error('Network error saving industries list');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-zinc-200">
      <div
        onClick={handleToggle}
        className="flex items-center justify-between pb-6 border-b border-zinc-100 cursor-pointer select-none group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#ffe000] text-black">
            <Factory className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900 tracking-tight">
              2. Industries Breakdown List ({industries.length} Sectors)
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
              Manage the sector cards displayed on the website: challenges, solutions, icon, and images.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAddIndustry();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#ffe000] hover:bg-yellow-400 text-black rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Industry</span>
          </button>
          <div
            className={`w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 transition-transform duration-300 ${
              isOpen ? 'rotate-180 bg-[#ffe000] text-black' : ''
            }`}
          >
            <ChevronDown className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="mt-6 space-y-6">
            {industries.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 text-sm">
                No industries added yet. Click &quot;Add Industry&quot; above to create one.
              </div>
            ) : (
              industries.map((ind, idx) => {
                const isSectorOpen = openSectors[idx] !== undefined ? openSectors[idx] : idx === 0;
                return (
                  <div
                    key={idx}
                    className="border border-zinc-200 rounded-2xl bg-white overflow-hidden shadow-2xs transition-all"
                  >
                    <div
                      onClick={() => toggleSector(idx)}
                      className="p-5 flex items-center justify-between cursor-pointer select-none bg-zinc-50/70 hover:bg-zinc-100/80 border-b border-zinc-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{ind.icon || '🏭'}</span>
                        <div>
                          <span className="text-xs font-black uppercase tracking-wider text-zinc-900">
                            Sector #{idx + 1}: {ind.name || 'New Sector'}
                          </span>
                          <div className="text-[11px] font-medium text-zinc-500 mt-0.5">
                            {(ind.challenges || []).length} Challenges • {(ind.solutions || []).length} Solutions
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveIndustry(idx);
                          }}
                          className="p-1.5 text-zinc-400 hover:text-red-600 transition cursor-pointer"
                          title="Remove Sector"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div
                          className={`w-7 h-7 rounded-full bg-zinc-200/80 flex items-center justify-center text-zinc-700 transition-transform duration-200 ${
                            isSectorOpen ? 'rotate-180 bg-[#ffe000] text-black' : ''
                          }`}
                        >
                          <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                        </div>
                      </div>
                    </div>

                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isSectorOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="p-6 space-y-5 bg-white">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputField
                              label="Industry Name"
                              value={ind.name}
                              onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                            />
                            <InputField
                              label="Icon (e.g. 🏭, 📄, ⚙️, 🚛, 🔧)"
                              value={ind.icon || ''}
                              onChange={(e) => handleFieldChange(idx, 'icon', e.target.value)}
                            />
                          </div>

                          <TextAreaField
                            label="Description"
                            value={ind.description}
                            onChange={(e) => handleFieldChange(idx, 'description', e.target.value)}
                            rows={2}
                          />

                          <ImageUploadField
                            label="Industry Showcase Graphic"
                            images={industryImages[idx] || []}
                            onImagesChange={(imgs) =>
                              setIndustryImages((prev) => ({ ...prev, [idx]: imgs }))
                            }
                            maxImages={1}
                            folder="lubricon/industries"
                          />

                          {/* Challenges List (2 in one row) */}
                          <div className="p-4 bg-red-50/60 rounded-xl border border-red-200/80 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-red-800">
                                Operating Challenges ({ind.challenges?.length || 0})
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAddBullet(idx, 'challenges')}
                                className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-900 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add Challenge
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {(ind.challenges || []).map((ch, chIdx) => (
                                <div key={chIdx} className="flex items-center gap-2">
                                  <div className="flex-1">
                                    <InputField
                                      value={ch}
                                      onChange={(e) =>
                                        handleBulletChange(idx, 'challenges', chIdx, e.target.value)
                                      }
                                      placeholder="e.g. High-temperature hydraulic system stability"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveBullet(idx, 'challenges', chIdx)}
                                    className="text-red-500 hover:text-red-700 p-1.5 shrink-0 cursor-pointer"
                                    title="Remove"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Solutions List (2 in one row) */}
                          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                                Lubricon Engineered Solutions ({ind.solutions?.length || 0})
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAddBullet(idx, 'solutions')}
                                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" /> Add Solution
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {(ind.solutions || []).map((sol, solIdx) => (
                                <div key={solIdx} className="flex items-center gap-2">
                                  <div className="flex-1">
                                    <InputField
                                      value={sol}
                                      onChange={(e) =>
                                        handleBulletChange(idx, 'solutions', solIdx, e.target.value)
                                      }
                                      placeholder="e.g. Anti-wear gear oils for gearbox protection"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveBullet(idx, 'solutions', solIdx)}
                                    className="text-red-500 hover:text-red-700 p-1.5 shrink-0 cursor-pointer"
                                    title="Remove"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <div className="flex justify-end pt-2">
              <SaveButton
                loading={loading}
                onClick={handleSave}
                label="Save Industries Breakdown List"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
