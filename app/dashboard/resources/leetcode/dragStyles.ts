import { DropPosition } from "./types";
import styles from "./leetcode.module.css";

export const PROBLEM_DROP_CLASSES = [
  styles.problemDropBefore,
  styles.problemDropAfter,
];

const PROBLEM_DROP_SELECTOR = PROBLEM_DROP_CLASSES.map(
  (className) => `.${className}`
).join(", ");

export const PROBLEM_DROP_CLASS_BY_POSITION: Record<DropPosition, string> = {
  before: styles.problemDropBefore,
  after: styles.problemDropAfter,
};

export const TOUCH_TARGET_CLASSES = [
  styles.touchDragOver,
  styles.problemDropBefore,
  styles.problemDropAfter,
];

export const clearProblemDropIndicators = () => {
  document.querySelectorAll(PROBLEM_DROP_SELECTOR).forEach((el) => {
    el.classList.remove(...PROBLEM_DROP_CLASSES);
  });
};

export { styles as leetcodeStyles };
