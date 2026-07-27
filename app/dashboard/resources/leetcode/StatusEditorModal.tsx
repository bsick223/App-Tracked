import { RefObject } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { STATUS_COLORS } from "./constants";

type StatusEditorModalProps = {
  isAddingStatus: boolean;
  editingStatusId: Id<"leetcodeStatuses"> | null;
  newStatusFormRef: RefObject<HTMLDivElement | null>;
  colorPickerRef: RefObject<HTMLDivElement | null>;
  newStatusName: string;
  newStatusColor: string;
  editingStatusName: string;
  editingStatusColor: string;
  onNewStatusNameChange: (name: string) => void;
  onSelectColor: (color: string) => void;
  onCancel: () => void;
  onAddStatus: () => void;
  onUpdateStatus: (statusId: Id<"leetcodeStatuses">) => void;
};

export function StatusEditorModal({
  isAddingStatus,
  editingStatusId,
  newStatusFormRef,
  colorPickerRef,
  newStatusName,
  newStatusColor,
  editingStatusName,
  editingStatusColor,
  onNewStatusNameChange,
  onSelectColor,
  onCancel,
  onAddStatus,
  onUpdateStatus,
}: StatusEditorModalProps) {
  if (!isAddingStatus && !editingStatusId) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-20"
      onClick={onCancel}
    >
      <div
        ref={editingStatusId ? colorPickerRef : newStatusFormRef}
        className="bg-gray-900 p-4 rounded-lg w-80 max-w-full mx-4"
        onClick={(e) => e.stopPropagation()}
        data-color-picker
      >
        <h3 className="text-white text-lg mb-4">
          {editingStatusId ? "Edit Day Color" : "Add New Day"}
        </h3>
        {!editingStatusId && (
          <div className="mb-4">
            <label className="block text-gray-400 mb-1 text-sm">Name</label>
            <input
              type="text"
              value={newStatusName}
              onChange={(e) => onNewStatusNameChange(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Enter day name"
            />
          </div>
        )}
        {editingStatusId && (
          <div className="mb-4">
            <p className="text-gray-400 mb-1 text-sm">Name</p>
            <p className="text-white text-md font-medium">
              {editingStatusName}
            </p>
          </div>
        )}
        <div className="mb-6">
          <label className="block text-gray-400 mb-1 text-sm">Color</label>
          <div className="grid grid-cols-5 gap-2">
            {STATUS_COLORS.map((color) => (
              <button
                key={color.id}
                className={`w-10 h-10 rounded-full ${color.id} ${
                  (editingStatusId ? editingStatusColor : newStatusColor) ===
                  color.id
                    ? "ring-2 ring-white ring-opacity-60"
                    : ""
                }`}
                onClick={() => onSelectColor(color.id)}
                aria-label={`Select ${color.label} color`}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              editingStatusId
                ? onUpdateStatus(editingStatusId)
                : onAddStatus()
            }
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
          >
            {editingStatusId ? "Update Color" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
