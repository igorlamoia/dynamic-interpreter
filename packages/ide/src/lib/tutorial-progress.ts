import type { TutorialId } from "./tutorials";

const STORAGE_PREFIX = "di:tutorial:";

export function getTutorialStorageKey(tutorialId: TutorialId) {
  return `${STORAGE_PREFIX}${tutorialId}`;
}

export function hasCompletedTutorial(tutorialId: TutorialId): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(getTutorialStorageKey(tutorialId)) === "1";
}

export function markTutorialCompleted(tutorialId: TutorialId) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getTutorialStorageKey(tutorialId), "1");
}
