'use client';

import React, { useState, useEffect } from 'react';
import { Code, RefreshCw, Instagram } from 'lucide-react';
import toast from 'react-hot-toast';
import { InputField } from '@/components/InputField';
import { SaveButton } from '@/components/SaveButton';
import { SectionHeader } from '@/components/SectionHeader';

const defaultFormData = {
  title: '',
  subtitle: '',
  instagramAccountId: '',
  instagramToken: '',
  lastRefreshedAt: 0,
};

interface InstagramRibbonCMSProps {
  initialData?: Record<string, unknown>;
  saveUrl?: string;
  responseKey?: string;
  onSave?: (data: Record<string, unknown>) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function InstagramRibbonCMS({
  initialData,
  saveUrl = '/api/home',
  responseKey = 'InstagramRibbon',
  onSave,
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
}: InstagramRibbonCMSProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (val: any) => {
    if (controlledOnToggle) {
      controlledOnToggle();
    } else {
      setInternalIsOpen(typeof val === 'function' ? val(internalIsOpen) : val);
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (initialData) {
      const data = initialData as any;
      setFormData({
        title: data.title || '',
        subtitle: data.subtitle || '',
        instagramAccountId: data.instagramAccountId || '',
        instagramToken: data.instagramToken || '',
        lastRefreshedAt: data.lastRefreshedAt || 0,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRefreshToken = async () => {
    if (!formData.instagramToken?.trim()) {
      toast.error('Please enter an Instagram Access Token first.');
      return;
    }

    setIsRefreshingToken(true);
    const toastId = toast.loading('Refreshing Instagram token via Meta API...');

    try {
      const res = await fetch('/api/instagram/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: formData.instagramToken.trim() }),
      });

      const json = await res.json();

      if (json.success && json.access_token) {
        setFormData((prev) => ({
          ...prev,
          instagramToken: json.access_token,
          lastRefreshedAt: Date.now(),
        }));
        toast.success(
          'Access Token refreshed successfully for 60 days! Click Save Changes to apply.',
          { id: toastId, duration: 5000 }
        );
      } else {
        toast.error(json.error || 'Token refresh failed.', { id: toastId, duration: 6000 });
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error refreshing token.', { id: toastId });
    } finally {
      setIsRefreshingToken(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading('Saving Instagram Ribbon settings...');
    try {
      const payload = {
        ...formData,
      };

      const body = { section: responseKey ?? 'InstagramRibbon', content: payload };

      const res = await fetch(saveUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('Instagram Ribbon settings saved successfully!', { id: toastId });
        setFormData(payload);
        if (onSave) onSave(payload as unknown as Record<string, unknown>);
      } else {
        toast.error(json.error || 'Save failed.', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error.', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col gap-4 transition-all">
        <SectionHeader
          title="Instagram Ribbon Feed (Live Marquee & Meta API)"
          description="Manage your Instagram infinite marquee. Connects with Meta Graph API for automated posts feed."
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-8 pt-6 animate-in fade-in duration-500 text-left font-sans">
              {/* Header Title block */}
              <div className="flex flex-col gap-6 bg-gray-50/20 border border-gray-100 p-6 rounded-2xl w-full">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Instagram className="w-4 h-4 text-[#C86218]" />
                  Instagram Header Options
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                  <InputField
                    label="Ribbon Eyebrow / Heading"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. FOLLOW US ON INSTAGRAM"
                    required
                  />
                  <InputField
                    label="Instagram Profile Link or Handle"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                    placeholder="e.g. https://www.instagram.com/jaidevaoilco/?hl=en"
                    required
                  />
                </div>
              </div>

              {/* Native Meta API Integration Block */}
              <div className="flex flex-col gap-6 bg-amber-50/50 border border-amber-200 p-6 rounded-2xl w-full">
                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-widest flex items-center gap-2 border-b border-amber-200/60 pb-2">
                  <Code className="w-4 h-4" />
                  Automatic Meta Graph API Integration
                </h4>

                <div className="text-sm text-gray-700 space-y-3">
                  <p className="font-semibold text-amber-900">
                    Connect your live Instagram feed by entering your API Token below.
                  </p>
                  <div className="bg-white/70 p-4 rounded-xl border border-amber-200/50 space-y-2 text-xs">
                    <p className="font-bold text-gray-900">How to generate your token:</p>
                    <ol className="list-decimal pl-4 space-y-1 text-gray-600">
                      <li>
                        Go to{' '}
                        <a
                          href="https://developers.facebook.com/"
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Meta for Developers
                        </a>{' '}
                        and create a <b>Business</b> App.
                      </li>
                      <li>
                        Use the <b>Graph API Explorer</b> tool.
                      </li>
                      <li>
                        Select the <code>instagram_basic</code> and <code>pages_show_list</code>{' '}
                        permissions.
                      </li>
                      <li>
                        Click Generate Access Token (ensure your Facebook Page is linked to
                        Instagram).
                      </li>
                      <li>
                        Make sure to use the <b>Access Token Tool</b> to extend it to a permanent
                        60-day token.
                      </li>
                    </ol>
                  </div>
                </div>

                <div className="flex flex-col gap-5 w-full">
                  <InputField
                    label="Instagram Business Account ID (Optional)"
                    name="instagramAccountId"
                    value={formData.instagramAccountId}
                    onChange={handleChange}
                    placeholder="e.g. 17841412345678901 (Leave blank to use default feed / IG Basic Display)"
                  />
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                      <div className="flex-1 w-full">
                        <InputField
                          label="Instagram Long-Lived Access Token"
                          name="instagramToken"
                          value={formData.instagramToken}
                          onChange={handleChange}
                          placeholder="e.g. EAAPz... or IGQW..."
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleRefreshToken}
                        disabled={isRefreshingToken || !formData.instagramToken?.trim()}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white text-xs font-semibold rounded-xl transition-all shadow-xs hover:shadow-sm disabled:cursor-not-allowed cursor-pointer shrink-0"
                        title="Extend access token validity by 60 days via Meta API"
                      >
                        <RefreshCw
                          className={`w-4 h-4 ${isRefreshingToken ? 'animate-spin' : ''}`}
                        />
                        {isRefreshingToken ? 'Refreshing...' : 'Refresh Token'}
                      </button>
                    </div>
                    <div className="flex flex-col gap-2 pt-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3.5 py-2 rounded-xl w-fit">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Auto-Marquee Active
                        <span className="text-emerald-600 font-normal">
                          • Displays dynamic showcase feed automatically
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Action */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <SaveButton
                  onClick={handleSave}
                  disabled={isSaving}
                  loading={isSaving}
                  label="Save Ribbon Settings"
                  className="w-auto px-8"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
