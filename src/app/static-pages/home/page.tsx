'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { HomeHeroSliderSection } from './components/HomeHeroSliderSection';
import { HomeStatsSection } from './components/HomeStatsSection';
import { HomeGovernmentProcurementSection } from './components/HomeGovernmentProcurementSection';
import { HomeIndustriesSection } from './components/HomeIndustriesSection';
import { HomeAboutStripSection } from './components/HomeAboutStripSection';
import { HomeProductShowcaseSection } from './components/HomeProductShowcaseSection';
import { HomeLubricantFinderSection } from './components/HomeLubricantFinderSection';
import { HomeCtaBannerSection } from './components/HomeCtaBannerSection';

export default function HomePageEditor() {
  const [homeData, setHomeData] = useState<any>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    hero: true, // Only hero section is open by default
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    async function loadHomeData() {
      try {
        const res = await fetch('/api/home');
        const json = await res.json();
        if (json.success && json.data) {
          setHomeData(json.data);
        }
      } catch (err) {
        console.error('Failed to load home sections:', err);
      }
    }
    loadHomeData();
  }, []);

  return (
    <section className="flex flex-col gap-8 pb-12">
      <PageHeader
        title="Home Page Content"
        description="Manage the live layout sections of your homepage. Edit fields below to update the website immediately."
      />

      {/* 1. Hero Carousel / Slider */}
      <HomeHeroSliderSection
        initialData={homeData?.HeroSlider}
        isOpen={openSections.hero ?? true}
        onToggle={() => toggleSection('hero')}
      />

      {/* 2. Key Stats & Metric Numbers */}
      <HomeStatsSection
        initialData={homeData?.HomeStats}
        isOpen={openSections.stats ?? false}
        onToggle={() => toggleSection('stats')}
      />

      {/* 3. Government & Institutional Procurement (GeM & IREPS) */}
      <HomeGovernmentProcurementSection
        initialData={homeData?.HomeGovernmentProcurement || homeData?.GovernmentProcurement}
        isOpen={openSections.procurement ?? false}
        onToggle={() => toggleSection('procurement')}
      />

      {/* 4. Industries We Serve */}
      <HomeIndustriesSection
        initialData={homeData?.HomeIndustries}
        isOpen={openSections.industries ?? false}
        onToggle={() => toggleSection('industries')}
      />

      {/* 5. About Lubricon Narrative & Framed Photo */}
      <HomeAboutStripSection
        initialData={homeData?.HomeAboutStrip}
        isOpen={openSections.about ?? false}
        onToggle={() => toggleSection('about')}
      />

      {/* 6. Product Portfolio Showcase */}
      <HomeProductShowcaseSection
        initialData={homeData?.HomeProductShowcase}
        isOpen={openSections.products ?? false}
        onToggle={() => toggleSection('products')}
      />

      {/* 7. Interactive Lubricant Finder Section */}
      <HomeLubricantFinderSection
        initialData={homeData?.HomeLubricantFinderSection || homeData?.HomeLubricantFinder}
        isOpen={openSections.finder ?? false}
        onToggle={() => toggleSection('finder')}
      />

      {/* 8. Conversion CTA Banner */}
      <HomeCtaBannerSection
        initialData={homeData?.HomeCtaBanner}
        isOpen={openSections.cta ?? false}
        onToggle={() => toggleSection('cta')}
      />
    </section>
  );
}
