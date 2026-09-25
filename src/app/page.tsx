import Link from "next/link";
import { Search, Sparkles, Filter, Code, Terminal, Trophy, BookOpen, Briefcase, Award } from "lucide-react";

const CATEGORIES = [
  { label: "All Opportunities", icon: Sparkles, active: true },
  { label: "Hackathons", icon: Trophy, active: false },
  { label: "CTFs & Security", icon: Terminal, active: false },
  { label: "Coding Contests", icon: Code, active: false },
  { label: "Workshops", icon: BookOpen, active: false },
  { label: "Internships", icon: Briefcase, active: false },
  { label: "Competitions", icon: Award, active: false },
];

export default function HomePage() {
  return (
    <div className="flex-1 pb-16">
      {/* Editorial Hero */}
      <section className="border-b border-orbit-border bg-gradient-to-b from-orbit-paper/40 via-orbit-ivory to-orbit-ivory px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-orbit-gold/30 bg-orbit-gold-light/60 px-4 py-1 text-xs font-medium text-orbit-gold-dark mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Curated for RV College of Engineering</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-orbit-brown leading-[1.15]">
            Discover what's happening.
            <br />
            <span className="italic font-normal text-orbit-subtle">Never miss a deadline.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-orbit-subtle leading-relaxed">
            Hackathons, CTFs, workshops, coding contests, and internships across RVCE clubs and student communities — all in one calm, editorial space.
          </p>

          {/* Search Box */}
          <div className="mx-auto mt-10 max-w-2xl">
            <div className="relative flex items-center rounded-xl border border-orbit-border bg-orbit-card p-1.5 shadow-sm transition-all focus-within:border-orbit-gold focus-within:ring-2 focus-within:ring-orbit-gold/20">
              <Search className="ml-3 h-5 w-5 text-orbit-muted" />
              <input
                type="text"
                placeholder="Search opportunities by title, club, tag, or topic..."
                className="w-full bg-transparent px-3 py-2 text-sm text-orbit-brown placeholder:text-orbit-muted focus:outline-none"
              />
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg bg-orbit-brown px-4 py-2 text-xs font-medium text-orbit-ivory transition-colors hover:bg-black"
              >
                <Filter className="h-3.5 w-3.5" />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills & Feed Section */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <button
                key={i}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                  cat.active
                    ? "border border-orbit-gold bg-orbit-paper text-orbit-brown shadow-sm"
                    : "border border-orbit-border bg-orbit-card text-orbit-subtle hover:border-orbit-border-strong hover:bg-orbit-paper/60"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${cat.active ? "text-orbit-gold" : "text-orbit-muted"}`} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Placeholder / Empty Feed Notice */}
        <div className="mt-8 rounded-2xl border border-dashed border-orbit-border bg-orbit-paper/30 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orbit-paper text-orbit-gold mb-4 border border-orbit-border">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-orbit-brown">
            Opportunity Feed Ready for Seeding
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-orbit-subtle leading-relaxed">
            Phase 1 foundation is being configured. Club-submitted events, hackathons, and CTFs will populate here in Phase 2.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/calendar"
              className="rounded-lg border border-orbit-border bg-orbit-card px-4 py-2 text-xs font-medium text-orbit-brown transition-colors hover:bg-orbit-paper"
            >
              View Calendar
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
