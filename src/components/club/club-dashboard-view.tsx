"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  FileText,
  Search,
} from "lucide-react";
import { ClubOpportunityRecord } from "@/lib/club-portal";
import { OpportunityFormModal } from "@/components/club/opportunity-form-modal";
import { formatDeadlineCountdown } from "@/lib/date-utils";

interface ClubDashboardViewProps {
  club: {
    id: string;
    name: string;
    slug: string;
  };
  initialOpportunities: ClubOpportunityRecord[];
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
  };
}

export function ClubDashboardView({
  club,
  initialOpportunities,
  user,
}: ClubDashboardViewProps) {
  const [opportunities, setOpportunities] =
    useState<ClubOpportunityRecord[]>(initialOpportunities);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<ClubOpportunityRecord | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "APPROVED" | "DRAFT">("ALL");
  const [feedbackNotice, setFeedbackNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Compute metrics
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const totalCount = opportunities.length;
  const publishedCount = opportunities.filter((o) => o.status === "APPROVED").length;
  const draftCount = opportunities.filter((o) => o.status === "DRAFT").length;
  const approachingCount = opportunities.filter((o) => {
    const d = new Date(o.deadline);
    return d > now && d <= sevenDaysFromNow && o.status === "APPROVED";
  }).length;

  // Filtered opportunities
  const filteredOpportunities = opportunities.filter((opp) => {
    if (activeFilter !== "ALL" && opp.status !== activeFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = opp.title.toLowerCase().includes(q);
      const matchDesc = opp.description.toLowerCase().includes(q);
      const matchCat = opp.category.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchCat;
    }
    return true;
  });

  function handleCreateClick() {
    setEditingOpp(null);
    setIsModalOpen(true);
  }

  function handleEditClick(opp: ClubOpportunityRecord) {
    setEditingOpp(opp);
    setIsModalOpen(true);
  }

  function handleModalSuccess(saved: ClubOpportunityRecord) {
    if (editingOpp) {
      setOpportunities((prev) =>
        prev.map((item) => (item.id === saved.id ? saved : item))
      );
      setFeedbackNotice({
        type: "success",
        message: `Updated "${saved.title}" successfully.`,
      });
    } else {
      setOpportunities((prev) => [saved, ...prev]);
      setFeedbackNotice({
        type: "success",
        message: `Published "${saved.title}" successfully! It is now live on the student feed.`,
      });
    }
    setTimeout(() => setFeedbackNotice(null), 5000);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeletingId(id);
    setFeedbackNotice(null);

    try {
      const res = await fetch(`/api/club/opportunities/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete opportunity.");
      }

      setOpportunities((prev) => prev.filter((o) => o.id !== id));
      setFeedbackNotice({
        type: "success",
        message: `Deleted "${title}" successfully.`,
      });
    } catch (err: any) {
      setFeedbackNotice({
        type: "error",
        message: err.message || "Failed to delete opportunity.",
      });
    } finally {
      setIsDeletingId(null);
      setTimeout(() => setFeedbackNotice(null), 5000);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col gap-4 border-b border-orbit-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orbit-gold/40 bg-orbit-gold-light/30 px-3 py-0.5 text-xs font-medium text-orbit-gold-dark">
              <ShieldCheck className="h-3.5 w-3.5 text-orbit-gold-dark" />
              Verified Club Representative
            </span>
            <span className="text-xs text-orbit-muted">•</span>
            <span className="text-xs text-orbit-muted">{user.email}</span>
          </div>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-orbit-brown sm:text-4xl">
            {club.name}
          </h1>
          <p className="mt-1 text-sm text-orbit-subtle">
            Manage your club&apos;s campus opportunities, hackathons, and recruitment drives.
          </p>
        </div>

        <button
          onClick={handleCreateClick}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orbit-brown px-5 py-2.5 text-sm font-medium text-orbit-ivory shadow-sm hover:bg-orbit-brown/90 transition-all hover:shadow"
        >
          <Plus className="h-4 w-4" />
          <span>New Opportunity</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedbackNotice && (
        <div
          className={`mt-6 flex items-center justify-between rounded-xl border p-4 text-xs font-medium ${
            feedbackNotice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackNotice.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <span>{feedbackNotice.message}</span>
          </div>
          <button
            onClick={() => setFeedbackNotice(null)}
            className="text-xs underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-orbit-border bg-orbit-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-orbit-muted">
            Total Posted
          </p>
          <p className="mt-2 font-serif text-3xl font-bold text-orbit-brown">
            {totalCount}
          </p>
          <p className="mt-1 text-[11px] text-orbit-subtle">All-time listings</p>
        </div>

        <div className="rounded-2xl border border-orbit-border bg-orbit-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-orbit-muted">
            Active / Live
          </p>
          <p className="mt-2 font-serif text-3xl font-bold text-emerald-700">
            {publishedCount}
          </p>
          <p className="mt-1 text-[11px] text-orbit-subtle">Visible to all RVCE students</p>
        </div>

        <div className="rounded-2xl border border-orbit-border bg-orbit-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-orbit-muted">
            Approaching Deadlines
          </p>
          <p className="mt-2 font-serif text-3xl font-bold text-amber-700">
            {approachingCount}
          </p>
          <p className="mt-1 text-[11px] text-orbit-subtle">Next 7 days</p>
        </div>

        <div className="rounded-2xl border border-orbit-border bg-orbit-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-orbit-muted">
            Drafts
          </p>
          <p className="mt-2 font-serif text-3xl font-bold text-orbit-subtle">
            {draftCount}
          </p>
          <p className="mt-1 text-[11px] text-orbit-subtle">Unpublished / Internal</p>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Tabs */}
        <div className="inline-flex rounded-xl border border-orbit-border bg-orbit-paper p-1">
          <button
            onClick={() => setActiveFilter("ALL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeFilter === "ALL"
                ? "bg-orbit-card text-orbit-brown shadow-sm"
                : "text-orbit-subtle hover:text-orbit-brown"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setActiveFilter("APPROVED")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeFilter === "APPROVED"
                ? "bg-orbit-card text-orbit-brown shadow-sm"
                : "text-orbit-subtle hover:text-orbit-brown"
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            onClick={() => setActiveFilter("DRAFT")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeFilter === "DRAFT"
                ? "bg-orbit-card text-orbit-brown shadow-sm"
                : "text-orbit-subtle hover:text-orbit-brown"
            }`}
          >
            Drafts ({draftCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-orbit-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search club opportunities..."
            className="w-full rounded-xl border border-orbit-border bg-orbit-card py-2 pl-9 pr-3 text-xs text-orbit-brown placeholder:text-orbit-muted focus:border-orbit-gold focus:outline-none focus:ring-1 focus:ring-orbit-gold"
          />
        </div>
      </div>

      {/* Opportunities List */}
      <div className="mt-6 space-y-4">
        {filteredOpportunities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-orbit-border bg-orbit-card/50 p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orbit-paper">
              <FileText className="h-6 w-6 text-orbit-muted" />
            </div>
            <h3 className="mt-3 font-serif text-lg font-bold text-orbit-brown">
              No opportunities found
            </h3>
            <p className="mt-1 text-xs text-orbit-subtle max-w-sm mx-auto">
              {opportunities.length === 0
                ? "Your club hasn't posted any opportunities yet. Create your first listing to engage RVCE students."
                : "No opportunities match your current filter or search criteria."}
            </p>
            {opportunities.length === 0 && (
              <button
                onClick={handleCreateClick}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orbit-brown px-4 py-2 text-xs font-medium text-orbit-ivory shadow-sm hover:bg-orbit-brown/90 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create First Opportunity</span>
              </button>
            )}
          </div>
        ) : (
          filteredOpportunities.map((opp) => {
            const deadlineDate = new Date(opp.deadline);
            const countdown = formatDeadlineCountdown(opp.deadline);
            const isApproved = opp.status === "APPROVED";

            return (
              <div
                key={opp.id}
                className="group relative rounded-2xl border border-orbit-border bg-orbit-card p-5 sm:p-6 shadow-sm transition-all hover:border-orbit-border-strong hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left: Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-orbit-gold/30 bg-orbit-gold-light/40 px-2.5 py-0.5 text-[11px] font-semibold text-orbit-gold-dark uppercase tracking-wider">
                        {opp.category.replace("_", " ")}
                      </span>
                      <span
                        className={`rounded-md px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                          isApproved
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-stone-100 text-stone-600 border border-stone-200"
                        }`}
                      >
                        {opp.status}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-orbit-brown group-hover:text-orbit-gold-dark transition-colors">
                      {opp.title}
                    </h3>

                    <p className="text-xs text-orbit-subtle line-clamp-2 leading-relaxed">
                      {opp.description}
                    </p>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-orbit-muted pt-1">
                      <span className="inline-flex items-center gap-1.5 font-medium text-amber-800">
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                        Deadline: {deadlineDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })} ({countdown.label})
                      </span>

                      {opp.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {opp.location}
                        </span>
                      )}

                      {opp.startDate && (
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          Event: {new Date(opp.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-orbit-border">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/opportunities/${opp.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-orbit-border bg-orbit-paper px-3 py-1.5 text-xs font-medium text-orbit-brown hover:bg-orbit-paper-dark transition-colors inline-flex items-center gap-1"
                        title="View Public Page"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>View</span>
                      </Link>

                      <button
                        onClick={() => handleEditClick(opp)}
                        className="rounded-lg border border-orbit-border bg-orbit-paper px-3 py-1.5 text-xs font-medium text-orbit-brown hover:bg-orbit-paper-dark transition-colors inline-flex items-center gap-1"
                        title="Edit Opportunity"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDelete(opp.id, opp.title)}
                        disabled={isDeletingId === opp.id}
                        className="rounded-lg border border-red-200 bg-red-50/60 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                        title="Delete Opportunity"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>{isDeletingId === opp.id ? "Deleting..." : "Delete"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Opportunity Modal (Create or Edit) */}
      <OpportunityFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        initialData={editingOpp}
        clubName={club.name}
      />
    </div>
  );
}
