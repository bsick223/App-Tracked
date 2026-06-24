import { Id } from "@/convex/_generated/dataModel";

export type LeetcodeStatus = {
  _id: Id<"leetcodeStatuses">;
  name: string;
  color: string;
  order: number;
  isDefault?: boolean;
  userId: string;
};

export type LeetcodeProblem = {
  _id: Id<"leetcodeProblems">;
  title: string;
  link?: string;
  difficulty?: string;
  statusId: Id<"leetcodeStatuses">;
  notes?: string;
  score: number;
  spaceComplexity?: string;
  timeComplexity?: string;
  customSpaceComplexity?: string;
  customTimeComplexity?: string;
  userId: string;
  dayOfWeek: number;
  orderIndex?: number;
  createdAt: number;
  updatedAt: number;
  mastered?: boolean;
  category?: string;
};

export type ToastMessage = {
  type: "success" | "error" | "info";
  message: string;
  onClose: () => void;
};

export type DropPosition = "before" | "after";

export type LeetcodeProblemForm = {
  title: string;
  link: string;
  notes: string;
  score: number;
  spaceComplexity: string;
  timeComplexity: string;
  customSpaceComplexity: string;
  customTimeComplexity: string;
  category: string;
  difficulty: string;
};
