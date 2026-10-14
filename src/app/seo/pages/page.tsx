'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import Link from 'next/link';
import { Edit2, Search, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

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

  const filteredPages = pages.filter(
    (page) =>
      page.slug !== 'home' &&
      (page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const websiteBaseUrl = (process.env.NEXT_PUBLIC_WEBSITE_URL || '').replace(/\/+$/, '');

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      <PageHeader
        title="Page Specific SEO"
        description="Monitor and manage SEO metadata, OpenGraph tags, and indexing settings for each website page."
      />

      {/* Info Tip Banner */}
      <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-[#FFE000] text-black flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
          i
        </div>
        <p className="text-xs text-amber-950 leading-relaxed font-medium">
          <strong>Per-Page SEO Scope:</strong> Manage metadata for the primary website landing pages
          (About Us, Products Catalog, Industries We Serve, Contact Us). Individual product SEO
          (titles, descriptions, OG images) is managed directly inside each product&apos;s editor
          under the <strong>Products Catalog</strong> tab.
        </p>
      </div>

      {/* Search Filter Box */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xs flex items-center gap-4 px-6 focus-within:ring-2 focus-within:ring-[#002B5C]/20 transition-all">
        <Search className="w-5 h-5 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search pages by title or slug..."
          className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-700 placeholder:text-gray-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
          {filteredPages.length} Pages
        </div>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-xs ring-1 ring-gray-100/50">
        <div className="overflow-x-auto p-4">
          <table className="min-w-full divide-y divide-gray-100/50">
            <thead>
              <tr>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[80px] whitespace-nowrap">
                  Order
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap min-w-[200px]">
                  Page Name
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap min-w-[180px]">
                  SEO Status
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap min-w-[130px]">
                  Type
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider min-w-[200px] max-w-[280px]">
                  URL Path
                </th>
                <th className="px-6 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap w-28">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002B5C] mx-auto"></div>
                  </td>
                </tr>
              ) : filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                    No pages found matching your search.
                  </td>
                </tr>
              ) : (
                filteredPages.map((page, index) => {
                  const hasTitle = Boolean(page.metaTitle && page.metaTitle.trim().length > 0);
                  const hasDesc = Boolean(
                    page.metaDescription && page.metaDescription.trim().length > 0
                  );

                  return (
                    <tr key={page.id} className="hover:bg-slate-50/70 transition-colors group">
                      {/* Order Column */}
                      <td className="px-6 py-5 text-sm font-semibold text-gray-500 whitespace-nowrap">
                        {index + 1}
                      </td>

                      {/* Title Column */}
                      <td className="px-6 py-5">
                        <span className="font-bold text-sm text-gray-900 group-hover:text-[#002B5C] transition-colors whitespace-nowrap block">
                          {page.title}
                        </span>
                      </td>

                      {/* SEO Status Badges */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                              hasTitle
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                            }`}
                          >
                            {hasTitle ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Title ✓</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                <span>Title Missing</span>
                              </>
                            )}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                              hasDesc
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                            }`}
                          >
                            {hasDesc ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Desc ✓</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                <span>Desc Missing</span>
                              </>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Type Column */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap bg-blue-50 text-[#002B5C] border border-blue-100/60">
                          STANDARD PAGE
                        </span>
                      </td>

                      {/* URL Path */}
                      <td className="px-6 py-5 font-mono text-xs text-gray-500 break-words max-w-[260px]">
                        <a
                          href={`${websiteBaseUrl}/${page.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-[#002B5C] hover:underline inline-flex items-center gap-1 group/link"
                        >
                          <span>/{page.slug}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-70 transition-opacity" />
                        </a>
                      </td>

                      {/* Action Button */}
                      <td className="px-6 py-5 whitespace-nowrap text-right">
                        <Link
                          href={`/seo/pages/${page.slug}`}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-[#002B5C] text-slate-700 hover:text-white rounded-xl transition-all font-semibold text-xs inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          title={`Edit SEO for ${page.title}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit SEO</span>
                        </Link>
                      </td>
                    </tr>
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
