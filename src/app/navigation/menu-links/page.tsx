'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, ExternalLink, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { LoadingIndicator } from '@/components/LoadingIndicator';

interface NavLinkItem {
  id: string;
  label: string;
  url: string;
  type: string;
  parent?: string;
  order?: number;
  title?: string;
  isStatic?: boolean;
  description?: string;
}

export default function MenuLinksPage() {
  const [links, setLinks] = useState<NavLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  const loadNavLinks = async () => {
    try {
      const res = await fetch('/api/nav-links');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setLinks(json.data);
        // Expand all dropdown parents by default so full structure is visible
        const initialExpanded: Record<string, boolean> = {};
        json.data.forEach((l: NavLinkItem) => {
          if (l.parent && l.parent !== '-') {
            initialExpanded[l.parent] = true;
          }
        });
        setExpandedParents(initialExpanded);
      }
    } catch (err) {
      console.error('Failed to load navigation links:', err);
      toast.error('Failed to load navigation links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNavLinks();
  }, []);

  const toggleParent = (id: string) => {
    setExpandedParents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const websiteBaseUrl = (process.env.NEXT_PUBLIC_WEBSITE_URL || '').replace(/\/+$/, '');
  const formatLiveUrl = (url: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${websiteBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const rootLinks = links
    .filter((l) => l.parent === '-' || !l.parent)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const getTypeBadge = (type: string, isChild = false) => {
    const t = type.toLowerCase();
    if (t.includes('dropdown') && !isChild) {
      return (
        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider whitespace-nowrap bg-purple-50 text-purple-700 border border-purple-100/60">
          DROPDOWN
        </span>
      );
    }
    if (isChild || t.includes('item') || t.includes('category')) {
      return (
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-800 border border-amber-200/60 whitespace-nowrap">
          DROPDOWN ITEM
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider whitespace-nowrap bg-blue-50 text-[#002B5C] border border-blue-100/60">
        MAIN LINK
      </span>
    );
  };

  return (
    <section className="flex flex-col gap-6 pb-16 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1528] tracking-tight">
          Navigation Links
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 font-normal">
          View the active navigation structure, mega-menu links, and dropdown hierarchies displayed
          on the Lubricon website.
        </p>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-2 sm:p-6 lg:p-8">
        {loading ? (
          <LoadingIndicator
            message="Loading navigation menu structure..."
            subMessage="Fetching live header links & order"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="py-3.5 px-6 text-[11px] font-bold uppercase tracking-wider w-20 whitespace-nowrap">
                    ORDER
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold uppercase tracking-wider min-w-[300px]">
                    LABEL / TITLE
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold uppercase tracking-wider text-center w-40 whitespace-nowrap">
                    TYPE
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold uppercase tracking-wider min-w-[260px]">
                    URL
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rootLinks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-sm text-slate-400">
                      No navigation links found.
                    </td>
                  </tr>
                ) : (
                  rootLinks.map((root, rootIndex) => {
                    const children = links
                      .filter((c) => c.parent === root.id)
                      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                    const hasChildren = children.length > 0;
                    const isExpanded = !!expandedParents[root.id];

                    return (
                      <React.Fragment key={root.id}>
                        {/* Root Link Row */}
                        <tr className="hover:bg-slate-50/70 transition-colors group">
                          {/* Order Column */}
                          <td className="py-4 px-6 text-sm font-bold text-slate-700 whitespace-nowrap">
                            {rootIndex + 1}
                          </td>

                          {/* Label / Title Column */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {hasChildren ? (
                                <button
                                  type="button"
                                  onClick={() => toggleParent(root.id)}
                                  className="p-1 hover:bg-slate-200/70 rounded-md transition-colors text-slate-500 cursor-pointer shrink-0"
                                  aria-label={isExpanded ? 'Collapse sub-menu' : 'Expand sub-menu'}
                                  title={isExpanded ? 'Collapse dropdown' : 'Expand dropdown'}
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-slate-700 stroke-[2.5]" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2.5]" />
                                  )}
                                </button>
                              ) : (
                                <div className="w-6 shrink-0" />
                              )}
                              <div className="min-w-0 flex items-center gap-2">
                                <span
                                  className="text-sm sm:text-[15px] font-bold text-slate-900 tracking-tight block truncate"
                                  title={root.label}
                                >
                                  {root.label}
                                </span>
                                {hasChildren && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                                    {children.length} {children.length === 1 ? 'item' : 'items'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Type Badge Column */}
                          <td className="py-4 px-6 text-center whitespace-nowrap">
                            {getTypeBadge(hasChildren ? 'Dropdown' : root.type, false)}
                          </td>

                          {/* URL Column */}
                          <td
                            className="py-4 px-6 font-mono text-xs text-slate-500 font-normal max-w-[320px] truncate"
                            title={root.url}
                          >
                            <a
                              href={formatLiveUrl(root.url)}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-[#002B5C] hover:underline inline-flex items-center gap-1"
                            >
                              <span>{root.url}</span>
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity" />
                            </a>
                          </td>
                        </tr>

                        {/* Render Nested Children (Inside Dropdowns like Products & Industries) */}
                        {isExpanded &&
                          children.map((child, childIndex) => (
                            <tr
                              key={child.id}
                              className="bg-[#fcfdff] hover:bg-[#f6f9fe] transition-colors group/child border-t border-slate-50"
                            >
                              {/* Nested Order */}
                              <td className="py-3.5 px-6 text-xs font-semibold text-slate-400 pl-10 whitespace-nowrap">
                                {rootIndex + 1}.{childIndex + 1}
                              </td>

                              {/* Nested Label */}
                              <td className="py-3.5 px-6">
                                <div className="flex items-center gap-2.5 pl-6 border-l-2 border-slate-200/70 min-w-0">
                                  <span className="text-slate-300 text-sm shrink-0">↳</span>
                                  <span
                                    className="font-semibold text-xs sm:text-sm text-slate-800 line-clamp-1 block"
                                    title={child.label}
                                  >
                                    {child.label}
                                  </span>
                                </div>
                              </td>

                              {/* Type Badge */}
                              <td className="py-3.5 px-6 text-center whitespace-nowrap">
                                {getTypeBadge(child.type, true)}
                              </td>

                              {/* URL */}
                              <td
                                className="py-3.5 px-6 font-mono text-xs text-slate-400 max-w-[320px] truncate"
                                title={child.url}
                              >
                                <a
                                  href={formatLiveUrl(child.url)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="hover:text-[#002B5C] hover:underline inline-flex items-center gap-1"
                                >
                                  <span>{child.url}</span>
                                  <ExternalLink className="w-3 h-3 opacity-0 group-hover/child:opacity-70 transition-opacity" />
                                </a>
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
