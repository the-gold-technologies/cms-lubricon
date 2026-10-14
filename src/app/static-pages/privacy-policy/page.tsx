'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { SaveButton } from '@/components/SaveButton';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { RichTextEditor } from '@/components/RichTextEditor';
import { ImagePickerField } from '@/components/ImagePickerField';
import { ShieldCheck, Image as ImageIcon, ExternalLink, Globe } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function PrivacyPolicyAdminPage() {
  const [heroBadge, setHeroBadge] = useState('');
  const [heroHeading, setHeroHeading] = useState('');
  const [heroDescription, setHeroDescription] = useState('');
  const [heroBannerImage, setHeroBannerImage] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadPrivacyPolicy() {
      try {
        const res = await fetch('/api/privacy-policy');
        const json = await res.json();
        if (json.success && json.data) {
          const data = json.data;
          setHeroBadge(data.heroBadge || '');
          setHeroHeading(data.heroHeading || data.title || '');
          setHeroDescription(data.heroDescription || '');
          setHeroBannerImage(data.heroBannerImage || '');
          setLastUpdated(data.lastUpdated || '');
          setContent(data.content || '');
          setIsPublished(Boolean(data.isPublished));
        }
      } catch (err) {
        console.error('Failed to load privacy policy:', err);
        toast.error('Failed to load Privacy Policy');
      } finally {
        setIsLoading(false);
      }
    }
    loadPrivacyPolicy();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const tid = toast.loading('Saving Privacy Policy...');
    try {
      const res = await fetch('/api/privacy-policy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: heroHeading,
          heroBadge,
          heroHeading,
          heroDescription,
          heroBannerImage,
          lastUpdated,
          content,
          isPublished,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('Privacy Policy saved successfully!', { id: tid });
      } else {
        toast.error(json.error || 'Failed to save Privacy Policy', { id: tid });
      }
    } catch (err) {
      console.error('Error saving privacy policy:', err);
      toast.error('Network error while saving.', { id: tid });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-pulse text-gray-400 font-medium">
          Loading Privacy Policy editor...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-24 animate-in fade-in duration-500">
      {/* Header & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <PageHeader
          title="Privacy Policy Page"
          description="Configure the hero banner, background imagery, legal statements, and detailed policy terms."
        />
        <div className="mb-2 shrink-0">
          <SaveButton onClick={handleSave} disabled={isSaving} className="w-auto px-10" />
        </div>
      </div>

      {/* Main Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Main Content & Hero Configuration */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Section 1: Hero Section & Background Banner */}
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xs border border-gray-100 flex flex-col gap-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-amber-50 text-[#C86218] rounded-2xl">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0B0F29]">1. Hero Section &amp; Background Banner</h2>
                <p className="text-xs text-slate-400">
                  Configure the hero headline, subtitle, badge, and full-width background photo.
                </p>
              </div>
            </div>

            {/* Background Image Picker */}
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
              <ImagePickerField
                label="Hero Background Banner Image"
                value={heroBannerImage}
                onChange={setHeroBannerImage}
                folder="lubricon/hero"
                helperText="Industrial background photo displayed across the hero header on /privacy-policy."
              />
            </div>

            {/* Eyebrow Badge & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField
                label="Eyebrow Badge Text"
                value={heroBadge}
                onChange={(e) => setHeroBadge(e.target.value)}
                placeholder="e.g. Legal & Data Protection"
                tooltip="Small pill badge displayed above the main heading."
              />

              <InputField
                label="Main Hero Title"
                value={heroHeading}
                onChange={(e) => setHeroHeading(e.target.value)}
                placeholder="e.g. Privacy Policy"
                tooltip="The prominent H1 title on the page."
              />
            </div>

            {/* Subtitle Description */}
            <TextAreaField
              label="Hero Subtitle / Description"
              value={heroDescription}
              onChange={(e) => setHeroDescription(e.target.value)}
              placeholder="Brief introductory summary shown under the main title..."
              rows={2}
              helperText="Summary statement displayed in the hero banner."
            />

            {/* Last Updated Timestamp */}
            <InputField
              label="Last Updated Stamp"
              value={lastUpdated}
              onChange={(e) => setLastUpdated(e.target.value)}
              placeholder="e.g. October 2026"
              tooltip="The revision date shown to website visitors."
            />
          </div>

          {/* Section 2: Policy Document Rich Content */}
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xs border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-blue-50 text-[#002B5C] rounded-2xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0B0F29]">2. Policy Document Body</h2>
                <p className="text-xs text-slate-400">
                  Full policy clauses, data collection breakdown, user rights, and compliance procedures.
                </p>
              </div>
            </div>

            <div className="mt-2">
              <RichTextEditor
                label="Full Policy Content"
                value={content}
                onChange={setContent}
                placeholder="Write your detailed privacy policy sections, clauses, and contact info..."
                minHeight="460px"
                tooltip="Full WYSIWYG editor. Format headings, lists, bold text, and hyperlinks."
              />
            </div>
          </div>
        </div>

        {/* Right Column: Status & Quick Links */}
        <div className="flex flex-col gap-6">
          {/* Publication Status Card */}
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xs border border-gray-100 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-[#0B0F29] uppercase tracking-wider">
              Status &amp; Visibility
            </h3>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">Published on Website</span>
                <span className="text-[11px] text-slate-400">Active at /privacy-policy</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#002B5C]"></div>
              </label>
            </div>

            <a
              href={`${(process.env.NEXT_PUBLIC_WEBSITE_URL || '').replace(/\/+$/, '')}/privacy-policy`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-[#002B5C] hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Globe className="w-4 h-4" />
              <span>View Live Website Page</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>

          {/* SEO Management Shortcut */}
          <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xs border border-gray-100 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#0B0F29] uppercase tracking-wider">
              SEO &amp; Metadata
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Configure meta title, description, and canonical URL for this page under Per-Page SEO.
            </p>
            <Link
              href="/seo/pages/privacy-policy"
              className="w-full py-2.5 px-4 bg-amber-50 hover:bg-[#FFE000] text-black text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 mt-1"
            >
              <span>Edit Page SEO</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
