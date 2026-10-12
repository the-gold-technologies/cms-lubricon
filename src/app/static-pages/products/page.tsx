'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  FileText,
  FolderTree,
  X,
  Award,
  Sparkles,
  Droplets,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/PageHeader';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { ImageUploadField } from '@/components/ImageUploadField';
import { SaveButton } from '@/components/SaveButton';
import { uploadFiles } from '@/lib/uploadHelpers';

interface Product {
  id: string;
  name: string;
  slug: string;
  subtitle?: string;
  categorySlug: string;
  categoryName: string;
  subCategoryTitle?: string;
  containerImage?: string;
  description?: string;
  applicationAreas?: string;
  specsText?: string;
  propertiesTable?: { property: string; value: string }[];
  pdfUrl?: string;
  msdsUrl?: string;
  isFeatured?: boolean;
}

interface BrandCategory {
  id: string;
  name: string;
  slug: string;
  shortDesc?: string;
  fullDesc?: string;
  coverImage?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  featuredBadgeText?: string;
  order?: number;
  isFeatured?: boolean;
  _count?: { products: number };
}

export default function ProductsCatalogCMSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<BrandCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Two-Tier Filter State:
  // 1. Selected Brand
  const [selectedBrandSlug, setSelectedBrandSlug] = useState<string>('all');
  // 2. Selected Category within that Brand
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState<string>('all');

  const [searchQuery, setSearchQuery] = useState('');

  // Brand Edit Modal state
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [brandModalLoading, setBrandModalLoading] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandCategory | null>(null);

  // Brand Form Fields
  const [brandName, setBrandName] = useState('');
  const [brandSlug, setBrandSlug] = useState('');
  const [brandTagline, setBrandTagline] = useState('');
  const [brandAbout, setBrandAbout] = useState('');
  const [brandImages, setBrandImages] = useState<(File | string | null)[]>([]);
  const [brandPrimaryCta, setBrandPrimaryCta] = useState('');
  const [brandSecondaryCta, setBrandSecondaryCta] = useState('');
  const [brandFeaturedBadge, setBrandFeaturedBadge] = useState('');
  const [brandOrder, setBrandOrder] = useState<number>(0);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) {
        setProducts(json.data.products || []);
        setBrands(json.data.categories || []);
      }
    } catch (err) {
      console.error('Error loading products:', err);
      toast.error('Failed to load catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const openNewBrandModal = () => {
    setEditingBrand(null);
    setBrandName('');
    setBrandSlug('');
    setBrandTagline('');
    setBrandAbout('');
    setBrandImages([]);
    setBrandPrimaryCta('');
    setBrandSecondaryCta('');
    setBrandFeaturedBadge('');
    setBrandOrder(brands.length);
    setIsBrandModalOpen(true);
  };

  const openEditBrandModal = (brand: BrandCategory) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setBrandSlug(brand.slug);
    setBrandTagline(brand.shortDesc || '');
    setBrandAbout(brand.fullDesc || '');
    setBrandImages(brand.coverImage ? [brand.coverImage] : []);
    setBrandPrimaryCta(brand.primaryCtaText || 'Request a Quote');
    setBrandSecondaryCta(brand.secondaryCtaText || 'Browse range');
    setBrandFeaturedBadge(brand.featuredBadgeText || 'Featured product');
    setBrandOrder(brand.order ?? 0);
    setIsBrandModalOpen(true);
  };

  const handleBrandNameChange = (val: string) => {
    setBrandName(val);
    setBrandSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    );
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName || !brandSlug) {
      toast.error('Brand name and URL slug are required');
      return;
    }

    setBrandModalLoading(true);

    try {
      let finalCoverUrl = '';
      const validImages = brandImages.filter((img): img is File | string => !!img);
      if (validImages.length > 0) {
        const [uploaded] = await uploadFiles(validImages);
        finalCoverUrl = uploaded || '';
      }

      const payload = {
        name: brandName.trim(),
        slug: brandSlug.trim().toLowerCase(),
        shortDesc: brandTagline.trim(),
        fullDesc: brandAbout.trim(),
        coverImage: finalCoverUrl,
        primaryCtaText: brandPrimaryCta.trim() || 'Request a Quote',
        secondaryCtaText: brandSecondaryCta.trim() || 'Browse range',
        featuredBadgeText: brandFeaturedBadge.trim() || 'Featured product',
        order: Number(brandOrder) || 0,
        isFeatured: true,
      };

      const url = '/api/products/categories';
      const method = editingBrand ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBrand ? { ...payload, id: editingBrand.id } : payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(editingBrand ? 'Brand updated successfully' : 'Brand created successfully');
        setIsBrandModalOpen(false);
        fetchCatalog();
      } else {
        toast.error(json.error || 'Failed to save brand');
      }
    } catch {
      toast.error('Network error saving brand');
    } finally {
      setBrandModalLoading(false);
    }
  };

  const handleDeleteBrand = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete brand "${name}" and its associated products?`))
      return;

    try {
      const res = await fetch(`/api/products/categories?id=${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Brand deleted successfully');
        if (selectedBrandSlug === id) setSelectedBrandSlug('all');
        fetchCatalog();
      } else {
        toast.error(json.error || 'Failed to delete brand');
      }
    } catch {
      toast.error('Network error deleting brand');
    }
  };

  const handleDeleteProduct = async (id: string, prodName: string) => {
    if (!confirm(`Are you sure you want to delete "${prodName}"?`)) return;

    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Product deleted successfully');
        fetchCatalog();
      } else {
        toast.error(json.error || 'Failed to delete product');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete product');
    }
  };

  // Categories under the currently selected brand (e.g. for HP Lubricants: Engine Oils, Gear Oils, etc.)
  const availableCategoriesForBrand = useMemo(() => {
    const brandProducts =
      selectedBrandSlug === 'all'
        ? products
        : products.filter((p) => p.categorySlug === selectedBrandSlug);

    const categoryCounts: Record<string, number> = {};
    brandProducts.forEach((p) => {
      const cat = p.subCategoryTitle?.trim() || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    return Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
    }));
  }, [products, selectedBrandSlug]);

  // When changing brand, reset category filter to "all"
  const handleSelectBrand = (slug: string) => {
    setSelectedBrandSlug(slug);
    setSelectedCategoryTitle('all');
  };

  // Filtered products based on Tier 1 (Brand), Tier 2 (Category), and Search Query
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesBrand = selectedBrandSlug === 'all' || p.categorySlug === selectedBrandSlug;
      const matchesCategory =
        selectedCategoryTitle === 'all' ||
        (p.subCategoryTitle || '').toLowerCase().trim() ===
          selectedCategoryTitle.toLowerCase().trim();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        (p.subCategoryTitle && p.subCategoryTitle.toLowerCase().includes(q)) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
        (p.specsText && p.specsText.toLowerCase().includes(q)) ||
        (p.applicationAreas && p.applicationAreas.toLowerCase().includes(q));
      return matchesBrand && matchesCategory && matchesSearch;
    });
  }, [products, selectedBrandSlug, selectedCategoryTitle, searchQuery]);

  const activeBrandName =
    selectedBrandSlug === 'all'
      ? 'All Brands'
      : brands.find((b) => b.slug === selectedBrandSlug)?.name || selectedBrandSlug;

  const hasActiveFilters =
    selectedBrandSlug !== 'all' || selectedCategoryTitle !== 'all' || searchQuery.trim() !== '';

  const handleClearFilters = () => {
    setSelectedBrandSlug('all');
    setSelectedCategoryTitle('all');
    setSearchQuery('');
  };

  return (
    <section className="flex flex-col gap-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Multi-Brand Products Catalog"
          description="Manage all 10 authorized brand partners (HP Lubricants, Valvoline, GS Caltex, etc.), brand categories (Engine Oils, Gear Oils, etc.), and their lubricant products."
        />
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={openNewBrandModal}
            className="inline-flex items-center gap-1.5 px-5 py-3 border border-gray-200 hover:border-[#C86218] text-gray-700 hover:text-[#C86218] text-xs font-bold rounded-full bg-white transition-all cursor-pointer shadow-2xs"
          >
            <FolderTree className="w-4 h-4 text-[#C86218]" />
            Add Brand Partner
          </button>
          <Link
            href="/static-pages/products/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#C86218] hover:bg-[#0C356A] text-white text-xs font-semibold rounded-full shadow-sm hover:shadow-[0_0_20px_rgba(200,98,24,0.35)] transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Two-Tier Filter Card: Brand Level + Category Level */}
      {/* ── Filter Bar ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Brand dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">
              Brand
            </label>
            <div className="relative">
              <select
                value={selectedBrandSlug}
                onChange={(e) => handleSelectBrand(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-gray-200 bg-gray-50 text-[12px] font-semibold text-gray-700 focus:outline-none focus:border-[#C86218] focus:ring-2 focus:ring-[#C86218]/10 cursor-pointer transition-all hover:border-gray-300 min-w-[180px]"
              >
                <option value="all">All Brands ({products.length})</option>
                {brands.map((brand) => {
                  const count = products.filter((p) => p.categorySlug === brand.slug).length;
                  return (
                    <option key={brand.slug} value={brand.slug}>
                      {brand.name} ({count})
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Category dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">
              Category
            </label>
            <div className="relative">
              <select
                value={selectedCategoryTitle}
                onChange={(e) => setSelectedCategoryTitle(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-gray-200 bg-gray-50 text-[12px] font-semibold text-gray-700 focus:outline-none focus:border-[#C86218] focus:ring-2 focus:ring-[#C86218]/10 cursor-pointer transition-all hover:border-gray-300 min-w-[180px]"
              >
                <option value="all">All Categories ({availableCategoriesForBrand.length})</option>
                {availableCategoriesForBrand.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name} ({cat.count})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-9 bg-gray-200 self-end hidden sm:block" />

          {/* Search */}
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">
              Search
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Grade, viscosity, specs..."
                className="w-full pl-8 pr-8 py-2 rounded-xl border border-gray-200 bg-gray-50 text-[12px] font-medium text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#C86218] focus:bg-white focus:ring-2 focus:ring-[#C86218]/10 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Result count & Clear Filters */}
          <div className="flex items-center gap-3 self-end pb-0.5 ml-auto flex-wrap">
            <span className="text-[11px] font-semibold text-gray-400 whitespace-nowrap">
              <span className="font-black text-gray-700">{filteredProducts.length}</span> /{' '}
              {products.length} products
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/80 rounded-xl px-2.5 py-1.5 transition-all cursor-pointer shadow-2xs"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4 h-80"
            >
              <div className="w-full h-40 bg-gray-100 rounded-2xl" />
              <div className="w-3/4 h-4 bg-gray-100 rounded-md" />
              <div className="w-1/2 h-3 bg-gray-100 rounded-md" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-[#C86218] flex items-center justify-center font-bold">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">No products found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm">
              {searchQuery
                ? `No products matched "${searchQuery}". Try a different keyword or reset filters.`
                : 'No products exist for this brand & category combination yet.'}
            </p>
          </div>
          <Link
            href="/static-pages/products/create"
            className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 bg-[#C86218] text-white text-xs font-bold rounded-full shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const packagingRow = p.propertiesTable?.find((r) =>
              r.property.toLowerCase().includes('packaging')
            );

            return (
              <div
                key={p.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide truncate bg-orange-50 text-[#C86218] border border-orange-100">
                      {p.categoryName || p.categorySlug}
                    </span>
                    {p.isFeatured && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full shrink-0">
                        <Sparkles className="w-3 h-3" /> Featured
                      </span>
                    )}
                  </div>

                  {p.containerImage ? (
                    <Link
                      href={`/static-pages/products/edit/${p.id}`}
                      className="w-full h-40 bg-gray-50 rounded-2xl mb-4 overflow-hidden border border-gray-100 flex items-center justify-center p-3 block group-hover:border-[#C86218]/30 transition-colors"
                    >
                      <img
                        src={p.containerImage}
                        alt={p.name}
                        className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                  ) : (
                    <div className="w-full h-40 bg-gray-50 rounded-2xl mb-4 border border-dashed border-gray-200 flex items-center justify-center text-gray-300">
                      <Package className="w-10 h-10 opacity-40" />
                    </div>
                  )}

                  <Link
                    href={`/static-pages/products/edit/${p.id}`}
                    className="font-bold text-base text-gray-900 group-hover:text-[#C86218] transition-colors line-clamp-1 block"
                  >
                    {p.name}
                  </Link>

                  {p.subCategoryTitle && (
                    <div className="flex items-center gap-1 mt-1">
                      <Droplets className="w-3 h-3 text-[#0C356A]" />
                      <p className="text-xs font-bold text-[#0C356A] line-clamp-1">
                        {p.subCategoryTitle}
                      </p>
                    </div>
                  )}

                  {p.specsText && (
                    <p className="text-[11px] font-medium text-gray-500 mt-1.5 line-clamp-1">
                      {p.specsText}
                    </p>
                  )}

                  {packagingRow && packagingRow.value && (
                    <div className="mt-2.5">
                      <span className="inline-block px-2 py-0.5 rounded bg-gray-50 text-[10px] font-semibold text-gray-600 border border-gray-100 truncate max-w-full">
                        Pack: {packagingRow.value}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    {p.pdfUrl && p.pdfUrl !== '#' && (
                      <a
                        href={p.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:text-[#C86218] transition-colors"
                        title="View TDS Document"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/static-pages/products/edit/${p.id}`}
                      className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      className="p-2 rounded-xl text-gray-400 hover:bg-orange-50 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Brand Partner Modal (Clear, Unambiguous Naming!) */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-orange-50 text-[#C86218] flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {editingBrand ? `Edit Brand: ${editingBrand.name}` : 'Add New Brand Partner'}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">
                    Configure brand identity, taglines, hero banner graphics, and catalog ordering.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBrandModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveBrand}
              className="flex-1 overflow-y-auto p-8 flex flex-col gap-5 custom-scrollbar"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Brand Name *"
                  value={brandName}
                  onChange={(e) => handleBrandNameChange(e.target.value)}
                  placeholder="Enter brand name"
                  required
                />
                <InputField
                  label="Brand URL Slug *"
                  value={brandSlug}
                  readOnly
                  placeholder="Auto-generated from brand name"
                  className="bg-gray-50 text-gray-500 cursor-not-allowed select-none"
                />
              </div>

              <InputField
                label="Brand Tagline / Subtitle"
                value={brandTagline}
                onChange={(e) => setBrandTagline(e.target.value)}
                placeholder="e.g. India Premier Lubricant Solutions & Direct Refinery Supply"
              />

              <TextAreaField
                label="About Brand / Full Narrative Description"
                rows={4}
                value={brandAbout}
                onChange={(e) => setBrandAbout(e.target.value)}
                placeholder="Detailed explanation displayed in the website hero banner and about section..."
              />

              <ImageUploadField
                label="Brand Hero Banner / Cover Graphic"
                images={brandImages}
                onImagesChange={setBrandImages}
                maxImages={1}
                tooltip="Upload brand hero banner graphic or warehouse photo."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Primary CTA Button Text"
                  value={brandPrimaryCta}
                  onChange={(e) => setBrandPrimaryCta(e.target.value)}
                  placeholder="e.g. Request a Quote"
                />
                <InputField
                  label="Secondary CTA Button Text"
                  value={brandSecondaryCta}
                  onChange={(e) => setBrandSecondaryCta(e.target.value)}
                  placeholder="e.g. Browse range"
                />
              </div>

              <InputField
                label="Featured Product Badge Text"
                value={brandFeaturedBadge}
                onChange={(e) => setBrandFeaturedBadge(e.target.value)}
                placeholder="e.g. Featured product"
              />

              <div className="grid grid-cols-1 gap-4 items-center p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                <InputField
                  label="Display Order Index"
                  type="number"
                  value={String(brandOrder)}
                  onChange={(e) => setBrandOrder(parseInt(e.target.value, 10) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                {editingBrand && (
                  <button
                    type="button"
                    onClick={() => handleDeleteBrand(editingBrand.id, editingBrand.name)}
                    className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                  >
                    Delete Brand
                  </button>
                )}
                <div className="flex items-center gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsBrandModalOpen(false)}
                    className="px-6 py-3 border border-gray-200 text-gray-700 rounded-full font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <SaveButton
                    loading={brandModalLoading}
                    label="Save Changes"
                    className="w-auto px-8"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
