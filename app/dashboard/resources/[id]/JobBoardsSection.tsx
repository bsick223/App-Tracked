"use client";

import { ExternalLink } from "lucide-react";
import { jobBoardCategories, type JobBoard } from "@/lib/jobBoards";

// Accent colors for the letter tiles, matching the dashboard's orange/purple/blue palette.
const TILE_ACCENTS = [
  "from-orange-500/30 to-orange-500/5 text-orange-300 border-orange-500/30",
  "from-purple-500/30 to-purple-500/5 text-purple-300 border-purple-500/30",
  "from-blue-500/30 to-blue-500/5 text-blue-300 border-blue-500/30",
];

function accentFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return TILE_ACCENTS[hash % TILE_ACCENTS.length];
}

function BoardCard({ board }: { board: JobBoard }) {
  return (
    <a
      href={board.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-start gap-4 rounded-md border border-[#20253d]/50 bg-[#0c1029]/70 p-4 transition-all duration-300 hover:border-[#2c3352] hover:bg-[#0c1029]"
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md border bg-gradient-to-br text-lg font-medium ${accentFor(
          board.name
        )}`}
        aria-hidden="true"
      >
        {board.name.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-sm font-light text-white transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:via-purple-500 group-hover:to-blue-500 group-hover:bg-clip-text group-hover:text-transparent">
            {board.name}
          </h4>
          {board.badge && (
            <span className="shrink-0 rounded-full border border-[#20253d] px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-400">
              {board.badge}
            </span>
          )}
          <ExternalLink className="ml-auto h-3.5 w-3.5 shrink-0 text-gray-600 transition-colors group-hover:text-gray-300" />
        </div>
        <p className="mt-1 text-xs leading-relaxed text-gray-400">
          {board.description}
        </p>
      </div>
    </a>
  );
}

export default function JobBoardsSection() {
  return (
    <div className="space-y-8">
      {jobBoardCategories.map((category) => (
        <section key={category.id}>
          <h3 className="text-lg font-light text-white">{category.title}</h3>
          <p className="mt-1 text-sm text-gray-400">{category.blurb}</p>

          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {category.boards.map((board) => (
              <BoardCard key={board.url} board={board} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
