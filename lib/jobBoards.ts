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
}

export interface JobBoardCategory {
  id: string;
  title: string;
  boards: JobBoard[];
}

export const jobBoardCategories: JobBoardCategory[] = [
  {
    id: "new-grad",
    title: "New grad & internships",
    boards: [
      { name: "ZeroToSudo", url: "https://www.instagram.com/stories/zero2sudo/" },
      { name: "Jobright.ai", url: "https://jobright.ai/" },
      { name: "Simplify", url: "https://simplify.jobs/" },
      { name: "Handshake", url: "https://joinhandshake.com/" },
      { name: "Summer 2027 Tech Internships by Vansh & Ouckah", url: "https://github.com/vanshb03/Summer2027-Internships"},
      {
        name: "SpeedyApply — 2027 SWE College Jobs",
        url: "https://github.com/speedyapply/2027-SWE-College-Jobs",
      },
      {
        name: "SimplifyJobs New Grad Positions",
        url: "https://github.com/SimplifyJobs/New-Grad-Positions",
      },
    ],
  },
  {
    id: "startups",
    title: "Startups",
    boards: [
      {
        name: "Y Combinator — Work at a Startup",
        url: "https://www.workatastartup.com/",
      },
      { name: "Wellfound", url: "https://wellfound.com/jobs" },
    ],
  },
  {
    id: "remote",
    title: "Remote-first",
    boards: [
      { name: "We Work Remotely", url: "https://weworkremotely.com/" },
      { name: "Remote OK", url: "https://remoteok.com/" },
    ],
  },
  {
    id: "aggregators",
    title: "The big aggregators",
    boards: [
      { name: "LinkedIn Jobs", url: "https://www.linkedin.com/jobs/" },
      { name: "Indeed", url: "https://www.indeed.com/" },
      {
        name: "Google Jobs",
        url: "https://www.google.com/search?q=software+engineer+jobs&ibp=htl;jobs",
      },
    ],
  },
];
