'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, FileText, Compass, Settings, Shield, Inbox, X, Package, Factory, Globe } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface SearchItem {
  title: string;
  category: string;
  url: string;
  icon: any;
}

const STATIC_SEARCH_ITEMS: SearchItem[] = [
  { title: 'Home Page Editor', category: 'Pages', url: '/static-pages/home', icon: FileText },
  { title: 'About Us Editor', category: 'Pages', url: '/static-pages/about-us', icon: FileText },
  { title: 'Products Catalog (18+ Products)', category: 'Products', url: '/static-pages/products', icon: Package },
  { title: 'Industries We Serve (Molding, Mills, Steel...)', category: 'Pages', url: '/static-pages/industries', icon: Factory },
  { title: 'Contact Us & Toll-Free Helpline', category: 'Pages', url: '/static-pages/contact-us', icon: FileText },
  { title: 'Technical Blogs & Articles', category: 'Pages', url: '/static-pages/blogs', icon: FileText },
  { title: 'Expos & Trade Shows', category: 'Pages', url: '/static-pages/events', icon: FileText },
  { title: 'Privacy Policy', category: 'Pages', url: '/static-pages/privacy-policy', icon: FileText },
  { title: 'Menu Links Navigation', category: 'Navigation', url: '/navigation/menu-links', icon: Compass },
  { title: 'Social Media & Footer', category: 'Navigation', url: '/navigation/social-media', icon: Compass },
  { title: 'Global SEO & Analytics', category: 'SEO', url: '/seo/global', icon: Globe },
  { title: 'Page-by-Page SEO & Meta Tags', category: 'SEO', url: '/seo/pages', icon: Shield },
  { title: 'Sitemap.xml & Robots.txt', category: 'SEO', url: '/seo/sitemap-robots', icon: Shield },
  { title: 'Enquiries & Technical Audits', category: 'Submissions', url: '/submissions/enquiries', icon: Inbox },
  { title: 'Quotes & Callback Requests', category: 'Submissions', url: '/submissions/distributor-leads', icon: Inbox },
  { title: 'Profile & Admin Security', category: 'Settings', url: '/settings/profile', icon: Settings },
];

export function AdminHeader() {
  const { data: session } = useSession();
  const userName = session?.user?.name || 'Administrator';
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = STATIC_SEARCH_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(query) || item.category.toLowerCase().includes(query)
    );
    setResults(filtered);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex justify-between items-center w-full">
        <div>
          <h1 className="text-[26px] font-black tracking-tight text-zinc-900 flex items-center gap-2">
            Welcome to Lubricon CMS, <span className="text-zinc-800 underline decoration-[#ffe000] decoration-4">{userName}</span>
            <span className="text-2xl animate-pulse">⚡</span>
          </h1>
          <p className="text-xs font-semibold text-zinc-500 mt-1">
            Australian Formulation Technology • Enterprise Lubrication & Fluid Management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-zinc-800 bg-white border border-zinc-200 hover:border-black hover:bg-zinc-50 transition shadow-xs"
          >
            <Globe className="w-3.5 h-3.5 text-[#e5c700]" />
            View Live Website
          </a>
          <div className="h-10 w-10 rounded-xl border-2 border-[#ffe000] shadow-sm overflow-hidden bg-zinc-900 flex items-center justify-center text-[#ffe000] font-black text-sm">
            L
          </div>
        </div>
      </header>

      <div className="flex justify-between items-center relative">
        <div className="relative group w-full max-w-md" ref={searchRef}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-black transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search products, static pages, SEO, leads..."
            className="pl-11 pr-10 py-3 bg-white border border-zinc-200 w-full rounded-2xl text-sm font-medium focus:border-black focus:ring-2 focus:ring-[#ffe000] focus:outline-none shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsOpen(false);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Results Dropdown */}
          {isOpen && searchQuery && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden z-50 py-2 max-h-[320px] overflow-y-auto">
              {results.length === 0 ? (
                <div className="px-5 py-4 text-xs font-semibold text-zinc-400 text-center italic">
                  No matching Lubricon CMS items found
                </div>
              ) : (
                <div className="flex flex-col">
                  {results.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        router.push(item.url);
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 transition-colors w-full cursor-pointer"
                    >
                      <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-zinc-900">{item.title}</span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          {item.category}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
