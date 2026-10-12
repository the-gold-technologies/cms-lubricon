'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Layers } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { ImageUploadField } from '@/components/ImageUploadField';
import { SaveButton } from '@/components/SaveButton';
import { uploadFiles } from '@/lib/uploadHelpers';

interface CategoryItem {
  name: string;
  description: string;
  image: string;
  badge: string;
}

export function BrandsProductCategoriesSection({
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

  const [eyebrow, setEyebrow] = useState('');
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoryImages, setCategoryImages] = useState<Record<number, (File | string | null)[]>>(
    {}
  );

  useEffect(() => {
    if (initialData) {
      if (initialData.eyebrow) setEyebrow(initialData.eyebrow);
      if (initialData.heading) setHeading(initialData.heading);
      if (initialData.description) setDescription(initialData.description);

      const loadedCats = initialData.categories;
      if (Array.isArray(loadedCats)) {
        setCategories(loadedCats);
        const imgMap: Record<number, (File | string | null)[]> = {};
        loadedCats.forEach((c: CategoryItem, i: number) => {
          if (c.image) imgMap[i] = [c.image];
        });
        setCategoryImages(imgMap);
      }
    }
  }, [initialData]);

  const handleCategoryChange = (index: number, field: keyof CategoryItem, val: string) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [field]: val };
    setCategories(updated);
  };

  const handleImageChange = (index: number, newImgs: (File | string | null)[]) => {
    setCategoryImages((prev) => ({ ...prev, [index]: newImgs }));
  };

  const handleAddCategory = () => {
    const newIdx = categories.length;
    setCategories([
      ...categories,
      {
        name: '',
        description: '',
        image: '',
        badge: '',
      },
    ]);
    setCategoryImages((prev) => ({ ...prev, [newIdx]: [''] }));
  };

  const handleRemoveCategory = (index: number) => {
    if (categories.length <= 1) {
      toast.error('At least one product category is required.');
      return;
    }
    setCategories(categories.filter((_, idx) => idx !== index));
    const newImgMap: Record<number, (File | string | null)[]> = {};
    let cursor = 0;
    categories.forEach((_, i) => {
      if (i !== index) {
        if (categoryImages[i]) newImgMap[cursor] = categoryImages[i];
        cursor++;
      }
    });
    setCategoryImages(newImgMap);
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const updatedCategories = await Promise.all(
        categories.map(async (cat, idx) => {
          const imgs = (categoryImages[idx] || []).filter((im): im is File | string => !!im);
          let finalImg = cat.image || '';
          if (imgs.length > 0) {
            const [uploaded] = await uploadFiles(imgs);
            if (uploaded) finalImg = uploaded;
          }
          return {
            name: cat.name.trim(),
            description: cat.description.trim(),
            badge: cat.badge.trim(),
            image: finalImg,
          };
        })
      );

      const payload = {
        eyebrow: eyebrow.trim(),
        heading: heading.trim(),
        description: description.trim(),
        categories: updatedCategories,
      };

      const res = await fetch('/api/brands', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'BrandsProductCategoriesSection',
          content: payload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaved(true);
        setCategories(updatedCategories);
        toast.success('Product Categories saved successfully');
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch {
      toast.error('Error saving Categories section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6 transition-all">
      <SectionHeader
        title="4. Product Categories Spectrum"
        description="Configure product spectrum categories with custom imagery, specifications badge, and description."
        badge={`${categories.length} Categories`}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Eyebrow Subtitle"
                value={eyebrow}
                onChange={(e) => setEyebrow(e.target.value)}
                placeholder="COMPREHENSIVE FLUID SPECTRUM"
              />
              <InputField
                label="Section Heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="Lubrication Solutions for Every Industrial & Automotive Sector"
              />
            </div>

            <TextAreaField
              label="Intro Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="From ultra-pure turbine fluids to heavy-duty earthmover diesel oils..."
            />

            {/* Dynamic Category Cards (2 in a row) */}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#0C356A]">
                  <Layers className="w-4 h-4 text-[#C86218]" />
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Category Cards ({categories.length})
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#C86218] hover:text-[#0C356A] transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Category
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {categories.map((cat, index) => (
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
                        onClick={() => handleRemoveCategory(index)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all cursor-pointer"
                        title="Remove Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <InputField
                        label="Category Name"
                        value={cat.name}
                        onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                        placeholder="Automotive & Engine Oils"
                      />
                      <InputField
                        label="Badge / Standard Tag"
                        value={cat.badge}
                        onChange={(e) => handleCategoryChange(index, 'badge', e.target.value)}
                        placeholder="e.g. API CK-4 / SN Plus"
                      />
                    </div>

                    <TextAreaField
                      label="Description"
                      value={cat.description}
                      onChange={(e) => handleCategoryChange(index, 'description', e.target.value)}
                      rows={2}
                      placeholder="Brief overview of fluids in this spectrum..."
                    />

                    <ImageUploadField
                      label="Category Thumbnail / Fluid Image"
                      images={categoryImages[index] || (cat.image ? [cat.image] : [''])}
                      onImagesChange={(imgs) => handleImageChange(index, imgs)}
                      maxImages={1}
                      tooltip="Upload product or barrel representation photo."
                    />
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
