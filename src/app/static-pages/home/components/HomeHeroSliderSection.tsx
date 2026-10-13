'use client';

import React, { useState, useEffect } from 'react';
import { SaveButton } from '@/components/SaveButton';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { ImageUploadField } from '@/components/ImageUploadField';
import { Layers, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface HeroSlide {
  tagline: string;
  heading: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  image: string;
}

interface HomeHeroSliderSectionProps {
  initialData?: {
    slides?: HeroSlide[];
  };
  isOpen?: boolean;
  onToggle?: () => void;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    tagline: 'AUSTRALIAN TECHNOLOGY',
    heading: 'High Performance Industrial Lubricants',
    description: 'Engineered for extreme operating environments across Indian manufacturing and transport sectors.',
    ctaText: 'Explore Products',
    ctaLink: '/products',
    secondaryCtaText: 'Request Technical Audit',
    secondaryCtaLink: '/contact',
    image: '/images/hero-factory.jpg',
  },
  {
    tagline: 'NEXT-GEN FLEET SOLUTIONS',
    heading: 'API CK-4 & CI-4 Plus Heavy Duty Engine Oils',
    description: 'Maximizing uptime, protecting SCR & EGR emissions, and slashing total operating costs for modern fleets.',
    ctaText: 'View Diesel Oils',
    ctaLink: '/products?cat=engine-oil',
    secondaryCtaText: 'Toll Free: 1800 569 6363',
    secondaryCtaLink: 'tel:18005696363',
    image: '/images/hero-fleet.jpg',
  },
];

export function HomeHeroSliderSection({
  initialData,
  isOpen: controlledIsOpen,
  onToggle,
}: HomeHeroSliderSectionProps) {
  const [internalOpen, setInternalOpen] = useState(true);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [loading, setLoading] = useState(false);
  const [openSlideIndex, setOpenSlideIndex] = useState<number | null>(0);

  useEffect(() => {
    if (initialData?.slides && Array.isArray(initialData.slides) && initialData.slides.length > 0) {
      setSlides(initialData.slides);
    }
  }, [initialData]);

  const handleSlideChange = (index: number, field: keyof HeroSlide, value: string) => {
    setSlides((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddSlide = () => {
    setSlides((prev) => [
      ...prev,
      {
        tagline: 'LUBRICON SPECIALITIES',
        heading: 'Australian Precision Lubrication',
        description: 'Advanced lubricants engineered for maximum machine uptime.',
        ctaText: 'Explore Catalog',
        ctaLink: '/products',
        secondaryCtaText: 'Contact Helpline',
        secondaryCtaLink: '/contact',
        image: '/images/hero-factory.jpg',
      },
    ]);
    setOpenSlideIndex(slides.length);
  };

  const handleRemoveSlide = (index: number) => {
    if (slides.length <= 1) {
      toast.error('You must keep at least one hero slide.');
      return;
    }
    setSlides((prev) => prev.filter((_, i) => i !== index));
    if (openSlideIndex === index) setOpenSlideIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'HeroSlider',
          content: { slides },
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Hero Slider slides saved successfully!');
      } else {
        toast.error(json.error || 'Failed to save Hero Slider');
      }
    } catch {
      toast.error('Network error saving Hero Slider');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-zinc-200">
      <div onClick={handleToggle} className="flex items-center justify-between pb-6 border-b border-zinc-100 cursor-pointer select-none group">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#ffe000] text-black">
            <Layers className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900 tracking-tight">1. Homepage Hero Slider</h2>
            <p className="text-xs text-zinc-500 font-medium">
              Manage carousel slides, Australian tech headlines, CTA buttons, and background banner photos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAddSlide();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-zinc-900 hover:bg-black text-[#ffe000] transition cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Slide
          </button>
          <div className={`w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 transition-transform duration-300 ${isOpen ? "rotate-180 bg-[#ffe000] text-black" : ""}`}>
            <ChevronDown className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
      </div>

      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="space-y-4">
          {slides.map((slide, idx) => {
            const isOpen = openSlideIndex === idx;
            return (
              <div key={idx} className="border border-zinc-200 rounded-2xl overflow-hidden transition-all bg-zinc-50/60">
                <div
                  className="flex items-center justify-between px-5 py-3.5 cursor-pointer bg-zinc-100/70 hover:bg-zinc-100 select-none"
                  onClick={() => setOpenSlideIndex(isOpen ? null : idx)}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-black text-[#ffe000] font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-extrabold text-zinc-900 truncate max-w-md">
                      {slide.heading || `Slide ${idx + 1}`}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 bg-white border border-zinc-200 px-2 py-0.5 rounded-full">
                      {slide.tagline || 'SLIDE'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSlide(idx);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg transition"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="p-5 space-y-4 bg-white border-t border-zinc-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField
                        label="Tagline / Badge Text"
                        value={slide.tagline}
                        onChange={(e) => handleSlideChange(idx, 'tagline', e.target.value)}
                        placeholder="e.g. AUSTRALIAN TECHNOLOGY"
                      />
                      <InputField
                        label="Main Slide Heading *"
                        value={slide.heading}
                        onChange={(e) => handleSlideChange(idx, 'heading', e.target.value)}
                        placeholder="e.g. High Performance Industrial Lubricants"
                        required
                      />
                    </div>

                    <TextAreaField
                      label="Slide Subtitle Narrative"
                      value={slide.description}
                      onChange={(e) => handleSlideChange(idx, 'description', e.target.value)}
                      rows={2}
                      placeholder="e.g. Engineered for extreme operating environments across Indian manufacturing..."
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <InputField
                        label="Primary CTA Text"
                        value={slide.ctaText}
                        onChange={(e) => handleSlideChange(idx, 'ctaText', e.target.value)}
                        placeholder="Explore Products"
                      />
                      <InputField
                        label="Primary CTA Link"
                        value={slide.ctaLink}
                        onChange={(e) => handleSlideChange(idx, 'ctaLink', e.target.value)}
                        placeholder="/products"
                      />
                      <InputField
                        label="Secondary CTA Text"
                        value={slide.secondaryCtaText}
                        onChange={(e) => handleSlideChange(idx, 'secondaryCtaText', e.target.value)}
                        placeholder="Request Technical Audit"
                      />
                      <InputField
                        label="Secondary CTA Link"
                        value={slide.secondaryCtaLink}
                        onChange={(e) => handleSlideChange(idx, 'secondaryCtaLink', e.target.value)}
                        placeholder="/contact"
                      />
                    </div>

                    <ImageUploadField
                      label="Background Banner Image"
                      images={slide.image ? [slide.image] : []}
                      onImagesChange={(imgs) => handleSlideChange(idx, 'image', typeof imgs[0] === 'string' ? imgs[0] : '')}
                      maxImages={1}
                      tooltip="Upload high-res factory, plant, or fleet machinery photo."
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2">
          <SaveButton loading={loading} label="Save Hero Slider" />
        </div>
      </form>
        </div>
      </div>
    </div>
  );
}
