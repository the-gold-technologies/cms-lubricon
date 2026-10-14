'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import {
  IndustriesHeroSection,
  IndustriesListSection,
  IndustriesPlantSupportSection,
} from './components';

export default function IndustriesPageEditor() {
  const [industriesData, setIndustriesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState<string | null>('hero');

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
      } finally {
        setLoading(false);
      }
    }
    loadIndustriesData();
  }, []);

  return (
    <section className="flex flex-col gap-8 pb-12">
      <PageHeader
        title="Industries Page Content"
        description="Manage the 3 live sections of the Industries page: Hero, Industries Breakdown List, and Plant Engineering Services & Support."
      />

      {loading ? (
        <LoadingIndicator message="Loading Industries page content from database..." />
      ) : (
        <>
      {/* 1. Hero */}
      <IndustriesHeroSection
        initialData={industriesData?.IndustriesHero}
        isOpen={openSection === 'hero'}
        onToggle={() => toggleSection('hero')}
      />

      {/* 2. Industries Breakdown List */}
      <IndustriesListSection
        initialIndustries={industriesData?.industries}
        isOpen={openSection === 'list'}
        onToggle={() => toggleSection('list')}
      />

      {/* 3. Plant Engineering Services & Support Banner */}
      <IndustriesPlantSupportSection
        initialData={industriesData?.IndustriesPlantSupport}
        isOpen={openSection === 'support'}
        onToggle={() => toggleSection('support')}
      />
        </>
      )}
    </section>
  );
}
