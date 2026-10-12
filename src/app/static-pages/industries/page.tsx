'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import {
  IndustriesHeroSection,
  IndustryStageSection,
  LessYouBurnImpactSection,
  MachineryFeatureSection,
  PlantProcessSection,
  IndustriesConsultationCTA,
} from './components';

export default function IndustriesPageEditor() {
  const [industriesData, setIndustriesData] = useState<any>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (sectionKey: string) => {
    setOpenSection((prev) => (prev === sectionKey ? null : sectionKey));
  };

  useEffect(() => {
    async function loadIndustriesData() {
      try {
        const res = await fetch('/api/industries');
        const json = await res.json();
        if (json.success && json.data) {
          setIndustriesData(json.data);
        }
      } catch (err) {
        console.error('Failed to load industries page data:', err);
      }
    }
    loadIndustriesData();
  }, []);

  return (
    <section className="flex flex-col gap-8 pb-12">
      <PageHeader
        title="Industries Page Content"
        description="Manage all live sections of the Industries page: Hero, Interactive Sector Lubrication Stages, Less You Burn Impact, Critical Machinery, 01-04 Workflow, and Technical Consultation CTA."
      />

      {/* 1. Hero */}
      <IndustriesHeroSection
        initialData={industriesData?.IndustriesHero}
        isOpen={openSection === 'hero'}
        onToggle={() => toggleSection('hero')}
      />

      {/* 2. Sector Lubrication Stages */}
      <IndustryStageSection
        initialData={industriesData?.IndustryStageSection}
        isOpen={openSection === 'stage'}
        onToggle={() => toggleSection('stage')}
      />

      {/* 3. Less You Burn Impact */}
      <LessYouBurnImpactSection
        initialData={industriesData?.LessYouBurnImpactSection}
        isOpen={openSection === 'impact'}
        onToggle={() => toggleSection('impact')}
      />

      {/* 4. Critical Plant Machinery Deep-Dive */}
      <MachineryFeatureSection
        initialData={industriesData?.MachineryFeatureSection}
        isOpen={openSection === 'machinery'}
        onToggle={() => toggleSection('machinery')}
      />

      {/* 5. 01-04 Workflow */}
      <PlantProcessSection
        initialData={industriesData?.PlantProcessSection}
        isOpen={openSection === 'process'}
        onToggle={() => toggleSection('process')}
      />

      {/* 6. Technical Consultation CTA */}
      <IndustriesConsultationCTA
        initialData={industriesData?.IndustriesConsultationCTA}
        isOpen={openSection === 'cta'}
        onToggle={() => toggleSection('cta')}
      />
    </section>
  );
}
