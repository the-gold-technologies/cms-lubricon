'use client';

import React, { useState, useEffect } from 'react';
import {
  Warehouse,
  Navigation,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Map as MapIcon,
  Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SectionHeader } from '@/components/SectionHeader';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { SaveButton } from '@/components/SaveButton';
import { ImagePickerField } from '@/components/ImagePickerField';

export type PinType = 'warehouse' | 'office' | 'field';

export interface NetworkLocationItem {
  id: string;
  name: string;
  state: string;
  region: string;
  type: PinType[];
  lat: number;
  lng: number;
  description: string;
  address?: string;
}

interface ExistingBusinessNetworkCMSSectionProps {
  initialData?: any;
  onSave: (data: any) => Promise<void>;
}

export function ExistingBusinessNetworkCMSSection({
  initialData,
  onSave,
}: ExistingBusinessNetworkCMSSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Section Header & Graphic
  const [badge, setBadge] = useState('');
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [regionalMapImage, setRegionalMapImage] = useState('');

  // Quick Jump Bar
  const [quickJumpWarehouses, setQuickJumpWarehouses] = useState('');
  const [quickJumpOffices, setQuickJumpOffices] = useState('');
  const [quickJumpFieldHubs, setQuickJumpFieldHubs] = useState('');

  // Directory Summary Cards
  const [summaryWarehouses, setSummaryWarehouses] = useState('');
  const [summaryOffices, setSummaryOffices] = useState('');
  const [summaryFieldHubs, setSummaryFieldHubs] = useState('');

  // Locations List
  const [locations, setLocations] = useState<NetworkLocationItem[]>([]);
  const [expandedLocationId, setExpandedLocationId] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setBadge(initialData.badge || '');
      setHeading(initialData.heading || '');
      setDescription(initialData.description || '');
      setRegionalMapImage(initialData.regionalMapImage || '');

      setQuickJumpWarehouses(initialData.quickJumpWarehouses || '');
      setQuickJumpOffices(initialData.quickJumpOffices || '');
      setQuickJumpFieldHubs(initialData.quickJumpFieldHubs || '');

      setSummaryWarehouses(initialData.summaryWarehouses || '');
      setSummaryOffices(initialData.summaryOffices || '');
      setSummaryFieldHubs(initialData.summaryFieldHubs || '');

      if (Array.isArray(initialData.locations)) {
        setLocations(initialData.locations);
      }
    }
  }, [initialData]);

  const handleAddLocation = () => {
    const newId = 'loc-' + Date.now();
    const newLoc: NetworkLocationItem = {
      id: newId,
      name: '',
      state: '',
      region: 'Delhi NCR',
      type: ['field'],
      lat: 28.6139,
      lng: 77.209,
      description: '',
      address: '',
    };
    setLocations([...locations, newLoc]);
    setExpandedLocationId(newId);
  };

  const handleRemoveLocation = (id: string) => {
    setLocations(locations.filter((l) => l.id !== id));
    if (expandedLocationId === id) setExpandedLocationId(null);
  };

  const handleUpdateLocation = (id: string, field: keyof NetworkLocationItem, value: any) => {
    setLocations(
      locations.map((loc) => {
        if (loc.id === id) {
          return { ...loc, [field]: value };
        }
        return loc;
      })
    );
  };

  const handleToggleType = (id: string, typeVal: PinType) => {
    setLocations(
      locations.map((loc) => {
        if (loc.id === id) {
          const currentTypes = loc.type || [];
          const exists = currentTypes.includes(typeVal);
          const newTypes = exists
            ? currentTypes.filter((t) => t !== typeVal)
            : [...currentTypes, typeVal];
          return { ...loc, type: newTypes.length > 0 ? newTypes : [typeVal] };
        }
        return loc;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      const payload = {
        badge: badge.trim(),
        heading: heading.trim(),
        description: description.trim(),
        regionalMapImage,
        quickJumpWarehouses: quickJumpWarehouses.trim(),
        quickJumpOffices: quickJumpOffices.trim(),
        quickJumpFieldHubs: quickJumpFieldHubs.trim(),
        summaryWarehouses: summaryWarehouses.trim(),
        summaryOffices: summaryOffices.trim(),
        summaryFieldHubs: summaryFieldHubs.trim(),
        locations: locations.map((loc) => ({
          ...loc,
          name: loc.name.trim(),
          state: loc.state.trim(),
          description: loc.description.trim(),
          address: loc.address ? loc.address.trim() : '',
          lat: Number(loc.lat) || 0,
          lng: Number(loc.lng) || 0,
        })),
      };

      await onSave(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error('Failed to save network section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-200">
      <div className="p-6 sm:p-8">
        <SectionHeader
          title="4. Existing Business Network & Regional Map"
          description="Manage northern industrial corridor coverage, regional map graphic, directory cards, and interactive Google Map pins."
          badge="Regional Network"
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />

        {isOpen && (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-8">
            {/* SUBSECTION 1: Header & Regional Graphic */}
            <div className="flex flex-col gap-5 p-6 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0C356A]">
                <Navigation className="w-4 h-4 text-[#C86218]" />
                <span>Section Heading &amp; Graphic</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Eyebrow Badge"
                  placeholder="e.g. North India Network"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                />
                <InputField
                  label="Main Heading"
                  placeholder="e.g. Existing Business Network"
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                />
              </div>

              <TextAreaField
                label="Section Description"
                placeholder="Direct distribution hubs, administrative branches, and field teams across the northern industrial corridor."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />

              <ImagePickerField
                label="Regional Operating Map Graphic"
                value={regionalMapImage}
                onChange={setRegionalMapImage}
                folder="jaideva/contact"
                helperText="Upload the curated regional map diagram shown in the Regional Map view."
              />
            </div>

            {/* SUBSECTION 2: Quick Jump & Directory Summary Pills */}
            <div className="flex flex-col gap-5 p-6 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0C356A]">
                <MapIcon className="w-4 h-4 text-[#C86218]" />
                <span>Quick Jump Bar &amp; Directory Summaries</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField
                  label="Quick Jump: Warehouses"
                  placeholder="e.g. 🔴 Mandoli, Baghpat, Haridwar"
                  value={quickJumpWarehouses}
                  onChange={(e) => setQuickJumpWarehouses(e.target.value)}
                />
                <InputField
                  label="Quick Jump: Offices"
                  placeholder="e.g. 🔵 Delhi HQ & Haridwar"
                  value={quickJumpOffices}
                  onChange={(e) => setQuickJumpOffices(e.target.value)}
                />
                <InputField
                  label="Quick Jump: Field Hubs"
                  placeholder="e.g. 🟡 14 Field Presence Hubs"
                  value={quickJumpFieldHubs}
                  onChange={(e) => setQuickJumpFieldHubs(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200/60">
                <InputField
                  label="Summary Card: Warehouses"
                  placeholder="Mandoli (Delhi), Baghpat (U.P.), Haridwar (Uttarakhand)"
                  value={summaryWarehouses}
                  onChange={(e) => setSummaryWarehouses(e.target.value)}
                />
                <InputField
                  label="Summary Card: Offices"
                  placeholder="Delhi HQ (Corporate), Haridwar (Regional Operations)"
                  value={summaryOffices}
                  onChange={(e) => setSummaryOffices(e.target.value)}
                />
                <InputField
                  label="Summary Card: Field Presence"
                  placeholder="Noida, Ghaziabad, Meerut, Sonipat, Rohtak, Dehradun +"
                  value={summaryFieldHubs}
                  onChange={(e) => setSummaryFieldHubs(e.target.value)}
                />
              </div>
            </div>

            {/* SUBSECTION 3: Interactive Location Pins */}
            <div className="flex flex-col gap-5 p-6 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0C356A]">
                  <Globe className="w-4 h-4 text-[#C86218]" />
                  <span>Interactive Map Pins ({locations.length} Locations)</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddLocation}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0C356A] text-white text-xs font-bold hover:bg-[#C86218] transition-colors cursor-pointer shadow-xs"
                >
                  <Plus size={14} /> Add Location Pin
                </button>
              </div>

              {locations.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                  No location pins added yet. Click &quot;Add Location Pin&quot; to configure
                  network locations.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {locations.map((loc, idx) => {
                    const isExpanded = expandedLocationId === loc.id;
                    const isWarehouse = (loc.type || []).includes('warehouse');
                    const isOffice = (loc.type || []).includes('office');
                    const isField = (loc.type || []).includes('field');

                    return (
                      <div
                        key={loc.id}
                        className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden"
                      >
                        {/* Collapsed Header */}
                        <div
                          className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50/80 transition-colors"
                          onClick={() => setExpandedLocationId(isExpanded ? null : loc.id)}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-[#0C356A]">
                              {loc.name || 'Untitled Location'}
                            </span>
                            {loc.state && (
                              <span className="text-[10px] font-semibold text-slate-400">
                                ({loc.state})
                              </span>
                            )}
                            <div className="flex items-center gap-1 ml-2">
                              {isWarehouse && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-100 text-rose-800">
                                  WH
                                </span>
                              )}
                              {isOffice && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-[#0C356A]">
                                  OFFICE
                                </span>
                              )}
                              {isField && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-800">
                                  FIELD
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveLocation(loc.id);
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Location"
                            >
                              <Trash2 size={14} />
                            </button>
                            {isExpanded ? (
                              <ChevronUp size={16} className="text-slate-400" />
                            ) : (
                              <ChevronDown size={16} className="text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Form Fields */}
                        {isExpanded && (
                          <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex flex-col gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <InputField
                                label="Location Name"
                                placeholder="e.g. Delhi / Mandoli"
                                value={loc.name}
                                onChange={(e) =>
                                  handleUpdateLocation(loc.id, 'name', e.target.value)
                                }
                              />
                              <InputField
                                label="State"
                                placeholder="e.g. Delhi, Uttar Pradesh, Haryana"
                                value={loc.state}
                                onChange={(e) =>
                                  handleUpdateLocation(loc.id, 'state', e.target.value)
                                }
                              />
                              <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                  Region Cluster
                                </label>
                                <select
                                  value={loc.region}
                                  onChange={(e) =>
                                    handleUpdateLocation(loc.id, 'region', e.target.value)
                                  }
                                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#C86218] text-gray-800"
                                >
                                  <option value="Delhi NCR">Delhi NCR</option>
                                  <option value="Western U.P.">Western U.P.</option>
                                  <option value="Uttarakhand">Uttarakhand</option>
                                  <option value="Haryana">Haryana</option>
                                </select>
                              </div>
                            </div>

                            {/* Pin Type Badges Checkbox Group */}
                            <div>
                              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                Pin Classification Type
                              </label>
                              <div className="flex flex-wrap gap-2.5">
                                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer select-none bg-white">
                                  <input
                                    type="checkbox"
                                    checked={isWarehouse}
                                    onChange={() => handleToggleType(loc.id, 'warehouse')}
                                    className="rounded text-rose-600 focus:ring-rose-500"
                                  />
                                  <span className="text-rose-900">Warehouse (Red Pin)</span>
                                </label>

                                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer select-none bg-white">
                                  <input
                                    type="checkbox"
                                    checked={isOffice}
                                    onChange={() => handleToggleType(loc.id, 'office')}
                                    className="rounded text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-blue-900">Branch Office (Blue Pin)</span>
                                </label>

                                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer select-none bg-white">
                                  <input
                                    type="checkbox"
                                    checked={isField}
                                    onChange={() => handleToggleType(loc.id, 'field')}
                                    className="rounded text-amber-600 focus:ring-amber-500"
                                  />
                                  <span className="text-amber-900">
                                    Field Presence (Yellow Pin)
                                  </span>
                                </label>
                              </div>
                            </div>

                            {/* Coordinates */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <InputField
                                label="Latitude (lat)"
                                type="number"
                                step="any"
                                placeholder="e.g. 28.709"
                                value={loc.lat}
                                onChange={(e) =>
                                  handleUpdateLocation(
                                    loc.id,
                                    'lat',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                              <InputField
                                label="Longitude (lng)"
                                type="number"
                                step="any"
                                placeholder="e.g. 77.311"
                                value={loc.lng}
                                onChange={(e) =>
                                  handleUpdateLocation(
                                    loc.id,
                                    'lng',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                              />
                            </div>

                            <InputField
                              label="Description / Specialization"
                              placeholder="e.g. Central Warehouse Hub & Corporate Operations Office"
                              value={loc.description}
                              onChange={(e) =>
                                handleUpdateLocation(loc.id, 'description', e.target.value)
                              }
                            />

                            <InputField
                              label="Physical Address (Optional)"
                              placeholder="e.g. Mandoli Industrial Area, Delhi 110093"
                              value={loc.address || ''}
                              onChange={(e) =>
                                handleUpdateLocation(loc.id, 'address', e.target.value)
                              }
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <SaveButton
                loading={loading}
                saved={saved}
                label="Save Network Section"
                className="w-full py-3.5 rounded-2xl font-bold text-sm shadow-md"
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
