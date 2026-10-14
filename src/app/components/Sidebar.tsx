'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Settings,
  Compass,
  BookOpen,
  Layers,
  LucideIcon,
  ChevronDown,
  LogOut,
  Globe,
  Package,
  Factory,
  Mail,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';

type SidebarLink = {
  title: string;
  icon: LucideIcon;
  href?: string;
  sublinks?: { title: string; href: string }[];
  badge?: string | number;
};

const sidebarLinks: SidebarLink[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Navigation & Links',
    icon: Compass,
    sublinks: [
      { title: 'Menu Links', href: '/navigation/menu-links' },
      { title: 'Footer & Socials', href: '/navigation/social-media' },
    ],
  },
  {
    title: 'Pages & Content',
    icon: BookOpen,
    sublinks: [
      { title: 'Home Page', href: '/static-pages/home' },
      { title: 'About Us', href: '/static-pages/about-us' },
      { title: 'Industries We Serve', href: '/static-pages/industries' },
      { title: 'Products Catalog', href: '/static-pages/products' },
      { title: 'Contact Us', href: '/static-pages/contact-us' },
      { title: 'Privacy Policy', href: '/static-pages/privacy-policy' },
    ],
  },
  {
    title: 'Enquiries & Audits',
    href: '/submissions/enquiries',
    icon: Layers,
  },
  {
    title: 'SEO Management',
    icon: Globe,
    sublinks: [
      { title: 'Global SEO', href: '/seo/global' },
      { title: 'Page-by-Page SEO', href: '/seo/pages' },
      { title: 'Sitemap & Robots', href: '/seo/sitemap-robots' },
    ],
  },
  {
    title: 'Settings',
    icon: Settings,
    sublinks: [{ title: 'Profile & Access', href: '/settings/profile' }],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const [openGroups, setOpenGroups] = useState<string[]>(() => {
    return sidebarLinks
      .filter((item) => item.sublinks?.some((sublink) => pathname.startsWith(sublink.href)))
      .map((item) => item.title);
  });

  useEffect(() => {
    const activeGroups = sidebarLinks
      .filter((item) => item.sublinks?.some((sublink) => pathname.startsWith(sublink.href)))
      .map((item) => item.title);

    setOpenGroups((prev) => {
      const newGroups = [...prev];
      activeGroups.forEach((group) => {
        if (!newGroups.includes(group)) {
          newGroups.push(group);
        }
      });
      return newGroups;
    });
  }, [pathname]);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <aside className="flex h-full w-[270px] flex-col bg-[#0b1329] text-white overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shrink-0">
      {/* Brand Header */}
      <div className="flex h-24 items-center px-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="h-10 w-10 rounded-xl bg-[#ffe000] flex items-center justify-center text-black font-black italic shadow-md text-xl tracking-tighter">
            L
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-[16px] tracking-tight text-white leading-tight">
              Lubricon <span className="text-[#ffe000] font-black">CMS</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">
              Specialities India
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1.5 custom-scrollbar">
        <nav className="space-y-1">
          {sidebarLinks.map((item, index) => {
            const isActive = pathname === item.href;
            const isOpen = openGroups.includes(item.title);

            if (item.sublinks) {
              return (
                <div key={index} className="pt-3 first:pt-0">
                  <div
                    className="flex items-center justify-between cursor-pointer group mb-1.5 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
                    onClick={() => toggleGroup(item.title)}
                  >
                    <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2.5 group-hover:text-zinc-200 transition-colors">
                      <item.icon className="w-3.5 h-3.5 text-zinc-400" />
                      {item.title}
                    </div>
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 group-hover:text-zinc-300',
                        isOpen ? 'rotate-180' : ''
                      )}
                    />
                  </div>
                  {isOpen && (
                    <div className="space-y-1 pl-3 ml-2 border-l border-zinc-800 py-1">
                      {item.sublinks.map((sublink, subIndex) => {
                        const isSubActive = pathname === sublink.href;
                        return (
                          <Link
                            key={subIndex}
                            href={sublink.href}
                            className={cn(
                              'block px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200',
                              isSubActive
                                ? 'bg-[#ffe000] text-black shadow-md shadow-[#ffe000]/20 font-bold'
                                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                            )}
                          >
                            {sublink.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={index}
                href={item.href!}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-[#ffe000] text-black shadow-md shadow-[#ffe000]/20 font-bold'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn('w-4 h-4', isActive ? 'text-black' : 'text-zinc-400')}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {item.title}
                </div>
                {item.badge && (
                  <div className="flex items-center justify-center px-1.5 py-0.5 rounded-full bg-[#ffe000] text-black text-[10px] font-black">
                    {item.badge}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Session & Sign Out */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center justify-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-[13px] font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer border border-red-500/20"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
