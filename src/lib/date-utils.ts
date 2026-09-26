export function formatDeadlineCountdown(deadlineDate: string | Date): {
  label: string;
  isUrgent: boolean;
  isPassed: boolean;
} {
  const deadline = typeof deadlineDate === "string" ? new Date(deadlineDate) : deadlineDate;
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      label: "Deadline passed",
      isUrgent: false,
      isPassed: true,
    };
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 24) {
    return {
      label: diffHours <= 1 ? "Ends in ~1 hour" : `Ends in ${diffHours} hours`,
      isUrgent: true,
      isPassed: false,
    };
  }

  if (diffDays === 1) {
    return {
      label: "Ends tomorrow",
      isUrgent: true,
      isPassed: false,
    };
  }

  if (diffDays <= 5) {
    return {
      label: `${diffDays} days left`,
      isUrgent: true,
      isPassed: false,
    };
  }

  const formattedDate = deadline.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: deadline.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });

  return {
    label: `Deadline: ${formattedDate}`,
    isUrgent: false,
    isPassed: false,
  };
}

export function formatEventDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "TBA";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatEventTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return "";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
