"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  Trash2,
  ExternalLink,
  Plus,
  Edit2,
  Search,
  Clock,
  MapPin,
  AlertCircle,
  FileCheck,
  Loader2,
  Filter,
} from "lucide-react";
import {
  AdminClubRecord,
  AdminUserRecord,
  AdminOpportunityRecord,
  AdminMetrics,
} from "@/lib/admin-portal";
import { ClubModal } from "@/components/admin/club-modal";
import { formatDeadlineCountdown } from "@/lib/date-utils";
import { Role, OpportunityStatus } from "@prisma/client";

interface AdminDashboardViewProps {
  initialClubs: AdminClubRecord[];
  initialUsers: AdminUserRecord[];
  initialOpportunities: AdminOpportunityRecord[];
  initialMetrics: AdminMetrics;
  currentUser: {
    id: string;
    email?: string | null;
    name?: string | null;
    role: string;
  };
}

export function AdminDashboardView({
  initialClubs,
  initialUsers,
  initialOpportunities,
  initialMetrics,
  currentUser,
}: AdminDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"MODERATION" | "CLUBS" | "USERS">("MODERATION");

  // Data states
  const [clubs, setClubs] = useState<AdminClubRecord[]>(initialClubs);
  const [users, setUsers] = useState<AdminUserRecord[]>(initialUsers);
  const [opportunities, setOpportunities] =
    useState<AdminOpportunityRecord[]>(initialOpportunities);
  const [metrics, setMetrics] = useState<AdminMetrics>(initialMetrics);

  // Moderation state
  const [oppFilter, setOppFilter] = useState<string>("ALL");
  const [oppSearch, setOppSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Club modal state
  const [isClubModalOpen, setIsClubModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<AdminClubRecord | null>(null);

  // User management state
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("ALL");
  const [pendingUserEdits, setPendingUserEdits] = useState<
    Record<string, { role: Role; clubId: string | null }>
  >({});
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Feedback banner
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  function showFeedback(type: "success" | "error", message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  }

  // ─── Opportunity Moderation Handlers ───

  async function handleModerateStatus(id: string, newStatus: OpportunityStatus) {
    setActionLoadingId(id);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/opportunities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update opportunity status.");

      setOpportunities((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );

      // Recompute metrics
      setMetrics((m) => {
        const currentOpp = opportunities.find((o) => o.id === id);
        const oldStatus = currentOpp?.status;
        return {
          ...m,
          approvedCount:
            newStatus === "APPROVED"
              ? m.approvedCount + (oldStatus !== "APPROVED" ? 1 : 0)
              : oldStatus === "APPROVED"
              ? m.approvedCount - 1
              : m.approvedCount,
          pendingCount:
            newStatus === "SUBMITTED"
              ? m.pendingCount + (oldStatus !== "SUBMITTED" ? 1 : 0)
              : oldStatus === "SUBMITTED"
              ? m.pendingCount - 1
              : m.pendingCount,
          rejectedCount:
            newStatus === "REJECTED"
              ? m.rejectedCount + (oldStatus !== "REJECTED" ? 1 : 0)
              : oldStatus === "REJECTED"
              ? m.rejectedCount - 1
              : m.rejectedCount,
        };
      });

      showFeedback(
        "success",
        `Opportunity status updated to "${newStatus}".`
      );
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to moderate opportunity.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDeleteOpportunity(id: string, title: string) {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return;
    }

    setActionLoadingId(id);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/opportunities/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete opportunity.");

      setOpportunities((prev) => prev.filter((o) => o.id !== id));
      setMetrics((m) => ({ ...m, totalOpportunities: m.totalOpportunities - 1 }));
      showFeedback("success", `Deleted "${title}" successfully.`);
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to delete opportunity.");
    } finally {
      setActionLoadingId(null);
    }
  }

  // ─── Club Registry Handlers ───

  function handleOpenCreateClub() {
    setEditingClub(null);
    setIsClubModalOpen(true);
  }

  function handleOpenEditClub(club: AdminClubRecord) {
    setEditingClub(club);
    setIsClubModalOpen(true);
  }

  function handleClubSaved(savedClub: AdminClubRecord) {
    if (editingClub) {
      setClubs((prev) => prev.map((c) => (c.id === savedClub.id ? savedClub : c)));
      showFeedback("success", `Updated club "${savedClub.name}".`);
    } else {
      setClubs((prev) => [...prev, savedClub]);
      setMetrics((m) => ({ ...m, totalClubs: m.totalClubs + 1 }));
      showFeedback("success", `Successfully registered "${savedClub.name}".`);
    }
  }

  // ─── User Role Handlers ───

  function handleUserRoleChange(userId: string, newRole: Role) {
    const existing = pendingUserEdits[userId] || {
      role: users.find((u) => u.id === userId)?.role || "STUDENT",
      clubId: users.find((u) => u.id === userId)?.clubId || null,
    };

    setPendingUserEdits((prev) => ({
      ...prev,
      [userId]: {
        ...existing,
        role: newRole,
        clubId: newRole === "CLUB_OWNER" ? existing.clubId || clubs[0]?.slug || null : null,
      },
    }));
  }

  function handleUserClubChange(userId: string, clubId: string) {
    const existing = pendingUserEdits[userId] || {
      role: users.find((u) => u.id === userId)?.role || "CLUB_OWNER",
      clubId: null,
    };

    setPendingUserEdits((prev) => ({
      ...prev,
      [userId]: {
        ...existing,
        clubId,
      },
    }));
  }

  async function handleSaveUserRole(userId: string) {
    const edit = pendingUserEdits[userId];
    if (!edit) return;

    setUpdatingUserId(userId);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          role: edit.role,
          clubId: edit.clubId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user role.");

      setUsers((prev) => prev.map((u) => (u.id === userId ? data.user : u)));

      setPendingUserEdits((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });

      showFeedback(
        "success",
        `Updated permissions for ${data.user.name || data.user.email} to ${data.user.role}.`
      );
    } catch (err: any) {
      showFeedback("error", err.message || "Failed to update user role.");
    } finally {
      setUpdatingUserId(null);
    }
  }

  // ─── Filtering Logic ───

  const filteredOpportunities = opportunities.filter((opp) => {
    if (oppFilter !== "ALL" && opp.status !== oppFilter) return false;
    if (oppSearch.trim()) {
      const q = oppSearch.toLowerCase();
      return (
        opp.title.toLowerCase().includes(q) ||
        opp.clubName.toLowerCase().includes(q) ||
        opp.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredUsers = users.filter((u) => {
    const currentRole = pendingUserEdits[u.id]?.role || u.role;
    if (userRoleFilter !== "ALL" && currentRole !== userRoleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return (
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.clubName && u.clubName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-orbit-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-0.5 text-xs font-semibold text-red-800">
              <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
              Main Administrator Console
            </span>
            <span className="text-xs text-orbit-muted">•</span>
            <span className="text-xs font-mono text-orbit-muted">{currentUser.email}</span>
          </div>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-orbit-brown sm:text-4xl">
            Campus Administration
          </h1>
          <p className="mt-1 text-sm text-orbit-subtle">
            Moderation queues, official club directories, and role provisioning across RVCE.
          </p>
        </div>

        {activeTab === "CLUBS" && (
          <button
            onClick={handleOpenCreateClub}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orbit-brown px-5 py-2.5 text-sm font-medium text-orbit-ivory shadow-sm hover:bg-orbit-brown/90 transition-all hover:shadow"
          >
            <Plus className="h-4 w-4" />
            <span>Register Club</span>
          </button>
        )}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`mt-6 flex items-center justify-between rounded-xl border p-4 text-xs font-medium ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs underline hover:opacity-80">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Metrics Row */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-orbit-border bg-orbit-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-orbit-muted">
            All Opportunities
          </p>
          <p className="mt-2 font-serif text-3xl font-bold text-orbit-brown">
            {metrics.totalOpportunities}
          </p>
          <p className="mt-1 text-[11px] text-orbit-subtle">
            {metrics.approvedCount} approved & live
          </p>
        </div>

        <div className="rounded-2xl border border-orbit-border bg-orbit-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-orbit-muted">
            Pending Moderation
          </p>
          <p className="mt-2 font-serif text-3xl font-bold text-amber-700">
            {metrics.pendingCount}
          </p>
          <p className="mt-1 text-[11px] text-orbit-subtle">Requires review</p>
        </div>

        <div className="rounded-2xl border border-orbit-border bg-orbit-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-orbit-muted">
            Campus Clubs
          </p>
          <p className="mt-2 font-serif text-3xl font-bold text-orbit-brown">
            {metrics.totalClubs}
          </p>
          <p className="mt-1 text-[11px] text-orbit-subtle">Registered organizations</p>
        </div>

        <div className="rounded-2xl border border-orbit-border bg-orbit-card p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-orbit-muted">
            Verified Accounts
          </p>
          <p className="mt-2 font-serif text-3xl font-bold text-orbit-brown">
            {metrics.totalUsers}
          </p>
          <p className="mt-1 text-[11px] text-orbit-subtle">@rvce.edu.in users</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mt-8 border-b border-orbit-border">
        <div className="flex space-x-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("MODERATION")}
            className={`flex items-center gap-2 border-b-2 pb-3.5 text-sm font-semibold transition-all ${
              activeTab === "MODERATION"
                ? "border-orbit-brown text-orbit-brown"
                : "border-transparent text-orbit-subtle hover:border-orbit-border hover:text-orbit-brown"
            }`}
          >
            <FileCheck className="h-4 w-4" />
            <span>Opportunity Moderation</span>
            {metrics.pendingCount > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                {metrics.pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("CLUBS")}
            className={`flex items-center gap-2 border-b-2 pb-3.5 text-sm font-semibold transition-all ${
              activeTab === "CLUBS"
                ? "border-orbit-brown text-orbit-brown"
                : "border-transparent text-orbit-subtle hover:border-orbit-border hover:text-orbit-brown"
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Campus Clubs ({clubs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("USERS")}
            className={`flex items-center gap-2 border-b-2 pb-3.5 text-sm font-semibold transition-all ${
              activeTab === "USERS"
                ? "border-orbit-brown text-orbit-brown"
                : "border-transparent text-orbit-subtle hover:border-orbit-border hover:text-orbit-brown"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>User Roles & Access ({users.length})</span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: MODERATION QUEUE & ALL OPPORTUNITIES ─── */}
      {activeTab === "MODERATION" && (
        <div className="mt-6 space-y-6">
          {/* Controls: Filter Pills + Search */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex rounded-xl border border-orbit-border bg-orbit-paper p-1 overflow-x-auto">
              {["ALL", "SUBMITTED", "APPROVED", "REJECTED", "DRAFT"].map((status) => (
                <button
                  key={status}
                  onClick={() => setOppFilter(status)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    oppFilter === status
                      ? "bg-orbit-card text-orbit-brown shadow-sm"
                      : "text-orbit-subtle hover:text-orbit-brown"
                  }`}
                >
                  {status === "SUBMITTED" ? "Pending Review" : status}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-orbit-muted" />
              <input
                type="text"
                value={oppSearch}
                onChange={(e) => setOppSearch(e.target.value)}
                placeholder="Search opportunities or clubs..."
                className="w-full rounded-xl border border-orbit-border bg-orbit-card py-2 pl-9 pr-3 text-xs text-orbit-brown placeholder:text-orbit-muted focus:border-orbit-gold focus:outline-none focus:ring-1 focus:ring-orbit-gold"
              />
            </div>
          </div>

          {/* Opportunities List */}
          <div className="space-y-4">
            {filteredOpportunities.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-orbit-border bg-orbit-card/50 p-12 text-center">
                <FileCheck className="mx-auto h-10 w-10 text-orbit-muted" />
                <h3 className="mt-3 font-serif text-lg font-bold text-orbit-brown">
                  No opportunities match your filter
                </h3>
                <p className="mt-1 text-xs text-orbit-subtle">
                  No submissions or events currently found under &ldquo;{oppFilter}&rdquo;.
                </p>
              </div>
            ) : (
              filteredOpportunities.map((opp) => {
                const deadlineDate = new Date(opp.deadline);
                const countdown = formatDeadlineCountdown(opp.deadline);
                const isLoading = actionLoadingId === opp.id;

                const statusStyles = {
                  APPROVED: "bg-emerald-50 text-emerald-800 border-emerald-200",
                  SUBMITTED: "bg-amber-50 text-amber-800 border-amber-200",
                  REJECTED: "bg-red-50 text-red-800 border-red-200",
                  DRAFT: "bg-stone-100 text-stone-700 border-stone-200",
                  EXPIRED: "bg-gray-100 text-gray-600 border-gray-200",
                }[opp.status] || "bg-stone-100 text-stone-700 border-stone-200";

                return (
                  <div
                    key={opp.id}
                    className="rounded-2xl border border-orbit-border bg-orbit-card p-5 sm:p-6 shadow-sm transition hover:border-orbit-border-strong hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      {/* Left: Info */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md border border-orbit-border bg-orbit-paper px-2.5 py-0.5 text-[11px] font-semibold text-orbit-brown">
                            {opp.clubName}
                          </span>
                          <span className="rounded-md border border-orbit-gold/30 bg-orbit-gold-light/40 px-2.5 py-0.5 text-[11px] font-semibold text-orbit-gold-dark uppercase tracking-wider">
                            {opp.category.replace("_", " ")}
                          </span>
                          <span
                            className={`rounded-md border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${statusStyles}`}
                          >
                            {opp.status === "SUBMITTED" ? "PENDING REVIEW" : opp.status}
                          </span>
                        </div>

                        <h3 className="font-serif text-xl font-bold text-orbit-brown">
                          {opp.title}
                        </h3>

                        <p className="text-xs text-orbit-subtle line-clamp-2 leading-relaxed">
                          {opp.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-orbit-muted pt-1">
                          <span className="inline-flex items-center gap-1.5 font-medium text-amber-800">
                            <Clock className="h-3.5 w-3.5 text-amber-600" />
                            Deadline:{" "}
                            {deadlineDate.toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}{" "}
                            ({countdown.label})
                          </span>

                          {opp.location && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              {opp.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-orbit-border">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Link
                            href={`/opportunities/${opp.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-orbit-border bg-orbit-paper px-3 py-1.5 text-xs font-medium text-orbit-brown hover:bg-orbit-paper-dark transition-colors inline-flex items-center gap-1"
                            title="View Public Page"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Preview</span>
                          </Link>

                          {opp.status !== "APPROVED" && (
                            <button
                              onClick={() => handleModerateStatus(opp.id, "APPROVED")}
                              disabled={isLoading}
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                              title="Approve & Publish to Student Feed"
                            >
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              <span>Approve</span>
                            </button>
                          )}

                          {opp.status !== "REJECTED" && (
                            <button
                              onClick={() => handleModerateStatus(opp.id, "REJECTED")}
                              disabled={isLoading}
                              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                              title="Reject Opportunity"
                            >
                              <XCircle className="h-3 w-3 text-amber-600" />
                              <span>Reject</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteOpportunity(opp.id, opp.title)}
                            disabled={isLoading}
                            className="rounded-lg border border-red-200 bg-red-50/60 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                            title="Delete Permanently"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: CLUBS DIRECTORY ─── */}
      {activeTab === "CLUBS" && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {clubs.map((c) => (
              <div
                key={c.id}
                className="flex flex-col justify-between rounded-2xl border border-orbit-border bg-orbit-card p-5 sm:p-6 shadow-sm transition hover:border-orbit-border-strong hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-lg font-bold text-orbit-brown">{c.name}</h3>
                    <button
                      onClick={() => handleOpenEditClub(c)}
                      className="rounded-lg p-1.5 text-orbit-muted hover:bg-orbit-paper hover:text-orbit-brown transition"
                      title="Edit Club"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-orbit-muted">{c.slug}</p>
                  <p className="mt-2 text-xs text-orbit-subtle line-clamp-3 leading-relaxed">
                    {c.description || "No official description provided."}
                  </p>
                </div>

                <div className="mt-5 border-t border-orbit-border pt-4">
                  <div className="flex items-center justify-between text-xs text-orbit-muted">
                    <span>
                      <strong className="text-orbit-brown">{c.opportunityCount}</strong> listings
                    </span>
                    {c.websiteUrl && (
                      <a
                        href={c.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-orbit-gold-dark hover:underline"
                      >
                        <span>Website</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: USER ROLES & ACCESS ─── */}
      {activeTab === "USERS" && (
        <div className="mt-6 space-y-6">
          {/* Controls */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex rounded-xl border border-orbit-border bg-orbit-paper p-1">
              {["ALL", "STUDENT", "CLUB_OWNER", "ADMIN"].map((role) => (
                <button
                  key={role}
                  onClick={() => setUserRoleFilter(role)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    userRoleFilter === role
                      ? "bg-orbit-card text-orbit-brown shadow-sm"
                      : "text-orbit-subtle hover:text-orbit-brown"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-orbit-muted" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-xl border border-orbit-border bg-orbit-card py-2 pl-9 pr-3 text-xs text-orbit-brown placeholder:text-orbit-muted focus:border-orbit-gold focus:outline-none focus:ring-1 focus:ring-orbit-gold"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto rounded-2xl border border-orbit-border bg-orbit-card shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-orbit-border bg-orbit-paper text-orbit-subtle font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Current Role</th>
                  <th className="px-5 py-3.5">Assign Role</th>
                  <th className="px-5 py-3.5">Club Affiliation</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orbit-border">
                {filteredUsers.map((u) => {
                  const pendingEdit = pendingUserEdits[u.id];
                  const selectedRole = pendingEdit ? pendingEdit.role : u.role;
                  const selectedClubId = pendingEdit ? pendingEdit.clubId : u.clubId;
                  const isDirty = Boolean(pendingEdit);
                  const isUpdating = updatingUserId === u.id;

                  const roleBadgeStyle = {
                    ADMIN: "bg-red-50 text-red-800 border-red-200",
                    CLUB_OWNER: "bg-amber-50 text-amber-800 border-amber-200",
                    STUDENT: "bg-stone-100 text-stone-700 border-stone-200",
                  }[u.role];

                  return (
                    <tr key={u.id} className="hover:bg-orbit-paper/40 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-orbit-brown">{u.name || "Student"}</p>
                        <p className="font-mono text-[11px] text-orbit-muted">{u.email}</p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-block rounded border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${roleBadgeStyle}`}
                        >
                          {u.role}
                        </span>
                        {u.clubName && (
                          <p className="mt-1 text-[11px] text-orbit-subtle">{u.clubName}</p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={selectedRole}
                          onChange={(e) => handleUserRoleChange(u.id, e.target.value as Role)}
                          className="rounded-lg border border-orbit-border bg-orbit-paper px-2.5 py-1.5 text-xs text-orbit-brown focus:border-orbit-gold focus:outline-none"
                        >
                          <option value="STUDENT">STUDENT</option>
                          <option value="CLUB_OWNER">CLUB_OWNER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>

                      <td className="px-5 py-4">
                        {selectedRole === "CLUB_OWNER" ? (
                          <select
                            value={selectedClubId || ""}
                            onChange={(e) => handleUserClubChange(u.id, e.target.value)}
                            className="rounded-lg border border-orbit-border bg-orbit-paper px-2.5 py-1.5 text-xs text-orbit-brown focus:border-orbit-gold focus:outline-none max-w-[200px]"
                          >
                            <option value="">Select Club...</option>
                            {clubs.map((c) => (
                              <option key={c.id} value={c.slug}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[11px] text-orbit-muted">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {isDirty && (
                          <button
                            onClick={() => handleSaveUserRole(u.id)}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-orbit-brown px-3 py-1.5 text-xs font-medium text-orbit-ivory shadow-sm hover:bg-black transition-colors disabled:opacity-50"
                          >
                            {isUpdating && <Loader2 className="h-3 w-3 animate-spin" />}
                            <span>Save</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Club Modal */}
      <ClubModal
        isOpen={isClubModalOpen}
        onClose={() => setIsClubModalOpen(false)}
        onSuccess={handleClubSaved}
        initialData={editingClub}
      />
    </div>
  );
}
