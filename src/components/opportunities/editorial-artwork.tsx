import React from "react";

export function CampusArchArt({
  className = "",
  caption = "Explore • Learn • Grow",
}: {
  className?: string;
  caption?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-[2.5rem] border border-orbit-border bg-gradient-to-b from-[#F3ECE0] via-[#E8DFD0] to-[#DDD2BF] p-6 shadow-sm ${className}`}
    >
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.6),transparent_70%)]" />

      {/* Architectural Arched Frame */}
      <div className="relative w-full max-w-[280px] h-[340px] flex flex-col items-center justify-between rounded-t-[140px] rounded-b-2xl border-2 border-orbit-border-strong/70 bg-[#F8F5EE]/90 p-5 shadow-inner overflow-hidden">
        {/* Sky / Arch interior texture */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#E3EDF6]/70 via-[#F3ECE0]/50 to-[#EAE1D1]/90 pointer-events-none" />

        {/* Decorative campus tower & arches illustration */}
        <svg
          className="absolute inset-x-0 bottom-12 mx-auto w-[240px] h-[220px] opacity-85"
          viewBox="0 0 240 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Campus Hall Base */}
          <path
            d="M20 220V120H220V220"
            stroke="#8B7B68"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Base Pillars & Windows */}
          <line x1="20" y1="180" x2="220" y2="180" stroke="#B5A490" strokeWidth="1" />
          <line x1="20" y1="145" x2="220" y2="145" stroke="#B5A490" strokeWidth="1" />

          {/* Arched windows in campus building */}
          <path d="M40 180V160A10 10 0 0 1 60 160V180" stroke="#8B7B68" strokeWidth="1.5" fill="#E8DFCE" />
          <path d="M75 180V160A10 10 0 0 1 95 160V180" stroke="#8B7B68" strokeWidth="1.5" fill="#E8DFCE" />
          <path d="M145 180V160A10 10 0 0 1 165 160V180" stroke="#8B7B68" strokeWidth="1.5" fill="#E8DFCE" />
          <path d="M180 180V160A10 10 0 0 1 200 160V180" stroke="#8B7B68" strokeWidth="1.5" fill="#E8DFCE" />

          {/* Central Portal Arch */}
          <path
            d="M100 220V175A20 20 0 0 1 140 175V220"
            stroke="#635445"
            strokeWidth="2"
            fill="#DDD3C1"
          />

          {/* Central Clock Tower */}
          <rect x="95" y="45" width="50" height="75" stroke="#8B7B68" strokeWidth="1.5" fill="#EFE8DC" />
          <polygon points="90,45 120,10 150,45" stroke="#8B7B68" strokeWidth="1.5" fill="#D9CCA8" />

          {/* Tower Clock Face */}
          <circle cx="120" cy="75" r="14" stroke="#B89758" strokeWidth="1.5" fill="#FFFFFF" />
          <line x1="120" y1="75" x2="120" y2="67" stroke="#0F2847" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="120" y1="75" x2="126" y2="75" stroke="#0F2847" strokeWidth="1.5" strokeLinecap="round" />

          {/* Spire with Orbit Compass Star */}
          <line x1="120" y1="10" x2="120" y2="2" stroke="#B89758" strokeWidth="1.5" />
          <path
            d="M120 0L122 3L125 3.5L122 4.5L120 7L118 4.5L115 3.5L118 3Z"
            fill="#C5A869"
          />
        </svg>

        {/* Botanical Olive / Eucalyptus Leaf Branch overlay */}
        <svg
          className="absolute -right-3 bottom-10 w-[110px] h-[190px] pointer-events-none drop-shadow-sm opacity-90"
          viewBox="0 0 110 190"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Stem */}
          <path
            d="M95 190C85 140 60 90 20 20"
            stroke="#5A6D57"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Leaves */}
          <path d="M20 20C15 10 28 5 35 15C42 25 30 30 20 20Z" fill="#758B71" />
          <path d="M42 45C32 35 48 30 58 42C65 52 52 55 42 45Z" fill="#6A8066" />
          <path d="M35 70C22 65 32 50 45 60C55 68 45 75 35 70Z" fill="#7F947B" />
          <path d="M58 95C48 85 65 80 75 92C82 102 68 105 58 95Z" fill="#6A8066" />
          <path d="M50 125C38 120 48 105 60 115C70 122 62 130 50 125Z" fill="#758B71" />
          <path d="M72 150C62 140 80 135 90 148C95 158 82 160 72 150Z" fill="#60755C" />
        </svg>

        {/* Floating Sparkle Stars */}
        <div className="absolute top-8 left-8 text-orbit-gold">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" />
          </svg>
        </div>
        <div className="absolute top-16 right-9 text-orbit-gold/70">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" />
          </svg>
        </div>

        {/* Cursive / Elegant Caption Overlay at bottom */}
        <div className="relative z-10 mt-auto w-full pt-4 pb-1 text-center">
          <p className="font-serif italic text-base sm:text-lg font-medium text-orbit-navy drop-shadow-sm tracking-wide">
            {caption}
          </p>
        </div>
      </div>
    </div>
  );
}

export function CampusArchMiniArt({
  className = "",
  caption = "Same campus. Bigger dreams.",
}: {
  className?: string;
  caption?: string;
}) {
  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border border-orbit-border bg-gradient-to-b from-[#F2ECE0] via-[#E8DEC9] to-[#DDD0B7] p-6 shadow-sm ${className}`}
    >
      {/* Background Arched Motif */}
      <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
        <div className="w-[180px] h-[240px] rounded-t-full border-2 border-orbit-brown/40" />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Top badge / label */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-orbit-muted">
            RVCE Community
          </span>
          <svg className="h-4 w-4 text-orbit-gold" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" />
          </svg>
        </div>

        {/* Center illustration of campus arch */}
        <div className="my-6 flex justify-center">
          <div className="relative w-28 h-36 rounded-t-full border border-orbit-border-strong bg-[#FBF9F5] shadow-inner flex flex-col items-center justify-end p-2 overflow-hidden">
            <div className="w-16 h-20 rounded-t-full border border-orbit-border bg-[#EFE9DC] flex items-center justify-center">
              <svg className="h-8 w-8 text-orbit-gold" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" />
              </svg>
            </div>
            {/* Leaves overlay */}
            <div className="absolute -right-1 bottom-1 text-emerald-800/60 text-xs">
              🌿
            </div>
          </div>
        </div>

        {/* Bottom serif italic caption */}
        <div className="text-center pt-2">
          <p className="font-serif italic text-lg font-bold text-orbit-navy leading-snug">
            &ldquo;{caption}&rdquo;
          </p>
          <p className="mt-1 text-[11px] text-orbit-subtle">
            RV College of Engineering • Bengaluru
          </p>
        </div>
      </div>
    </div>
  );
}
