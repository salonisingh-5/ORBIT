// Seed data for ORBIT — realistic RVCE clubs and opportunities
// Used as fallback when PostgreSQL is unavailable and for database seeding

export interface SeedClub {
  name: string;
  slug: string;
  description: string;
  logoUrl: string | null;
  websiteUrl: string | null;
}

export interface SeedOpportunity {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: "HACKATHON" | "CTF" | "CODING_CONTEST" | "WORKSHOP" | "INTERNSHIP" | "COMPETITION" | "OTHER";
  officialUrl: string;
  deadline: string;
  startDate: string | null;
  endDate: string | null;
  location: string;
  status: "APPROVED";
  clubSlug: string;
  clubName: string;
  createdAt: string;
}

// ─── RVCE Clubs ────────────────────────────────────────────────────────────────

export const SEED_CLUBS: SeedClub[] = [
  {
    name: "Coding Club RVCE",
    slug: "coding-club-rvce",
    description:
      "The premier competitive programming and software engineering community at RVCE. Hosts weekly contests, algorithmic duels, and workshops on systems design, data structures, and open-source contributions.",
    logoUrl: null,
    websiteUrl: "https://codingclub.rvce.edu.in",
  },
  {
    name: "IEEE RVCE Student Branch",
    slug: "ieee-rvce",
    description:
      "RVCE's IEEE Student Branch promotes technical excellence through research symposiums, paper presentations, CTF cybersecurity challenges, and interdisciplinary tech events spanning IoT, AI/ML, and VLSI.",
    logoUrl: null,
    websiteUrl: "https://ieee.rvce.edu.in",
  },
  {
    name: "Team Astra Robotics",
    slug: "team-astra-robotics",
    description:
      "A multidisciplinary robotics team at RVCE competing in national and international autonomous vehicle, drone racing, and industrial automation challenges. Known for Mars Rover prototypes.",
    logoUrl: null,
    websiteUrl: null,
  },
  {
    name: "RVCE E-Cell",
    slug: "rvce-ecell",
    description:
      "RVCE's Entrepreneurship Cell nurturing student startups through pitch competitions, founder fireside chats, venture capital bootcamps, and the annual VentureX inter-college startup showcase.",
    logoUrl: null,
    websiteUrl: "https://ecell.rvce.edu.in",
  },
  {
    name: "GDG on Campus RVCE",
    slug: "gdg-on-campus-rvce",
    description:
      "Google Developer Groups on Campus chapter at RVCE. Organizes hands-on workshops on Flutter, Firebase, Google Cloud, TensorFlow, and annual DevFest and Solution Challenge hackathons.",
    logoUrl: null,
    websiteUrl: null,
  },
];

// ─── RVCE Opportunities ────────────────────────────────────────────────────────

