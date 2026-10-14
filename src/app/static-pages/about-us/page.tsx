'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import {
  AboutHeroSection,
  AboutStatsSection,
  AboutValuesSection,
  AboutPortfolioSection,
  AboutTimelineSection,
  AboutCtaBannerSection,
} from './components';

export default function AboutUsPageEditor() {
  const [aboutData, setAboutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    hero: true, // Only hero section is open by default
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    async function loadAboutData() {
      try {
        setLoading(true);
        const res = await fetch('/api/about-us');
        const json = await res.json();
        if (json.success && json.data) {
          setAboutData(json.data);
        }
      } catch (err) {
        console.error('Failed to load about us data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAboutData();
  }, []);

  return (
    <section className="flex flex-col gap-8 pb-16">
      <PageHeader
        title="About Us Page Content"
        description="Manage all 6 live sections of the Lubricon About Us page: Hero & Company Narrative, Stats, Core Principles, Product Portfolio, Historical Journey Timeline, and Closing CTA Banner."
      />

      {loading ? (
        <LoadingIndicator message="Loading About Us sections from database..." />
      ) : (
        <div className="flex flex-col gap-8">
          {/* 1. Hero & Narrative */}
          <AboutHeroSection
            initialData={aboutData?.AboutHero}
            isOpen={openSections.hero ?? true}
            onToggle={() => toggleSection('hero')}
          />

          {/* 2. Key Stats Strip */}
          <AboutStatsSection
            initialData={aboutData?.AboutStats}
            isOpen={openSections.stats ?? false}
            onToggle={() => toggleSection('stats')}
          />

          {/* 3. Core Principles & Values */}
          <AboutValuesSection
            initialData={aboutData?.AboutValues}
            isOpen={openSections.values ?? false}
            onToggle={() => toggleSection('values')}
          />

          {/* 4. Complete Lubrication Portfolio */}
          <AboutPortfolioSection
            initialData={aboutData?.AboutPortfolio}
            isOpen={openSections.portfolio ?? false}
            onToggle={() => toggleSection('portfolio')}
          />

          {/* 5. Historical Journey Timeline */}
          <AboutTimelineSection
            initialData={aboutData?.AboutTimeline}
            isOpen={openSections.timeline ?? false}
            onToggle={() => toggleSection('timeline')}
          />

          {/* 6. Closing Call-To-Action Banner */}
          <AboutCtaBannerSection
            initialData={aboutData?.AboutCtaBanner}
            isOpen={openSections.cta ?? false}
            onToggle={() => toggleSection('cta')}
          />
        </div>
      )}
    </section>
  );
}
