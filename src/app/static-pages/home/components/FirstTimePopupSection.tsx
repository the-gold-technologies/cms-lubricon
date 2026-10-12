'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CloudUpload, Trash2, Sparkles, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { SaveButton } from '@/components/SaveButton';
import { uploadFiles } from '@/lib/uploadHelpers';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';

const defaultFormData = {
  isEnabled: true,
  showForm: true,
  title: 'Special First-Time Visitor Offer',
  subtitle: 'Connect with our technical team for competitive pricing and bulk supply inquiries.',
  formTitle: 'Request an Instant Quote',
  image: '',
};

interface FirstTimePopupSectionProps {
  initialData?: Record<string, unknown>;
  saveUrl?: string;
  responseKey?: string;
  onSave?: (data: Record<string, unknown>) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function FirstTimePopupSection({
  initialData,
  saveUrl = '/api/home',
  responseKey = 'FirstTimePopup',
  onSave,
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
}: FirstTimePopupSectionProps) {
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
  const [formData, setFormData] = useState(defaultFormData);
  const [selectedImage, setSelectedImage] = useState<File | string>('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      const data = initialData as any;
      setFormData({
        isEnabled: data.isEnabled ?? true,
        showForm: data.showForm ?? true,
        title: data.title ?? defaultFormData.title,
        subtitle: data.subtitle ?? defaultFormData.subtitle,
        formTitle: data.formTitle ?? defaultFormData.formTitle,
        image: data.image || '',
      });
      if (data.image) {
        setSelectedImage(data.image);
      }
    }
  }, [initialData]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
    }
  };

  const removeFile = () => {
    setSelectedImage('');
    setFormData((prev) => ({ ...prev, image: '' }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading('Saving First-Time Visitor Popup settings...');
    try {
      let url = typeof selectedImage === 'string' ? selectedImage : '';
      if (selectedImage instanceof File) {
        const uploadedUrls = await uploadFiles([selectedImage]);
        url = uploadedUrls[0] || '';
      }

      const payload = {
        ...formData,
        image: url,
      };

      const body = {
        section: responseKey,
        content: payload,
      };

      const res = await fetch(saveUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('First-Time Visitor Popup settings saved!', { id: toastId });
        setFormData(payload);
        setSelectedImage(url);
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

  const preview =
    selectedImage instanceof File ? URL.createObjectURL(selectedImage) : selectedImage;
  const filename =
    typeof selectedImage === 'string'
      ? selectedImage.split('/').pop() || 'Popup Image'
      : selectedImage?.name;

  return (
    <section>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col gap-4 transition-all">
        <SectionHeader
          title="First-Time Visitor Popup & Enquiry"
          description="Manage settings, announcement graphic, and instant enquiry form presented to first-time website visitors."
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />

        <div
          className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-8 pt-6 animate-in fade-in duration-500">
              {/* Toggle Switches */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Enable Popup */}
                <div className="flex items-center justify-between bg-gray-50/60 border border-gray-200/80 p-4.5 px-5 rounded-2xl">
                  <div
                    className="flex items-center gap-3.5 cursor-pointer select-none"
                    onClick={() => setFormData((prev) => ({ ...prev, isEnabled: !prev.isEnabled }))}
                  >
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.isEnabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData((prev) => ({ ...prev, isEnabled: !prev.isEnabled }));
                      }}
                      className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
                        formData.isEnabled ? 'bg-[#3b5998]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          formData.isEnabled ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider hover:text-slate-900 transition-colors">
                      Enable First-Time Popup
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      formData.isEnabled ? 'bg-blue-50 text-[#3b5998]' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {formData.isEnabled ? 'Active' : 'Disabled'}
                  </span>
                </div>

                {/* 2. Show Form Toggle */}
                <div className="flex items-center justify-between bg-gray-50/60 border border-gray-200/80 p-4.5 px-5 rounded-2xl">
                  <div
                    className="flex items-center gap-3.5 cursor-pointer select-none"
                    onClick={() => setFormData((prev) => ({ ...prev, showForm: !prev.showForm }))}
                  >
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.showForm}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData((prev) => ({ ...prev, showForm: !prev.showForm }));
                      }}
                      className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${
                        formData.showForm ? 'bg-[#3b5998]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          formData.showForm ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider hover:text-slate-900 transition-colors">
                      Include Enquiry Form
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      formData.showForm
                        ? 'bg-blue-50 text-[#3b5998]'
                        : 'bg-orange-50 text-[#C86218]'
                    }`}
                  >
                    {formData.showForm ? 'With Form' : 'Banner Only'}
                  </span>
                </div>
              </div>

              {/* Popup Titles & Enquiry Form Configuration */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-[#C86218]" />
                  Popup Titles & Headings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    label="Popup Headline / Badge"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Special First-Time Visitor Offer"
                  />
                  <InputField
                    label="Enquiry Form Title"
                    name="formTitle"
                    value={formData.formTitle}
                    onChange={handleInputChange}
                    placeholder="e.g. Request an Instant Quote"
                  />
                </div>
                <div>
                  <InputField
                    label="Subtitle / Brief Description"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="e.g. Connect with our technical team for competitive industrial pricing & direct supply."
                  />
                </div>
              </div>

              {/* Popup Banner Image */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#C86218]" />
                  Optional Promotional Banner / Flyer Graphic
                </h4>

                <div className="flex flex-col gap-3 bg-gray-50/40 p-5 border border-gray-100 rounded-3xl">
                  {preview ? (
                    <div className="flex items-center justify-between p-3.5 px-5 bg-white border border-gray-200 rounded-2xl transition-all hover:bg-gray-50/50 mt-1">
                      <div className="flex items-center gap-3.5 text-gray-700">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 border border-gray-300/40 relative flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preview}
                            alt="Popup banner"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-900 truncate max-w-[150px] sm:max-w-xs">
                            {filename}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold mt-0.5">
                            First-Time Visitor Graphic (Displayed alongside Enquiry Form)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileRef.current?.click()}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="text-red-500 hover:text-red-600 p-2 bg-red-50 hover:bg-red-100 rounded-xl transition-all cursor-pointer"
                          title="Remove Image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="w-full border-2 border-dashed border-gray-200 hover:border-[#C86218] bg-white hover:bg-orange-50/10 rounded-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all group mt-1"
                    >
                      <CloudUpload className="w-8 h-8 text-gray-400 group-hover:text-[#C86218] transition-colors mb-2" />
                      <p className="text-xs text-gray-500 font-semibold group-hover:text-[#C86218]">
                        Drag and drop banner flyer here, or{' '}
                        <span className="text-[#C86218] hover:underline font-bold">browse</span>
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        PNG, JPG or WEBP (Optional Announcement Poster)
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Save Action */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <SaveButton
                  onClick={handleSave}
                  disabled={isSaving}
                  loading={isSaving}
                  label="Save Popup Settings"
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
