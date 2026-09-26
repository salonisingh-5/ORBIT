"use client";

import { useState } from "react";
import { X, Building2, AlertCircle, Loader2 } from "lucide-react";
import { AdminClubRecord } from "@/lib/admin-portal";

interface ClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (club: AdminClubRecord) => void;
  initialData?: AdminClubRecord | null;
}

export function ClubModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: ClubModalProps) {
  const isEditing = Boolean(initialData);

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [websiteUrl, setWebsiteUrl] = useState(initialData?.websiteUrl || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  function handleNameChange(val: string) {
    setName(val);
    if (!isEditing) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generated);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || name.trim().length < 3) {
      setErrorMessage("Club name must be at least 3 characters long.");
      return;
    }

    if (
      websiteUrl.trim() &&
      !websiteUrl.trim().startsWith("http://") &&
      !websiteUrl.trim().startsWith("https://")
    ) {
      setErrorMessage("Website URL must start with http:// or https://");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isEditing ? `/api/admin/clubs/${initialData!.id}` : `/api/admin/clubs`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          websiteUrl: websiteUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save club record.");
      }

      onSuccess(data.club);
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
        className="fixed inset-0 bg-orbit-brown/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-orbit-border bg-orbit-card p-6 sm:p-8 shadow-2xl transition-all">
        <div className="flex items-start justify-between border-b border-orbit-border pb-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-orbit-gold/30 bg-orbit-gold-light/40 px-2.5 py-0.5 text-[11px] font-medium text-orbit-gold-dark mb-2">
              <Building2 className="h-3 w-3" />
              <span>Campus Directory</span>
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-orbit-brown">
              {isEditing ? "Edit Club Details" : "Register New Campus Club"}
            </h2>
            <p className="mt-1 text-xs text-orbit-subtle">
              {isEditing
                ? "Update club registration, contact website, and profile description."
                : "Add an official student organization to ORBIT to enable club owner assignments."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-orbit-muted hover:bg-orbit-paper hover:text-orbit-brown transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to save club</p>
              <p className="mt-0.5 text-red-700">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-orbit-subtle mb-1.5">
              Club Official Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Google Developer Student Club RVCE"
              className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-brown placeholder:text-orbit-muted focus:border-orbit-gold focus:outline-none focus:ring-1 focus:ring-orbit-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-orbit-subtle mb-1.5">
              URL Slug / Identifier
            </label>
            <input
              type="text"
              disabled={isEditing}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="gdsc-rvce"
              className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-brown font-mono placeholder:text-orbit-muted focus:border-orbit-gold focus:outline-none focus:ring-1 focus:ring-orbit-gold disabled:opacity-60"
            />
            {isEditing && (
              <p className="mt-1 text-[11px] text-orbit-muted">
                Slug identifiers cannot be modified once provisioned.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-orbit-subtle mb-1.5">
              Official Website / Portal (Optional)
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://gdsc.rvce.edu.in"
              className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-brown placeholder:text-orbit-muted focus:border-orbit-gold focus:outline-none focus:ring-1 focus:ring-orbit-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-orbit-subtle mb-1.5">
              Description / Overview
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mission, flagship events, and domain focus..."
              className="w-full rounded-xl border border-orbit-border bg-orbit-paper px-3.5 py-2.5 text-sm text-orbit-brown placeholder:text-orbit-muted focus:border-orbit-gold focus:outline-none focus:ring-1 focus:ring-orbit-gold"
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-orbit-border pt-4">
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
              <span>{isEditing ? "Save Changes" : "Register Club"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
