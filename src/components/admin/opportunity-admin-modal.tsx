"use client";

import { useState } from "react";
import { X, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { AdminOpportunityRecord, AdminClubRecord } from "@/lib/admin-portal";
import { Category, OpportunityStatus } from "@prisma/client";

interface OpportunityAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (opportunity: AdminOpportunityRecord) => void;
  initialData?: AdminOpportunityRecord | null;
  clubs: AdminClubRecord[];
}

const CATEGORIES = [
  { value: "HACKATHON", label: "Hackathon" },
  { value: "CTF", label: "CTF & Cybersecurity" },
  { value: "CODING_CONTEST", label: "Coding Contest" },
  { value: "WORKSHOP", label: "Technical Workshop" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "COMPETITION", label: "Competition / Symposium" },
  { value: "OTHER", label: "Other Campus Event" },
];

function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 16);
}

export function OpportunityAdminModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  clubs,
}: OpportunityAdminModalProps) {
  const isEditing = Boolean(initialData);

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState<Category>(initialData?.category || "HACKATHON");
  const [clubId, setClubId] = useState(initialData?.clubId || clubs[0]?.slug || "coding-club-rvce");
  const [officialUrl, setOfficialUrl] = useState(initialData?.officialUrl || "");
  const [deadline, setDeadline] = useState(formatDateForInput(initialData?.deadline));
  const [startDate, setStartDate] = useState(formatDateForInput(initialData?.startDate));
  const [endDate, setEndDate] = useState(formatDateForInput(initialData?.endDate));
  const [location, setLocation] = useState(initialData?.location || "RV College of Engineering");
  const [mode, setMode] = useState<string>("Online + Offline");
  const [status, setStatus] = useState<OpportunityStatus>(initialData?.status || "APPROVED");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim() || title.trim().length < 3) {
      setErrorMessage("Opportunity title must be at least 3 characters long.");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setErrorMessage("Description must be at least 10 characters long.");
      return;
    }

    if (!officialUrl.trim().startsWith("http://") && !officialUrl.trim().startsWith("https://")) {
      setErrorMessage("Registration link must start with https:// or http://");
      return;
    }

    if (!deadline) {
      setErrorMessage("Please set a registration deadline.");
      return;
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      setErrorMessage("Please enter a valid registration deadline date.");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEditing
        ? `/api/admin/opportunities/${initialData!.id}`
        : `/api/admin/opportunities`;
      const method = isEditing ? "PUT" : "POST";

      const formattedLocation = location.trim()
        ? mode ? `${location.trim()} • ${mode}` : location.trim()
        : mode;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          clubId,
          officialUrl: officialUrl.trim(),
          deadline: deadlineDate.toISOString(),
          startDate: startDate ? new Date(startDate).toISOString() : null,
          endDate: endDate ? new Date(endDate).toISOString() : null,
          location: formattedLocation,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save opportunity.");
      }

      onSuccess(data.opportunity);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-orbit-navy/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-orbit-border bg-orbit-card p-6 sm:p-8 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-orbit-border pb-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-orbit-gold/30 bg-orbit-gold-light/40 px-2.5 py-0.5 text-[11px] font-medium text-orbit-gold-dark mb-2">
              <Sparkles className="h-3 w-3" />
              <span>Campus Opportunity Administration</span>
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-orbit-navy">
              {isEditing ? "Edit Opportunity" : "Create Campus Opportunity"}
            </h2>
            <p className="mt-1 text-xs text-orbit-subtle">
              {isEditing
                ? "Update event metadata, schedule dates, or registration details."
                : "Publish an approved opportunity live to the student feed and campus calendar."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-orbit-muted hover:bg-orbit-paper hover:text-orbit-navy transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to save opportunity</p>
              <p className="mt-0.5 text-red-700">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-orbit-subtle mb-1.5">
              Opportunity Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. RVCE Hackathon 2026: Quantum Leap"
              className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-navy placeholder:text-orbit-muted focus:border-orbit-navy focus:outline-none focus:ring-1 focus:ring-orbit-navy"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-orbit-subtle mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-navy focus:border-orbit-navy focus:outline-none focus:ring-1 focus:ring-orbit-navy"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-orbit-subtle mb-1.5">
                Organizing Club / Dept *
              </label>
              <select
                value={clubId}
                onChange={(e) => setClubId(e.target.value)}
                className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-navy focus:border-orbit-navy focus:outline-none focus:ring-1 focus:ring-orbit-navy"
              >
                {clubs.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-orbit-subtle mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OpportunityStatus)}
                className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-navy focus:border-orbit-navy focus:outline-none focus:ring-1 focus:ring-orbit-navy"
              >
                <option value="APPROVED">APPROVED (Live on Student Feed)</option>
                <option value="SUBMITTED">SUBMITTED (Pending Review)</option>
                <option value="DRAFT">DRAFT (Internal)</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-orbit-subtle mb-1.5">
                Event Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-navy focus:border-orbit-navy focus:outline-none focus:ring-1 focus:ring-orbit-navy"
              >
                <option value="Online + Offline">Online + Offline (Hybrid)</option>
                <option value="Online">Online Only</option>
                <option value="Offline">Offline / Campus Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-orbit-subtle mb-1.5">
              Official Registration Link *
            </label>
            <input
              type="url"
              required
              value={officialUrl}
              onChange={(e) => setOfficialUrl(e.target.value)}
              placeholder="https://unstop.com/hackathons/... or official portal"
              className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-navy placeholder:text-orbit-muted focus:border-orbit-navy focus:outline-none focus:ring-1 focus:ring-orbit-navy"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-orbit-subtle mb-1.5">
                Registration Deadline *
              </label>
              <input
                type="datetime-local"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-navy focus:border-orbit-navy focus:outline-none focus:ring-1 focus:ring-orbit-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-orbit-subtle mb-1.5">
                Location / Venue
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. RV College of Engineering or ISE Seminar Hall"
                className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-navy placeholder:text-orbit-muted focus:border-orbit-navy focus:outline-none focus:ring-1 focus:ring-orbit-navy"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-orbit-subtle mb-1.5">
                Event Start Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-navy focus:border-orbit-navy focus:outline-none focus:ring-1 focus:ring-orbit-navy"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-orbit-subtle mb-1.5">
                Event End Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-navy focus:border-orbit-navy focus:outline-none focus:ring-1 focus:ring-orbit-navy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-orbit-subtle mb-1.5">
              Description & Guidelines *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Eligibility criteria, prize pool details, rules, registration requirements..."
              className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-navy placeholder:text-orbit-muted focus:border-orbit-navy focus:outline-none focus:ring-1 focus:ring-orbit-navy"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-orbit-border pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-orbit-border bg-orbit-paper px-4 py-2 text-xs font-medium text-orbit-navy hover:bg-orbit-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-orbit-navy px-5 py-2 text-xs font-medium text-white shadow-sm hover:bg-orbit-navy-dark transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isEditing ? "Save Changes" : "Create Opportunity"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
