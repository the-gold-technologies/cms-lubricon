'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Send, ChevronDown } from 'lucide-react';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { SaveButton } from '@/components/SaveButton';

export interface ContactFormData {
  infoHeading?: string;
  infoDescription?: string;
  phone?: string;
  email?: string;
  formTitle?: string;
  formSubtitle?: string;
  submitButtonText?: string;
}

export interface ContactFormSectionProps {
  initialData?: ContactFormData;
  onSave?: (data: ContactFormData) => Promise<boolean | void>;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function ContactFormSection({
  initialData,
  onSave,
  isOpen: controlledIsOpen,
  onToggle,
}: ContactFormSectionProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));

  const [infoHeading, setInfoHeading] = useState('');
  const [infoDescription, setInfoDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [submitButtonText, setSubmitButtonText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initialData) {
      if (initialData.infoHeading !== undefined) setInfoHeading(initialData.infoHeading);
      if (initialData.infoDescription !== undefined) setInfoDescription(initialData.infoDescription);
      if (initialData.phone !== undefined) setPhone(initialData.phone);
      if (initialData.email !== undefined) setEmail(initialData.email);
      if (initialData.formTitle !== undefined) setFormTitle(initialData.formTitle);
      if (initialData.formSubtitle !== undefined) setFormSubtitle(initialData.formSubtitle);
      if (initialData.submitButtonText !== undefined) setSubmitButtonText(initialData.submitButtonText);
    }
  }, [initialData]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload: ContactFormData = {
        infoHeading: infoHeading.trim(),
        infoDescription: infoDescription.trim(),
        phone: phone.trim(),
        email: email.trim(),
        formTitle: formTitle.trim(),
        formSubtitle: formSubtitle.trim(),
        submitButtonText: submitButtonText.trim(),
      };

      if (onSave) {
        await onSave(payload);
      } else {
        const res = await fetch('/api/contact-us', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section: 'ContactForm',
            content: payload,
          }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Failed to save form settings');
      }

      setSaved(true);
      toast.success('Direct Channels & Form configuration updated successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      toast.error(err.message || 'Error saving form settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-zinc-200/80 p-6 sm:p-8 flex flex-col gap-4 transition-all">
      {/* Header bar */}
      <div
        onClick={handleToggle}
        className="flex items-center justify-between cursor-pointer select-none group border-b border-zinc-100 pb-5"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Send className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-zinc-900 group-hover:text-amber-600 transition-colors">
              2. Direct Channels & Enquiry Form
            </h3>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              Live direct contact channels, support hotline, and message form settings
            </p>
          </div>
        </div>

        <div
          className={`w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 transition-transform duration-300 ${
            isOpen ? 'rotate-180 bg-[#ffe000] text-black' : ''
          }`}
        >
          <ChevronDown className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>

      {/* Accordion body */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-4 flex flex-col gap-6">
            {/* Direct Channels (Left Column) */}
            <div className="flex flex-col gap-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Left Column: Direct Channels & Information
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Channel Headline"
                  value={infoHeading}
                  onChange={(e) => setInfoHeading(e.target.value)}
                  placeholder="Need more information? Get in touch with us"
                />
                <InputField
                  label="Helpline Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="1800 569 6363"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <TextAreaField
                  label="Narrative Description"
                  rows={2}
                  value={infoDescription}
                  onChange={(e) => setInfoDescription(e.target.value)}
                  placeholder="A dedicated team of Australian lubrication engineers ready to assist..."
                />
                <InputField
                  label="Support Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@lubricon.in"
                />
              </div>
            </div>

            {/* Right Column: Enquiry Form Settings */}
            <div className="pt-6 border-t border-zinc-200 flex flex-col gap-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Right Column: Form Settings
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Form Title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Send Message"
                />
                <InputField
                  label="Submit Button Text"
                  value={submitButtonText}
                  onChange={(e) => setSubmitButtonText(e.target.value)}
                  placeholder="Send Message"
                />
              </div>

              <TextAreaField
                label="Form Subtitle / Instructions"
                rows={2}
                value={formSubtitle}
                onChange={(e) => setFormSubtitle(e.target.value)}
                placeholder="Please fill out the form below with your details and message to contact us."
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-100">
              <SaveButton
                loading={loading}
                saved={saved}
                onClick={handleSave}
                label="Save Channels & Form Settings"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
