'use client';

import React, { useState, useEffect } from 'react';
import { SaveButton } from '@/components/SaveButton';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import {
  Compass,
  ChevronDown,
  Layers,
  Plus,
  Trash2,
  Wrench,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface RecommendationItem {
  name: string;
  grade?: string;
  badge?: string;
  benefits?: string[];
  link?: string;
}

export interface EquipmentItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  recommendations?: RecommendationItem[];
}

export interface CategoryItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  equipment?: EquipmentItem[];
}

interface HomeLubricantFinderSectionProps {
  initialData?: {
    badgeText?: string;
    tagline?: string;
    title?: string;
    heading?: string;
    subtitle?: string;
    description?: string;
    step1Title?: string;
    step1Subtitle?: string;
    step2Title?: string;
    step2Subtitle?: string;
    step3Badge?: string;
    step3Title?: string;
    resetBtnText?: string;
    helplinePrompt?: string;
    helplineText?: string;
    tollFree?: string;
    categories?: CategoryItem[];
  };
  isOpen?: boolean;
  onToggle?: () => void;
}

export function HomeLubricantFinderSection({
  initialData,
  isOpen: controlledIsOpen,
  onToggle,
}: HomeLubricantFinderSectionProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));

  // All useStates start completely EMPTY
  const [badgeText, setBadgeText] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [step1Title, setStep1Title] = useState('');
  const [step1Subtitle, setStep1Subtitle] = useState('');
  const [step2Title, setStep2Title] = useState('');
  const [step2Subtitle, setStep2Subtitle] = useState('');
  const [step3Badge, setStep3Badge] = useState('');
  const [step3Title, setStep3Title] = useState('');
  const [resetBtnText, setResetBtnText] = useState('');
  const [helplinePrompt, setHelplinePrompt] = useState('');
  const [helplineText, setHelplineText] = useState('');
  const [tollFree, setTollFree] = useState('');
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Expanded categories & equipment in CMS UI
  const [expandedCat, setExpandedCat] = useState<Record<number, boolean>>({});
  const [expandedEq, setExpandedEq] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialData) {
      if (initialData.badgeText || initialData.tagline) {
        setBadgeText(initialData.badgeText || initialData.tagline || '');
      }
      if (initialData.title || initialData.heading) {
        setTitle(initialData.title || initialData.heading || '');
      }
      if (initialData.subtitle || initialData.description) {
        setSubtitle(initialData.subtitle || initialData.description || '');
      }
      if (initialData.step1Title) setStep1Title(initialData.step1Title);
      if (initialData.step1Subtitle) setStep1Subtitle(initialData.step1Subtitle);
      if (initialData.step2Title) setStep2Title(initialData.step2Title);
      if (initialData.step2Subtitle) setStep2Subtitle(initialData.step2Subtitle);
      if (initialData.step3Badge) setStep3Badge(initialData.step3Badge);
      if (initialData.step3Title) setStep3Title(initialData.step3Title);
      if (initialData.resetBtnText) setResetBtnText(initialData.resetBtnText);
      if (initialData.helplinePrompt) setHelplinePrompt(initialData.helplinePrompt);
      if (initialData.helplineText) setHelplineText(initialData.helplineText);
      if (initialData.tollFree) setTollFree(initialData.tollFree);
      if (initialData.categories && Array.isArray(initialData.categories)) {
        setCategories(initialData.categories);
      }
    }
  }, [initialData]);

  // Step 1: Category handlers
  const handleCategoryChange = (catIdx: number, field: keyof CategoryItem, value: any) => {
    setCategories((prev) => {
      const updated = [...prev];
      updated[catIdx] = { ...updated[catIdx], [field]: value };
      return updated;
    });
  };

  const handleAddCategory = () => {
    const newId = `cat-${Date.now()}`;
    setCategories((prev) => [
      ...prev,
      {
        id: newId,
        title: '',
        subtitle: '',
        icon: 'Settings',
        equipment: [],
      },
    ]);
    setExpandedCat((prev) => ({ ...prev, [categories.length]: true }));
  };

  const handleRemoveCategory = (catIdx: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== catIdx));
  };

  // Step 2: Equipment handlers
  const handleEquipmentChange = (
    catIdx: number,
    eqIdx: number,
    field: keyof EquipmentItem,
    value: any
  ) => {
    setCategories((prev) => {
      const updated = [...prev];
      const eqList = [...(updated[catIdx].equipment || [])];
      eqList[eqIdx] = { ...eqList[eqIdx], [field]: value };
      updated[catIdx] = { ...updated[catIdx], equipment: eqList };
      return updated;
    });
  };

  const handleAddEquipment = (catIdx: number) => {
    const newEqId = `eq-${Date.now()}`;
    setCategories((prev) => {
      const updated = [...prev];
      const eqList = [...(updated[catIdx].equipment || [])];
      eqList.push({
        id: newEqId,
        title: '',
        subtitle: '',
        icon: 'Settings',
        recommendations: [],
      });
      updated[catIdx] = { ...updated[catIdx], equipment: eqList };
      return updated;
    });
    setExpandedEq((prev) => ({ ...prev, [`${catIdx}-${(categories[catIdx]?.equipment?.length || 0)}`]: true }));
  };

  const handleRemoveEquipment = (catIdx: number, eqIdx: number) => {
    setCategories((prev) => {
      const updated = [...prev];
      const eqList = (updated[catIdx].equipment || []).filter((_, i) => i !== eqIdx);
      updated[catIdx] = { ...updated[catIdx], equipment: eqList };
      return updated;
    });
  };

  // Step 3: Recommendation handlers
  const handleRecommendationChange = (
    catIdx: number,
    eqIdx: number,
    recIdx: number,
    field: keyof RecommendationItem,
    value: any
  ) => {
    setCategories((prev) => {
      const updated = [...prev];
      const eqList = [...(updated[catIdx].equipment || [])];
      const recList = [...(eqList[eqIdx].recommendations || [])];
      recList[recIdx] = { ...recList[recIdx], [field]: value };
      eqList[eqIdx] = { ...eqList[eqIdx], recommendations: recList };
      updated[catIdx] = { ...updated[catIdx], equipment: eqList };
      return updated;
    });
  };

  const handleAddRecommendation = (catIdx: number, eqIdx: number) => {
    setCategories((prev) => {
      const updated = [...prev];
      const eqList = [...(updated[catIdx].equipment || [])];
      const recList = [...(eqList[eqIdx].recommendations || [])];
      recList.push({
        name: '',
        grade: '',
        badge: '',
        benefits: [],
        link: '',
      });
      eqList[eqIdx] = { ...eqList[eqIdx], recommendations: recList };
      updated[catIdx] = { ...updated[catIdx], equipment: eqList };
      return updated;
    });
  };

  const handleRemoveRecommendation = (catIdx: number, eqIdx: number, recIdx: number) => {
    setCategories((prev) => {
      const updated = [...prev];
      const eqList = [...(updated[catIdx].equipment || [])];
      const recList = (eqList[eqIdx].recommendations || []).filter((_, i) => i !== recIdx);
      eqList[eqIdx] = { ...eqList[eqIdx], recommendations: recList };
      updated[catIdx] = { ...updated[catIdx], equipment: eqList };
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
          section: 'HomeLubricantFinderSection',
          content: {
            badgeText,
            title,
            subtitle,
            step1Title,
            step1Subtitle,
            step2Title,
            step2Subtitle,
            step3Badge,
            step3Title,
            resetBtnText,
            helplinePrompt,
            helplineText,
            tollFree,
            categories,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Lubricant Finder section saved successfully!');
      } else {
        toast.error(json.error || 'Failed to save section');
      }
    } catch {
      toast.error('Network error saving section');
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
            <Compass className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900 tracking-tight">
              7. Lubricant Finder Advisor
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
              Manage all 3 steps: Step 1 Categories, Step 2 Equipment, and Step 3 Formulation Recommendations.
            </p>
          </div>
        </div>
        <div
          className={`w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 transition-transform duration-300 ${
            isOpen ? 'rotate-180 bg-[#ffe000] text-black' : ''
          }`}
        >
          <ChevronDown className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Header Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Badge Tag"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
              />
              <InputField
                label="Section Heading *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <TextAreaField
              label="Subtitle / Description"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              rows={2}
            />

            {/* Step Workflow Prompts */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
              <div className="text-xs font-black uppercase tracking-wider text-zinc-800">
                Step Workflow Prompts & Headings
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Step 1 Title"
                  value={step1Title}
                  onChange={(e) => setStep1Title(e.target.value)}
                />
                <InputField
                  label="Step 1 Subtitle"
                  value={step1Subtitle}
                  onChange={(e) => setStep1Subtitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Step 2 Title"
                  value={step2Title}
                  onChange={(e) => setStep2Title(e.target.value)}
                />
                <InputField
                  label="Step 2 Subtitle"
                  value={step2Subtitle}
                  onChange={(e) => setStep2Subtitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField
                  label="Step 3 Badge"
                  value={step3Badge}
                  onChange={(e) => setStep3Badge(e.target.value)}
                />
                <InputField
                  label="Step 3 Title"
                  value={step3Title}
                  onChange={(e) => setStep3Title(e.target.value)}
                />
                <InputField
                  label="Reset Button Text"
                  value={resetBtnText}
                  onChange={(e) => setResetBtnText(e.target.value)}
                />
              </div>
            </div>

            {/* 3-Step Nested Category Manager */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-700">
                  <Layers className="w-4 h-4 text-zinc-500" />
                  <span>
                    Step 1: Application Category Domains ({categories.length})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-zinc-900 hover:bg-black text-[#ffe000] transition cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Category
                </button>
              </div>

              {categories.length === 0 ? (
                <div className="p-6 rounded-2xl bg-zinc-50 border border-dashed border-zinc-300 text-center text-xs text-zinc-500">
                  No category cards yet. Click &quot;Add Category&quot; to create one.
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.map((cat, catIdx) => {
                    const isCatOpen = expandedCat[catIdx] ?? false;
                    return (
                      <div
                        key={catIdx}
                        className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4"
                      >
                        {/* Category Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-black text-[#ffe000] text-[10px] font-black uppercase tracking-wider">
                              Step 1 Card #{catIdx + 1}
                            </span>
                            <span className="text-sm font-black text-zinc-900">
                              {cat.title || 'Untitled Category'}
                            </span>
                            <span className="text-xs text-zinc-400">
                              ({(cat.equipment || []).length} equipment types)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedCat((prev) => ({
                                  ...prev,
                                  [catIdx]: !isCatOpen,
                                }))
                              }
                              className="px-2.5 py-1 text-xs font-bold text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100 transition cursor-pointer"
                            >
                              {isCatOpen ? 'Collapse Sub-Steps' : 'Manage Sub-Steps (Steps 2 & 3)'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveCategory(catIdx)}
                              className="text-zinc-400 hover:text-red-600 transition p-1"
                              title="Remove Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Category Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <InputField
                            label="Category ID (e.g. automotive)"
                            value={cat.id || ''}
                            onChange={(e) =>
                              handleCategoryChange(catIdx, 'id', e.target.value)
                            }
                            required
                          />
                          <InputField
                            label="Category Title *"
                            value={cat.title || ''}
                            onChange={(e) =>
                              handleCategoryChange(catIdx, 'title', e.target.value)
                            }
                            required
                          />
                          <InputField
                            label="Icon Name (Truck, Factory, FlaskConical, Settings)"
                            value={cat.icon || ''}
                            onChange={(e) =>
                              handleCategoryChange(catIdx, 'icon', e.target.value)
                            }
                          />
                        </div>

                        <TextAreaField
                          label="Category Subtitle"
                          value={cat.subtitle || ''}
                          onChange={(e) =>
                            handleCategoryChange(catIdx, 'subtitle', e.target.value)
                          }
                          rows={2}
                        />

                        {/* STEP 2 & 3 EXPANDABLE CONTAINER */}
                        {isCatOpen && (
                          <div className="pt-3 border-t border-zinc-200 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-800">
                                <Wrench className="w-3.5 h-3.5 text-zinc-600" />
                                <span>
                                  Step 2: Equipment / Machinery for &ldquo;{cat.title || 'Category'}&rdquo; ({(cat.equipment || []).length})
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAddEquipment(catIdx)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-800 text-white hover:bg-black transition cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                Add Equipment
                              </button>
                            </div>

                            {(cat.equipment || []).length === 0 ? (
                              <div className="p-4 rounded-xl bg-white border border-dashed border-zinc-300 text-center text-xs text-zinc-500">
                                No equipment types defined. Click &ldquo;Add Equipment&rdquo; to add Step 2 machinery cards.
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {(cat.equipment || []).map((eq, eqIdx) => {
                                  const eqKey = `${catIdx}-${eqIdx}`;
                                  const isEqOpen = expandedEq[eqKey] ?? false;
                                  return (
                                    <div
                                      key={eqIdx}
                                      className="p-4 rounded-xl bg-white border border-zinc-200 shadow-xs space-y-3"
                                    >
                                      {/* Equipment header */}
                                      <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                                        <div className="flex items-center gap-2">
                                          <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 text-[10px] font-bold uppercase tracking-wider">
                                            Step 2 Machinery #{eqIdx + 1}
                                          </span>
                                          <span className="text-xs font-black text-zinc-900">
                                            {eq.title || 'Untitled Equipment'}
                                          </span>
                                          <span className="text-[11px] text-zinc-400">
                                            ({(eq.recommendations || []).length} formulations)
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setExpandedEq((prev) => ({
                                                ...prev,
                                                [eqKey]: !isEqOpen,
                                              }))
                                            }
                                            className="px-2 py-0.5 text-xs font-semibold text-zinc-700 bg-zinc-50 border border-zinc-200 rounded hover:bg-zinc-100"
                                          >
                                            {isEqOpen
                                              ? 'Hide Recommendations'
                                              : 'Manage Step 3 Formulations'}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveEquipment(catIdx, eqIdx)}
                                            className="text-zinc-400 hover:text-red-600 transition"
                                            title="Remove Equipment"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Equipment inputs */}
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <InputField
                                          label="Equipment ID (e.g. diesel-heavy)"
                                          value={eq.id || ''}
                                          onChange={(e) =>
                                            handleEquipmentChange(catIdx, eqIdx, 'id', e.target.value)
                                          }
                                          required
                                        />
                                        <InputField
                                          label="Equipment Title *"
                                          value={eq.title || ''}
                                          onChange={(e) =>
                                            handleEquipmentChange(catIdx, eqIdx, 'title', e.target.value)
                                          }
                                          required
                                        />
                                        <InputField
                                          label="Equipment Subtitle"
                                          value={eq.subtitle || ''}
                                          onChange={(e) =>
                                            handleEquipmentChange(catIdx, eqIdx, 'subtitle', e.target.value)
                                          }
                                        />
                                      </div>

                                      {/* STEP 3 RECOMMENDATIONS CONTAINER */}
                                      {isEqOpen && (
                                        <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 space-y-3">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-zinc-700">
                                              <Sparkles className="w-3 h-3 text-[#ffe000]" />
                                              <span>
                                                Step 3: Recommended Formulations ({(eq.recommendations || []).length})
                                              </span>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => handleAddRecommendation(catIdx, eqIdx)}
                                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#ffe000] text-black hover:bg-yellow-400 transition"
                                            >
                                              <Plus className="w-3 h-3" />
                                              Add Formulation
                                            </button>
                                          </div>

                                          {(eq.recommendations || []).length === 0 ? (
                                            <div className="p-3 text-center text-xs text-zinc-400">
                                              No formulations added yet for this equipment.
                                            </div>
                                          ) : (
                                            <div className="space-y-3">
                                              {(eq.recommendations || []).map((rec, recIdx) => (
                                                <div
                                                  key={recIdx}
                                                  className="p-3 rounded-lg bg-white border border-zinc-200 space-y-2 relative"
                                                >
                                                  <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-black text-zinc-800">
                                                      Formulation #{recIdx + 1}: {rec.name || 'New Product'}
                                                    </span>
                                                    <button
                                                      type="button"
                                                      onClick={() =>
                                                        handleRemoveRecommendation(catIdx, eqIdx, recIdx)
                                                      }
                                                      className="text-zinc-400 hover:text-red-600 transition"
                                                      title="Remove Formulation"
                                                    >
                                                      <Trash2 className="w-3 h-3" />
                                                    </button>
                                                  </div>

                                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                    <InputField
                                                      label="Product Name *"
                                                      value={rec.name || ''}
                                                      onChange={(e) =>
                                                        handleRecommendationChange(
                                                          catIdx,
                                                          eqIdx,
                                                          recIdx,
                                                          'name',
                                                          e.target.value
                                                        )
                                                      }
                                                      required
                                                    />
                                                    <InputField
                                                      label="API / ISO Grade Spec"
                                                      value={rec.grade || ''}
                                                      onChange={(e) =>
                                                        handleRecommendationChange(
                                                          catIdx,
                                                          eqIdx,
                                                          recIdx,
                                                          'grade',
                                                          e.target.value
                                                        )
                                                      }
                                                    />
                                                    <InputField
                                                      label="Badge Tag (e.g. Euro 6 Ready)"
                                                      value={rec.badge || ''}
                                                      onChange={(e) =>
                                                        handleRecommendationChange(
                                                          catIdx,
                                                          eqIdx,
                                                          recIdx,
                                                          'badge',
                                                          e.target.value
                                                        )
                                                      }
                                                    />
                                                  </div>

                                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    <InputField
                                                      label="Product URL / Catalog Link"
                                                      value={rec.link || ''}
                                                      onChange={(e) =>
                                                        handleRecommendationChange(
                                                          catIdx,
                                                          eqIdx,
                                                          recIdx,
                                                          'link',
                                                          e.target.value
                                                        )
                                                      }
                                                    />
                                                    <InputField
                                                      label="Bullet Benefits (comma-separated)"
                                                      value={(rec.benefits || []).join(', ')}
                                                      onChange={(e) =>
                                                        handleRecommendationChange(
                                                          catIdx,
                                                          eqIdx,
                                                          recIdx,
                                                          'benefits',
                                                          e.target.value
                                                            .split(',')
                                                            .map((s) => s.trim())
                                                            .filter(Boolean)
                                                        )
                                                      }
                                                    />
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Helpline Callout */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <InputField
                label="Helpline Callout Title"
                value={helplinePrompt}
                onChange={(e) => setHelplinePrompt(e.target.value)}
              />
              <InputField
                label="Helpline Description"
                value={helplineText}
                onChange={(e) => setHelplineText(e.target.value)}
              />
              <InputField
                label="Toll Free Phone"
                value={tollFree}
                onChange={(e) => setTollFree(e.target.value)}
              />
            </div>

            <div className="flex justify-end pt-2">
              <SaveButton loading={loading} label="Save Finder Settings" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
