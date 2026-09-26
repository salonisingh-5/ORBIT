"use client";

import {
  Sparkles,
  Trophy,
  Terminal,
  Code,
  BookOpen,
  Briefcase,
  Award,
  Layers,
} from "lucide-react";

export type CategoryFilterItem = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const CATEGORY_ITEMS: CategoryFilterItem[] = [
  { key: "ALL", label: "All Opportunities", icon: Sparkles },
  { key: "HACKATHON", label: "Hackathons", icon: Trophy },
  { key: "CTF", label: "CTFs & Security", icon: Terminal },
  { key: "CODING_CONTEST", label: "Coding Contests", icon: Code },
  { key: "WORKSHOP", label: "Workshops", icon: BookOpen },
  { key: "INTERNSHIP", label: "Internships", icon: Briefcase },
  { key: "COMPETITION", label: "Competitions", icon: Award },
  { key: "OTHER", label: "Other", icon: Layers },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts?: Record<string, number>;
}

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}: CategoryFilterProps) {
  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none scroll-smooth">
        {CATEGORY_ITEMS.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedCategory === item.key;
          const count =
            item.key === "ALL"
              ? categoryCounts
                ? Object.values(categoryCounts).reduce((a, b) => a + b, 0)
                : undefined
              : categoryCounts?.[item.key];

          return (
            <button
              key={item.key}
              onClick={() => onSelectCategory(item.key)}
              className={`group inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-medium transition-all duration-200 ${
                isSelected
                  ? "border border-orbit-gold bg-orbit-paper text-orbit-brown shadow-sm ring-1 ring-orbit-gold/30"
                  : "border border-orbit-border bg-orbit-card text-orbit-subtle hover:border-orbit-border-strong hover:bg-orbit-paper/60 hover:text-orbit-brown"
              }`}
            >
              <Icon
                className={`h-3.5 w-3.5 transition-colors ${
                  isSelected ? "text-orbit-gold-dark" : "text-orbit-muted group-hover:text-orbit-subtle"
                }`}
              />
              <span>{item.label}</span>
              {typeof count === "number" && (
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                    isSelected
                      ? "bg-orbit-gold-light text-orbit-gold-dark"
                      : "bg-orbit-paper text-orbit-muted"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
