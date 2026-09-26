"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { SignInModal } from "@/components/auth/sign-in-modal";

export interface SerializedNotification {
  id: string;
  userId: string;
  opportunityId: string | null;
  opportunitySlug?: string | null;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [notifications, setNotifications] = useState<SerializedNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications when authenticated
  const fetchNotifications = async () => {
    if (status !== "authenticated" || !session?.user) return;

    try {
      setIsLoading(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("[NotificationBell] Failed to fetch:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [status, session]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const handleBellClick = () => {
    if (status !== "authenticated" || !session?.user) {
      setIsSignInOpen(true);
      return;
    }
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
    } catch (err) {
      console.error("[NotificationBell] Failed to mark read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
    } catch (err) {
      console.error("[NotificationBell] Failed to mark all read:", err);
    }
  };

  const formatRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={handleBellClick}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-orbit-border bg-orbit-card text-orbit-subtle transition hover:border-orbit-gold/60 hover:bg-orbit-paper hover:text-orbit-brown shadow-xs"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-2xl border border-orbit-border bg-orbit-card shadow-xl overflow-hidden transition-all duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-orbit-border/80 bg-orbit-paper/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm font-bold text-orbit-brown">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-orbit-gold-light/60 border border-orbit-gold/30 px-2 py-0.2 text-[10px] font-bold text-orbit-gold-dark">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-orbit-muted hover:text-orbit-brown transition"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-orbit-border/60">
            {isLoading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-orbit-muted">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-orbit-paper border border-orbit-border text-orbit-gold mb-3">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="font-serif text-sm font-bold text-orbit-brown">
                  All caught up!
                </p>
                <p className="mt-1 text-xs text-orbit-subtle">
                  No reminders or updates right now. Bookmark opportunities to receive deadline alerts.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isDeadline = notif.type === "DEADLINE_REMINDER";

                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.read) handleMarkAsRead(notif.id);
                    }}
                    className={`group relative flex items-start gap-3 p-3.5 text-xs transition cursor-pointer ${
                      notif.read
                        ? "bg-orbit-card hover:bg-orbit-paper/40"
                        : "bg-orbit-gold-light/15 hover:bg-orbit-gold-light/25 border-l-2 border-orbit-gold"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border text-[11px] ${
                        isDeadline
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-orbit-paper text-orbit-gold-dark border-orbit-border"
                      }`}
                    >
                      {isDeadline ? (
                        <Clock className="h-3.5 w-3.5" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4
                          className={`truncate text-xs ${
                            notif.read
                              ? "font-medium text-orbit-brown"
                              : "font-bold text-orbit-brown"
                          }`}
                        >
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-orbit-muted whitespace-nowrap">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>

                      <p className="mt-1 text-[11px] text-orbit-subtle line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      {notif.opportunitySlug && (
                        <div className="mt-2 flex items-center gap-2">
                          <Link
                            href={`/opportunities/${notif.opportunitySlug}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsOpen(false);
                              if (!notif.read) handleMarkAsRead(notif.id);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-orbit-gold-dark hover:underline"
                          >
                            <span>View details</span>
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Sign-in prompt modal if unauthenticated */}
      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
    </div>
  );
}
