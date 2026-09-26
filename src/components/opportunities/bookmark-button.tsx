"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Bookmark } from "lucide-react";
import { SignInModal } from "@/components/auth/sign-in-modal";

interface BookmarkButtonProps {
  opportunityId: string;
  initialBookmarked?: boolean;
  showLabel?: boolean;
  className?: string;
  onToggle?: (isSaved: boolean) => void;
}

export function BookmarkButton({
  opportunityId,
  initialBookmarked = false,
  showLabel = false,
  className = "",
  onToggle,
}: BookmarkButtonProps) {
  const { data: session, status } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If unauthenticated, show Sign In Modal
    if (status !== "authenticated" || !session?.user) {
      setIsSignInOpen(true);
      return;
    }

    // Optimistic toggle
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    if (onToggle) {
      onToggle(nextState);
    }

    try {
      setIsPending(true);
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId }),
      });

      if (!res.ok) {
        // Rollback on server error
        setIsBookmarked(!nextState);
        if (onToggle) {
          onToggle(!nextState);
        }
      } else {
        const data = await res.json();
        if (typeof data.bookmarked === "boolean") {
          setIsBookmarked(data.bookmarked);
        }
      }
    } catch (err) {
      console.error("[BookmarkButton] Failed to toggle bookmark:", err);
      // Rollback on network failure
      setIsBookmarked(!nextState);
      if (onToggle) {
        onToggle(!nextState);
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        title={isBookmarked ? "Remove from saved opportunities" : "Save opportunity to personal list"}
        aria-label={isBookmarked ? "Remove from saved opportunities" : "Save opportunity"}
        className={`group inline-flex items-center gap-1.5 transition-all duration-200 ${
          showLabel
            ? isBookmarked
              ? "rounded-lg border border-orbit-gold bg-orbit-paper px-3 py-1.5 text-xs font-medium text-orbit-gold-dark shadow-sm"
              : "rounded-lg border border-orbit-border bg-orbit-card px-3 py-1.5 text-xs font-medium text-orbit-subtle hover:bg-orbit-paper hover:text-orbit-brown"
            : isBookmarked
            ? "rounded-lg p-1.5 bg-orbit-gold-light/60 text-orbit-gold-dark"
            : "rounded-lg p-1.5 text-orbit-muted hover:bg-orbit-paper hover:text-orbit-brown"
        } ${className}`}
      >
        <Bookmark
          className={`h-4 w-4 transition-transform group-active:scale-90 ${
            isBookmarked
              ? "fill-orbit-gold text-orbit-gold-dark"
              : "text-orbit-muted group-hover:text-orbit-brown"
          }`}
        />
        {showLabel && (
          <span className="font-medium">
            {isBookmarked ? "Saved" : "Save"}
          </span>
        )}
      </button>

      {/* Modal rendered if user attempts to save while logged out */}
      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
    </>
  );
}
