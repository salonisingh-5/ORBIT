import type { SerializedOpportunity } from "@/components/opportunities/opportunity-card";

export interface CalendarDay {
  date: Date;
  dateKey: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
}

export interface DaySchedule {
  date: Date;
  dateKey: string;
  deadlines: SerializedOpportunity[];
  events: SerializedOpportunity[];
  totalCount: number;
}

/**
 * Converts a Date or ISO string into a local 'YYYY-MM-DD' key for reliable day comparisons.
 */
export function formatDateKey(input: Date | string): string {
  const d = typeof input === "string" ? new Date(input) : input;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Checks if two dates represent the same calendar day.
 */
export function isSameDay(d1: Date | string, d2: Date | string): boolean {
  return formatDateKey(d1) === formatDateKey(d2);
}

/**
 * Generates the 35 or 42 grid cells for displaying a standard month view.
 * @param year e.g. 2026
 * @param month 0-indexed month (0 = Jan, 9 = Oct)
 */
export function getCalendarDays(year: number, month: number): CalendarDay[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = lastDayOfMonth.getDate();

  const days: CalendarDay[] = [];
  const todayKey = formatDateKey(new Date());

  // 1. Previous month padding days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const date = new Date(year, month - 1, dayNum);
    const dateKey = formatDateKey(date);
    days.push({
      date,
      dateKey,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateKey === todayKey,
      isPast: date.getTime() < new Date().setHours(0, 0, 0, 0),
    });
  }

  // 2. Current month days
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const date = new Date(year, month, dayNum);
    const dateKey = formatDateKey(date);
    days.push({
      date,
      dateKey,
      dayNumber: dayNum,
      isCurrentMonth: true,
      isToday: dateKey === todayKey,
      isPast: date.getTime() < new Date().setHours(0, 0, 0, 0),
    });
  }

  // 3. Next month padding days to complete full 7-day rows (up to 35 or 42 cells)
  const remainingCells = (7 - (days.length % 7)) % 7;
  // If we only have 28 or 35 days and need another row for visual consistency, standard is 35 or 42
  const targetTotal = days.length + remainingCells < 35 ? 35 : days.length + remainingCells;
  const trailingNeeded = targetTotal - days.length;

  for (let dayNum = 1; dayNum <= trailingNeeded; dayNum++) {
    const date = new Date(year, month + 1, dayNum);
    const dateKey = formatDateKey(date);
    days.push({
      date,
      dateKey,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateKey === todayKey,
      isPast: date.getTime() < new Date().setHours(0, 0, 0, 0),
    });
  }

  return days;
}

/**
 * Returns opportunities that have a registration deadline or an active event on this date.
 */
export function getOpportunitiesForDate(
  dateKey: string,
  opportunities: SerializedOpportunity[]
): DaySchedule {
  const deadlines: SerializedOpportunity[] = [];
  const events: SerializedOpportunity[] = [];

  for (const opp of opportunities) {
    const deadlineKey = formatDateKey(opp.deadline);
    if (deadlineKey === dateKey) {
      deadlines.push(opp);
    }

    if (opp.startDate) {
      const startKey = formatDateKey(opp.startDate);
      const endKey = opp.endDate ? formatDateKey(opp.endDate) : startKey;

      if (dateKey >= startKey && dateKey <= endKey) {
        // Only add to events if it's not already listed under deadlines for the same day
        events.push(opp);
      }
    }
  }

  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);

  return {
    date,
    dateKey,
    deadlines,
    events,
    totalCount: deadlines.length + events.length,
  };
}

/**
 * Groups opportunities by their upcoming deadlines chronologically for the Agenda view.
 */
export function getAgendaItems(
  opportunities: SerializedOpportunity[]
): Array<{
  dateKey: string;
  date: Date;
  deadlines: SerializedOpportunity[];
  events: SerializedOpportunity[];
}> {
  const map = new Map<
    string,
    { date: Date; deadlines: SerializedOpportunity[]; events: SerializedOpportunity[] }
  >();

  for (const opp of opportunities) {
    // Add deadline
    const dKey = formatDateKey(opp.deadline);
    if (!map.has(dKey)) {
      map.set(dKey, { date: new Date(opp.deadline), deadlines: [], events: [] });
    }
    map.get(dKey)!.deadlines.push(opp);

    // Add event start if available
    if (opp.startDate) {
      const sKey = formatDateKey(opp.startDate);
      if (!map.has(sKey)) {
        map.set(sKey, { date: new Date(opp.startDate), deadlines: [], events: [] });
      }
      map.get(sKey)!.events.push(opp);
    }
  }

  // Convert to sorted array by date
  return Array.from(map.entries())
    .map(([dateKey, val]) => ({
      dateKey,
      date: val.date,
      deadlines: val.deadlines,
      events: val.events,
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}