export const SEED_OPPORTUNITIES: SeedOpportunity[] = [
  {
    id: "opp-8th-mile-hack-2026",
    title: "8th Mile National Hackathon 2026",
    slug: "8th-mile-national-hackathon-2026",
    description:
      "RVCE's flagship 36-hour national hackathon hosted during the 8th Mile cultural fest. ₹2,00,000 total prize pool across four tracks: HealthTech, EdTech, FinTech, and Sustainability. Teams of 2–4 students build functional prototypes judged on innovation, feasibility, and impact. Mentors from Google, Microsoft, and Flipkart available on-site. Free meals, swag kits, and cloud credits for all participants.",
    category: "HACKATHON",
    officialUrl: "https://8thmile.rvce.edu.in/hackathon",
    deadline: "2026-10-18T23:59:00.000Z",
    startDate: "2026-10-25T09:00:00.000Z",
    endDate: "2026-10-26T21:00:00.000Z",
    location: "RVCE Campus — Seminar Hall Complex",
    status: "APPROVED",
    clubSlug: "coding-club-rvce",
    clubName: "Coding Club RVCE",
    createdAt: "2026-09-10T10:00:00.000Z",
  },
  {
    id: "opp-cybershield-ctf-v4",
    title: "RVCE CyberShield CTF v4",
    slug: "rvce-cybershield-ctf-v4",
    description:
      "Fourth edition of RVCE's competitive Capture-the-Flag cybersecurity contest. Challenges span binary exploitation, web application security, cryptographic attacks, reverse engineering, and OSINT forensics. Individual or team participation (max 3). Top 3 teams receive cash prizes and internship referrals to cybersecurity firms. 48-hour online jeopardy format followed by a live finals round on campus.",
    category: "CTF",
    officialUrl: "https://ctf.ieee-rvce.org",
    deadline: "2026-10-08T23:59:00.000Z",
    startDate: "2026-10-12T18:00:00.000Z",
    endDate: "2026-10-14T18:00:00.000Z",
    location: "Online (Finals: RVCE CS Block Lab 4)",
    status: "APPROVED",
    clubSlug: "ieee-rvce",
    clubName: "IEEE RVCE Student Branch",
    createdAt: "2026-09-05T08:30:00.000Z",
  },
  {
    id: "opp-codeblitz-2026",
    title: "CodeBlitz: Algorithmic Duel 2026",
    slug: "codeblitz-algorithmic-duel-2026",
    description:
      "A high-intensity ICPC-style competitive programming contest with 8 problems of increasing difficulty across graph theory, dynamic programming, number theory, and string algorithms. Timed at 3 hours. Individual participation. Ranked on Codeforces-style scoring with partial marks. Winners receive coding gear, premium competitive programming subscriptions, and placement interview fast-track passes.",
    category: "CODING_CONTEST",
    officialUrl: "https://codingclub.rvce.edu.in/codeblitz",
    deadline: "2026-10-05T23:59:00.000Z",
    startDate: "2026-10-10T14:00:00.000Z",
    endDate: "2026-10-10T17:00:00.000Z",
    location: "Online (Codeforces Mirror)",
    status: "APPROVED",
    clubSlug: "coding-club-rvce",
    clubName: "Coding Club RVCE",
    createdAt: "2026-09-12T14:00:00.000Z",
  },
  {
    id: "opp-rust-systems-workshop",
    title: "Hands-on Rust & Systems Engineering Workshop",
    slug: "rust-systems-engineering-workshop",
    description:
      "A comprehensive 2-day workshop covering Rust fundamentals, ownership & borrowing, async Tokio runtime, building CLI tools, and systems-level programming patterns. Led by Rustaceans from Hasura and DeepSource. Bring your laptop with Rust 1.78+ installed. Certificate of completion and workshop materials provided. Limited to 60 seats.",
    category: "WORKSHOP",
    officialUrl: "https://gdg-rvce.dev/rust-workshop",
    deadline: "2026-10-22T23:59:00.000Z",
    startDate: "2026-10-28T09:30:00.000Z",
    endDate: "2026-10-29T17:00:00.000Z",
    location: "RVCE Campus — Innovation Center, Room 302",
    status: "APPROVED",
    clubSlug: "gdg-on-campus-rvce",
    clubName: "GDG on Campus RVCE",
    createdAt: "2026-09-15T11:00:00.000Z",
  },
  {
    id: "opp-aiml-fellowship",
    title: "Summer AI/ML Research Fellowship 2027",
    slug: "summer-aiml-research-fellowship-2027",
    description:
      "An 8-week on-campus research internship at RVCE's Center for Imaging Technologies & Applied Speech Processing. Work alongside faculty on computer vision, NLP, or reinforcement learning projects. Monthly stipend of ₹15,000. Open to 3rd and 4th year CSE, ISE, ECE, and AI/ML students with a CGPA ≥ 7.5. Research output may lead to IEEE/Springer conference publications.",
    category: "INTERNSHIP",
    officialUrl: "https://research.rvce.edu.in/aiml-fellowship",
    deadline: "2026-11-15T23:59:00.000Z",
    startDate: "2027-01-06T09:00:00.000Z",
    endDate: "2027-02-28T17:00:00.000Z",
    location: "RVCE Campus — CITASP Research Lab",
    status: "APPROVED",
    clubSlug: "ieee-rvce",
    clubName: "IEEE RVCE Student Branch",
    createdAt: "2026-09-20T09:00:00.000Z",
  },
  {
    id: "opp-venturex-2026",
    title: "VentureX: Inter-College Startup Pitch Competition",
    slug: "venturex-inter-college-startup-pitch-2026",
    description:
      "RVCE E-Cell's marquee annual startup pitch event. Teams of 1–4 present a 7-minute pitch + live demo to a panel of VCs, angel investors, and founders. ₹1,50,000 seed grant for the winner, incubation support through RVCE Innovation Hub, and mentorship from Axilor Ventures. Open to students from any engineering college in Karnataka.",
    category: "COMPETITION",
    officialUrl: "https://ecell.rvce.edu.in/venturex",
    deadline: "2026-10-30T23:59:00.000Z",
    startDate: "2026-11-08T10:00:00.000Z",
    endDate: "2026-11-08T18:00:00.000Z",
    location: "RVCE Campus — Dr. M.K. Panduranga Setty Auditorium",
    status: "APPROVED",
    clubSlug: "rvce-ecell",
    clubName: "RVCE E-Cell",
    createdAt: "2026-09-18T10:30:00.000Z",
  },
  {
    id: "opp-flutter-forward",
    title: "Flutter Forward: Build Your First Production App",
    slug: "flutter-forward-production-app-workshop",
    description:
      "A weekend-long guided workshop on building production-ready cross-platform mobile applications using Flutter and Firebase. Covers Material 3 theming, state management with Riverpod, Firestore real-time sync, and deploying to Google Play and Apple TestFlight. Aimed at intermediate developers. Participants ship a working app by Sunday afternoon. Hosted by Google Developer Experts.",
    category: "WORKSHOP",
    officialUrl: "https://gdg-rvce.dev/flutter-forward",
    deadline: "2026-11-02T23:59:00.000Z",
    startDate: "2026-11-08T09:00:00.000Z",
    endDate: "2026-11-09T17:00:00.000Z",
    location: "RVCE Campus — GDG Lab, CSE Block",
    status: "APPROVED",
    clubSlug: "gdg-on-campus-rvce",
    clubName: "GDG on Campus RVCE",
    createdAt: "2026-09-22T16:00:00.000Z",
  },
  {
    id: "opp-robowar-2026",
    title: "RoboWar Arena: National Robotics Combat Championship",
    slug: "robowar-arena-national-robotics-combat-2026",
    description:
      "Team Astra's annual combat robotics event where student-built bots compete in a 12×12 ft steel arena. Weight categories: 15kg and 30kg. Judged on damage dealt, aggression, and control. Winning bots receive cash prizes, industrial sponsorship deals, and invitations to the Asia RoboCombat League qualifiers. Safety briefing mandatory.",
    category: "COMPETITION",
    officialUrl: "https://astra.rvce.edu.in/robowar",
    deadline: "2026-10-15T23:59:00.000Z",
    startDate: "2026-11-01T08:00:00.000Z",
    endDate: "2026-11-02T20:00:00.000Z",
    location: "RVCE Campus — Open-Air Arena (Near Mechanical Block)",
    status: "APPROVED",
    clubSlug: "team-astra-robotics",
    clubName: "Team Astra Robotics",
    createdAt: "2026-09-08T07:00:00.000Z",
  },
  {
    id: "opp-devfest-rvce-2026",
    title: "DevFest RVCE 2026",
    slug: "devfest-rvce-2026",
    description:
      "GDG on Campus RVCE's annual developer festival featuring keynote talks by Google Developer Experts, hands-on codelabs on Gemini API, Google Cloud, and Android development, a mini-hackathon challenge, and networking sessions. Free entry for all RVCE students. External college students can register for a nominal fee. Lunch, snacks, and swag included.",
    category: "HACKATHON",
    officialUrl: "https://gdg-rvce.dev/devfest-2026",
    deadline: "2026-11-10T23:59:00.000Z",
    startDate: "2026-11-22T09:00:00.000Z",
    endDate: "2026-11-22T19:00:00.000Z",
    location: "RVCE Campus — Main Seminar Hall",
    status: "APPROVED",
    clubSlug: "gdg-on-campus-rvce",
    clubName: "GDG on Campus RVCE",
    createdAt: "2026-09-25T12:00:00.000Z",
  },
];
