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
      <HomeHeroSliderSection initialData={homeData?.HeroSlider} />

      {/* 2. Key Stats & Metric Numbers */}
      <HomeStatsSection initialData={homeData?.HomeStats} />

      {/* 3. Government & Institutional Procurement (GeM & IREPS) */}
      <HomeGovernmentProcurementSection
        initialData={homeData?.HomeGovernmentProcurement || homeData?.GovernmentProcurement}
      />

      {/* 4. Industries We Serve */}
      <HomeIndustriesSection initialData={homeData?.HomeIndustries} />

      {/* 5. About Lubricon Narrative & Framed Photo */}
      <HomeAboutStripSection initialData={homeData?.HomeAboutStrip} />

      {/* 6. Product Portfolio Showcase */}
      <HomeProductShowcaseSection initialData={homeData?.HomeProductShowcase} />

      {/* 7. Interactive Lubricant Finder Section */}
      <HomeLubricantFinderSection
        initialData={homeData?.HomeLubricantFinderSection || homeData?.HomeLubricantFinder}
      />

      {/* 8. Conversion CTA Banner */}
      <HomeCtaBannerSection initialData={homeData?.HomeCtaBanner} />
    </section>
  );
}
