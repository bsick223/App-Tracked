import { RefObject } from "react";
import { X } from "lucide-react";
import { ALGORITHM_CATEGORIES, BIG_O_NOTATIONS } from "./constants";
import { LeetcodeProblemForm } from "./types";

type AddProblemModalProps = {
  isOpen: boolean;
  modalRef: RefObject<HTMLDivElement | null>;
  newProblem: LeetcodeProblemForm;
  onClose: () => void;
  onAddProblem: () => void;
  onInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  getTargetDayOfWeek: (score: number) => number;
};

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function AddProblemModal({
  isOpen,
  modalRef,
  newProblem,
  onClose,
  onAddProblem,
  onInputChange,
  getTargetDayOfWeek,
}: AddProblemModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-20"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-gray-900 p-4 rounded-lg w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white text-lg">Add Leetcode Problem</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1 text-sm">
              Problem Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={newProblem.title}
              onChange={onInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g., Two Sum"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1 text-sm">
              Difficulty
            </label>
            <select
              name="difficulty"
              value={newProblem.difficulty}
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
              Score <span className="text-red-500">*</span>
              <span className="text-xs ml-1 text-gray-500">
                (1-5, determines review schedule)
              </span>
            </label>
            <select
              name="score"
              value={newProblem.score}
              onChange={onInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              required
            >
              <option value={1}>1 - Review tomorrow</option>
              <option value={2}>2 - Review in 2 days</option>
              <option value={3}>3 - Review in 3 days</option>
              <option value={4}>4 - Review in 4 days</option>
              <option value={5}>5 - Review in 5 days</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {`This problem will be scheduled for ${
                DAYS_OF_WEEK[getTargetDayOfWeek(newProblem.score)]
              }`}
            </p>
          </div>

          <div>
            <label className="block text-gray-400 mb-1 text-sm">
              Problem Link
            </label>
            <input
              type="url"
              name="link"
              value={newProblem.link}
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
                value={newProblem.timeComplexity}
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
              {newProblem.timeComplexity === "Other" && (
                <input
                  type="text"
                  name="customTimeComplexity"
                  value={newProblem.customTimeComplexity}
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
                value={newProblem.spaceComplexity}
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
              {newProblem.spaceComplexity === "Other" && (
                <input
                  type="text"
                  name="customSpaceComplexity"
                  value={newProblem.customSpaceComplexity}
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
              value={newProblem.notes}
              onChange={onInputChange}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Add your notes, approach, or tips here..."
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1 text-sm">
              Category
            </label>
            <select
              name="category"
              value={newProblem.category}
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
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={onAddProblem}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
            >
              Add Problem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
