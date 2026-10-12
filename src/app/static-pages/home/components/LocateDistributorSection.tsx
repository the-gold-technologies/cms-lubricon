'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';
import { SaveButton } from '@/components/SaveButton';

export interface LocateDistributorData {
  companyName: string;
  address: string;
  phone: string;
  workingHours: string;
  email: string;
  btn1Text: string;
}

export const DEFAULT_LOCATE_DISTRIBUTOR_DATA: LocateDistributorData = {
  companyName: '',
  address: '',
  phone: '',
  workingHours: '',
  email: '',
  btn1Text: '',
};

export function LocateDistributorSection({ initialData }: { initialData?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState<LocateDistributorData>(DEFAULT_LOCATE_DISTRIBUTOR_DATA);

  useEffect(() => {
    if (initialData) {
      setFormData({
        companyName: initialData.companyName || '',
        address: initialData.address || '',
        phone: initialData.phone || '',
        workingHours: initialData.workingHours || '',
        email: initialData.email || '',
        btn1Text: initialData.btn1Text || '',
      });
    }
  }, [initialData]);

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch('/api/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'LocateDistributorSection',
          content: formData,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSaved(true);
        toast.success('Contact details banner saved successfully!');
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(json.error || 'Failed to save contact section');
      }
    } catch {
      toast.error('Error saving contact section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col gap-4 transition-all">
        <SectionHeader
          title="Contact Hub & Action Banner"
          description="Manage the homepage contact card: hub address, direct phone, operating hours, email, and action buttons."
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-6 pt-4">
              {/* Address */}
              <InputField
                label="Facility & Distribution Hub Address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Industrial Area & Distribution Hub, India"
                helperText="Physical depot and logistics location displayed on the card"
              />

              {/* Phone & Working Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Direct Contact Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                />

                <InputField
                  label="Working Hours Text"
                  value={formData.workingHours}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      workingHours: e.target.value,
                    }))
                  }
                  placeholder="Working Hours: Mon - Sat: 9:00 AM - 6:30 PM"
                />
              </div>

              {/* Email */}
              <InputField
                label="Sales & Technical Support Email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="sales@jaidevaoil.com"
              />

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 flex flex-col gap-3">
                  <span className="text-xs font-bold text-[#C86218] uppercase tracking-wider">
                    Button 1 (Orange - Send Enquiry)
                  </span>
                  <InputField
                    label="Button 1 Label"
                    value={formData.btn1Text}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        btn1Text: e.target.value,
                      }))
                    }
                    placeholder="SEND ENQUIRY"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-gray-100">
                <SaveButton
                  loading={loading}
                  saved={saved}
                  onClick={handleSave}
                  label="Save Contact Banner"
                  className="w-full py-3.5 text-sm font-bold shadow-sm hover:shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
