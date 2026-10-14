'use client';

import Link from 'next/link';
import { ArrowRight, Loader2, Layout, BadgeCheck, ShieldAlert, Eye } from 'lucide-react';

interface PageListItem {
  id: string;
  title: string;
  slug: string;
  visibility: string;
  type: string;
  sectionsCount: number;
}

interface PageStructureProps {
  stats?: {
    pagesList?: PageListItem[];
  };
  loading?: boolean;
}

export function PageStructure({ stats, loading }: PageStructureProps) {
  const pagesList = stats?.pagesList || [];
  const displayedPages = pagesList.slice(0, 6);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xs border border-zinc-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-extrabold text-lg text-zinc-900">Lubricon Website Pages</h3>
          <p className="text-xs font-medium text-zinc-500 mt-0.5">
            Static page layouts, structured content blocks, and live SEO status.
          </p>
        </div>
        <Link
          href="/seo/pages"
          className="text-xs font-bold text-black hover:bg-[#ffe000] flex items-center gap-1 bg-[#ffe000]/30 px-3 py-1.5 rounded-xl transition-all"
        >
          Manage All SEO <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-800" />
        </div>
      ) : pagesList.length === 0 ? (
        <div className="py-8 text-center text-zinc-400 text-xs italic">
          No website pages found in database. Run seed script or create one.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-zinc-100 pb-2">
                <th className="pb-3 font-bold text-zinc-400 uppercase tracking-widest text-[10px]">
                  Page Name
                </th>
                <th className="pb-3 font-bold text-zinc-400 uppercase tracking-widest text-[10px]">
                  Route Path
                </th>
                <th className="pb-3 font-bold text-zinc-400 uppercase tracking-widest text-[10px]">
                  Status
                </th>
                <th className="pb-3 font-bold text-zinc-400 uppercase tracking-widest text-[10px]">
                  Sections Count
                </th>
                <th className="pb-3 font-bold text-zinc-400 uppercase tracking-widest text-[10px] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {displayedPages.map((page) => {
                const isPublic = page.visibility === 'published' || page.visibility === 'public';
                const editorUrl = `/static-pages/${page.slug}`;

                return (
                  <tr key={page.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3.5">
                      <Link href={editorUrl} className="flex items-center gap-2.5 group">
                        <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 group-hover:bg-[#ffe000] group-hover:text-black transition-colors">
                          <Layout className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900 group-hover:text-black transition-colors">
                            {page.title}
                          </span>
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                            {page.type} Page
                          </span>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3.5 font-mono text-xs text-zinc-500">
                      /{page.slug === 'home' ? '' : page.slug}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isPublic
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isPublic ? (
                          <>
                            <BadgeCheck className="w-3 h-3 text-emerald-600" />
                            Live
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3 h-3 text-amber-600" />
                            Draft
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-zinc-800">
                      {page.sectionsCount} content block{page.sectionsCount === 1 ? '' : 's'}
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href={editorUrl}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 hover:border-black hover:bg-black hover:text-[#ffe000] text-zinc-700 font-semibold text-[11px] transition-all"
                      >
                        <Eye className="w-3 h-3" />
                        Edit Content
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
