'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import {
  BrandsHeroSection,
  BrandsStatsBandSection,
  BrandsPillarsSection,
  BrandsProductCategoriesSection,
  BrandsCtaSection,
} from './components';

export default function BrandsPageEditor() {
  const [brandsData, setBrandsData] = useState<any>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (sectionKey: string) => {
    setOpenSection((prev) => (prev === sectionKey ? null : sectionKey));
  };

  useEffect(() => {
    async function loadBrandsData() {
      try {
        const res = await fetch('/api/brands');
        const json = await res.json();
        if (json.success && json.data) {
          setBrandsData(json.data);
        }
      } catch (err) {
        console.error('Failed to load brands page data:', err);
      }
    }
    loadBrandsData();
  }, []);

  return (
    <section className="flex flex-col gap-8 pb-12">
      <PageHeader
        title="Brands Page Content"
        description="Manage all live sections of the Brands page: Hero Banner, Key Industry Statistics, Brand Value Pillars, Product Categories Spectrum, and Consultation CTA."
      />

      {/* 1. Hero Section */}
      <BrandsHeroSection
        initialData={brandsData?.BrandsHero}
        isOpen={openSection === 'hero'}
        onToggle={() => toggleSection('hero')}
      />

      {/* 2. Key Industry Statistics Band */}
      <BrandsStatsBandSection
        initialData={brandsData?.BrandsStatsBand}
        isOpen={openSection === 'stats'}
        onToggle={() => toggleSection('stats')}
      />

      {/* 3. Brand Value Pillars & Refinery Guarantee */}
      <BrandsPillarsSection
        initialData={brandsData?.BrandsPillarsSection}
        isOpen={openSection === 'pillars'}
        onToggle={() => toggleSection('pillars')}
      />

      {/* 4. Product Categories Spectrum */}
      <BrandsProductCategoriesSection
        initialData={brandsData?.BrandsProductCategoriesSection}
        isOpen={openSection === 'categories'}
        onToggle={() => toggleSection('categories')}
      />

      {/* 5. Consultation & Contact CTA */}
      <BrandsCtaSection
        initialData={brandsData?.BrandsCtaSection}
        isOpen={openSection === 'cta'}
        onToggle={() => toggleSection('cta')}
      />
    </section>
  );
}
