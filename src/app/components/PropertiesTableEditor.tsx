'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface PropertyRow {
  property: string;
  testMethod?: string;
  value: string;
}

interface PropertiesTableEditorProps {
  label?: string;
  rows?: PropertyRow[];
  properties?: PropertyRow[];
  onChange: (rows: PropertyRow[]) => void;
}

export function PropertiesTableEditor({
  label = 'Physico-Chemical Properties Table',
  rows: propRows,
  properties: propProperties,
  onChange,
}: PropertiesTableEditorProps) {
  const rawRows = propRows ?? propProperties ?? [];

  // Normalize incoming rows whether they are arrays [prop, method, val] or objects { property, testMethod, value }
  const activeRows: PropertyRow[] = rawRows.map((r: any) => {
    if (Array.isArray(r)) {
      return {
        property: r[0] || '',
        testMethod: r.length > 2 ? r[1] : '-',
        value: r[r.length - 1] || '',
      };
    }
    return {
      property: r?.property || '',
      testMethod: r?.testMethod || '-',
      value: r?.value || '',
    };
  });

  const handleAddRow = () => {
    onChange([...activeRows, { property: '', testMethod: 'ASTM D445', value: '' }]);
  };

  const handleRemoveRow = (index: number) => {
    onChange(activeRows.filter((_, idx) => idx !== index));
  };

  const handleUpdateCell = (
    index: number,
    field: 'property' | 'testMethod' | 'value',
    val: string
  ) => {
    const updated = [...activeRows];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
          {label}
        </label>
        <button
          type="button"
          onClick={handleAddRow}
          className="text-xs font-bold text-black bg-[#ffe000] hover:bg-yellow-400 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Spec Row
        </button>
      </div>

      {activeRows.length === 0 ? (
        <div className="p-5 bg-gray-50 border border-dashed border-gray-300 rounded-2xl text-center text-xs text-gray-500">
          No laboratory test specifications added yet. Click &quot;Add Spec Row&quot; to add
          parameter rows.
        </div>
      ) : (
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                <th className="py-2.5 px-3">Test Parameter / Property</th>
                <th className="py-2.5 px-3">Test Method (e.g. ASTM D445)</th>
                <th className="py-2.5 px-3">Typical Value / Unit</th>
                <th className="py-2.5 px-2 text-right">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50">
                  <td className="p-2 px-3">
                    <input
                      type="text"
                      value={row.property}
                      onChange={(e) => handleUpdateCell(idx, 'property', e.target.value)}
                      placeholder="e.g. Kinematic Viscosity @ 100°C"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </td>
                  <td className="p-2 px-3">
                    <input
                      type="text"
                      value={row.testMethod}
                      onChange={(e) => handleUpdateCell(idx, 'testMethod', e.target.value)}
                      placeholder="e.g. ASTM D445"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </td>
                  <td className="p-2 px-3">
                    <input
                      type="text"
                      value={row.value}
                      onChange={(e) => handleUpdateCell(idx, 'value', e.target.value)}
                      placeholder="e.g. 15.2 cSt"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black font-semibold"
                    />
                  </td>
                  <td className="p-2 px-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
