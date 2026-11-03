'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

interface MultiSelectFieldProps {
  label?: string;
  containerClassName?: string;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
}

/** Dropdown with checkboxes; selection is optional and may be empty. */
export const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label,
  containerClassName = '',
  options,
  value,
  onChange,
  placeholder = 'Select...',
  emptyText = 'No options available',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const toggle = (v: string) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };

  const selectedOptions = options.filter((o) => value.includes(o.value));

  return (
    <div ref={ref} className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-4">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="w-full min-h-[50px] px-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-left focus:ring-2 focus:ring-[#C86218]/20 focus:border-[#C86218] outline-none transition-all cursor-pointer text-gray-800 disabled:cursor-not-allowed disabled:opacity-60 flex flex-wrap items-center gap-1.5"
        >
          {selectedOptions.length === 0 ? (
            <span className="text-gray-400 px-1">{placeholder}</span>
          ) : (
            selectedOptions.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full bg-orange-50 text-[#C86218] border border-orange-100 text-[11px] font-bold"
              >
                {opt.label}
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label={`Remove ${opt.label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(opt.value);
                  }}
                  className="p-0.5 rounded-full hover:bg-orange-100"
                >
                  <X className="w-3 h-3" />
                </span>
              </span>
            ))
          )}
        </button>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>

        {open && (
          <div
            role="listbox"
            aria-multiselectable="true"
            className="absolute z-30 mt-2 w-full max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-2xl shadow-lg p-1.5"
          >
            {options.length === 0 ? (
              <p className="px-3 py-2.5 text-xs text-gray-400">{emptyText}</p>
            ) : (
              options.map((opt) => {
                const checked = value.includes(opt.value);
                return (
                  <button
                    type="button"
                    role="option"
                    aria-selected={checked}
                    key={opt.value}
                    onClick={() => toggle(opt.value)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-left transition-colors cursor-pointer ${
                      checked
                        ? 'bg-orange-50 text-[#C86218] font-semibold'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        checked ? 'bg-[#C86218] border-[#C86218]' : 'border-gray-300 bg-white'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 text-white" />}
                    </span>
                    {opt.label}
                  </button>
                );
              })
            )}
            {value.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full mt-1 px-3 py-2 rounded-xl text-[11px] font-bold text-red-600 hover:bg-red-50 text-left cursor-pointer border-t border-gray-100"
              >
                Clear selection
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
