'use client';

import React, { useState, useEffect } from 'react';
import { SaveButton } from '@/components/SaveButton';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { ImageUploadField } from '@/components/ImageUploadField';
import { ShieldCheck, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProcurementCard {
  title: string;
  badge: string;
  description: string;
  link: string;
  logo: string;
}

interface HomeGovernmentProcurementSectionProps {
  initialData?: {
    badgeText?: string;
    title?: string;
    subtitle?: string;
    gemCard?: ProcurementCard;
    irepsCard?: ProcurementCard;
  };
  isOpen?: boolean;
  onToggle?: () => void;
}

export function HomeGovernmentProcurementSection({
  initialData,
  isOpen: controlledIsOpen,
  onToggle,
}: HomeGovernmentProcurementSectionProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));
  const [badgeText, setBadgeText] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [gemCard, setGemCard] = useState<ProcurementCard>({
    title: '',
    badge: '',
    description: '',
    link: '',
    logo: '',
  });
  const [irepsCard, setIrepsCard] = useState<ProcurementCard>({
    title: '',
    badge: '',
    description: '',
    link: '',
    logo: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.badgeText) setBadgeText(initialData.badgeText);
      if (initialData.title) setTitle(initialData.title);
      if (initialData.subtitle) setSubtitle(initialData.subtitle);
      if (initialData.gemCard) setGemCard(initialData.gemCard);
      if (initialData.irepsCard) setIrepsCard(initialData.irepsCard);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'HomeGovernmentProcurement',
          content: { badgeText, title, subtitle, gemCard, irepsCard },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Government Procurement section saved successfully!');
      } else {
        toast.error(json.error || 'Failed to save GeM & IREPS credentials');
      }
    } catch {
      toast.error('Network error saving procurement section');
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
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900 tracking-tight">
              3. Government Procurement (GeM & IREPS)
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
              Manage Government e-Marketplace and Indian Railways E-Procurement vendor credentials
              and direct links.
            </p>
          </div>
        </div>
        <div
          className={`w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-[#ffe000] text-black' : ''}`}
        >
          <ChevronDown className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField
                label="Badge Tag"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="Official E-Procurement Registration"
              />
              <InputField
                label="Main Heading *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="We Are Registered on GeM & IREPS"
                required
              />
              <InputField
                label="Subtitle Description"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Registered and approved supplier..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* GeM Portal Card */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
                <h3 className="text-sm font-black text-black">GeM Portal Credentials</h3>
                <InputField
                  label="Card Title"
                  value={gemCard.title}
                  onChange={(e) => setGemCard({ ...gemCard, title: e.target.value })}
                />
                <InputField
                  label="Status Badge"
                  value={gemCard.badge}
                  onChange={(e) => setGemCard({ ...gemCard, badge: e.target.value })}
                />
                <TextAreaField
                  label="Description"
                  value={gemCard.description}
                  onChange={(e) => setGemCard({ ...gemCard, description: e.target.value })}
                  rows={2}
                />
                <InputField
                  label="Portal External Link"
                  value={gemCard.link}
                  onChange={(e) => setGemCard({ ...gemCard, link: e.target.value })}
                />
                <ImageUploadField
                  label="GeM Official Logo"
                  images={gemCard.logo ? [gemCard.logo] : []}
                  onImagesChange={(imgs) =>
                    setGemCard({ ...gemCard, logo: typeof imgs[0] === 'string' ? imgs[0] : '' })
                  }
                  maxImages={1}
                />
              </div>

              {/* IREPS Portal Card */}
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
                <h3 className="text-sm font-black text-black">IREPS Portal Credentials</h3>
                <InputField
                  label="Card Title"
                  value={irepsCard.title}
                  onChange={(e) => setIrepsCard({ ...irepsCard, title: e.target.value })}
                />
                <InputField
                  label="Status Badge"
                  value={irepsCard.badge}
                  onChange={(e) => setIrepsCard({ ...irepsCard, badge: e.target.value })}
                />
                <TextAreaField
                  label="Description"
                  value={irepsCard.description}
                  onChange={(e) => setIrepsCard({ ...irepsCard, description: e.target.value })}
                  rows={2}
                />
                <InputField
                  label="Portal External Link"
                  value={irepsCard.link}
                  onChange={(e) => setIrepsCard({ ...irepsCard, link: e.target.value })}
                />
                <ImageUploadField
                  label="IREPS Official Logo"
                  images={irepsCard.logo ? [irepsCard.logo] : []}
                  onImagesChange={(imgs) =>
                    setIrepsCard({ ...irepsCard, logo: typeof imgs[0] === 'string' ? imgs[0] : '' })
                  }
                  maxImages={1}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <SaveButton loading={loading} label="Save GeM & IREPS Details" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
