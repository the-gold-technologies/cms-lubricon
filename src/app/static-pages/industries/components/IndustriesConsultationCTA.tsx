'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { SaveButton } from '@/components/SaveButton';

export function IndustriesConsultationCTA({
  initialData,
  isOpen: controlledIsOpen,
  onToggle,
}: {
  initialData?: any;
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [eyebrowBadge, setEyebrowBadge] = useState('');
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [dropdownLabel, setDropdownLabel] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [phoneText, setPhoneText] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sectorOptionsText, setSectorOptionsText] = useState('');
  const [trustIndicatorsText, setTrustIndicatorsText] = useState('');

  useEffect(() => {
    if (initialData) {
      if (initialData.badge) setEyebrowBadge(initialData.badge);
      if (initialData.heading) setHeading(initialData.heading);
      if (initialData.description) setDescription(initialData.description);
      if (initialData.formTitle) setFormTitle(initialData.formTitle);
      if (initialData.formSubtitle) setFormSubtitle(initialData.formSubtitle);
      if (initialData.dropdownLabel) setDropdownLabel(initialData.dropdownLabel);
      if (initialData.buttonText) setButtonText(initialData.buttonText);
      if (initialData.phoneText) setPhoneText(initialData.phoneText);
      if (initialData.phoneNumber) setPhoneNumber(initialData.phoneNumber);

      if (Array.isArray(initialData.sectorOptions)) {
        setSectorOptionsText(initialData.sectorOptions.join('\n'));
      } else if (typeof initialData.sectorOptionsText === 'string') {
        setSectorOptionsText(initialData.sectorOptionsText);
      }

      if (Array.isArray(initialData.trustIndicators)) {
        setTrustIndicatorsText(
          initialData.trustIndicators
            .map((t: any) => `${t.icon || 'Clock'}: ${t.text || ''}`)
            .join('\n')
        );
      }
    }
  }, [initialData]);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const sectorOptions = sectorOptionsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const trustIndicators = trustIndicatorsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          if (line.includes(':')) {
            const [icon, ...rest] = line.split(':');
            return { icon: icon.trim(), text: rest.join(':').trim() };
          }
          return { icon: 'Clock', text: line };
        });

      const payload = {
        badge: eyebrowBadge.trim(),
        heading: heading.trim(),
        description: description.trim(),
        formTitle: formTitle.trim(),
        formSubtitle:
          formSubtitle.trim() ||
          'Select your primary operating vertical to launch a tailored technical enquiry:',
        dropdownLabel: dropdownLabel.trim(),
        buttonText: buttonText.trim(),
        phoneText: phoneText.trim(),
        phoneNumber: phoneNumber.trim(),
        sectorOptions,
        trustIndicators:
          trustIndicators.length > 0
            ? trustIndicators
            : [
                { icon: 'Clock', text: '24h Response SLA' },
                {
                  icon: 'ShieldCheck',
                  text: '100% Refinery Direct Drum Supply',
                },
                {
                  icon: 'Headphones',
                  text: 'On-Site Tribology Engineer Available',
                },
              ],
      };

      const res = await fetch('/api/industries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'IndustriesConsultationCTA',
          content: payload,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaved(true);
        toast.success('Consultation CTA section saved successfully');
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save');
      }
    } catch {
      toast.error('Error saving CTA section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-6 transition-all">
      <SectionHeader
        title="6. Consultation & Engineering Audit CTA"
        description="Configure the technical advisory callout banner, form titles, trust badges, and direct engineer helpline."
        badge={phoneNumber ? 'Configured' : 'Draft'}
        isOpen={isOpen}
        onToggle={handleToggle}
      />

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Eyebrow Badge"
                value={eyebrowBadge}
                onChange={(e) => setEyebrowBadge(e.target.value)}
                placeholder="Dedicated Plant Engineering Desk"
              />
              <InputField
                label="Banner Heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="Ready to Reduce Plant Sump Temperatures & Oil Consumption?"
              />
            </div>

            <TextAreaField
              label="Banner Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Schedule an on-site lubrication audit or request factory-sealed drum pricing..."
            />

            {/* Form Title & Dropdown Labels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-4 bg-gray-50/70 rounded-2xl border border-gray-100">
              <InputField
                label="Form Title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Request Sector Specification"
              />
              <InputField
                label="Form Subtitle"
                value={formSubtitle}
                onChange={(e) => setFormSubtitle(e.target.value)}
                placeholder="Select your primary operating vertical..."
              />
              <InputField
                label="Sector Dropdown Label"
                value={dropdownLabel}
                onChange={(e) => setDropdownLabel(e.target.value)}
                placeholder="Industry / Machinery Application:"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <InputField
                label="Action Button Text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="Request Consultation & Quote"
              />
              <InputField
                label="Phone Label / Caption"
                value={phoneText}
                onChange={(e) => setPhoneText(e.target.value)}
                placeholder="Direct Technical Support Desk"
              />
              <InputField
                label="Contact Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98111 23456"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TextAreaField
                label="Trust Indicators (Format: Icon: Label, one per line)"
                value={trustIndicatorsText}
                onChange={(e) => setTrustIndicatorsText(e.target.value)}
                rows={5}
                placeholder="Clock: 24h Response SLA&#10;ShieldCheck: 100% Refinery Direct Drum Supply&#10;Headphones: On-Site Tribology Engineer Available"
              />

              <TextAreaField
                label="Sector Dropdown Options (One per line)"
                value={sectorOptionsText}
                onChange={(e) => setSectorOptionsText(e.target.value)}
                rows={5}
                placeholder="Steel & Hot Rolling Mills&#10;Cement & Heavy Mining&#10;Power Generation & Turbines&#10;Automotive & Component Stamping..."
              />
            </div>

            <div className="pt-4 border-t border-gray-100">
              <SaveButton
                loading={loading}
                saved={saved}
                onClick={handleSave}
                label="Save Changes"
                className="w-full py-3.5 text-sm font-bold shadow-sm hover:shadow-md"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
