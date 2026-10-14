'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Layers,
  X,
  Loader2,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<NavLinkItem | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    url: '',
    type: 'Dropdown',
    parent: '-',
    order: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingLink, setDeletingLink] = useState<NavLinkItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadNavLinks = async () => {
    try {
      const res = await fetch('/api/nav-links');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setLinks(json.data);
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

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    rootLinks.forEach((l) => {
      const hasKids = links.some((c) => c.parent === l.id);
      if (hasKids) next[l.id] = true;
    });
    setExpandedParents(next);
  };

  const collapseAll = () => {
    setExpandedParents({});
  };

  const rootLinks = links
    .filter((l) => l.parent === '-' || !l.parent)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Open modal for creating a new link
  const handleOpenCreateModal = (preselectedParentId?: string) => {
    setEditingLink(null);
    const parentVal = preselectedParentId || '-';
    // Calculate default next order
    const siblings = links.filter((l) => (l.parent || '-') === parentVal);
    const nextOrder = siblings.length > 0 ? Math.max(...siblings.map((s) => s.order ?? 0)) + 1 : 0;

    setFormData({
      label: '',
      url: '',
      type: parentVal === '-' ? 'Main Link' : 'Dropdown',
      parent: parentVal,
      order: nextOrder,
    });
    setIsModalOpen(true);
  };

  // Open modal for editing an existing link
  const handleOpenEditModal = (link: NavLinkItem) => {
    setEditingLink(link);
    setFormData({
      label: link.label,
      url: link.url,
      type: link.type || 'Main Link',
      parent: link.parent || '-',
      order: link.order ?? 0,
    });
    setIsModalOpen(true);
  };

  // Submit modal form (create or edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label.trim()) {
      toast.error('Please enter a label for this navigation link');
      return;
    }
    if (!formData.url.trim()) {
      toast.error('Please enter a URL for this navigation link');
      return;
    }

    setSubmitting(true);
    try {
      if (editingLink) {
        // Update existing link
        const res = await fetch('/api/nav-links', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingLink.id,
            ...formData,
          }),
        });
        const json = await res.json();
        if (json.success) {
          toast.success('Navigation link updated successfully');
          setIsModalOpen(false);
          await loadNavLinks();
        } else {
          toast.error(json.error || 'Failed to update link');
        }
      } else {
        // Create new link
        const res = await fetch('/api/nav-links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          toast.success('Navigation link created successfully');
          setIsModalOpen(false);
          // If created under a parent, ensure that parent is expanded
          if (formData.parent && formData.parent !== '-') {
            setExpandedParents((prev) => ({ ...prev, [formData.parent]: true }));
          }
          await loadNavLinks();
        } else {
          toast.error(json.error || 'Failed to create link');
        }
      }
    } catch (err) {
      console.error('Error saving nav link:', err);
      toast.error('An error occurred while saving the link');
    } finally {
      setSubmitting(false);
    }
  };

  // Open delete modal
  const handleOpenDeleteModal = (link: NavLinkItem) => {
    setDeletingLink(link);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete link
  const handleConfirmDelete = async () => {
    if (!deletingLink) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/nav-links?id=${deletingLink.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Removed "${deletingLink.label}"`);
        setIsDeleteModalOpen(false);
        setDeletingLink(null);
        await loadNavLinks();
      } else {
        toast.error(json.error || 'Failed to delete link');
      }
    } catch (err) {
      console.error('Error deleting link:', err);
      toast.error('Failed to delete navigation link');
    } finally {
      setDeleting(false);
    }
  };

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

  const isAllExpanded =
    rootLinks.length > 0 &&
    rootLinks
      .filter((l) => links.some((c) => c.parent === l.id))
      .every((l) => expandedParents[l.id]);

  return (
    <section className="flex flex-col gap-6 pb-16 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1528] tracking-tight">
            Navigation Links
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 font-normal">
            Manage the navigation structure, mega-menu links, and dropdown hierarchies displayed on
            the Lubricon website.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {rootLinks.some((l) => links.some((c) => c.parent === l.id)) && (
            <button
              type="button"
              onClick={isAllExpanded ? collapseAll : expandAll}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              {isAllExpanded ? 'Collapse All' : 'Expand All'}
            </button>
          )}

          <button
            type="button"
            onClick={() => handleOpenCreateModal()}
            className="px-4 py-2 text-xs font-bold text-black bg-[#FFE000] hover:bg-[#ebd000] rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add Menu Link
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-2 sm:p-6 lg:p-8">
        {loading ? (
          <div className="py-16 text-center text-xs font-medium text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#002B5C]" />
            <span>Loading navigation structure...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="py-3.5 px-6 text-[11px] font-bold uppercase tracking-wider w-20 whitespace-nowrap">
                    ORDER
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold uppercase tracking-wider min-w-[280px]">
                    LABEL / TITLE
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold uppercase tracking-wider text-center w-36 whitespace-nowrap">
                    TYPE
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold uppercase tracking-wider min-w-[220px]">
                    URL
                  </th>
                  <th className="py-3.5 px-6 text-[11px] font-bold uppercase tracking-wider text-right w-36 whitespace-nowrap">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rootLinks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-slate-400">
                      No navigation links found. Click &quot;Add Menu Link&quot; to create one.
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
                            className="py-4 px-6 font-mono text-xs text-slate-500 font-normal max-w-[280px] truncate"
                            title={root.url}
                          >
                            <a
                              href={root.url}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-[#002B5C] hover:underline inline-flex items-center gap-1"
                            >
                              <span>{root.url}</span>
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity" />
                            </a>
                          </td>

                          {/* Actions Column */}
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick Add Child Button */}
                              {(root.type.toLowerCase().includes('dropdown') ||
                                hasChildren ||
                                root.url === '/products' ||
                                root.url === '/industries') && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenCreateModal(root.id)}
                                  className="p-1.5 hover:bg-amber-50 text-amber-700 rounded-lg transition-colors cursor-pointer"
                                  title={`Add sub-link inside ${root.label}`}
                                >
                                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              )}

                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(root)}
                                className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors cursor-pointer"
                                title="Edit Link"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenDeleteModal(root)}
                                className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors cursor-pointer"
                                title="Delete Link"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
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
                                className="py-3.5 px-6 font-mono text-xs text-slate-400 max-w-[280px] truncate"
                                title={child.url}
                              >
                                <a
                                  href={child.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="hover:text-[#002B5C] hover:underline inline-flex items-center gap-1"
                                >
                                  <span>{child.url}</span>
                                  <ExternalLink className="w-3 h-3 opacity-0 group-hover/child:opacity-70 transition-opacity" />
                                </a>
                              </td>

                              {/* Child Actions */}
                              <td className="py-3.5 px-6 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditModal(child)}
                                    className="p-1.5 hover:bg-slate-200/70 text-slate-600 rounded-lg transition-colors cursor-pointer"
                                    title="Edit Sub-Link"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenDeleteModal(child)}
                                    className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Sub-Link"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
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

      {/* Add / Edit Menu Link Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingLink ? 'Edit Navigation Link' : 'Add New Navigation Link'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure label, path URL, type, and hierarchical parent placement.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              {/* Label */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Link Label / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engine Oils, Products, Certificates"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002B5C]/20 focus:border-[#002B5C] transition-all font-medium"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Destination URL / Path <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. /products, /products?cat=engine-oil, /about"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002B5C]/20 focus:border-[#002B5C] transition-all"
                />
              </div>

              {/* Parent Navigation Item */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Parent Menu Item
                </label>
                <select
                  value={formData.parent}
                  onChange={(e) => {
                    const p = e.target.value;
                    setFormData({
                      ...formData,
                      parent: p,
                      type: p === '-' ? 'Main Link' : 'Dropdown',
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002B5C]/20 focus:border-[#002B5C] transition-all cursor-pointer font-medium"
                >
                  <option value="-">None (Top-Level Root Menu Item)</option>
                  {rootLinks.map((r) => (
                    <option key={r.id} value={r.id}>
                      Inside &quot;{r.label}&quot; (Dropdown Item)
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Choose &quot;None&quot; for top-level navbar links, or select a parent to nest this
                  link inside a dropdown.
                </p>
              </div>

              {/* Link Type & Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Link Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002B5C]/20 focus:border-[#002B5C] transition-all cursor-pointer font-medium"
                  >
                    <option value="Main Link">Main Link</option>
                    <option value="Dropdown">Dropdown</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Order Index
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002B5C]/20 focus:border-[#002B5C] transition-all font-medium"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 mt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-bold text-black bg-[#FFE000] hover:bg-[#ebd000] disabled:opacity-60 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingLink ? 'Save Changes' : 'Create Link'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && deletingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-6 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Delete Navigation Link &ldquo;{deletingLink.label}&rdquo;?
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Are you sure you want to remove this navigation link?
              {links.some((c) => c.parent === deletingLink.id) && (
                <span className="block mt-1 font-semibold text-rose-600">
                  ⚠️ This menu item has child dropdown links that will also be removed.
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
