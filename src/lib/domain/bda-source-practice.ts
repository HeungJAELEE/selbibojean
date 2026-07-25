export type BdaSourcePracticeMode = "multiple_choice" | "self_check";

export type BdaSourcePracticeChoice = {
  id: string;
  order: number;
  text: string;
};

export type PublicBdaSourcePracticeQuestion = {
  id: string;
  blockId: string;
  subjectId: "bda-s1" | "bda-s2" | "bda-s3" | "bda-s4";
  sourceSnapshotId: string;
  mode: BdaSourcePracticeMode;
  stem: string;
  choices: BdaSourcePracticeChoice[];
  sourceType: "user_provided";
  evidenceGrade: "B";
  reviewStatus: "검수 완료";
  reviewDisposition: "source_verified" | "corrected" | "supplemented";
  practiceNotice: string;
};

export type BdaSourcePracticeQuestion = PublicBdaSourcePracticeQuestion & {
  correctChoiceId?: string;
  answerText: string;
  explanation: string;
  reviewNote: string;
};

export type PublicBdaSourcePracticeBlock = {
  id: string;
  sourceSnapshotId: string;
  subjectId: PublicBdaSourcePracticeQuestion["subjectId"];
  blockIndex: number;
  questions: PublicBdaSourcePracticeQuestion[];
  auditStatus: "published";
  auditNote: string;
};

export type BdaSourcePracticeFeedback = {
  questionId: string;
  isCorrect: boolean | null;
  selectedChoice?: BdaSourcePracticeChoice;
  correctChoice?: BdaSourcePracticeChoice;
  answerText: string;
  explanation: string;
  evidenceGrade: "B";
  reviewStatus: "검수 완료";
  reviewDisposition: PublicBdaSourcePracticeQuestion["reviewDisposition"];
  notice: string;
};
