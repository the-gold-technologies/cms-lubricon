'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import {
  ContactHeroSection,
  ContactFormSection,
  ContactFaqSection,
} from './components';
import toast from 'react-hot-toast';

export default function ContactUsCMSPage() {
  const [sections, setSections] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState<string | null>('hero');

  const toggleSection = (sectionKey: string) => {
    setOpenSection((prev) => (prev === sectionKey ? null : sectionKey));
  };

  const fetchContactData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/contact-us');
      const json = await res.json();
      if (json.success && json.data) {
        setSections(json.data.sections || {});
      }
    } catch {
      toast.error('Failed to load contact page content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactData();
  }, []);

  const handleSaveSection = async (sectionType: string, content: any) => {
    try {
      const res = await fetch('/api/contact-us', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: sectionType,
          content,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Section updated successfully!');
        setSections((prev) => ({ ...prev, [sectionType]: content }));
      } else {
        toast.error(json.error || 'Failed to save changes');
      }
    } catch {
      toast.error('Network error saving changes');
    }
  };

  return (
    <section className="flex flex-col gap-8 pb-16">
      <PageHeader
        title="Contact Us Page Content"
        description="Manage the 3 live sections of the Contact page: Hero & Direct Channels, Enquiry Form Settings, and Frequently Asked Questions."
      />

      {loading ? (
        <LoadingIndicator message="Loading Contact page content from database..." />
      ) : (
        <div className="flex flex-col gap-8">
          {/* Section 1: Hero Banner & Titles */}
          <ContactHeroSection
            initialData={sections.ContactHero}
            onSave={(data) => handleSaveSection('ContactHero', data)}
            isOpen={openSection === 'hero'}
            onToggle={() => toggleSection('hero')}
          />

          {/* Section 2: Enquiry Form Card Settings & Direct Channels */}
          <ContactFormSection
            initialData={sections.ContactForm}
            onSave={(data) => handleSaveSection('ContactForm', data)}
            isOpen={openSection === 'form'}
            onToggle={() => toggleSection('form')}
          />

          {/* Section 3: Frequently Asked Questions */}
          <ContactFaqSection
            initialData={sections.ContactFaq}
            onSave={(data) => handleSaveSection('ContactFaq', data)}
            isOpen={openSection === 'faq'}
            onToggle={() => toggleSection('faq')}
          />
        </div>
      )}
    </section>
  );
}
