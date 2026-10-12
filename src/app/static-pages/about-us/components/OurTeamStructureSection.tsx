'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Users } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';
import { SaveButton } from '@/components/SaveButton';

interface Role {
  count: string;
  label: string;
}
interface Card {
  step: number;
  title: string;
  total: string;
  icon: string;
  tagline?: string;
  roles: Role[];
}

const ICON_OPTIONS = ['Factory', 'Globe2', 'Bike', 'Cog', 'Users', 'Truck', 'ShieldCheck', 'Boxes'];
const EMPTY_ROLE: Role = { count: '', label: '' };
const makeEmptyCard = (step: number): Card => ({
  step,
  title: '',
  total: '',
  icon: 'Factory',
  tagline: '',
  roles: [{ ...EMPTY_ROLE }],
});

export function OurTeamStructureSection({ initialData }: { initialData?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    if (initialData) {
      setHeading(initialData.heading || '');
      setDescription(initialData.description || '');
      setCards(initialData.cards || []);
    }
  }, [initialData]);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch('/api/about-us', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'OurTeamStructureSection',
          content: { heading: heading.trim(), description: description.trim(), cards },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSaved(true);
        toast.success('Team structure saved successfully');
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error saving');
    } finally {
      setLoading(false);
    }
  };

  const addCard = () => setCards([...cards, makeEmptyCard(cards.length + 1)]);

  const removeCard = (idx: number) => {
    if (cards.length <= 1) {
      toast.error('At least one card is required.');
      return;
    }
    setCards(cards.filter((_, i) => i !== idx).map((c, i) => ({ ...c, step: i + 1 })));
  };

  const updateCard = (idx: number, field: keyof Card, val: any) => {
    const updated = [...cards];
    updated[idx] = { ...updated[idx], [field]: val };
    setCards(updated);
  };

  const addRole = (cardIdx: number) => {
    const updated = [...cards];
    updated[cardIdx] = {
      ...updated[cardIdx],
      roles: [...updated[cardIdx].roles, { ...EMPTY_ROLE }],
    };
    setCards(updated);
  };

  const removeRole = (cardIdx: number, roleIdx: number) => {
    const updated = [...cards];
    if (updated[cardIdx].roles.length <= 1) {
      toast.error('At least one role is required.');
      return;
    }
    updated[cardIdx] = {
      ...updated[cardIdx],
      roles: updated[cardIdx].roles.filter((_, i) => i !== roleIdx),
    };
    setCards(updated);
  };

  const updateRole = (cardIdx: number, roleIdx: number, field: keyof Role, val: string) => {
    const updated = [...cards];
    const roles = [...updated[cardIdx].roles];
    roles[roleIdx] = { ...roles[roleIdx], [field]: val };
    updated[cardIdx] = { ...updated[cardIdx], roles };
    setCards(updated);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-4 transition-all">
      <SectionHeader
        title="3. Our Team Structure"
        description="Configure department cards showing team headcount and role breakdowns."
        badge={`${cards.length} Cards`}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />

      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-6 pt-4">
            {/* Section meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Section Heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="Our Team Structure"
              />
              <InputField
                label="Description (use &lt;strong&gt; for bold)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A synchronized workforce of <strong>62+</strong> specialists…"
              />
            </div>

            {/* Department Cards */}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#0C356A]">
                  <Users className="w-4 h-4 text-[#C86218]" />
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Department Cards ({cards.length})
                  </label>
                </div>
                <button
                  type="button"
                  onClick={addCard}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#C86218] hover:text-[#0C356A] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Card
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {cards.map((card, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-gray-50/80 rounded-2xl border border-gray-200/70 flex flex-col gap-4"
                  >
                    {/* Card header */}
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-full bg-[#0C356A] text-white text-xs font-black flex items-center justify-center shrink-0">
                        {card.step}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCard(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all cursor-pointer"
                        title="Remove card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <InputField
                        label="Title"
                        value={card.title}
                        onChange={(e) => updateCard(idx, 'title', e.target.value)}
                        placeholder="Industrial Sales"
                      />
                      <InputField
                        label="Total Members"
                        value={card.total}
                        onChange={(e) => updateCard(idx, 'total', e.target.value)}
                        placeholder="27 Members"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-600">Icon</label>
                        <select
                          value={card.icon}
                          onChange={(e) => updateCard(idx, 'icon', e.target.value)}
                          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0C356A]/20"
                        >
                          {ICON_OPTIONS.map((ic) => (
                            <option key={ic} value={ic}>
                              {ic}
                            </option>
                          ))}
                        </select>
                      </div>
                      <InputField
                        label="Tagline (optional)"
                        value={card.tagline || ''}
                        onChange={(e) => updateCard(idx, 'tagline', e.target.value)}
                        placeholder="e.g. Indiamart & SEO"
                      />
                    </div>

                    {/* Roles */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-gray-600">Roles</label>
                        <button
                          type="button"
                          onClick={() => addRole(idx)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C86218] hover:text-[#0C356A] transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add Role
                        </button>
                      </div>
                      {card.roles.map((role, rIdx) => (
                        <div key={rIdx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={role.count}
                            onChange={(e) => updateRole(idx, rIdx, 'count', e.target.value)}
                            placeholder="20"
                            className="w-16 border border-gray-200 rounded-lg px-2 py-2.5 text-xs font-bold text-center bg-white focus:outline-none focus:ring-1 focus:ring-[#0C356A]/30"
                          />
                          <input
                            type="text"
                            value={role.label}
                            onChange={(e) => updateRole(idx, rIdx, 'label', e.target.value)}
                            placeholder="Field Sales Officers"
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0C356A]/30"
                          />
                          <button
                            type="button"
                            onClick={() => removeRole(idx, rIdx)}
                            className="p-1 text-gray-300 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
