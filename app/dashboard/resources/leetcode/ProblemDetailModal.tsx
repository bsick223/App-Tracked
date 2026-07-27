import { RefObject } from "react";
import { ChevronRight, X } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { ALGORITHM_CATEGORIES, BIG_O_NOTATIONS } from "./constants";
import { LeetcodeProblem } from "./types";

type ProblemDetailModalProps = {
  selectedProblem: LeetcodeProblem | null;
  editedProblem: LeetcodeProblem | null;
  isEditingProblem: boolean;
  modalRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onCancelEdit: () => void;
  onSaveProblem: () => void;
  onToggleEdit: () => void;
  onMarkAsMastered: (problemId: Id<"leetcodeProblems">) => void;
  onUnmasterProblem: (problemId: Id<"leetcodeProblems">) => void;
};

export function ProblemDetailModal({
  selectedProblem,
  editedProblem,
  isEditingProblem,
  modalRef,
  onClose,
  onInputChange,
  onCancelEdit,
  onSaveProblem,
  onToggleEdit,
  onMarkAsMastered,
  onUnmasterProblem,
}: ProblemDetailModalProps) {
  if (!selectedProblem) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-20"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-gray-900 p-4 rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        data-problem-modal
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg">
            {isEditingProblem ? "Edit Problem" : "Problem Details"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isEditingProblem && editedProblem ? (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-1 text-sm">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={editedProblem.title}
                onChange={onInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1 text-sm">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={editedProblem.difficulty || ""}
                onChange={onInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 mb-1 text-sm">
                Score (1-5)
              </label>
              <select
                name="score"
                value={editedProblem.score}
                onChange={onInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value={1}>1 - Review tomorrow</option>
                <option value={2}>2 - Review in 2 days</option>
                <option value={3}>3 - Review in 3 days</option>
                <option value={4}>4 - Review in 4 days</option>
                <option value={5}>5 - Review in 5 days</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 mb-1 text-sm">
                Problem Link
              </label>
              <input
                type="url"
                name="link"
                value={editedProblem.link || ""}
                onChange={onInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="https://leetcode.com/problems/..."
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-400 mb-1 text-sm">
                  Time Complexity
                </label>
                <select
                  name="timeComplexity"
                  value={editedProblem.timeComplexity || ""}
                  onChange={onInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select complexity</option>
                  {BIG_O_NOTATIONS.map((notation) => (
                    <option key={notation} value={notation}>
                      {notation}
                    </option>
                  ))}
                </select>
                {editedProblem.timeComplexity === "Other" && (
                  <input
                    type="text"
                    name="customTimeComplexity"
                    value={editedProblem.customTimeComplexity || ""}
                    onChange={onInputChange}
                    className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g., O(m*n)"
                  />
                )}
              </div>
              <div className="flex-1">
                <label className="block text-gray-400 mb-1 text-sm">
                  Space Complexity
                </label>
                <select
                  name="spaceComplexity"
                  value={editedProblem.spaceComplexity || ""}
                  onChange={onInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select complexity</option>
                  {BIG_O_NOTATIONS.map((notation) => (
                    <option key={notation} value={notation}>
                      {notation}
                    </option>
                  ))}
                </select>
                {editedProblem.spaceComplexity === "Other" && (
                  <input
                    type="text"
                    name="customSpaceComplexity"
                    value={editedProblem.customSpaceComplexity || ""}
                    onChange={onInputChange}
                    className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g., O(m*n)"
                  />
                )}
              </div>
            </div>
            <div>
              <label className="block text-gray-400 mb-1 text-sm">Notes</label>
              <textarea
                name="notes"
                value={editedProblem.notes || ""}
                onChange={onInputChange}
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Add your notes here..."
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1 text-sm">
                Category
              </label>
              <select
                name="category"
                value={editedProblem.category || ""}
                onChange={onInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select category</option>
                {ALGORITHM_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={onCancelEdit}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={onSaveProblem}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              {selectedProblem.mastered && (
                <div className="flex justify-between items-center mb-2">
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded-full">
                    Mastered
                  </span>
                  <button
                    onClick={() => onUnmasterProblem(selectedProblem._id)}
                    className="text-xs text-gray-400 hover:text-white px-2 py-1 hover:bg-gray-800 rounded"
                  >
                    Move back to board
                  </button>
                </div>
              )}

              <h4 className="text-white text-xl mb-2">
                {selectedProblem.title}
              </h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedProblem.difficulty && (
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      selectedProblem.difficulty === "Easy"
                        ? "bg-green-500/20 text-green-300"
                        : selectedProblem.difficulty === "Medium"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {selectedProblem.difficulty}
                  </span>
                )}
                <span className="text-sm px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300">
                  Score: {selectedProblem.score}
                </span>

                {selectedProblem.category && (
                  <span className="text-sm px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                    {selectedProblem.category}
                  </span>
                )}
              </div>

              {selectedProblem.score === 5 && !selectedProblem.mastered && (
                <div className="bg-emerald-900/20 border border-emerald-800/30 rounded-md p-3 mt-2 mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="mastered-checkbox"
                      className="mr-2 h-4 w-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
                      onChange={() => onMarkAsMastered(selectedProblem._id)}
                    />
                    <label
                      htmlFor="mastered-checkbox"
                      className="text-emerald-300 text-sm"
                    >
                      Mark as mastered (achieved score of 5)
                    </label>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">
                    This will move the problem to your mastered list below the
                    board.
                  </p>
                </div>
              )}

              {(selectedProblem.timeComplexity ||
                selectedProblem.spaceComplexity) && (
                <div className="bg-gray-800/50 rounded-md p-2 mb-3">
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {selectedProblem.timeComplexity && (
                      <div className="text-sm">
                        <span className="text-gray-400">Time:</span>
                        <span className="text-white ml-1">
                          {selectedProblem.timeComplexity}
                        </span>
                      </div>
                    )}
                    {selectedProblem.spaceComplexity && (
                      <div className="text-sm">
                        <span className="text-gray-400">Space:</span>
                        <span className="text-white ml-1">
                          {selectedProblem.spaceComplexity}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedProblem.link && (
                <a
                  href={selectedProblem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center mb-4"
                >
                  <span>Open on Leetcode</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              )}
              <div className="border-t border-gray-800 my-4"></div>
              <div>
                <h5 className="text-gray-400 text-sm mb-1">Notes</h5>
                <p className="text-white whitespace-pre-wrap">
                  {selectedProblem.notes || "No notes added."}
                </p>
              </div>
              <div className="text-gray-500 text-xs mt-4">
                Last updated:{" "}
                {new Date(selectedProblem.updatedAt).toLocaleString()}
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              {!selectedProblem.mastered && (
                <button
                  onClick={onToggleEdit}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
                >
                  Edit Problem
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
