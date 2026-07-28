// The curated job board list shown at /dashboard/resources/3 ("Where to find jobs?").
//
// This is the only file you need to edit to change what users see. Add, remove or
// reorder boards and categories here; the page renders straight from this array.
//
// Kept as plain data (rather than in the component) so it can be swapped for a
// Convex query later without touching any JSX.

export interface JobBoard {
  /** Display name, also used to generate the letter tile. */
  name: string;
  /** Full URL including protocol. Opened in a new tab. */
  url: string;
  /** One line on why this board is worth a user's time. */
  description: string;
  /** Optional short label, e.g. "Free", "Paid", "US only". */
  badge?: string;
}

export interface JobBoardCategory {
  id: string;
  title: string;
  /** Short framing sentence shown under the category heading. */
  blurb: string;
  boards: JobBoard[];
}

export const jobBoardCategories: JobBoardCategory[] = [
  {
    id: "aggregators",
    title: "The big aggregators",
    blurb:
      "Widest coverage, but also the most competition. Use these for volume, not for your best shots.",
    boards: [
      {
        name: "LinkedIn Jobs",
        url: "https://www.linkedin.com/jobs/",
        description:
          "Largest volume of postings and the only board where the referral path is built in.",
      },
      {
        name: "Indeed",
        url: "https://www.indeed.com/",
        description:
          "Broadest raw coverage, including small companies that post nowhere else.",
      },
      {
        name: "Google Jobs",
        url: "https://www.google.com/search?q=software+engineer+jobs&ibp=htl;jobs",
        description:
          "Pulls from most other boards at once. Good for a quick sweep before you commit to a site.",
      },
    ],
  },
  {
    id: "new-grad",
    title: "New grad & internships",
    blurb:
      "If you are early career, start here. These filter out the senior roles that waste most of your time.",
    boards: [
      {
        name: "Simplify",
        url: "https://simplify.jobs/",
        description:
          "Autofills applications and maintains one of the best-kept new grad lists.",
        badge: "Free",
      },
      {
        name: "Handshake",
        url: "https://joinhandshake.com/",
        description:
          "Campus recruiting pipeline. Less competition than public boards if your school is on it.",
      },
      {
        name: "GitHub New Grad Lists",
        url: "https://github.com/SimplifyJobs/New-Grad-Positions",
        description:
          "Community-maintained repos that often post roles within hours of them going live.",
        badge: "Free",
      },
    ],
  },
  {
    id: "startups",
    title: "Startups",
    blurb:
      "Smaller applicant pools and founders who actually read applications. Highest response rate per hour spent.",
    boards: [
      {
        name: "Y Combinator — Work at a Startup",
        url: "https://www.workatastartup.com/",
        description:
          "One profile applies across every YC company. Frequently a direct line to the founder.",
      },
      {
        name: "Wellfound",
        url: "https://wellfound.com/jobs",
        description:
          "Startup-only listings with salary and equity shown upfront.",
      },
    ],
  },
  {
    id: "remote",
    title: "Remote-first",
    blurb:
      "Boards where remote is the default rather than a filter you have to apply.",
    boards: [
      {
        name: "We Work Remotely",
        url: "https://weworkremotely.com/",
        description:
          "Long-running remote board with a steady flow of engineering roles.",
      },
      {
        name: "Remote OK",
        url: "https://remoteok.com/",
        description:
          "Salary data on most postings and an easy filter by stack.",
      },
    ],
  },
];
