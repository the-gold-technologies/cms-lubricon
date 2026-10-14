'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  FileText,
  Sparkles,
  ChevronDown,
  Droplets,
  RotateCcw,
  X,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/PageHeader';
import { ProductsHeroSection } from './components/ProductsHeroSection';
import { InputField } from '@/components/InputField';
import { SaveButton } from '@/components/SaveButton';

interface Product {
  id: string;
  name: string;
  slug: string;
  badge?: string;
  categorySlug: string;
  categoryName: string;
  subCategoryTitle?: string;
  containerImage?: string;
  description?: string;
  applicationAreas?: string;
  specifications?: {
    viscosity?: string;
    grade?: string;
    standard?: string;
    packaging?: string[] | string;
  };
  propertiesTable?: any[];
  pdfUrl?: string;
  msdsUrl?: string;
  isFeatured?: boolean;
}

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  order?: number;
  isFeatured?: boolean;
  _count?: { products: number };
}

export default function ProductsCatalogCMSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Category Filter & Search
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Hero Section State
  const [heroData, setHeroData] = useState<any>(null);
  const [isHeroOpen, setIsHeroOpen] = useState(false);

  // Category Modal State (Add / Edit Category)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalLoading, setCategoryModalLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);

  // Category Form Fields
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catOrder, setCatOrder] = useState<number>(0);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) {
        setProducts(json.data.products || []);
        setCategories(json.data.categories || []);
        setHeroData(json.data.hero || null);
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

  const openNewCategoryModal = () => {
    setEditingCategory(null);
    setCatName('');
    setCatSlug('');
    setCatOrder(categories.length);
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: ProductCategory) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatOrder(cat.order ?? 0);
    setIsCategoryModalOpen(true);
  };

  const handleCatNameChange = (val: string) => {
    setCatName(val);
    if (!editingCategory) {
      setCatSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catSlug) {
      toast.error('Category name and URL slug are required');
      return;
    }

    setCategoryModalLoading(true);
    try {
      const payload = {
        name: catName.trim(),
        slug: catSlug.trim().toLowerCase(),
        order: catOrder,
      };

      const method = editingCategory ? 'PUT' : 'POST';
      const res = await fetch('/api/products/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory ? { ...payload, id: editingCategory.id } : payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(editingCategory ? 'Category updated successfully' : 'Category created successfully');
        setIsCategoryModalOpen(false);
        fetchCatalog();
      } else {
        toast.error(json.error || 'Failed to save category');
      }
    } catch {
      toast.error('Network error saving category');
    } finally {
      setCategoryModalLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products/categories?id=${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Category deleted successfully');
        if (selectedCategorySlug === id) setSelectedCategorySlug('all');
        fetchCatalog();
      } else {
        toast.error(json.error || 'Failed to delete category');
      }
    } catch {
      toast.error('Network error deleting category');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete product "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Product deleted successfully');
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        toast.error(json.error || 'Failed to delete product');
      }
    } catch {
      toast.error('Network error deleting product');
    }
  };

  // Filtered products based on Category and Search Query
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategorySlug === 'all' ||
        p.categorySlug === selectedCategorySlug ||
        p.categoryName?.toLowerCase() === selectedCategorySlug.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.subCategoryTitle && p.subCategoryTitle.toLowerCase().includes(q)) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
        (p.specifications?.viscosity && p.specifications.viscosity.toLowerCase().includes(q)) ||
        (p.specifications?.grade && p.specifications.grade.toLowerCase().includes(q)) ||
        (p.badge && p.badge.toLowerCase().includes(q)) ||
        (p.applicationAreas && p.applicationAreas.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategorySlug, searchQuery]);

  const hasActiveFilters = selectedCategorySlug !== 'all' || searchQuery.trim() !== '';

  const handleClearFilters = () => {
    setSelectedCategorySlug('all');
    setSearchQuery('');
  };

  return (
    <section className="p-4 sm:p-8 flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Products Catalog"
          description="Manage, filter, and edit all Lubricon formulations and product categories."
        />
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={openNewCategoryModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:text-black hover:border-black text-xs font-bold rounded-full shadow-2xs transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 text-[#C86218]" />
            Add Category
          </button>
          <Link
            href="/static-pages/products/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C86218] hover:bg-[#b05514] text-white text-xs font-bold rounded-full shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* ── 1. Products Page Hero Banner Editor ── */}
      <ProductsHeroSection
        initialData={heroData}
        isOpen={isHeroOpen}
        onToggle={() => setIsHeroOpen(!isHeroOpen)}
        onSaved={(updated) => setHeroData(updated)}
      />

      {/* ── 2. Filter Bar (Category Selector + Search) ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-wrap">
          {/* Category Dropdown */}
          <div className="flex flex-col gap-1 min-w-[200px]">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1">
              Product Category
            </label>
            <div className="relative">
              <select
                value={selectedCategorySlug}
                onChange={(e) => setSelectedCategorySlug(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl border border-gray-200 bg-gray-50 text-[12px] font-semibold text-gray-800 focus:outline-none focus:border-[#C86218] focus:bg-white focus:ring-2 focus:ring-[#C86218]/10 transition-all cursor-pointer"
              >
                <option value="all">All Categories ({products.length})</option>
                {categories.map((cat) => {
                  const count = products.filter(
                    (p) => p.categorySlug === cat.slug || p.categoryName?.toLowerCase() === cat.name.toLowerCase()
                  ).length;
                  return (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name} ({count})
                    </option>
                  );
                })}
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
                placeholder="Grade, viscosity, product name, application..."
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
              <span className="font-black text-gray-700">{filteredProducts.length}</span> / {products.length} products
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

      {/* ── 3. Products Grid ── */}
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
                : 'No products exist for this category yet.'}
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
            const packagingRow = p.propertiesTable?.find((r: any) => {
              if (!r) return false;
              if (typeof r.property === 'string') {
                return r.property.toLowerCase().includes('packaging');
              }
              if (Array.isArray(r) && typeof r[0] === 'string') {
                return r[0].toLowerCase().includes('packaging');
              }
              return false;
            });

            const packagingValue = packagingRow
              ? (typeof (packagingRow as any).value === 'string'
                  ? (packagingRow as any).value
                  : Array.isArray(packagingRow)
                  ? packagingRow[packagingRow.length - 1]
                  : null)
              : null;

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

                  {p.specifications?.viscosity ? (
                    <p className="text-[11px] font-medium text-gray-500 mt-1.5 line-clamp-1">
                      {p.specifications.viscosity}
                      {p.specifications.grade ? ` • ${p.specifications.grade}` : ''}
                    </p>
                  ) : null}

                  {(() => {
                    let packText = '';
                    if (p.specifications?.packaging) {
                      if (Array.isArray(p.specifications.packaging) && p.specifications.packaging.length > 0) {
                        packText = p.specifications.packaging.join(", ");
                      } else if (typeof p.specifications.packaging === 'string') {
                        packText = p.specifications.packaging;
                      }
                    }
                    if (!packText && packagingValue) {
                      packText = String(packagingValue);
                    }
                    return packText ? (
                      <div className="mt-2.5">
                        <span className="inline-block px-2 py-0.5 rounded bg-gray-50 text-[10px] font-semibold text-gray-600 border border-gray-100 truncate max-w-full">
                          Pack: {packText}
                        </span>
                      </div>
                    ) : null;
                  })()}
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

      {/* Category Modal (Add / Edit) */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-orange-50 text-[#C86218] flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">
                    Configure category name, URL slug, and ordering.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveCategory}
              className="p-7 flex flex-col gap-4"
            >
              <InputField
                label="Category Name *"
                value={catName}
                onChange={(e) => handleCatNameChange(e.target.value)}
                placeholder="e.g. Engine Oil, Gear Oil, ATF..."
                required
              />

              <InputField
                label="Category URL Slug *"
                value={catSlug}
                onChange={(e) => setCatSlug(e.target.value)}
                placeholder="e.g. engine-oil"
                required
              />

              <InputField
                label="Display Order Index"
                type="number"
                value={String(catOrder)}
                onChange={(e) => setCatOrder(parseInt(e.target.value, 10) || 0)}
                placeholder="0"
              />

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(editingCategory.id, editingCategory.name)}
                    className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                  >
                    Delete Category
                  </button>
                )}
                <div className="flex items-center gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-full font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <SaveButton
                    loading={categoryModalLoading}
                    label="Save Category"
                    className="w-auto px-6"
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
