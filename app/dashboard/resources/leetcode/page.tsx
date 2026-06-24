"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import {
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  MoreVertical,
  AlertCircle,
  Columns,
} from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Toast } from "@/app/components/Toast";
import { useSwipeable } from "react-swipeable";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  clearProblemDropIndicators,
  leetcodeStyles,
  PROBLEM_DROP_CLASS_BY_POSITION,
  TOUCH_TARGET_CLASSES,
} from "./dragStyles";
import {
  LeetcodeProblem,
  LeetcodeProblemForm,
  LeetcodeStatus,
  ToastMessage,
} from "./types";
import { formatTimeElapsed } from "./utils";
import { MasteredProblemsSection } from "./MasteredProblemsSection";
import { StatusEditorModal } from "./StatusEditorModal";
import { AddProblemModal } from "./AddProblemModal";
import { ProblemDetailModal } from "./ProblemDetailModal";

export default function LeetcodeTrackerPage() {
  const { user } = useUser();
  const [statuses, setStatuses] = useState<LeetcodeStatus[]>([]);
  const [problems, setProblems] = useState<LeetcodeProblem[]>([]);
  const [masteredProblems, setMasteredProblems] = useState<LeetcodeProblem[]>(
    []
  );
  const [groupedMasteredProblems, setGroupedMasteredProblems] = useState<
    {
      category: string;
      problems: LeetcodeProblem[];
    }[]
  >([]);
  const [collapsedCategories, setCollapsedCategories] = useState<{
    [key: string]: boolean;
  }>({});
  const [isAddingStatus, setIsAddingStatus] = useState(false);
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusColor, setNewStatusColor] = useState("bg-blue-500");
  const [editingStatusId, setEditingStatusId] =
    useState<Id<"leetcodeStatuses"> | null>(null);
  const [editingStatusName, setEditingStatusName] = useState("");
  const [editingStatusColor, setEditingStatusColor] = useState("");
  const [selectedProblem, setSelectedProblem] =
    useState<LeetcodeProblem | null>(null);
  const [isEditingProblem, setIsEditingProblem] = useState(false);
  const [editedProblem, setEditedProblem] = useState<LeetcodeProblem | null>(
    null
  );
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // New mobile-specific state
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);
  const [showingAllColumns, setShowingAllColumns] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Refs for click outside detection
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const newStatusFormRef = useRef<HTMLDivElement>(null);
  const problemModalRef = useRef<HTMLDivElement>(null);

  // Add these to the state variables
  const [isDraggingProblem, setIsDraggingProblem] = useState(false);
  const [draggedProblemId, setDraggedProblemId] =
    useState<Id<"leetcodeProblems"> | null>(null);
  const [dropTargetId, setDropTargetId] =
    useState<Id<"leetcodeProblems"> | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(
    null
  );

  // Add these below the existing state variables
  const [touchDragging, setTouchDragging] = useState(false);
  const [touchCurrentTarget, setTouchCurrentTarget] =
    useState<HTMLElement | null>(null);
  const [ghostElement, setGhostElement] = useState<HTMLElement | null>(null);

  // Add a state for showing mobile instructions
  const [showDragInstructions, setShowDragInstructions] = useState(false);

  // Add new problem state
  const [isAddingProblem, setIsAddingProblem] = useState(false);
  const [newProblem, setNewProblem] = useState<LeetcodeProblemForm>({
    title: "",
    link: "",
    notes: "",
    score: 1,
    spaceComplexity: "",
    timeComplexity: "",
    customSpaceComplexity: "",
    customTimeComplexity: "",
    category: "",
    difficulty: "",
  });
  const addProblemModalRef = useRef<HTMLDivElement>(null);

  // Get status data from Convex
  const statusesData = useQuery(api.leetcodeStatuses.listByUser, {
    userId: user?.id || "",
  });

  // Get problem data from Convex
  const problemsData = useQuery(api.leetcodeProblems.listByUser, {
    userId: user?.id || "",
  });

  // Convex mutations
  const initializeDefaultStatuses = useMutation(
    api.leetcodeStatuses.initializeDefaultStatuses
  );
  const createStatus = useMutation(api.leetcodeStatuses.create);
  const updateStatus = useMutation(api.leetcodeStatuses.update);
  const removeStatus = useMutation(api.leetcodeStatuses.remove);
  const updateProblemStatus = useMutation(api.leetcodeProblems.updateStatus);
  const updateProblem = useMutation(api.leetcodeProblems.update);
  const removeProblem = useMutation(api.leetcodeProblems.remove);
  const updateProblemOrder = useMutation(api.leetcodeProblems.updateOrder);
  const createProblem = useMutation(api.leetcodeProblems.create);

  // Initialize default statuses for new users
  useEffect(() => {
    if (user && statusesData !== undefined && statusesData.length === 0) {
      initializeDefaultStatuses({ userId: user.id });
    }
  }, [user, statusesData, initializeDefaultStatuses]);

  // Update state when Convex data changes
  useEffect(() => {
    if (statusesData) {
      setStatuses(statusesData);
    }
  }, [statusesData]);

  useEffect(() => {
    if (problemsData) {
      // Split problems into active and mastered
      const active: LeetcodeProblem[] = [];
      const mastered: LeetcodeProblem[] = [];

      problemsData.forEach((problem) => {
        const problemWithOptionalMastered = problem as LeetcodeProblem;
        if (problemWithOptionalMastered.mastered) {
          mastered.push(problemWithOptionalMastered);
        } else {
          active.push(problemWithOptionalMastered);
        }
      });

      setProblems(active);
      setMasteredProblems(mastered);
    }
  }, [problemsData]);

  // Reset active column index when statuses change
  useEffect(() => {
    if (statuses && statuses.length > 0) {
      setActiveColumnIndex((prev) => (prev >= statuses.length ? 0 : prev));
    }
  }, [statuses]);

  // Add this useEffect for mobile instructions
  useEffect(() => {
    if (isMobile && showingAllColumns) {
      setShowDragInstructions(true);
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        setShowDragInstructions(false);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [isMobile, showingAllColumns]);

  // Swipe handlers for mobile column navigation
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (!isMobile || showingAllColumns) return;
      setActiveColumnIndex((prev) => Math.min(prev + 1, statuses.length - 1));
    },
    onSwipedRight: () => {
      if (!isMobile || showingAllColumns) return;
      setActiveColumnIndex((prev) => Math.max(prev - 1, 0));
    },
    trackMouse: false,
  });

  // Function to navigate to a specific column by index
  const navigateToColumn = (index: number) => {
    if (index >= 0 && index < statuses.length) {
      setActiveColumnIndex(index);
    }
  };

  // Toggle between single column and all columns view
  const toggleColumnsView = () => {
    setShowingAllColumns(!showingAllColumns);
  };

  // Scroll horizontally on desktop
  const scrollContainer = (direction: "left" | "right") => {
    const container = document.getElementById("columns-container");
    if (container) {
      const scrollAmount = direction === "left" ? -300 : 300;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Drag and drop functions for problems
  const handleDragStart = (
    e: React.DragEvent,
    problemId: Id<"leetcodeProblems">
  ) => {
    setIsDraggingProblem(true);
    setDraggedProblemId(problemId);

    // Add data to the drag event
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ type: "problem", id: problemId })
    );

    // Set the drag image
    const draggedElement = e.currentTarget as HTMLElement;
    if (draggedElement) {
      // Create ghost image with same dimensions but semi-transparent
      const rect = draggedElement.getBoundingClientRect();
      const ghost = draggedElement.cloneNode(true) as HTMLElement;

      ghost.style.width = `${rect.width}px`;
      ghost.style.height = `${rect.height}px`;
      ghost.style.transform = "rotate(3deg)";
      ghost.style.opacity = "0.8";
      ghost.style.position = "absolute";
      ghost.style.top = "-1000px";
      ghost.style.left = "-1000px";

      // Add it to the DOM temporarily
      document.body.appendChild(ghost);

      // Set as drag image
      e.dataTransfer.setDragImage(ghost, rect.width / 2, 20);

      // Clean up after drag operation
      setTimeout(() => {
        document.body.removeChild(ghost);
      }, 0);
    }
  };

  const handleDragEnd = () => {
    setIsDraggingProblem(false);
    setDraggedProblemId(null);
    setDropTargetId(null);
    setDropPosition(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();

    if (!isDraggingProblem) return;

    // Find the problem element we're dragging over
    let problemElement = e.target as HTMLElement;
    while (
      problemElement &&
      !problemElement.hasAttribute("data-problem-id") &&
      problemElement !== e.currentTarget
    ) {
      problemElement = problemElement.parentElement as HTMLElement;
    }

    if (
      problemElement &&
      problemElement.hasAttribute("data-problem-id") &&
      problemElement !== e.currentTarget
    ) {
      const targetId = problemElement.getAttribute(
        "data-problem-id"
      ) as Id<"leetcodeProblems">;

      if (targetId !== draggedProblemId) {
        const rect = problemElement.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const position = e.clientY < midY ? "before" : "after";

        setDropTargetId(targetId);
        setDropPosition(position);

        // Remove any existing hover classes
        clearProblemDropIndicators();

        // Add appropriate hover class
        problemElement.classList.add(PROBLEM_DROP_CLASS_BY_POSITION[position]);
      }
    } else {
      // We're just over the column but not a specific problem
      setDropTargetId(null);
      setDropPosition(null);

      // Remove any existing hover classes
      clearProblemDropIndicators();
    }
  };

  const handleProblemDrop = async (e: React.DragEvent) => {
    e.preventDefault();

    // Remove any existing hover classes
    clearProblemDropIndicators();

    if (!isDraggingProblem) return;

    // Get the data from the drag event
    const data = e.dataTransfer.getData("text/plain");
    if (!data) return;

    try {
      const { type, id } = JSON.parse(data);

      if (type !== "problem" || !id) return;

      // Get the column we're dropping onto
      const columnElement = e.currentTarget as HTMLElement;
      const statusId = columnElement.getAttribute(
        "data-status-id"
      ) as Id<"leetcodeStatuses">;
      const dayOfWeekStr = columnElement.getAttribute("data-day-of-week");
      const dayOfWeek = dayOfWeekStr ? parseInt(dayOfWeekStr, 10) : 0;

      if (!statusId) return;

      // Get the problem being dragged
      const draggedProblem = problems.find((p) => p._id === id);
      if (!draggedProblem) return;

      // Check if we're dropping onto a different column
      if (
        draggedProblem.statusId !== statusId ||
        draggedProblem.dayOfWeek !== dayOfWeek
      ) {
        // Update the problem's status and day of week
        await updateProblemStatus({
          id,
          statusId,
          dayOfWeek,
        });
        showToast("success", "Problem moved");
        return;
      }

      // If we're in the same column and have a target, reorder
      if (dropTargetId && dropPosition) {
        const statusProblems = problems.filter(
          (p) => p.statusId === statusId && p.dayOfWeek === dayOfWeek
        );

        // Sort by order index
        const orderedProblems = [...statusProblems].sort(
          (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
        );

        // Find the indices of the dragged and target problems
        const draggedIndex = orderedProblems.findIndex((p) => p._id === id);
        const targetIndex = orderedProblems.findIndex(
          (p) => p._id === dropTargetId
        );

        if (draggedIndex === -1 || targetIndex === -1) return;

        // Create a new array with the reordered problems
        const newOrder = [...orderedProblems];
        const [removed] = newOrder.splice(draggedIndex, 1);

        // Adjust target index if needed
        let adjustedTargetIndex = targetIndex;
        if (draggedIndex < targetIndex && dropPosition === "before") {
          adjustedTargetIndex--;
        } else if (draggedIndex > targetIndex && dropPosition === "after") {
          adjustedTargetIndex++;
        }

        // Insert at the adjusted position
        const insertIndex =
          dropPosition === "after"
            ? adjustedTargetIndex + 1
            : adjustedTargetIndex;
        newOrder.splice(insertIndex, 0, removed);

        // Update order indices
        const problemIds = newOrder.map((p) => p._id);
        const orderIndices = problemIds.map((_, i) => i);

        await updateProblemOrder({
          problemIds,
          orderIndices,
        });

        showToast("success", "Problem reordered");
      }
    } catch (error) {
      console.error("Error handling drop:", error);
      showToast("error", "Failed to move problem");
    }
  };

  // CRUD functions for statuses
  const handleAddStatus = async () => {
    if (!user || !newStatusName.trim()) return;

    try {
      await createStatus({
        userId: user.id,
        name: newStatusName.trim(),
        color: newStatusColor,
      });

      setNewStatusName("");
      setIsAddingStatus(false);
      showToast("success", "Column added");
    } catch (error) {
      console.error("Error adding status:", error);
      showToast("error", "Failed to add column");
    }
  };

  const handleUpdateStatus = async (statusId: Id<"leetcodeStatuses">) => {
    try {
      await updateStatus({
        id: statusId,
        color: editingStatusColor,
      });

      setEditingStatusId(null);
      showToast("success", "Column color updated");
    } catch (error) {
      console.error("Error updating status color:", error);
      showToast("error", "Failed to update column color");
    }
  };

  const handleDeleteStatus = async (statusId: Id<"leetcodeStatuses">) => {
    if (
      !confirm(
        "Are you sure you want to delete this column and all its problems?"
      )
    ) {
      return;
    }

    try {
      await removeStatus({ id: statusId });
      showToast("success", "Column deleted");
    } catch (error) {
      console.error("Error deleting status:", error);
      showToast("error", "Failed to delete column");
    }
  };

  // Get day of week from a score
  const getTargetDayOfWeek = (score: number): number => {
    // Get current day (0-6, where 0 is Sunday)
    const today = new Date().getDay();

    // Calculate target day by adding the score
    const targetDay = (today + score) % 7;

    return targetDay;
  };

  // Problem CRUD operations
  const handleAddProblem = async () => {
    if (!user || !newProblem.title.trim()) {
      showToast("error", "Problem title is required");
      return;
    }

    try {
      const targetDayOfWeek = getTargetDayOfWeek(newProblem.score);

      // Find the status for the target day
      const targetStatus = statuses.find((s) => s.order === targetDayOfWeek);

      if (!targetStatus) {
        showToast("error", "Could not find the target day column");
        return;
      }

      // Determine final complexity values
      const finalTimeComplexity =
        newProblem.timeComplexity === "Other"
          ? newProblem.customTimeComplexity
          : newProblem.timeComplexity;

      const finalSpaceComplexity =
        newProblem.spaceComplexity === "Other"
          ? newProblem.customSpaceComplexity
          : newProblem.spaceComplexity;

      await createProblem({
        userId: user.id,
        title: newProblem.title.trim(),
        statusId: targetStatus._id,
        dayOfWeek: targetDayOfWeek,
        link: newProblem.link.trim() || undefined,
        notes: newProblem.notes.trim() || undefined,
        score: newProblem.score,
        spaceComplexity: finalSpaceComplexity.trim() || undefined,
        timeComplexity: finalTimeComplexity.trim() || undefined,
        category: newProblem.category || undefined,
        difficulty: newProblem.difficulty || undefined,
      });

      setIsAddingProblem(false);
      showToast("success", "Problem added");
    } catch (error) {
      console.error("Error adding problem:", error);
      showToast("error", "Failed to add problem");
    }
  };

  const handleNewProblemInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Handle special case for complexity fields with "Other" option
    if (name === "timeComplexity" && value === "Other") {
      setNewProblem((prev) => ({
        ...prev,
        [name]: value,
        customTimeComplexity: "",
      }));
    } else if (name === "spaceComplexity" && value === "Other") {
      setNewProblem((prev) => ({
        ...prev,
        [name]: value,
        customSpaceComplexity: "",
      }));
    } else if (name === "customTimeComplexity") {
      setNewProblem((prev) => ({
        ...prev,
        customTimeComplexity: value,
      }));
    } else if (name === "customSpaceComplexity") {
      setNewProblem((prev) => ({
        ...prev,
        customSpaceComplexity: value,
      }));
    } else {
      setNewProblem((prev) => ({
        ...prev,
        [name]: name === "score" ? parseInt(value, 10) : value,
      }));
    }
  };

  const handleDeleteProblem = async (
    e: React.MouseEvent,
    problemId: Id<"leetcodeProblems">
  ) => {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this problem?")) {
      return;
    }

    try {
      await removeProblem({ id: problemId });
      showToast("success", "Problem deleted");
    } catch (error) {
      console.error("Error deleting problem:", error);
      showToast("error", "Failed to delete problem");
    }
  };

  // Toast message
  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToast({
      type,
      message,
      onClose: () => setToast(null), // Add onClose handler
    });
    setTimeout(() => setToast(null), 3000);
  };

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle color picker outside click
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node)
      ) {
        const clickedElement = event.target as HTMLElement;
        const isColorPickerButton = clickedElement.closest(
          "[data-color-picker-button]"
        );

        if (!isColorPickerButton) {
          setEditingStatusId(null);
        }
      }

      // Handle new status form outside click
      if (
        isAddingStatus &&
        newStatusFormRef.current &&
        !newStatusFormRef.current.contains(event.target as Node)
      ) {
        const clickedElement = event.target as HTMLElement;
        const isAddButton = clickedElement.closest("[data-add-status-button]");

        if (!isAddButton) {
          setIsAddingStatus(false);
        }
      }

      // Handle problem modal outside click
      if (
        problemModalRef.current &&
        !problemModalRef.current.contains(event.target as Node)
      ) {
        closeMenus();
      }

      // Handle add problem modal outside click
      if (
        isAddingProblem &&
        addProblemModalRef.current &&
        !addProblemModalRef.current.contains(event.target as Node)
      ) {
        setIsAddingProblem(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAddingStatus, isAddingProblem]);

  // Color picker for column colors
  // This function is not used, removing it

  // Select a color from the color picker
  const selectColor = (color: string) => {
    if (editingStatusId) {
      setEditingStatusColor(color);
    } else {
      setNewStatusColor(color);
    }
  };

  // Problem modal functions
  const openProblemModal = (problem: LeetcodeProblem) => {
    setSelectedProblem(problem);

    // Add custom complexity fields if they don't exist
    const problemWithCustomFields = {
      ...problem,
      customTimeComplexity: problem.customTimeComplexity || "",
      customSpaceComplexity: problem.customSpaceComplexity || "",
    };

    setEditedProblem(problemWithCustomFields);
    setIsEditingProblem(false);
  };

  const closeProblemModal = () => {
    setSelectedProblem(null);
    setEditedProblem(null);
    setIsEditingProblem(false);
  };

  const toggleEditProblem = () => {
    setIsEditingProblem(!isEditingProblem);

    // Ensure the editedProblem has the custom fields if timeComplexity is "Other"
    if (selectedProblem && !isEditingProblem) {
      const updatedProblem = { ...selectedProblem };

      // Add customTimeComplexity if needed
      if (
        selectedProblem.timeComplexity === "Other" &&
        !updatedProblem.customTimeComplexity
      ) {
        updatedProblem.customTimeComplexity = "";
      }

      // Add customSpaceComplexity if needed
      if (
        selectedProblem.spaceComplexity === "Other" &&
        !updatedProblem.customSpaceComplexity
      ) {
        updatedProblem.customSpaceComplexity = "";
      }

      setEditedProblem(updatedProblem);
    }
  };

  const handleProblemInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!editedProblem) return;

    const { name, value } = e.target;

    // Handle special case for complexity fields with "Other" option
    if (name === "timeComplexity" && value === "Other") {
      setEditedProblem({
        ...editedProblem,
        timeComplexity: value,
        customTimeComplexity: "",
      });
    } else if (name === "spaceComplexity" && value === "Other") {
      setEditedProblem({
        ...editedProblem,
        spaceComplexity: value,
        customSpaceComplexity: "",
      });
    } else if (name === "customTimeComplexity") {
      setEditedProblem({
        ...editedProblem,
        customTimeComplexity: value,
      });
    } else if (name === "customSpaceComplexity") {
      setEditedProblem({
        ...editedProblem,
        customSpaceComplexity: value,
      });
    } else {
      setEditedProblem({
        ...editedProblem,
        [name]: name === "score" ? parseInt(value, 10) : value,
      });
    }
  };

  const saveProblem = async () => {
    if (!editedProblem) return;

    try {
      const { _id } = editedProblem;

      // Get the original problem to calculate the day shift
      const originalProblem = problems.find((p) => p._id === _id);
      if (!originalProblem) {
        showToast("error", "Problem not found");
        return;
      }

      // Determine final complexity values
      const finalTimeComplexity =
        editedProblem.timeComplexity === "Other"
          ? editedProblem.customTimeComplexity
          : editedProblem.timeComplexity;

      const finalSpaceComplexity =
        editedProblem.spaceComplexity === "Other"
          ? editedProblem.customSpaceComplexity
          : editedProblem.spaceComplexity;

      // Prepare the update object with only the fields we want to update
      const updateData: {
        id: Id<"leetcodeProblems">;
        title?: string;
        link?: string;
        difficulty?: string;
        notes?: string;
        score?: number;
        spaceComplexity?: string;
        timeComplexity?: string;
        statusId?: Id<"leetcodeStatuses">;
        dayOfWeek?: number;
        category?: string;
      } = {
        id: _id,
        title: editedProblem.title,
        link: editedProblem.link,
        difficulty: editedProblem.difficulty,
        notes: editedProblem.notes,
        score:
          typeof editedProblem.score === "string"
            ? parseInt(editedProblem.score, 10)
            : editedProblem.score,
        spaceComplexity: finalSpaceComplexity,
        timeComplexity: finalTimeComplexity,
        category: editedProblem.category,
      };

      // Calculate the day shift based on score change
      if (originalProblem.score !== updateData.score) {
        // Use the same function that's used for creating new problems
        const targetDayOfWeek = getTargetDayOfWeek(updateData.score!);

        // Find the target status for the new day
        const targetStatus = statuses.find((s) => s.order === targetDayOfWeek);
        if (!targetStatus) {
          showToast("error", "Could not find the target day column");
          return;
        }

        // Update the status ID and day of week in our update data
        updateData.statusId = targetStatus._id;
        updateData.dayOfWeek = targetDayOfWeek;
      }

      await updateProblem(updateData);

      // Completely close the modal
      setIsEditingProblem(false);
      setSelectedProblem(null);
      setEditedProblem(null);
      showToast("success", "Problem updated");
    } catch (error) {
      console.error("Error updating problem:", error);
      showToast("error", "Failed to update problem");
    }
  };

  // Close all open menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close all open menus
      if (!selectedProblem && !isAddingStatus && editingStatusId === null) {
        return;
      }

      const targetElement = event.target as HTMLElement;

      // Check if we clicked on a menu trigger
      const isMenuTrigger = targetElement.closest("[data-menu-trigger]");
      if (isMenuTrigger) return;

      // Check if we clicked inside a menu
      const isInsideMenu =
        targetElement.closest("[data-menu]") ||
        targetElement.closest("[data-color-picker]") ||
        targetElement.closest("[data-problem-modal]");

      if (!isInsideMenu) {
        closeMenus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedProblem, isAddingStatus, editingStatusId]);

  const closeMenus = () => {
    setSelectedProblem(null);
    setIsAddingStatus(false);
    setEditingStatusId(null);
  };

  // Mobile touch handling for drag and drop
  // Add a type for the timer
  type TouchTimer = {
    _longPressTimer: NodeJS.Timeout | null;
  };

  const handleTouchStart = (
    e: React.TouchEvent,
    problemId: Id<"leetcodeProblems">
  ) => {
    // Check if it's a long press (start timer)
    const target = e.currentTarget as HTMLElement;

    // Use setTimeout to detect long press
    const timer = setTimeout(() => {
      setTouchDragging(true);
      setDraggedProblemId(problemId);

      // Create and position the ghost element
      const rect = target.getBoundingClientRect();
      const ghost = target.cloneNode(true) as HTMLElement;

      ghost.style.position = "fixed";
      ghost.style.top = `${rect.top}px`;
      ghost.style.left = `${rect.left}px`;
      ghost.style.width = `${rect.width}px`;
      ghost.style.height = `${rect.height}px`;
      ghost.style.transform = "rotate(2deg) scale(1.05)";
      ghost.style.opacity = "0.9";
      ghost.style.zIndex = "9999";
      ghost.style.pointerEvents = "none";
      ghost.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
      ghost.classList.add(leetcodeStyles.touchDragGhost);

      document.body.appendChild(ghost);
      setGhostElement(ghost);

      // Visual feedback for the original element
      target.style.opacity = "0.4";

      // Show touch indicator
      showTouchIndicator(e);
    }, 300); // 300ms long press to start drag

    // Store the timer so we can clear it if touch ends before long press
    (e.currentTarget as HTMLElement & TouchTimer)._longPressTimer = timer;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDragging || !ghostElement) return;

    const touch = e.touches[0];

    // Move the ghost element to follow the touch
    ghostElement.style.top = `${touch.clientY - 30}px`; // offset to position under finger
    ghostElement.style.left = `${
      touch.clientX - ghostElement.offsetWidth / 2
    }px`;

    // Find the element under the touch
    const elementsUnderTouch = document.elementsFromPoint(
      touch.clientX,
      touch.clientY
    );

    // Find column and problem elements under touch
    const columnElement = elementsUnderTouch.find((el) =>
      el.hasAttribute("data-status-id")
    ) as HTMLElement | undefined;

    const problemElement = elementsUnderTouch.find((el) =>
      el.hasAttribute("data-problem-id")
    ) as HTMLElement | undefined;

    // Reset previous touch target styles
    if (touchCurrentTarget && touchCurrentTarget !== columnElement) {
      touchCurrentTarget.classList.remove(...TOUCH_TARGET_CLASSES);
    }

    if (columnElement) {
      // We're over a column
      setTouchCurrentTarget(columnElement);
      columnElement.classList.add(leetcodeStyles.touchDragOver);

      // If we're also over a problem, handle problem drop position
      if (
        problemElement &&
        problemElement !== e.currentTarget &&
        problemElement.hasAttribute("data-problem-id")
      ) {
        const targetId = problemElement.getAttribute(
          "data-problem-id"
        ) as Id<"leetcodeProblems">;

        if (targetId !== draggedProblemId) {
          const rect = problemElement.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          const position = touch.clientY < midY ? "before" : "after";

          setDropTargetId(targetId);
          setDropPosition(position);

          // Remove any existing hover classes
          clearProblemDropIndicators();

          // Add appropriate hover class
          problemElement.classList.add(
            PROBLEM_DROP_CLASS_BY_POSITION[position]
          );
        }
      } else {
        // Just over a column, not a specific problem
        setDropTargetId(null);
        setDropPosition(null);
      }
    } else {
      setTouchCurrentTarget(null);
    }
  };

  const handleTouchEnd = async (e: React.TouchEvent) => {
    // Clear long press timer if touch ends before drag starts
    const timer = (e.currentTarget as HTMLElement & TouchTimer)._longPressTimer;
    if (timer) {
      clearTimeout(timer);
      (e.currentTarget as HTMLElement & TouchTimer)._longPressTimer = null;
    }

    if (!touchDragging || !draggedProblemId) {
      return;
    }

    try {
      const targetElement = touchCurrentTarget;

      if (
        targetElement &&
        targetElement.hasAttribute("data-status-id") &&
        targetElement.hasAttribute("data-day-of-week")
      ) {
        const statusId = targetElement.getAttribute(
          "data-status-id"
        ) as Id<"leetcodeStatuses">;
        const dayOfWeekStr = targetElement.getAttribute("data-day-of-week");
        const dayOfWeek = dayOfWeekStr ? parseInt(dayOfWeekStr, 10) : 0;

        // Get the problem being dragged
        const draggedProblem = problems.find((p) => p._id === draggedProblemId);
        if (!draggedProblem) return;

        // Check if we're dropping onto a different column
        if (
          draggedProblem.statusId !== statusId ||
          draggedProblem.dayOfWeek !== dayOfWeek
        ) {
          // Update the problem's status and day of week
          await updateProblemStatus({
            id: draggedProblemId,
            statusId,
            dayOfWeek,
          });
          showToast("success", "Problem moved");
        } else if (dropTargetId && dropPosition) {
          // We're in the same column and have a target - reorder

          const statusProblems = problems.filter(
            (p) => p.statusId === statusId && p.dayOfWeek === dayOfWeek
          );

          // Sort by order index
          const orderedProblems = [...statusProblems].sort(
            (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
          );

          // Find the indices of the dragged and target problems
          const draggedIndex = orderedProblems.findIndex(
            (p) => p._id === draggedProblemId
          );
          const targetIndex = orderedProblems.findIndex(
            (p) => p._id === dropTargetId
          );

          if (draggedIndex === -1 || targetIndex === -1) return;

          // Create a new array with the reordered problems
          const newOrder = [...orderedProblems];
          const [removed] = newOrder.splice(draggedIndex, 1);

          // Adjust target index if needed
          let adjustedTargetIndex = targetIndex;
          if (draggedIndex < targetIndex && dropPosition === "before") {
            adjustedTargetIndex--;
          } else if (draggedIndex > targetIndex && dropPosition === "after") {
            adjustedTargetIndex++;
          }

          // Insert at the adjusted position
          const insertIndex =
            dropPosition === "after"
              ? adjustedTargetIndex + 1
              : adjustedTargetIndex;
          newOrder.splice(insertIndex, 0, removed);

          // Update order indices
          const problemIds = newOrder.map((p) => p._id);
          const orderIndices = problemIds.map((_, i) => i);

          await updateProblemOrder({
            problemIds,
            orderIndices,
          });

          showToast("success", "Problem reordered");
        }
      }
    } catch (error) {
      console.error("Error handling touch drop:", error);
      showToast("error", "Failed to move problem");
    } finally {
      cleanupTouchDrag();
    }
  };

  const cleanupTouchDrag = () => {
    // Remove ghost element from DOM
    if (ghostElement && ghostElement.parentNode) {
      ghostElement.parentNode.removeChild(ghostElement);
    }

    // Reset original element opacity
    const originalElement = document.querySelector(
      `[data-problem-id="${draggedProblemId}"]`
    ) as HTMLElement;
    if (originalElement) {
      originalElement.style.opacity = "1";
    }

    // Reset other state
    if (touchCurrentTarget) {
      touchCurrentTarget.classList.remove(...TOUCH_TARGET_CLASSES);
    }

    // Remove any drop indicators
    clearProblemDropIndicators();

    setTouchDragging(false);
    setDraggedProblemId(null);
    setGhostElement(null);
    setTouchCurrentTarget(null);
    setDropTargetId(null);
    setDropPosition(null);
  };

  const showTouchIndicator = (e: React.TouchEvent) => {
    // Create a ripple effect to show the user the drag has started
    const touch = e.touches[0];
    const ripple = document.createElement("div");
    ripple.className = leetcodeStyles.touchDragIndicator;
    ripple.style.top = `${touch.clientY - 25}px`;
    ripple.style.left = `${touch.clientX - 25}px`;

    document.body.appendChild(ripple);

    // Remove the ripple after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, 800);
  };

  // Add a function to mark a problem as mastered
  const handleMarkAsMastered = async (problemId: Id<"leetcodeProblems">) => {
    try {
      await updateProblem({
        id: problemId,
        mastered: true,
      });

      // Close the modal and show success message
      setSelectedProblem(null);
      showToast("success", "Problem marked as mastered!");
    } catch (error) {
      console.error("Error marking problem as mastered:", error);
      showToast("error", "Failed to mark problem as mastered");
    }
  };

  // Add a function to unmark a problem as mastered
  const handleUnmasterProblem = async (problemId: Id<"leetcodeProblems">) => {
    try {
      await updateProblem({
        id: problemId,
        mastered: false,
      });

      // Close the modal and show success message
      setSelectedProblem(null);
      showToast("success", "Problem moved back to active board");
    } catch (error) {
      console.error("Error unmarking problem as mastered:", error);
      showToast("error", "Failed to move problem back to board");
    }
  };

  // Use effect to group mastered problems by category
  useEffect(() => {
    if (masteredProblems.length === 0) {
      setGroupedMasteredProblems([]);
      return;
    }

    // Group problems by category
    const problemsByCategory: { [key: string]: LeetcodeProblem[] } = {};

    // Add "Uncategorized" group
    problemsByCategory["Uncategorized"] = [];

    // Group problems
    masteredProblems.forEach((problem) => {
      if (problem.category) {
        if (!problemsByCategory[problem.category]) {
          problemsByCategory[problem.category] = [];
        }
        problemsByCategory[problem.category].push(problem);
      } else {
        problemsByCategory["Uncategorized"].push(problem);
      }
    });

    // If no uncategorized problems, remove that group
    if (problemsByCategory["Uncategorized"].length === 0) {
      delete problemsByCategory["Uncategorized"];
    }

    // Sort categories alphabetically, but keep "Uncategorized" at the end
    const sortedCategories = Object.keys(problemsByCategory).sort((a, b) => {
      if (a === "Uncategorized") return 1;
      if (b === "Uncategorized") return -1;
      return a.localeCompare(b);
    });

    // Create the grouped array
    const groupedProblems = sortedCategories.map((category) => ({
      category,
      problems: problemsByCategory[category],
    }));

    setGroupedMasteredProblems(groupedProblems);
  }, [masteredProblems]);

  // Loading state
  if (!user || !statuses || !problems) {
    return (
      <div className="min-h-screen bg-[#090d1b] flex items-center justify-center">
        <RefreshCw className="h-10 w-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  // Function to toggle category collapse
  const toggleCategoryCollapse = (category: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Get the current day of the week (0-6, where 0 is Sunday)
  const today = new Date().getDay();

  return (
    <div
      className="min-h-screen bg-[#090d1b] flex flex-col overflow-hidden"
      {...swipeHandlers}
    >
      {/* Header with navigation and controls */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center">
          <Link
            href="/dashboard/resources"
            className="text-gray-400 hover:text-white mr-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center">
            <Image
              src="/photos/LeetCode_Logo_1.png"
              alt="LeetCode Logo"
              width={30}
              height={30}
              className="mr-2"
            />
            <h1 className="text-xl font-light text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-gray-300">
              Leetcode Tracker
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isMobile && (
            <div className="hidden md:flex items-center mr-2">
              <button
                onClick={() => scrollContainer("left")}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scrollContainer("right")}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {isMobile && (
            <button
              onClick={toggleColumnsView}
              className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 border border-gray-700"
            >
              <Columns className="h-5 w-5" />
              <span className="sr-only">
                {showingAllColumns ? "Single Column" : "All Columns"}
              </span>
            </button>
          )}

          <button
            onClick={() => {
              setNewProblem({
                title: "",
                link: "",
                notes: "",
                score: 1,
                spaceComplexity: "",
                timeComplexity: "",
                customSpaceComplexity: "",
                customTimeComplexity: "",
                category: "",
                difficulty: "",
              });
              setIsAddingProblem(true);
            }}
            className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 border border-gray-700"
          >
            <Plus className="h-5 w-5" />
            <span className="sr-only">Add Problem</span>
          </button>
        </div>
      </div>

      {/* Mobile column navigation */}
      {isMobile && !showingAllColumns && statuses.length > 0 && (
        <div className="flex items-center justify-center p-2 bg-[#0c1324]">
          <button
            onClick={() => navigateToColumn(Math.max(0, activeColumnIndex - 1))}
            className="text-gray-400 p-1 rounded-full hover:bg-gray-800 disabled:opacity-30"
            disabled={activeColumnIndex === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="mx-2 text-gray-300 text-sm">
            {statuses[activeColumnIndex]?.name || ""}
          </div>
          <button
            onClick={() =>
              navigateToColumn(
                Math.min(statuses.length - 1, activeColumnIndex + 1)
              )
            }
            className="text-gray-400 p-1 rounded-full hover:bg-gray-800 disabled:opacity-30"
            disabled={activeColumnIndex === statuses.length - 1}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Mobile drag instructions */}
      {showDragInstructions && isMobile && (
        <div className="fixed top-16 left-0 right-0 mx-auto w-5/6 bg-blue-900/80 backdrop-blur-sm p-3 rounded-lg z-20 shadow-md text-center">
          <div className="flex items-center justify-center mb-2">
            <AlertCircle className="text-blue-300 mr-2 h-5 w-5" />
            <p className="text-white text-sm font-medium">Drag Instructions</p>
          </div>
          <p className="text-blue-100 text-xs">
            Long-press a problem to drag it between days. Tap a problem to view
            details.
          </p>
          <button
            onClick={() => setShowDragInstructions(false)}
            className="mt-2 text-xs text-blue-300 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Columns container */}
      <div
        id="columns-container"
        className="flex-1 overflow-x-auto overflow-y-hidden flex md:px-4 pt-2 pb-4"
      >
        <div
          className={`flex ${
            isMobile && !showingAllColumns ? "w-full h-full" : "space-x-4"
          }`}
        >
          {statuses.map((status, index) => (
            <div
              key={status._id}
              className={`flex-shrink-0 ${
                isMobile && !showingAllColumns
                  ? activeColumnIndex === index
                    ? "w-full h-full"
                    : "hidden"
                  : "w-72"
              }`}
              data-status-id={status._id}
              data-day-of-week={status.order}
            >
              {/* Column header */}
              <div
                className={`p-2 rounded-t-md flex items-center justify-between ${
                  status.color
                } bg-opacity-70 ${
                  status.order === today
                    ? "ring-2 ring-white/60 shadow-lg relative overflow-hidden"
                    : ""
                }`}
              >
                {status.order === today && (
                  <div className="absolute inset-0 bg-white/10 animate-pulse opacity-50 pointer-events-none"></div>
                )}
                <div className="flex items-center">
                  <h3 className="font-medium text-white truncate max-w-[140px]">
                    {status.name}
                    {status.order === today && (
                      <span className="ml-1 text-xs opacity-80">(Today)</span>
                    )}
                  </h3>
                  <div className="ml-2 bg-white/20 text-white text-xs px-1.5 rounded-full">
                    {
                      problems.filter(
                        (p) =>
                          p.statusId === status._id &&
                          p.dayOfWeek === status.order
                      ).length
                    }
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="relative group" data-menu-trigger>
                    <button className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {/* Column menu dropdown */}
                    <div
                      className="absolute right-0 mt-1 w-36 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10 hidden group-hover:block"
                      data-menu
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          // Only allow color editing
                          const statusId = status._id;
                          const foundStatus = statuses.find(
                            (s) => s._id === statusId
                          );
                          if (foundStatus) {
                            setEditingStatusId(foundStatus._id);
                            setEditingStatusName(foundStatus.name);
                            setEditingStatusColor(foundStatus.color);
                          }
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white"
                      >
                        Change Color
                      </button>
                      {!status.isDefault && (
                        <button
                          onClick={() => handleDeleteStatus(status._id)}
                          className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-900/30 hover:text-red-300"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Problems container */}
              <div
                className={`bg-[#121a36]/50 backdrop-blur-sm h-[calc(100vh-13rem)] overflow-y-auto p-2 rounded-b-md border ${
                  status.order === today
                    ? "border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.07)] relative"
                    : "border-t-0 border-[#20253d]/50"
                } flex flex-col gap-2`}
                onDragOver={handleDragOver}
                onDrop={handleProblemDrop}
              >
                {status.order === today && (
                  <div className="absolute inset-0 bg-[#ffffff03] pointer-events-none rounded-b-md"></div>
                )}
                {problems
                  .filter(
                    (p) =>
                      p.statusId === status._id && p.dayOfWeek === status.order
                  )
                  .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                  .map((problem) => (
                    <div
                      key={problem._id}
                      className={`bg-[#1c2642]/70 p-3 rounded-md border border-[#2a3353]/60 cursor-pointer transition-all ${
                        draggedProblemId === problem._id
                          ? "opacity-50"
                          : "hover:border-indigo-500/40"
                      }`}
                      onClick={() => openProblemModal(problem)}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, problem._id)}
                      onDragEnd={handleDragEnd}
                      onTouchStart={(e) => handleTouchStart(e, problem._id)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      data-problem-id={problem._id}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium text-white">
                          {problem.title}
                        </h4>
                        <button
                          onClick={(e) => handleDeleteProblem(e, problem._id)}
                          className="text-gray-400 hover:text-red-400 p-1 rounded-full hover:bg-gray-800 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
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
                            {problem.difficulty.charAt(0)}
                          </span>
                        )}
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300"
                          title="Problem score"
                        >
                          {problem.score}
                        </span>
                      </div>
                      {problem.notes && (
                        <p className="mt-1 text-xs text-gray-400 line-clamp-1">
                          {problem.notes}
                        </p>
                      )}
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {formatTimeElapsed(problem.updatedAt)}
                        </span>
                        {problem.link && (
                          <a
                            href={problem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            View Problem
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <MasteredProblemsSection
        masteredProblems={masteredProblems}
        groupedMasteredProblems={groupedMasteredProblems}
        collapsedCategories={collapsedCategories}
        onToggleCategory={toggleCategoryCollapse}
        onOpenProblem={openProblemModal}
      />

      <StatusEditorModal
        isAddingStatus={isAddingStatus}
        editingStatusId={editingStatusId}
        newStatusFormRef={newStatusFormRef}
        colorPickerRef={colorPickerRef}
        newStatusName={newStatusName}
        newStatusColor={newStatusColor}
        editingStatusName={editingStatusName}
        editingStatusColor={editingStatusColor}
        onNewStatusNameChange={setNewStatusName}
        onSelectColor={selectColor}
        onCancel={() => {
          setIsAddingStatus(false);
          setEditingStatusId(null);
        }}
        onAddStatus={handleAddStatus}
        onUpdateStatus={handleUpdateStatus}
      />

      <ProblemDetailModal
        selectedProblem={selectedProblem}
        editedProblem={editedProblem}
        isEditingProblem={isEditingProblem}
        modalRef={problemModalRef}
        onClose={closeProblemModal}
        onInputChange={handleProblemInputChange}
        onCancelEdit={() => setIsEditingProblem(false)}
        onSaveProblem={saveProblem}
        onToggleEdit={toggleEditProblem}
        onMarkAsMastered={handleMarkAsMastered}
        onUnmasterProblem={handleUnmasterProblem}
      />

      <AddProblemModal
        isOpen={isAddingProblem}
        modalRef={addProblemModalRef}
        newProblem={newProblem}
        onClose={() => setIsAddingProblem(false)}
        onAddProblem={handleAddProblem}
        onInputChange={handleNewProblemInputChange}
        getTargetDayOfWeek={getTargetDayOfWeek}
      />

      {/* Toast notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={toast.onClose}
        />
      )}

    </div>
  );
}
