"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import {
  Search,
  Loader2,
  Mail,
  Calendar,
  User,
  Tag,
  MessageSquare,
  Phone,
  Building,
  MapPin,
  Clock,
  Package,
  Wrench,
  Factory,
  X,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { InputField } from "@/components/InputField";
import toast from "react-hot-toast";

interface Enquiry {
  id: string;
  type?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  location?: string;
  industry?: string;
  service?: string;
  timeframe?: string;
  interestedIn?: string | null;
  product?: string | null;
  packaging?: string | null;
  budget?: string | null;
  message?: string | null;
  status: string;
  createdAt: string;
}

export default function EnquiriesCMSPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeMessage, setActiveMessage] = useState<Enquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/enquiries");
      const json = await res.json();
      if (json.success) {
        setEnquiries(json.data || []);
      } else {
        toast.error(json.error || "Failed to fetch enquiries");
      }
    } catch {
      toast.error("Network error while loading enquiries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleDeleteEnquiry = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this enquiry? This action cannot be undone."
      )
    ) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/enquiries?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Enquiry deleted successfully");
        setEnquiries((prev) => prev.filter((e) => e.id !== id));
        setActiveMessage(null);
      } else {
        toast.error(json.error || "Failed to delete enquiry");
      }
    } catch {
      toast.error("Network error while deleting enquiry");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Status updated to ${newStatus}`);
        setEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
        );
        if (activeMessage && activeMessage.id === id) {
          setActiveMessage({ ...activeMessage, status: newStatus });
        }
      } else {
        toast.error(json.error || "Failed to update status");
      }
    } catch {
      toast.error("Network error while updating status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getTypeBadgeClass = (type?: string) => {
    const t = (type || "").toLowerCase();
    if (t.includes("audit")) {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }
    if (t.includes("quote")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (t.includes("callback")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (t.includes("price list")) {
      return "bg-sky-50 text-sky-700 border-sky-200";
    }
    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  const filtered = enquiries.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.phone && e.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.company && e.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.product && e.product.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.type && e.type.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      typeFilter === "all" ||
      (e.type && e.type.toLowerCase().includes(typeFilter.toLowerCase()));

    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-7xl mx-auto">
      <PageHeader
        title="Enquiries & Lead Submissions"
        description="All lead submissions, callback requests, plant audits, and quote requests captured from the website."
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <InputField
          label=""
          name="search"
          placeholder="Search by name, company, product, type, or contact..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          containerClassName="flex-1 w-full"
        />

        <div className="flex items-center gap-2">
          {["all", "audit", "quote", "callback", "contact"].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setTypeFilter(filter)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                typeFilter === filter
                  ? "bg-[#0b1329] text-white shadow-sm"
                  : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              {filter === "all" ? "All Submissions" : filter}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-8">
                  Type & Lead Info
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Requirement / Context
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Date
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest pr-8 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#C86218]" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400 italic">
                    No submissions found.
                  </td>
                </tr>
              ) : (
                filtered.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5 pl-8">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider w-fit ${getTypeBadgeClass(
                            enquiry.type
                          )}`}
                        >
                          {enquiry.type || "General Enquiry"}
                        </span>
                        <span className="font-bold text-gray-900 flex items-center gap-2 mt-1">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {enquiry.name}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {enquiry.email}
                        </span>
                        {enquiry.phone && (
                          <span className="text-xs text-gray-400 flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {enquiry.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        {(enquiry.product || enquiry.interestedIn) && (
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
                            <Tag className="w-3 h-3 text-[#C86218]" />
                            {enquiry.product || enquiry.interestedIn}
                          </div>
                        )}
                        {enquiry.service && (
                          <div className="inline-flex items-center gap-1.5 text-xs text-zinc-600">
                            <Wrench className="w-3 h-3 text-zinc-400" />
                            {enquiry.service}
                          </div>
                        )}
                        {enquiry.company && (
                          <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                            <Building className="w-3 h-3 text-gray-400" />
                            {enquiry.company}
                          </p>
                        )}
                        {enquiry.location && (
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {enquiry.location}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          enquiry.status === "Resolved"
                            ? "bg-green-100 text-green-700"
                            : enquiry.status === "Contacted"
                            ? "bg-blue-100 text-blue-700"
                            : enquiry.status === "In Review"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-zinc-100 text-zinc-700"
                        }`}
                      >
                        {enquiry.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[13px] text-gray-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(enquiry.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-5 pr-8 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveMessage(enquiry)}
                        title="View Full Details"
                        className="p-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-orange-50 hover:text-[#C86218] transition-all cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold border border-gray-100"
                      >
                        <MessageSquare className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message & Lead Detail Modal */}
      {activeMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getTypeBadgeClass(
                      activeMessage.type
                    )}`}
                  >
                    {activeMessage.type || "General Enquiry"}
                  </span>
                  <span className="text-xs text-gray-400">
                    ID: {activeMessage.id.slice(-6)}
                  </span>
                </div>
                <h3 className="font-bold text-xl text-[#0B0F29]">{activeMessage.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {activeMessage.email} &bull; {activeMessage.phone || "No phone provided"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveMessage(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
              {activeMessage.company && (
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Company / Firm
                  </span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1.5 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-zinc-400" />
                    {activeMessage.company}
                  </span>
                </div>
              )}
              {activeMessage.location && (
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Location / City
                  </span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    {activeMessage.location}
                  </span>
                </div>
              )}
              {activeMessage.industry && (
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Industry Segment
                  </span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1.5 mt-0.5">
                    <Factory className="w-3.5 h-3.5 text-zinc-400" />
                    {activeMessage.industry}
                  </span>
                </div>
              )}
              {activeMessage.service && (
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Service / Plant Type
                  </span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1.5 mt-0.5">
                    <Wrench className="w-3.5 h-3.5 text-zinc-400" />
                    {activeMessage.service}
                  </span>
                </div>
              )}
              {activeMessage.product && (
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Product / Grade
                  </span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1.5 mt-0.5">
                    <Tag className="w-3.5 h-3.5 text-zinc-400" />
                    {activeMessage.product}
                  </span>
                </div>
              )}
              {activeMessage.packaging && (
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Packaging Size
                  </span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1.5 mt-0.5">
                    <Package className="w-3.5 h-3.5 text-zinc-400" />
                    {activeMessage.packaging}
                  </span>
                </div>
              )}
              {activeMessage.timeframe && (
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Timeline / Preferred Time
                  </span>
                  <span className="font-semibold text-gray-800 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    {activeMessage.timeframe}
                  </span>
                </div>
              )}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Submission Date
                </span>
                <span className="font-semibold text-gray-800 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  {new Date(activeMessage.createdAt).toLocaleString("en-US")}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Submission Message / Details
              </span>
              <p className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-gray-800 leading-relaxed text-sm whitespace-pre-wrap">
                {activeMessage.message || "No additional message text was submitted."}
              </p>
            </div>

            {/* Status Selector */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
              <span className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#C86218]" />
                Update Status:
              </span>
              <div className="flex items-center gap-2">
                {["Pending", "In Review", "Contacted", "Resolved"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={isUpdatingStatus || activeMessage.status === status}
                    onClick={() => handleUpdateStatus(activeMessage.id, status)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeMessage.status === status
                        ? "bg-[#0b1329] text-white shadow-xs"
                        : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handleDeleteEnquiry(activeMessage.id)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-full font-bold text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer inline-flex items-center gap-1.5 border border-red-200 hover:border-red-300 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Deleting..." : "Delete Enquiry"}
              </button>

              <button
                type="button"
                onClick={() => setActiveMessage(null)}
                className="px-6 py-2.5 bg-[#0B0F29] text-white rounded-full font-bold text-xs hover:bg-black transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
