'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export type CoreSpecKey = 'viscosity' | 'grade' | 'standard' | 'packaging';

export interface SpecField {
  /** Core fields keep a fixed key (used for search, cards and quote forms); custom ones have none */
  key?: CoreSpecKey;
  label: string;
  value: string;
}

/** Labels shown on the website when a product has no custom label saved (keep in sync with the website) */
export const DEFAULT_SPEC_LABELS: Record<CoreSpecKey, string> = {
  viscosity: 'Viscosity Rating',
  grade: 'Performance Grade',
  standard: 'Testing Standard',
  packaging: 'Standard Packaging',
};

// Same order as the "Engineering Standards" card on the website
const CORE_KEYS: CoreSpecKey[] = ['grade', 'viscosity', 'standard', 'packaging'];

const PLACEHOLDERS: Record<CoreSpecKey, string> = {
  viscosity: 'e.g. SAE 15W40, ISO VG 460',
  grade: 'e.g. API CK-4 / ACEA E9, Dexron IIIH',
  standard: 'e.g. Euro 6, BS-VI Ready, DIN 51524 Part 2',
  packaging: 'e.g. 1L, 4L, 10L, 20L, 210L Barrel (comma-separated)',
};

/** Builds the editable field list from a stored `specifications` JSON object */
export function specFieldsFromSpecifications(specs: any): SpecField[] {
  const s = specs && typeof specs === 'object' ? specs : {};
  const labels = s.labels && typeof s.labels === 'object' ? s.labels : {};

  const core: SpecField[] = CORE_KEYS.map((key) => {
    const raw = s[key];
    const value = Array.isArray(raw) ? raw.join(', ') : typeof raw === 'string' ? raw : '';
    return { key, label: labels[key] || DEFAULT_SPEC_LABELS[key], value };
  });

  const extra: SpecField[] = Array.isArray(s.extra)
    ? s.extra
        .filter((e: any) => e && typeof e === 'object')
        .map((e: any) => ({ label: String(e.label ?? ''), value: String(e.value ?? '') }))
    : [];

  return [...core, ...extra];
}

/** Serializes the field list back into the `specifications` JSON object */
export function specificationsFromSpecFields(fields: SpecField[]) {
  const get = (key: CoreSpecKey) => fields.find((f) => f.key === key);
  const labels: Record<string, string> = {};
  for (const key of CORE_KEYS) {
    labels[key] = get(key)?.label.trim() || DEFAULT_SPEC_LABELS[key];
  }

  return {
    viscosity: get('viscosity')?.value.trim() || '',
    grade: get('grade')?.value.trim() || '',
    standard: get('standard')?.value.trim() || '',
    packaging: (get('packaging')?.value || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    labels,
    extra: fields
      .filter((f) => !f.key)
      .map((f) => ({ label: f.label.trim(), value: f.value.trim() }))
      .filter((f) => f.label && f.value),
  };
}

interface SpecificationsEditorProps {
  fields: SpecField[];
  onChange: (fields: SpecField[]) => void;
}

const inputClass =
  'w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black';

export function SpecificationsEditor({ fields, onChange }: SpecificationsEditorProps) {
  const update = (idx: number, patch: Partial<SpecField>) => {
    onChange(fields.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="hidden sm:grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_32px] gap-3 px-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
        <span>Label (shown on website)</span>
        <span>Value</span>
        <span />
      </div>

      {fields.map((field, idx) => (
        <div
          key={field.key ?? `extra-${idx}`}
          className="grid grid-cols-1 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_32px] gap-2 sm:gap-3 items-center p-3 sm:p-0 rounded-2xl sm:rounded-none bg-gray-50/60 sm:bg-transparent border border-gray-100 sm:border-0"
        >
          <input
            type="text"
            value={field.label}
            onChange={(e) => update(idx, { label: e.target.value })}
            placeholder={field.key ? DEFAULT_SPEC_LABELS[field.key] : 'e.g. Base Oil Type'}
            className={`${inputClass} font-bold`}
          />
          <input
            type="text"
            value={field.value}
            onChange={(e) => update(idx, { value: e.target.value })}
            placeholder={field.key ? PLACEHOLDERS[field.key] : 'e.g. Group III Synthetic'}
            className={inputClass}
          />
          {field.key ? (
            <span />
          ) : (
            <button
              type="button"
              onClick={() => onChange(fields.filter((_, i) => i !== idx))}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer justify-self-end sm:justify-self-center"
              title="Remove Parameter"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}

      <div>
        <button
          type="button"
          onClick={() => onChange([...fields, { label: '', value: '' }])}
          className="text-xs font-bold text-black bg-[#ffe000] hover:bg-yellow-400 px-3 py-1.5 rounded-lg inline-flex items-center gap-1 cursor-pointer transition shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Parameter
        </button>
      </div>

      <p className="text-[11px] text-gray-400">
        Leave a value empty to hide that row on the website. The four standard rows also power
        product search, product cards and quote forms.
      </p>
    </div>
  );
}
