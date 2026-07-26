export const STUDY_MODES = ["integrated", "written", "practical"] as const;

export type StudyMode = (typeof STUDY_MODES)[number];

export const LEARNING_NATURES = [
  "understand",
  "distinguish",
  "memorize",
  "practice",
  "perform",
] as const;

export type LearningNature = (typeof LEARNING_NATURES)[number];

export type UnifiedLearningConcept = {
  id: string;
  title: string;
  summary: string;

  writtenLessonIds: string[];
  writtenQuestionIds: string[];

  practicalConceptIds: string[];
  practicalQuestionIds: string[];
  practicalTaskIds: string[];
  practicalEvidenceIds: string[];

  relatedConceptIds: string[];
  learningNature: LearningNature[];
  defaultMode: StudyMode;

  writtenFocus: string[];
  practicalFocus: string[];
  memoryPoints: string[];
};
