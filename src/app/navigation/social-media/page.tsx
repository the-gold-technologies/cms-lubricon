'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Image as ImageIcon, Phone, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/PageHeader';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { SaveButton } from '@/components/SaveButton';
import { ImagePickerField } from '@/components/ImagePickerField';

export default function FooterSocialMediaCMSPage() {
  const [loadingSocial, setLoadingSocial] = useState(false);
  const [savedSocial, setSavedSocial] = useState(false);

  const [loadingBranding, setLoadingBranding] = useState(false);
  const [savedBranding, setSavedBranding] = useState(false);

  const [loadingContact, setLoadingContact] = useState(false);
  const [savedContact, setSavedContact] = useState(false);

  // Social Links (Facebook, LinkedIn, Instagram only)
  const [facebook, setFacebook] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [instagram, setInstagram] = useState('');

  // Footer Branding & Icon
  const [footerLogo, setFooterLogo] = useState('');
  const [copyrightText, setCopyrightText] = useState('');

  // Footer Contact Details
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/seo');
        const json = await res.json();
        if (json.success && json.data) {
          const cfg = json.data;
          if (cfg.phone) setPhone(cfg.phone);
          if (cfg.email) setEmail(cfg.email);
          if (cfg.address) setAddress(cfg.address);

          const s = cfg.socialLinks || {};
          if (s.facebook) setFacebook(s.facebook);
          if (s.linkedin) setLinkedin(s.linkedin);
          if (s.instagram) setInstagram(s.instagram);
          if (s.footerLogo) setFooterLogo(s.footerLogo);
          if (s.copyrightText) setCopyrightText(s.copyrightText);
        }
      } catch (err) {
        console.error('Failed to load footer & social config:', err);
      }
    }
    loadConfig();
  }, []);

  const saveConfig = async (updatedFields: Record<string, any>) => {
    const getRes = await fetch('/api/seo');
    const currentJson = await getRes.json();
    const currentConfig = currentJson.data || {};
    const currentSocials = currentConfig.socialLinks || {};

    delete currentSocials.youtube;
    delete currentSocials.twitter;
    delete currentSocials.hpclBadge;
    delete currentSocials.indiaGovBadge;
    delete currentSocials.globalCompactBadge;

    const payload: any = {
      phone: updatedFields.phone !== undefined ? updatedFields.phone : phone,
      email: updatedFields.email !== undefined ? updatedFields.email : email,
      address: updatedFields.address !== undefined ? updatedFields.address : address,
      socialLinks: {
        ...currentSocials,
        facebook,
        linkedin,
        instagram,
        footerLogo,
        copyrightText,
        ...updatedFields.socialLinks,
      },
    };

    const res = await fetch('/api/seo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  };

  const handleSaveSocial = async () => {
    setLoadingSocial(true);
    setSavedSocial(false);
    try {
      const json = await saveConfig({
        socialLinks: {
          facebook: facebook.trim(),
          linkedin: linkedin.trim(),
          instagram: instagram.trim(),
        },
      });
      if (json.success) {
        setSavedSocial(true);
        toast.success('Social media profiles updated successfully!');
        setTimeout(() => setSavedSocial(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save');
    } finally {
      setLoadingSocial(false);
    }
  };

  const handleSaveBranding = async () => {
    setLoadingBranding(true);
    setSavedBranding(false);
    try {
      const json = await saveConfig({
        socialLinks: {
          footerLogo,
          copyrightText: copyrightText.trim(),
        },
      });
      if (json.success) {
        setSavedBranding(true);
        toast.success('Footer logo and copyright updated successfully!');
        setTimeout(() => setSavedBranding(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save');
    } finally {
      setLoadingBranding(false);
    }
  };

  const handleSaveContact = async () => {
    setLoadingContact(true);
    setSavedContact(false);
    try {
      const json = await saveConfig({
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
      });
      if (json.success) {
        setSavedContact(true);
        toast.success('Footer contact details updated successfully!');
        setTimeout(() => setSavedContact(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save');
    } finally {
      setLoadingContact(false);
    }
  };

  return (
    <section className="flex flex-col gap-8 pb-16 w-full max-w-5xl mx-auto">
      <PageHeader
        title="Footer & Social Media Management"
        description="Manage the official footer logo icon, corporate social media profiles, and contact details displayed in the website footer."
        badge="Footer & Socials"
      />

      <div className="flex flex-col gap-8 w-full">
        {/* Form 1: Social Media Channels */}
        <div className="w-full border border-slate-200 rounded-3xl bg-white p-7 sm:p-9 shadow-xs flex flex-col gap-6">
          <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#C86218] flex items-center justify-center">
              <Share2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">1. Social Media Profiles</h3>
              <p className="text-xs text-slate-500">
                Corporate channel URLs appearing in the website footer (Facebook, LinkedIn,
                Instagram)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputField
              label="Facebook Page URL"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://facebook.com/..."
            />
            <InputField
              label="LinkedIn Company URL"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/company/..."
            />
            <InputField
              label="Instagram Profile URL"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </div>

          <div className="pt-4 border-t border-slate-100 mt-2">
            <SaveButton
              loading={loadingSocial}
              saved={savedSocial}
              onClick={handleSaveSocial}
              label="Save Social Profiles"
              className="w-full py-3.5 rounded-2xl font-bold text-sm shadow-md"
            />
          </div>
        </div>

        {/* Form 2: Footer Logo & Branding */}
        <div className="w-full border border-slate-200 rounded-3xl bg-white p-7 sm:p-9 shadow-xs flex flex-col gap-6">
          <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#002B5C] flex items-center justify-center">
              <ImageIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                2. Footer Logo & Copyright Notice
              </h3>
              <p className="text-xs text-slate-500">
                Upload the footer brand icon/logo and configure the bottom copyright notice
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100">
              <ImagePickerField
                label="Footer Brand Logo / Icon"
                value={footerLogo}
                onChange={(url) => setFooterLogo(url)}
                folder="jaideva/footer"
                helperText="Official company logo displayed inside the white emblem container on the left of the footer."
              />
            </div>

            <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-100">
              <InputField
                label="Footer Copyright Text Notice"
                value={copyrightText}
                onChange={(e) => setCopyrightText(e.target.value)}
                placeholder="© 2026 Jai Deva Oil Co. All rights reserved."
                helperText="Displays in the bottom-left corner of the website footer."
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-2">
            <SaveButton
              loading={loadingBranding}
              saved={savedBranding}
              onClick={handleSaveBranding}
              label="Save Footer Branding"
              className="w-full py-3.5 rounded-2xl font-bold text-sm shadow-md"
            />
          </div>
        </div>

        {/* Form 3: Footer Contact Details */}
        <div className="w-full border border-slate-200 rounded-3xl bg-white p-7 sm:p-9 shadow-xs flex flex-col gap-6">
          <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#C86218] flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">3. Footer Contact Details</h3>
              <p className="text-xs text-slate-500">
                Registered office location and communication channels shown in the footer contact
                column
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <TextAreaField
              label="Company Address / Hub Location"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Industrial Area & Regional Distribution Hub, Haryana / Delhi NCR, India"
              rows={2}
              helperText="Full address shown in the footer Contact Details column."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Contact Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98120 22340"
                helperText="Primary telephone displayed in the footer."
              />
              <InputField
                label="Official Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sales@jaideva.com"
                helperText="Official sales/support inquiry email address."
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-2">
            <SaveButton
              loading={loadingContact}
              saved={savedContact}
              onClick={handleSaveContact}
              label="Save Contact Details"
              className="w-full py-3.5 rounded-2xl font-bold text-sm shadow-md"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
