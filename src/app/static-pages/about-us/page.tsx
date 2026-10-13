"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import {
  AboutHeroSection,
  AboutStatsSection,
  AboutValuesSection,
  AboutPortfolioSection,
  AboutTimelineSection,
  AboutCtaBannerSection,
} from "./components";

export default function AboutUsPageEditor() {
  const [aboutData, setAboutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAboutData() {
      try {
        setLoading(true);
        const res = await fetch("/api/about-us");
        const json = await res.json();
        if (json.success && json.data) {
          setAboutData(json.data);
        }
      } catch (err) {
        console.error("Failed to load about us data:", err);
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
        <div className="py-20 text-center text-gray-400 text-sm animate-pulse">
          Loading About Us sections from database...
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* 1. Hero & Narrative */}
          <AboutHeroSection initialData={aboutData?.AboutHero} />

          {/* 2. Key Stats Strip */}
          <AboutStatsSection initialData={aboutData?.AboutStats} />

          {/* 3. Core Principles & Values */}
          <AboutValuesSection initialData={aboutData?.AboutValues} />

          {/* 4. Complete Lubrication Portfolio */}
          <AboutPortfolioSection initialData={aboutData?.AboutPortfolio} />

          {/* 5. Historical Journey Timeline */}
          <AboutTimelineSection initialData={aboutData?.AboutTimeline} />

          {/* 6. Closing Call-To-Action Banner */}
          <AboutCtaBannerSection initialData={aboutData?.AboutCtaBanner} />
        </div>
      )}
    </section>
  );
}
