'use client';

import React, { useRef } from 'react';
import { Plus, Trash2, GripVertical, CheckCircle2 } from 'lucide-react';

interface StringListEditorProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  tooltip?: string;
  accentColor?: 'red' | 'dark';
}

export function StringListEditor({
  label,
  items = [],
  onChange,
  placeholder = 'Add point...',
}: StringListEditorProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleAdd = () => {
    onChange([...items, '']);
    // Focus the newly added input after render
    setTimeout(() => {
      inputRefs.current[items.length]?.focus();
    }, 50);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, val: string) => {
    if (val.includes('\n')) {
      const splitLines = val
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const copy = [...items];
      copy.splice(index, 1, ...splitLines);
      onChange(copy);
      return;
    }
    const copy = [...items];
    copy[index] = val;
    onChange(copy);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onChange([...items.slice(0, idx + 1), '', ...items.slice(idx + 1)]);
      setTimeout(() => {
        inputRefs.current[idx + 1]?.focus();
      }, 50);
    }
    if (e.key === 'Backspace' && items[idx] === '' && items.length > 1) {
      e.preventDefault();
      onChange(items.filter((_, i) => i !== idx));
      setTimeout(() => {
        inputRefs.current[Math.max(0, idx - 1)]?.focus();
      }, 50);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap truncate">
            {label}
          </label>
          {items.length > 0 && (
            <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C86218]/10 text-[#C86218] border border-[#C86218]/20">
              {items.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-[#C86218] hover:bg-[#A5501A] px-3 py-1.5 rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-1.5">
        {items.length === 0 ? (
          <button
            type="button"
            onClick={handleAdd}
            className="w-full p-5 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 text-center text-xs text-gray-400 cursor-pointer hover:border-[#C86218]/50 hover:bg-orange-50/30 hover:text-[#C86218] transition-all flex flex-col items-center justify-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-[#C86218]/10 flex items-center justify-center transition-colors">
              <Plus className="w-4 h-4 text-gray-400 group-hover:text-[#C86218]" />
            </div>
            <span className="font-semibold">Click to add first point</span>
          </button>
        ) : (
          items.map((item, idx) => (
            <div
              key={idx}
              className="group flex items-start gap-2.5 bg-white border border-gray-200 rounded-2xl px-3 py-2.5 hover:border-[#C86218]/40 focus-within:border-[#C86218] focus-within:ring-2 focus-within:ring-[#C86218]/10 focus-within:shadow-sm transition-all"
            >
              {/* Drag handle (visual only) */}
              <GripVertical className="w-3.5 h-3.5 text-gray-300 mt-1.5 shrink-0 group-hover:text-gray-400 transition-colors" />

              {/* Number badge */}
              <div className="w-5 h-5 mt-0.5 rounded-full flex items-center justify-center shrink-0 bg-[#C86218]/10 text-[#C86218] group-focus-within:bg-[#C86218] group-focus-within:text-white transition-colors">
                <span className="text-[10px] font-black leading-none">{idx + 1}</span>
              </div>

              {/* Input — full width, wraps text */}
              <input
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                value={item}
                onChange={(e) => handleUpdate(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                placeholder={placeholder}
                className="flex-1 min-w-0 bg-transparent border-none text-[13px] text-gray-800 font-medium focus:outline-none placeholder:text-gray-300 py-0.5 leading-relaxed"
              />

              {/* Valid indicator */}
              {item.trim().length > 0 && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}

              {/* Delete */}
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1 mt-0.5 text-gray-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all cursor-pointer shrink-0 opacity-0 group-hover:opacity-100"
                title="Remove"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer hint */}
      {items.length > 0 && (
        <p className="text-[10px] text-gray-400 pl-1 leading-snug">
          Press{' '}
          <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[9px] font-mono">
            Enter
          </kbd>{' '}
          to add a new line ·{' '}
          <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[9px] font-mono">
            Backspace
          </kbd>{' '}
          on empty row to remove
        </p>
      )}
    </div>
  );
}
