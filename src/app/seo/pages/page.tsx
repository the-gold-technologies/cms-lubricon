'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';
import { Edit2, Search, ChevronDown, ChevronRight } from 'lucide-react';

interface PageSEOSummary {
  id: string;
  pageId: string | null;
  title: string;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
  type: string;
  visibility: string;
  parent: string;
  order: number;
  description?: string;
  navTitle?: string;
  isStatic?: boolean;
}

export default function PageSEODashboard() {
  const [pages, setPages] = useState<PageSEOSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchPages() {
      try {
        const res = await fetch('/api/seo/pages');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const seen = new Set<string>();
          const uniquePages = json.data.filter((p: PageSEOSummary) => {
            if (p.slug === 'home') return false;
            const norm = p.slug.toLowerCase().trim();
            if (seen.has(norm)) return false;
            seen.add(norm);
            return true;
          });
          setPages(uniquePages);
        }
      } catch (error) {
        console.error('Error fetching pages for SEO:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPages();
  }, []);

  const toggleParent = (id: string) => {
    setExpandedParents((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredPages = pages.filter(
    (page) =>
      page.slug !== 'home' &&
      (page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const rootLinks = filteredPages
    .filter((l) => l.parent === '-' || !pages.some((p) => p.id === l.parent))
    .sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      <PageHeader
        title="Page Specific SEO"
        description="Monitor and manage SEO metadata, OG tags, and canonical URLs for every page on your site."
      />

      {/* Search Filter Box */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 px-6 focus-within:ring-2 focus-within:ring-[#002B5C]/20 transition-all">
        <Search className="w-5 h-5 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search pages by title or slug..."
          className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-700 placeholder:text-gray-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
          {filteredPages.length} Results
        </div>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-sm ring-1 ring-gray-100/50">
        <div className="overflow-x-auto p-4">
          <table className="min-w-full divide-y divide-gray-100/50">
            <thead>
              <tr>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[80px] whitespace-nowrap">
                  Order
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Label / Title
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap min-w-[180px]">
                  SEO Status
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap min-w-[140px]">
                  Type
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider min-w-[200px] max-w-[280px]">
                  URL
                </th>
                <th className="px-6 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap w-24">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C86218] mx-auto"></div>
                  </td>
                </tr>
              ) : rootLinks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                    No pages found matching your search.
                  </td>
                </tr>
              ) : (
                rootLinks.map((root, rootIndex) => {
                  const children = filteredPages
                    .filter((c) => c.parent === root.id)
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                  const hasChildren = children.length > 0;
                  const isExpanded = !!expandedParents[root.id];

                  const hasTitle = Boolean(root.metaTitle && root.metaTitle.trim().length > 0);
                  const hasDesc = Boolean(
                    root.metaDescription && root.metaDescription.trim().length > 0
                  );

                  return (
                    <React.Fragment key={root.id}>
                      <tr className="hover:bg-slate-50/70 transition-colors group">
                        <td className="px-6 py-5 text-sm font-semibold text-gray-500 whitespace-nowrap">
                          {rootIndex + 1}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            {hasChildren ? (
                              <button
                                type="button"
                                onClick={() => toggleParent(root.id)}
                                className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 cursor-pointer"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                            ) : (
                              <div className="w-6" />
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-gray-900 group-hover:text-[#002B5C] transition-colors whitespace-nowrap">
                                {root.title}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          {root.type === 'Dropdown' || root.slug === 'products' ? (
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest whitespace-nowrap">
                              Group Container
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                                  hasTitle
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                    : 'bg-orange-50 text-[#C86218] border border-orange-100'
                                }`}
                              >
                                {hasTitle ? 'Title ✓' : 'Title ✗'}
                              </span>
                              <span
                                className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                                  hasDesc
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                    : 'bg-orange-50 text-[#C86218] border border-orange-100'
                                }`}
                              >
                                {hasDesc ? 'Desc ✓' : 'Desc ✗'}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                              root.type === 'Main Link'
                                ? 'bg-blue-50 text-[#002B5C]'
                                : root.type === 'Dropdown'
                                  ? 'bg-purple-50 text-purple-600'
                                  : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {root.type}
                          </span>
                        </td>
                        <td className="px-6 py-5 font-mono text-xs text-gray-500 break-words max-w-[260px] leading-relaxed">
                          /{root.slug}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right">
                          <div className="flex items-center gap-3 justify-end">
                            {root.type !== 'Dropdown' && root.slug !== 'products' && (
                              <Link
                                href={`/seo/pages/${root.slug}`}
                                className="p-2 bg-gray-50 text-slate-600 rounded-xl hover:bg-[#002B5C] hover:text-white transition-all group inline-flex items-center justify-center"
                                title="Edit Page SEO"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded &&
                        children.map((child, childIndex) => {
                          const childHasTitle = !!child.metaTitle;
                          const childHasDesc = !!child.metaDescription;

                          return (
                            <tr
                              key={child.id}
                              className="bg-[#fcfdff]/50 hover:bg-[#f5f8ff] transition-colors group"
                            >
                              <td className="px-6 py-4 text-sm font-medium text-gray-400 pl-12 whitespace-nowrap">
                                {rootIndex + 1}.{childIndex + 1}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3 pl-6 border-l-2 border-gray-100/50">
                                  <span className="text-gray-300 text-lg">↳</span>
                                  <span className="font-medium text-xs text-gray-700 group-hover:text-[#002B5C] transition-colors">
                                    {child.title}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                                      childHasTitle
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                        : 'bg-orange-50 text-[#C86218] border border-orange-100'
                                    }`}
                                  >
                                    {childHasTitle ? 'Title ✓' : 'Title ✗'}
                                  </span>
                                  <span
                                    className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                                      childHasDesc
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                        : 'bg-orange-50 text-[#C86218] border border-orange-100'
                                    }`}
                                  >
                                    {childHasDesc ? 'Desc ✓' : 'Desc ✗'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-gray-50 text-gray-500 border border-gray-100 whitespace-nowrap">
                                  {child.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs font-mono text-gray-400 break-words max-w-[260px] leading-relaxed">
                                /{child.slug}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="flex items-center gap-3 justify-end">
                                  <Link
                                    href={`/seo/pages/${child.slug}`}
                                    className="p-1.5 bg-white border border-gray-100 text-gray-400 rounded-lg hover:border-[#002B5C] hover:text-[#002B5C] transition-all inline-flex items-center justify-center"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
