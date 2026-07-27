import { ChevronDown, ChevronRight } from "lucide-react";
import { LeetcodeProblem } from "./types";

type MasteredProblemGroup = {
  category: string;
  problems: LeetcodeProblem[];
};

type MasteredProblemsSectionProps = {
  masteredProblems: LeetcodeProblem[];
  groupedMasteredProblems: MasteredProblemGroup[];
  collapsedCategories: Record<string, boolean>;
  onToggleCategory: (category: string) => void;
  onOpenProblem: (problem: LeetcodeProblem) => void;
};

export function MasteredProblemsSection({
  masteredProblems,
  groupedMasteredProblems,
  collapsedCategories,
  onToggleCategory,
  onOpenProblem,
}: MasteredProblemsSectionProps) {
  if (masteredProblems.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-gray-800 mt-4 mx-4">
      <div className="flex items-center justify-between pt-4 pb-2">
        <h2 className="text-lg font-medium text-white">Mastered Problems</h2>
        <span className="bg-emerald-500/20 text-emerald-300 text-sm px-2 py-1 rounded-full">
          {masteredProblems.length}{" "}
          {masteredProblems.length === 1 ? "problem" : "problems"}
        </span>
      </div>

      {groupedMasteredProblems.map((group) => (
        <div key={group.category} className="mb-6">
          <h3
            className="text-indigo-300 text-md font-medium mt-4 mb-2 border-b border-indigo-900/30 pb-1 flex items-center cursor-pointer"
            onClick={() => onToggleCategory(group.category)}
          >
            <span className="mr-2">
              {collapsedCategories[group.category] ? (
                <ChevronRight className="h-4 w-4 text-indigo-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-indigo-400" />
              )}
            </span>
            {group.category}{" "}
            <span className="text-sm text-indigo-400/60 ml-1">
              ({group.problems.length})
            </span>
          </h3>

          {!collapsedCategories[group.category] && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.problems.map((problem) => (
                <div
                  key={problem._id}
                  className="bg-[#121a36]/50 border border-emerald-800/30 p-3 rounded-md cursor-pointer hover:bg-[#1a2542]/50"
                  onClick={() => onOpenProblem(problem)}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium text-white">
                      {problem.title}
                    </h4>
                    {problem.difficulty && (
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full ${
                          problem.difficulty === "Easy"
                            ? "bg-green-500/20 text-green-300"
                            : problem.difficulty === "Medium"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                    )}
                  </div>
                  {problem.link && (
                    <a
                      href={problem.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block"
                    >
                      View Problem
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

