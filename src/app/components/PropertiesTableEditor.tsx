'use client';

import React from 'react';
import { Plus, Trash2, Columns3, X } from 'lucide-react';

export const DEFAULT_TABLE_HEADERS = ['Property', 'Test Method', 'Typical Value'];

export interface PropertiesTableData {
  headers: string[];
  rows: string[][];
}

/**
 * Normalizes any stored table format into { headers, rows } with every row padded to
 * the header count. Supports:
 *  - legacy object rows: { property, testMethod, value }
 *  - array rows: ['Kinematic Viscosity', 'ASTM D445', '15.2 cSt'] + tableHeaders
 */
export function normalizePropertiesTable(
  rawRows: unknown,
  rawHeaders: unknown
): PropertiesTableData {
  const rowsIn = Array.isArray(rawRows) ? rawRows : [];
  const headersIn = Array.isArray(rawHeaders)
    ? rawHeaders.map((h) => (typeof h === 'string' ? h : String(h ?? '')))
    : [];

  const hasObjectRows = rowsIn.some((r) => r && !Array.isArray(r) && typeof r === 'object');
  // Prisma default for tableHeaders is ["Property","Value"], which never matched the real table
  const isPrismaDefault =
    headersIn.length === 2 && headersIn[0] === 'Property' && headersIn[1] === 'Value';

  let headers: string[];
  if (hasObjectRows || headersIn.length === 0 || (isPrismaDefault && rowsIn.length === 0)) {
    headers = [...DEFAULT_TABLE_HEADERS];
  } else {
    headers = headersIn;
  }

  const rows: string[][] = rowsIn.map((r: any) => {
    if (Array.isArray(r)) return r.map((c) => (c == null ? '' : String(c)));
    if (r && typeof r === 'object') {
      return [r.property ?? '', r.testMethod ?? '-', r.value ?? ''].map(String);
    }
    return [];
  });

  const columnCount = Math.max(headers.length, ...rows.map((r) => r.length), 1);
  while (headers.length < columnCount) headers.push(`Column ${headers.length + 1}`);

  return {
    headers,
    rows: rows.map((r) => [...r, ...Array(columnCount - r.length).fill('')]),
  };
}

interface PropertiesTableEditorProps {
  label?: string;
  headers: string[];
  rows: string[][];
  onChange: (data: PropertiesTableData) => void;
}

const cellInputClass =
  'w-full min-w-[120px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black';

export function PropertiesTableEditor({
  label = 'Physico-Chemical Properties Table',
  headers,
  rows,
  onChange,
}: PropertiesTableEditorProps) {
  const columnCount = headers.length;

  const handleAddRow = () => {
    onChange({ headers, rows: [...rows, Array(columnCount).fill('')] });
  };

  const handleRemoveRow = (rowIdx: number) => {
    onChange({ headers, rows: rows.filter((_, idx) => idx !== rowIdx) });
  };

  const handleUpdateCell = (rowIdx: number, colIdx: number, val: string) => {
    const updated = rows.map((r, i) =>
      i === rowIdx ? r.map((c, j) => (j === colIdx ? val : c)) : r
    );
    onChange({ headers, rows: updated });
  };

  const handleAddColumn = () => {
    onChange({
      headers: [...headers, `Column ${columnCount + 1}`],
      rows: rows.map((r) => [...r, '']),
    });
  };

  const handleRemoveColumn = (colIdx: number) => {
    if (columnCount <= 1) return;
    const hasData = rows.some((r) => (r[colIdx] || '').trim() !== '');
    if (hasData && !window.confirm(`Delete column "${headers[colIdx]}" and all of its values?`)) {
      return;
    }
    onChange({
      headers: headers.filter((_, j) => j !== colIdx),
      rows: rows.map((r) => r.filter((_, j) => j !== colIdx)),
    });
  };

  const handleRenameColumn = (colIdx: number, val: string) => {
    onChange({ headers: headers.map((h, j) => (j === colIdx ? val : h)), rows });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddColumn}
            className="text-xs font-bold text-gray-800 bg-white border border-gray-200 hover:border-black px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition shadow-xs"
          >
            <Columns3 className="w-3.5 h-3.5" />
            Add Column
          </button>
          <button
            type="button"
            onClick={handleAddRow}
            className="text-xs font-bold text-black bg-[#ffe000] hover:bg-yellow-400 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Row
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-2xl overflow-x-auto bg-white shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {headers.map((header, colIdx) => (
                <th key={colIdx} className="p-2 px-3 align-top">
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={header}
                      onChange={(e) => handleRenameColumn(colIdx, e.target.value)}
                      placeholder="Column name"
                      title="Column heading shown on the website"
                      className="w-full min-w-[120px] px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] uppercase font-bold text-gray-700 tracking-wider focus:outline-none focus:ring-1 focus:ring-black"
                    />
                    {columnCount > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveColumn(colIdx)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                        title="Delete Column"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="py-2.5 px-2 text-right text-[10px] uppercase font-bold text-gray-500 tracking-wider w-px">
                Remove
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columnCount + 1}
                  className="p-5 bg-gray-50/60 text-center text-xs text-gray-500"
                >
                  No laboratory test specifications added yet. Click &quot;Add Row&quot; to add
                  parameter rows.
                </td>
              </tr>
            ) : (
              rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-gray-50/50">
                  {row.map((cell, colIdx) => (
                    <td key={colIdx} className="p-2 px-3">
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => handleUpdateCell(rowIdx, colIdx, e.target.value)}
                        placeholder={headers[colIdx] || ''}
                        className={`${cellInputClass} ${
                          colIdx === columnCount - 1 ? 'font-semibold' : ''
                        }`}
                      />
                    </td>
                  ))}
                  <td className="p-2 px-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(rowIdx)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
