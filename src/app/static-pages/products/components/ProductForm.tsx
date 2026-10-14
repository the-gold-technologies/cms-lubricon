'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  Sparkles,
  Layers,
  FileText,
  FlaskConical,
  ShieldCheck,
  Globe,
  Wrench,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { InputField } from '@/components/InputField';
import { TextAreaField } from '@/components/TextAreaField';
import { SelectField } from '@/components/SelectField';
import { ImageUploadField } from '@/components/ImageUploadField';
import { StringListEditor } from '@/components/StringListEditor';
import { PropertiesTableEditor, PropertyRow } from '@/components/PropertiesTableEditor';
import { SaveButton } from '@/components/SaveButton';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { uploadFiles } from '@/lib/uploadHelpers';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  productId?: string;
  isNew?: boolean;
}

export function ProductForm({ productId, isNew = false }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!isNew);
  const [categories, setCategories] = useState<Category[]>([]);

  // 1. Classification
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [subCategoryTitle, setSubCategoryTitle] = useState('');
  const [badge, setBadge] = useState('');
  const [containerImages, setContainerImages] = useState<(File | string | null)[]>([]);

  // 2. Narrative & Applications
  const [description, setDescription] = useState('');
  const [applicationAreas, setApplicationAreas] = useState('');

  // 3. Performance Benefits
  const [performanceBenefits, setPerformanceBenefits] = useState<string[]>([]);

  // 4. Specifications Card (Viscosity, Grade, Standard, Packaging)
  const [viscosity, setViscosity] = useState('');
  const [grade, setGrade] = useState('');
  const [standard, setStandard] = useState('');
  const [packaging, setPackaging] = useState('');

  // 5. Physico-Chemical Lab Properties
  const [propertiesTable, setPropertiesTable] = useState<PropertyRow[]>([]);



  // 7. Promotion
  const [isFeatured, setIsFeatured] = useState(false);

  // 8. SEO
  const [headingOptions, setHeadingOptions] = useState('h1');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [targetKeywords, setTargetKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [schema, setSchema] = useState('');

  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch Categories
  useEffect(() => {
    let isMounted = true;
    async function fetchCategories() {
      try {
        setCategoriesLoading(true);
        const res = await fetch('/api/products/categories');
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setCategories(json.data);
          if (isNew && json.data.length > 0) {
            setCategorySlug((prev) => prev || json.data[0].slug);
            setCategoryName((prev) => prev || json.data[0].name);
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        if (isMounted) setCategoriesLoading(false);
      }
    }
    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, [isNew]);

  // Fetch Existing Product Data for Edit
  useEffect(() => {
    if (!productId || isNew) return;

    async function fetchProduct() {
      try {
        setFetching(true);
        const res = await fetch(`/api/products?id=${productId}`);
        const json = await res.json();

        if (json.success && json.data) {
          const p = json.data;
          setName(p.name || '');
          setSlug(p.slug || '');
          setCategorySlug(p.categorySlug || '');
          setCategoryName(p.categoryName || '');
          setSubCategoryTitle(p.subCategoryTitle || '');
          setBadge(p.badge || '');
          if (p.containerImage) setContainerImages([p.containerImage]);

          setDescription(p.description || '');
          setApplicationAreas(p.applicationAreas || '');

          if (Array.isArray(p.performanceBenefits)) {
            setPerformanceBenefits(p.performanceBenefits);
          }

          // Specifications
          const specs = p.specifications || {};
          setViscosity(specs.viscosity || '');
          setGrade(specs.grade || '');
          setStandard(specs.standard || '');
          if (Array.isArray(specs.packaging)) {
            setPackaging(specs.packaging.join(', '));
          } else if (typeof specs.packaging === 'string') {
            setPackaging(specs.packaging);
          }

          // Properties Table
          if (Array.isArray(p.propertiesTable)) {
            setPropertiesTable(p.propertiesTable);
          }

          setIsFeatured(Boolean(p.isFeatured));

          setHeadingOptions(p.headingOptions || 'h1');
          setMetaTitle(p.metaTitle || '');
          setMetaDescription(p.metaDescription || '');
          setTargetKeywords(p.targetKeywords || '');
          setCanonicalUrl(p.canonicalUrl || '');
          setSchema(p.schema || '');
        } else {
          toast.error('Product not found');
          router.push('/static-pages/products');
        }
      } catch {
        toast.error('Failed to load product');
      } finally {
        setFetching(false);
      }
    }

    fetchProduct();
  }, [productId, isNew, router]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (isNew) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.error('Product name and URL slug are required');
      return;
    }
    if (!categorySlug) {
      toast.error('Product Category is required');
      return;
    }

    setLoading(true);

    try {
      // 1. Upload Container Image if new File
      let containerImageUrl = containerImages[0] ? String(containerImages[0]) : '';
      if (containerImages[0] instanceof File) {
        const uploaded = await uploadFiles([containerImages[0]]);
        containerImageUrl = uploaded[0] || '';
      }

      // 2. Prepare Specifications Object
      const packagingArray = packaging
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const specifications = {
        viscosity: viscosity.trim(),
        grade: grade.trim(),
        standard: standard.trim(),
        packaging: packagingArray,
      };

      // 3. Payload
      const payload = {
        ...(productId && !isNew ? { id: productId } : {}),
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        categorySlug,
        categoryName,
        subCategoryTitle: subCategoryTitle.trim(),
        badge: badge.trim() || null,
        containerImage: containerImageUrl || null,
        description: description.trim(),
        applicationAreas: applicationAreas.trim(),
        performanceBenefits,
        specifications,
        propertiesTable,
        isFeatured,
        headingOptions: headingOptions.trim() || 'h1',
        metaTitle: metaTitle.trim() || null,
        metaDescription: metaDescription.trim() || null,
        targetKeywords: targetKeywords.trim() || null,
        canonicalUrl: canonicalUrl.trim() || null,
        schema: schema.trim() || null,
      };

      const res = await fetch('/api/products', {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(isNew ? 'Product created successfully!' : 'Product updated successfully!');
        router.push('/static-pages/products');
        router.refresh();
      } else {
        toast.error(json.error || 'Failed to save product');
      }
    } catch {
      toast.error('Network error saving product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <LoadingIndicator
        fullScreen
        message="Loading product details..."
        subMessage="Fetching specifications & technical properties"
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 pb-16">
      {/* Top Breadcrumb & Header Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex flex-col gap-1.5">
          <Link
            href="/static-pages/products"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products Catalog
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {isNew ? 'Add New Product' : `Edit Product: ${name || 'Untitled'}`}
          </h1>
          <p className="text-xs text-gray-400 font-medium">
            Manage product classification, parameters, laboratory properties table, and technical datasheets.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/static-pages/products"
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-full font-bold text-xs hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <SaveButton loading={loading} label="Save Product" className="w-auto px-8" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Core Product Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Card 1: Category Classification & Identity */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm flex flex-col gap-5">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-[#ffe000] fill-black" />
              1. Product Classification & Identity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Product Commercial Name *"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Lubricon XtremeX CK-4 15W40"
                required
              />

              {/* Auto-generated URL slug */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  URL SLUG <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50/80 text-sm font-mono text-gray-700 select-all min-h-[44px]">
                  <span className="truncate">
                    {slug || <span className="text-gray-400 font-sans italic">auto-generated from name</span>}
                  </span>
                  <span className="ml-auto shrink-0 text-[10px] font-bold text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
                    Auto
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <SelectField
                label="Product Category *"
                value={categorySlug}
                disabled={categoriesLoading || categories.length === 0}
                onChange={(e) => {
                  const val = e.target.value;
                  setCategorySlug(val);
                  const match = categories.find((c) => c.slug === val);
                  if (match) setCategoryName(match.name);
                }}
                options={
                  categories.length > 0
                    ? categories.map((c) => ({
                        value: c.slug,
                        label: c.name,
                      }))
                    : [
                        {
                          value: categorySlug || '',
                          label: categoriesLoading ? 'Loading categories...' : 'No categories available',
                        },
                      ]
                }
              />

              <InputField
                label="Subcategory / Series"
                value={subCategoryTitle}
                onChange={(e) => setSubCategoryTitle(e.target.value)}
                placeholder="e.g. CK4 Engine Oils"
              />

              <InputField
                label="Featured Badge Tag"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Latest Grade, Euro 6 Ready"
              />
            </div>
          </div>

          {/* Card 2: Narrative & Application Scope */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm flex flex-col gap-5">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#ffe000] fill-black" />
              2. Description & Application Scope
            </h3>

            <TextAreaField
              label="Formulation Description *"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Base oil formulation, additive chemistry, and operational benefits..."
              required
            />

            <TextAreaField
              label="Recommended Application Areas (Comma-Separated or Detailed)"
              rows={3}
              value={applicationAreas}
              onChange={(e) => setApplicationAreas(e.target.value)}
              placeholder="Modern turbocharged diesel engines, Heavy haulage trucks, Hydraulic presses, CNC machining centers..."
            />
          </div>

          {/* Card 3: Key Performance Features & Benefits */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm flex flex-col gap-5">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#ffe000] fill-black" />
              3. Key Performance Features & Benefits
            </h3>

            <StringListEditor
              label="Features & Benefits List"
              items={performanceBenefits}
              onChange={setPerformanceBenefits}
              placeholder="e.g. Advanced soot dispersancy, DPF & SCR catalytic protection..."
              accentColor="yellow"
            />
          </div>

          {/* Card 4: Technical Parameters Card (Viscosity, Grade, Standard, Packaging) */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm flex flex-col gap-5">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#ffe000] fill-black" />
              4. Technical Parameters Card (Product Specifications)
            </h3>
            <p className="text-xs text-gray-500">
              Displayed in the prominent Technical Parameters card on the product detail page.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Viscosity"
                value={viscosity}
                onChange={(e) => setViscosity(e.target.value)}
                placeholder="e.g. SAE 15W40, ISO VG 460"
              />
              <InputField
                label="API / ISO Grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. API CK-4 / ACEA E9, Dexron IIIH"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Industry Standard"
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                placeholder="e.g. Euro 6, BS-VI Ready, DIN 51524 Part 2"
              />
              <InputField
                label="Available Pack Sizes (comma-separated)"
                value={packaging}
                onChange={(e) => setPackaging(e.target.value)}
                placeholder="e.g. 1L, 4L, 10L, 20L, 210L Barrel"
              />
            </div>
          </div>

          {/* Card 5: Physico-Chemical Lab Properties Table */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm flex flex-col gap-5">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-[#ffe000] fill-black" />
              5. Physico-Chemical Properties Table
            </h3>
            <p className="text-xs text-gray-500">
              Laboratory test results table (Parameter, Test Method, Typical Value) rendered on the product detail page.
            </p>

            <PropertiesTableEditor properties={propertiesTable} onChange={setPropertiesTable} />
          </div>
        </div>

        {/* Right Column (1 Col): Container Graphics, Datasheets & SEO */}
        <div className="flex flex-col gap-6">
          {/* Packaging Image */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-zinc-700" />
              Packaging Packshot Graphic
            </h3>

            <ImageUploadField
              label="Can / Pail / Drum Graphic"
              images={containerImages}
              onImagesChange={setContainerImages}
              maxImages={1}
              tooltip="Upload container pack visual (PNG or JPG)."
            />
          </div>



          {/* Promotion */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ffe000]" />
              Promotion & Visibility
            </h3>

            <label className="flex items-start gap-3 p-3.5 bg-yellow-50/60 border border-yellow-200/60 rounded-2xl cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="mt-0.5 rounded text-black focus:ring-black cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-800">Feature on Homepage</span>
                <span className="text-[11px] text-gray-500 leading-snug">
                  Displays this lubricant grade in the homepage product showcase.
                </span>
              </div>
            </label>
          </div>

          {/* SEO Metadata */}
          <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm flex flex-col gap-5">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-zinc-700" />
              Product SEO Metadata
            </h3>

            <SelectField
              label="Semantic Heading Tag"
              value={headingOptions}
              onChange={(e) => setHeadingOptions(e.target.value)}
              options={[
                { value: 'h1', label: 'H1 - Primary Main Title' },
                { value: 'h2', label: 'H2 - Section Title' },
                { value: 'h3', label: 'H3 - Sub-heading' },
              ]}
            />

            <InputField
              label="Meta Title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="e.g. Lubricon XtremeX CK-4 | Lubricon India"
            />

            <TextAreaField
              label="Meta Description"
              rows={2}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Search engine snippet description..."
            />

            <InputField
              label="Target Keywords"
              value={targetKeywords}
              onChange={(e) => setTargetKeywords(e.target.value)}
              placeholder="Comma-separated keywords..."
            />

            <InputField
              label="Canonical URL"
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              placeholder="https://lubricon.in/products/..."
            />

            <TextAreaField
              label="Custom Schema Markup (JSON-LD)"
              rows={3}
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              placeholder='{"@context": "https://schema.org", "@type": "Product"}'
            />
          </div>

          <div className="pt-2">
            <SaveButton loading={loading} label="Save Product" className="w-full" />
          </div>
        </div>
      </div>
    </form>
  );
}
