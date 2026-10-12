'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { HomeHeroSection } from './components/HomeHeroSection';
import { ProductsServicesSection } from './components/ProductsServicesSection';
import { MultiBrandSolutionsSection } from './components/MultiBrandSolutionsSection';
import { IndustriesWeServeSection } from './components/IndustriesWeServeSection';
import { WhyJaiDevaSection } from './components/WhyJaiDevaSection';
import { TrustedClientsSection } from './components/TrustedClientsSection';
import { BrandClosingBannerSection } from './components/BrandClosingBannerSection';
import { InstagramRibbonCMS } from './components/InstagramRibbonCMS';
import { LocateDistributorSection } from './components/LocateDistributorSection';
import { FirstTimePopupSection } from './components/FirstTimePopupSection';

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

      {/* 1. Homepage Hero (Live Website Centerpiece) */}
      <HomeHeroSection initialData={homeData?.HomeHero} />

      {/* 2. First-Time Visitor Popup Configuration */}
      <FirstTimePopupSection initialData={homeData?.FirstTimePopup} />

      {/* 3. Our Product Range */}
      <ProductsServicesSection initialData={homeData?.ProductsServicesSection} />

      {/* 4. Multi-Brand Lubricant Solutions */}
      <MultiBrandSolutionsSection initialData={homeData?.MultiBrandSolutionsSection} />

      {/* 5. Industries We Serve */}
      <IndustriesWeServeSection initialData={homeData?.IndustriesWeServeSection} />

      {/* 6. Why Jai Deva Oil Co.? */}
      <WhyJaiDevaSection initialData={homeData?.WhyJaiDevaSection} />

      {/* 7. Trusted Clients & Brands Marquee */}
      <TrustedClientsSection initialData={homeData?.TrustedClientsSection} />

      {/* 8. Brand Summary Closing Banner */}
      <BrandClosingBannerSection initialData={homeData?.BrandClosingBannerSection} />

      {/* 9 Instagram Live Marquee Ribbon */}
      <InstagramRibbonCMS initialData={homeData?.InstagramRibbon} />

      {/* 10. Locate Distributor & Direct Enquiry Contact */}
      <LocateDistributorSection initialData={homeData?.LocateDistributorSection} />
    </section>
  );
}
