'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import {
  AboutHeroSection,
  AboutJaiDevaContentSection,
  OurTeamStructureSection,
  OurJourneySection,
  AboutWhyChooseSection,
  AboutImageGallerySection,
} from './components';

export default function AboutUsPageEditor() {
  const [aboutData, setAboutData] = useState<any>(null);

  useEffect(() => {
    async function loadAboutData() {
      try {
        const res = await fetch('/api/about-us');
        const json = await res.json();
        if (json.success && json.data) {
          setAboutData(json.data);
        }
      } catch (err) {
        console.error('Failed to load about us data:', err);
      }
    }
    loadAboutData();
  }, []);

  const whyChooseData =
    aboutData?.AboutWhyChooseSection ||
    (aboutData?.AboutJaiDevaContent
      ? {
          title:
            aboutData.AboutJaiDevaContent.whyChooseTitle || aboutData.AboutJaiDevaContent.title,
          subtitle:
            aboutData.AboutJaiDevaContent.whyChooseSubtitle ||
            aboutData.AboutJaiDevaContent.subtitle,
          items:
            aboutData.AboutJaiDevaContent.whyChooseItems || aboutData.AboutJaiDevaContent.items,
        }
      : null);

  return (
    <section className="flex flex-col gap-8 pb-12">
      <PageHeader
        title="About Us Page Content"
        description="Manage all live sections of the About Us page: Hero Banner, Company Story, Team Structure, Journey Timeline, Why Choose Us, and Facilities Gallery."
      />

      {/* 1. Hero */}
      <AboutHeroSection initialData={aboutData?.AboutHero} />

      {/* 2. Story & Mentor */}
      <AboutJaiDevaContentSection initialData={aboutData?.AboutJaiDevaContent} />

      {/* 3. Team Structure */}
      <OurTeamStructureSection initialData={aboutData?.OurTeamStructureSection} />

      {/* 4. Journey Timeline */}
      <OurJourneySection initialData={aboutData?.OurJourneySection} />

      {/* 5. Why Choose Jai Deva Oil Co. */}
      <AboutWhyChooseSection initialData={whyChooseData} />

      {/* 6. Facilities & Logistics Gallery */}
      <AboutImageGallerySection initialData={aboutData?.AboutImageGallerySection} />
    </section>
  );
}
