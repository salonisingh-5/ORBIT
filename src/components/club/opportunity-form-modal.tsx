"use client";

import { useState } from "react";
import { X, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { ClubOpportunityRecord } from "@/lib/club-portal";
import { Category } from "@prisma/client";

interface OpportunityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (opportunity: ClubOpportunityRecord) => void;
  initialData?: ClubOpportunityRecord | null;
  clubName: string;
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

export function OpportunityFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  clubName,
}: OpportunityFormModalProps) {
  const isEditing = Boolean(initialData);

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState<Category>(initialData?.category || "HACKATHON");
  const [officialUrl, setOfficialUrl] = useState(initialData?.officialUrl || "");
  const [deadline, setDeadline] = useState(formatDateForInput(initialData?.deadline));
  const [startDate, setStartDate] = useState(formatDateForInput(initialData?.startDate));
  const [endDate, setEndDate] = useState(formatDateForInput(initialData?.endDate));
  const [location, setLocation] = useState(initialData?.location || "RVCE Campus");
  const [status, setStatus] = useState<string>(initialData?.status || "APPROVED");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!title.trim() || title.trim().length < 3) {
      setErrorMessage("Title must be at least 3 characters long.");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setErrorMessage("Description must be at least 10 characters long.");
      return;
    }

    if (!officialUrl.trim().startsWith("http://") && !officialUrl.trim().startsWith("https://")) {
      setErrorMessage("Registration link must begin with https:// or http://");
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
        ? `/api/club/opportunities/${initialData!.id}`
        : `/api/club/opportunities`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          officialUrl: officialUrl.trim(),
          deadline: deadlineDate.toISOString(),
          startDate: startDate ? new Date(startDate).toISOString() : null,
          endDate: endDate ? new Date(endDate).toISOString() : null,
          location: location.trim() || "RVCE Campus",
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-orbit-brown/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-orbit-border bg-orbit-card p-6 sm:p-8 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-orbit-border pb-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-orbit-gold/30 bg-orbit-gold-light/40 px-2.5 py-0.5 text-[11px] font-medium text-orbit-gold-dark mb-2">
              <Sparkles className="h-3 w-3" />
              <span>{clubName}</span>
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-orbit-brown">
              {isEditing ? "Edit Opportunity" : "Create New Opportunity"}
            </h2>
            <p className="mt-1 text-xs text-orbit-subtle">
              {isEditing
                ? "Update your event details. Changes reflect immediately across ORBIT."
                : "Publish an event, hackathon, or workshop directly to the RVCE student feed."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-orbit-muted hover:bg-orbit-paper hover:text-orbit-brown transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to save opportunity</p>
              <p className="mt-0.5 text-red-700">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-orbit-subtle mb-1.5">
              Opportunity Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 8th Mile Hackathon 2026: Quantum Leap"
              className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-brown placeholder:text-orbit-muted focus:border-orbit-gold focus:outline-none focus:ring-1 focus:ring-orbit-gold"
            />
          </div>

          {/* Category & Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-orbit-subtle mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-brown focus:border-orbit-gold focus:outline-none focus:ring-1 focus:ring-orbit-gold"
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
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-brown focus:border-orbit-gold focus:outline-none focus:ring-1 focus:ring-orbit-gold"
              >
                <option value="APPROVED">Published (Live on Feed)</option>
                <option value="DRAFT">Draft (Club Internal)</option>
              </select>
            </div>
          </div>

          {/* Official URL */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-orbit-subtle mb-1.5">
              Official Registration Link *
            </label>
            <input
              type="url"
              required
              value={officialUrl}
              onChange={(e) => setOfficialUrl(e.target.value)}
              placeholder="https://unstop.com/hackathons/8th-mile or Google Form URL"
              className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-brown placeholder:text-orbit-muted focus:border-orbit-gold focus:outline-none focus:ring-1 focus:ring-orbit-gold"
            />
          </div>

          {/* Deadline & Location Grid */}
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
                className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-brown focus:border-orbit-gold focus:outline-none focus:ring-1 focus:ring-orbit-gold"
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
                placeholder="e.g. ISE Seminar Hall or Online"
                className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-brown placeholder:text-orbit-muted focus:border-orbit-gold focus:outline-none focus:ring-1 focus:ring-orbit-gold"
              />
            </div>
          </div>

          {/* Start and End Date Grid (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-orbit-subtle mb-1.5">
                Event Start Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-brown focus:border-orbit-gold focus:outline-none focus:ring-1 focus:ring-orbit-gold"
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
                className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-brown focus:border-orbit-gold focus:outline-none focus:ring-1 focus:ring-orbit-gold"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-orbit-subtle mb-1.5">
              Event Details & Guidelines *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide eligibility criteria, team size limits, prize pool details, rounds, and instructions..."
              className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-brown placeholder:text-orbit-muted focus:border-orbit-gold focus:outline-none focus:ring-1 focus:ring-orbit-gold"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-orbit-border pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-orbit-border bg-orbit-paper px-4 py-2 text-xs font-medium text-orbit-brown hover:bg-orbit-paper-dark transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-orbit-brown px-5 py-2 text-xs font-medium text-orbit-ivory shadow-sm hover:bg-orbit-brown/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isEditing ? "Save Changes" : "Publish Opportunity"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
