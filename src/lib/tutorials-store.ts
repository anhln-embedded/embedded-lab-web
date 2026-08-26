/**
 * Embedded-AIoT Lab - Tutorials Store & Data Layer
 */

import { TUTORIAL_TOPICS, TutorialTopic, TutorialPost } from "./tutorials-data";

const LOCAL_STORAGE_KEY = "embedded_lab_tutorials_custom";

export function getAllTutorials(): TutorialTopic[] {
  if (typeof window === "undefined") {
    return TUTORIAL_TOPICS;
  }
  try {
    const custom = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (custom) {
      return JSON.parse(custom);
    }
  } catch (e) {
    console.error("Failed to read tutorials from localStorage:", e);
  }
  return TUTORIAL_TOPICS;
}

export function saveAllTutorials(topics: TutorialTopic[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(topics));
    window.dispatchEvent(new CustomEvent("embedded_tutorials_updated"));
  } catch (e) {
    console.error("Failed to save tutorials:", e);
  }
}

export function getTutorialBySlug(slug: string): TutorialTopic | undefined {
  const topics = getAllTutorials();
  return topics.find((t) => t.slug === slug || t.id === slug);
}

export function deleteTutorialTopic(id: string) {
  const current = getAllTutorials();
  const filtered = current.filter((t) => t.id !== id && t.slug !== id);
  saveAllTutorials(filtered);
}
