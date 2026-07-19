"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import bundledSearchIndexPayload from "./generated/notion-search-index.json";
import {
  allChapters,
  allTopics,
  getTopicById,
  notionCatalogStats,
  subjects,
  topicPathById,
  type IndexedTopic,
  type NotionTopicPayload,
  type TheoryContentBlock,
  type Topic,
} from "./content";

const STORAGE_KEY = "maintenance-masterbook:v1";
const REVIEW_DATE = "2026-07-20";

type WrongAnswer = {
  questionId: string;
  topicId: string;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  attempts: number;
};

type StoredStudyState = {
  completed: string[];
  bookmarks: string[];
  lastTopicId: string | null;
  wrongAnswers: WrongAnswer[];
};

type SearchIndexEntry = {
  id: string;
  title: string;
  normalizedText: string;
  excerpt?: string;
};

type SearchIndexPayload = {
  schemaVersion: number;
  topics: SearchIndexEntry[];
};

const notionTopicCache = new Map<string, NotionTopicPayload>();
const knownTopicIds = new Set(allTopics.map((topic) => topic.id));
const NOTION_IMAGE_PATH_RE = /^\/notion-images\/[0-9a-f]{64}\.(svg|png|jpg)$/;

const notionBlockTypes = new Set([
  "paragraph",
  "heading",
  "list",
  "quote",
  "callout",
  "code",
  "table",
  "image",
  "divider",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

const bundledSearchIndex = new Map(
  ((bundledSearchIndexPayload as SearchIndexPayload).topics ?? [])
    .filter(
      (entry) =>
        isRecord(entry) &&
        typeof entry.id === "string" &&
        typeof entry.title === "string" &&
        typeof entry.normalizedText === "string" &&
        (entry.excerpt === undefined || typeof entry.excerpt === "string") &&
        knownTopicIds.has(entry.id),
    )
    .map((entry) => [entry.id, entry] as const),
);

function isValidTheoryBlock(value: unknown): value is TheoryContentBlock {
  if (!isRecord(value) || typeof value.type !== "string" || !notionBlockTypes.has(value.type)) {
    return false;
  }
  if (value.type === "divider") return true;
  if (value.type === "paragraph" || value.type === "quote") {
    return typeof value.text === "string" && value.text.length <= 200_000;
  }
  if (value.type === "heading") {
    return typeof value.text === "string" && Number.isInteger(value.level) && Number(value.level) >= 1 && Number(value.level) <= 6;
  }
  if (value.type === "callout") {
    return typeof value.text === "string" && (value.icon === undefined || typeof value.icon === "string");
  }
  if (value.type === "code") {
    return typeof value.text === "string" && (value.language === undefined || typeof value.language === "string");
  }
  if (value.type === "list") {
    return Array.isArray(value.items) && value.items.length <= 2_000 && value.items.every((item) => typeof item === "string") &&
      (value.ordered === undefined || typeof value.ordered === "boolean");
  }
  if (value.type === "table") {
    const headersValid = value.headers === undefined ||
      (Array.isArray(value.headers) && value.headers.length <= 100 && value.headers.every((header) => typeof header === "string"));
    const rowsValid = Array.isArray(value.rows) && value.rows.length <= 2_000 && value.rows.every(
      (row) => Array.isArray(row) && row.length <= 100 && row.every((cell) => typeof cell === "string"),
    );
    return headersValid && rowsValid && (value.caption === undefined || typeof value.caption === "string");
  }
  if (value.type === "image") {
    const optionalTextValid = [value.caption, value.sourceUrl].every((item) => item === undefined || typeof item === "string");
    const rightsValid = value.rightsStatus === undefined || ["cleared", "unknown", "link-only"].includes(String(value.rightsStatus));
    const dimensionsValid = [value.width, value.height].every(
      (item) => item === undefined || (typeof item === "number" && Number.isInteger(item) && item > 0 && item <= 20_000),
    );
    return typeof value.src === "string" && typeof value.alt === "string" && optionalTextValid && rightsValid && dimensionsValid;
  }
  return false;
}

function parseNotionTopicPayload(value: unknown, expectedId: string): NotionTopicPayload | null {
  if (!isRecord(value) || value.schemaVersion !== 1 || value.id !== expectedId) return null;
  if (typeof value.title !== "string" || typeof value.sourcePath !== "string") return null;
  if (!Array.isArray(value.blocks) || value.blocks.length > 10_000) return null;
  if (!value.blocks.every(isValidTheoryBlock)) return null;
  return value as unknown as NotionTopicPayload;
}

type PracticeQuestion = {
  id: string;
  type: "객관식" | "복수선택" | "계산" | "단답" | "순서" | "사진판별";
  prompt: string;
  topicId: string;
  options?: { id: string; text: string }[];
  answers: string[];
  explanation: string;
  orderItems?: string[];
  visual?: boolean;
};

const practiceQuestions: PracticeQuestion[] = [
  {
    id: "practice-single",
    type: "객관식",
    prompt: "회전체 불평형에서 대표적으로 크게 나타나는 진동 성분은?",
    topicId: "vibration-diagnosis",
    options: [
      { id: "A", text: "회전속도의 1X 성분" },
      { id: "B", text: "회전속도의 0.25X 성분" },
      { id: "C", text: "직류 성분만 증가" },
      { id: "D", text: "모든 주파수 성분 소멸" },
    ],
    answers: ["A"],
    explanation:
      "불평형은 매 회전마다 반복되는 원심력을 만들기 때문에 1X 회전주파수 성분이 우세한 경우가 많습니다. 단, 운전조건·위상·추세를 함께 확인해야 합니다.",
  },
  {
    id: "practice-multiple",
    type: "복수선택",
    prompt: "용접부 기공 발생 가능성을 높이는 요인을 모두 고르세요.",
    topicId: "welding-defect",
    options: [
      { id: "A", text: "모재 표면의 수분·오염" },
      { id: "B", text: "적절한 층간 청소" },
      { id: "C", text: "보호가스 유량 불안정" },
      { id: "D", text: "승인된 절차에 따른 예열" },
    ],
    answers: ["A", "C"],
    explanation:
      "수분·오염과 보호가스 불량은 용융금속에 가스가 갇히게 해 기공을 만들 수 있습니다.",
  },
  {
    id: "practice-calculation",
    type: "계산",
    prompt: "시간가동률 90%, 성능가동률 80%, 양품률 100%일 때 OEE는 몇 %인가요?",
    topicId: "oee-calculation",
    answers: ["72", "72%"],
    explanation: "OEE = 0.90 × 0.80 × 1.00 × 100 = 72%입니다.",
  },
  {
    id: "practice-short",
    type: "단답",
    prompt: "고장이 나기 전에 주기적으로 점검·교환하는 보전 방식은?",
    topicId: "maintenance-strategy",
    answers: ["예방보전", "예방 보전", "PM"],
    explanation:
      "예방보전(PM)은 고장을 예방하기 위해 정해진 주기나 기준에 따라 점검·정비하는 방식입니다.",
  },
  {
    id: "practice-order",
    type: "순서",
    prompt: "일반적인 설비 작업 전 안전 절차를 올바른 순서로 배열하세요.",
    topicId: "lockout-tagout",
    answers: ["에너지원 확인", "설비 정지", "차단·잠금", "잔류에너지 해소"],
    orderItems: ["차단·잠금", "에너지원 확인", "잔류에너지 해소", "설비 정지"],
    explanation:
      "대상 에너지원을 먼저 확인하고 설비를 정지한 뒤 차단·잠금하고, 마지막으로 잔류에너지를 안전하게 해소합니다. 현장 절차와 담당자 확인을 우선하세요.",
  },
  {
    id: "practice-photo",
    type: "사진판별",
    prompt: "학습 도식의 원뿔형 롤러와 궤도를 가진 부품은 무엇인가요?",
    topicId: "tapered-roller-bearing",
    options: [
      { id: "A", text: "테이퍼 롤러베어링" },
      { id: "B", text: "스러스트 볼베어링" },
      { id: "C", text: "슬리브 커플링" },
      { id: "D", text: "V 벨트 풀리" },
    ],
    answers: ["A"],
    explanation:
      "원뿔형 롤러와 궤도는 반경하중과 한 방향 축하중을 함께 지지하는 테이퍼 롤러베어링의 대표 식별 특징입니다.",
    visual: true,
  },
];

const subjectAccents = ["forest", "teal", "orange", "slate"] as const;

function getTopicPath(topicId: string) {
  const path = topicPathById.get(topicId);
  if (!path) return null;
  const subject = subjects.find((item) => item.id === path.subjectId);
  const chapter = subject?.chapters.find((item) => item.id === path.chapterId);
  const topic = getTopicById(topicId);
  return subject && chapter && topic ? { subject, chapter, topic } : null;
}

function groupTopicsByCategory(topics: Topic[]) {
  const groups = new Map<string, Topic[]>();
  for (const topic of topics) {
    const label = topic.categoryPath?.length
      ? topic.categoryPath.join(" › ")
      : topic.kind === "notion-original" ? "원문 개요" : "핵심 해설";
    groups.set(label, [...(groups.get(label) ?? []), topic]);
  }
  return [...groups.entries()];
}

function normalize(value: string) {
  return value.toLocaleLowerCase("ko-KR").replace(/\s+/g, "").trim();
}

function answerLabel(question: PracticeQuestion) {
  if (question.type === "순서") return question.answers.join(" → ");
  if (!question.options) return question.answers[0];
  return question.answers
    .map((answer) => question.options?.find((option) => option.id === answer)?.text ?? answer)
    .join(", ");
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="progress-block" aria-label={`${label} ${value}%`}>
      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${value}%` }} />
      </div>
      <span>{value}%</span>
    </div>
  );
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

type NotionHeadingAnchor = {
  blockIndex: number;
  id: string;
  level: number;
  text: string;
};

function notionHeadingSlug(value: string) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ko-KR")
    .replace(/[^0-9a-z가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "") || "section";
}

function getNotionHeadingAnchors(blocks: TheoryContentBlock[], topicId: string): NotionHeadingAnchor[] {
  const occurrences = new Map<string, number>();
  const anchors: NotionHeadingAnchor[] = [];

  blocks.forEach((block, blockIndex) => {
    if (block.type !== "heading") return;
    const slug = notionHeadingSlug(block.text);
    const occurrence = (occurrences.get(slug) ?? 0) + 1;
    occurrences.set(slug, occurrence);
    anchors.push({
      blockIndex,
      id: `${topicId}-section-${slug}${occurrence > 1 ? `-${occurrence}` : ""}`,
      level: block.level,
      text: block.text,
    });
  });

  return anchors;
}

function NotionPageToc({ blocks, topicId }: { blocks: TheoryContentBlock[]; topicId: string }) {
  const headings = getNotionHeadingAnchors(blocks, topicId);
  if (headings.length === 0) return null;
  const minimumLevel = Math.min(...headings.map((heading) => heading.level));

  return (
    <nav className="notion-page-toc" aria-label="이 페이지 목차">
      <div className="notion-page-toc-title">
        <span>ON THIS PAGE</span>
        <strong>이 페이지 목차</strong>
      </div>
      <ol>
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ "--notion-toc-depth": Math.max(0, heading.level - minimumLevel) } as React.CSSProperties}
          >
            <a href={`#${heading.id}`}>{heading.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function NotionTheoryContent({ blocks, topicId }: { blocks: TheoryContentBlock[]; topicId: string }) {
  const headingsByBlockIndex = new Map(
    getNotionHeadingAnchors(blocks, topicId).map((heading) => [heading.blockIndex, heading]),
  );

  return (
    <section className="notion-theory" aria-label="Notion 원문 이론">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        switch (block.type) {
          case "heading": {
            const headingId = headingsByBlockIndex.get(index)?.id;
            return block.level <= 3
              ? <h3 id={headingId} key={key}>{block.text}</h3>
              : <h4 id={headingId} key={key}>{block.text}</h4>;
          }
          case "paragraph":
            return <p key={key}>{block.text}</p>;
          case "list": {
            const List = block.ordered ? "ol" : "ul";
            return <List key={key}>{block.items.map((item, itemIndex) => <li key={`${key}-${itemIndex}`}>{item}</li>)}</List>;
          }
          case "quote":
            return <blockquote key={key}>{block.text}</blockquote>;
          case "callout":
            return <aside className="notion-callout" key={key}>{block.icon && <span aria-hidden="true">{block.icon}</span>}<p>{block.text}</p></aside>;
          case "code":
            return <pre className={block.language === "formula" ? "notion-formula" : undefined} key={key}><code data-language={block.language}>{block.text}</code></pre>;
          case "table":
            return (
              <div className="notion-table-wrap" key={key}>
                <table>
                  {block.caption && <caption>{block.caption}</caption>}
                  {block.headers?.length ? <thead><tr>{block.headers.map((header) => <th key={header} scope="col">{header}</th>)}</tr></thead> : null}
                  <tbody>{block.rows.map((row, rowIndex) => <tr key={`${key}-row-${rowIndex}`}>{row.map((cell, cellIndex) => <td key={`${key}-${rowIndex}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody>
                </table>
              </div>
            );
          case "image": {
            const publishable = block.rightsStatus === "cleared" && NOTION_IMAGE_PATH_RE.test(block.src);
            return (
              <figure className="notion-figure" key={key}>
                {publishable ? (
                  <a
                    className="notion-image-link"
                    href={block.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${block.alt || "원문 이미지"} 새 탭에서 확대`}
                  >
                    <Image
                      src={block.src}
                      alt={block.alt}
                      width={block.width ?? 1200}
                      height={block.height ?? 800}
                      sizes="(max-width: 800px) 100vw, 760px"
                      loading="lazy"
                      unoptimized
                    />
                    <span>새 탭에서 확대</span>
                  </a>
                ) : (
                  <div className="notion-image-placeholder" role="img" aria-label={block.alt || "출처 확인이 필요한 원문 이미지"}>
                    승인된 이미지 경로를 확인하지 못했습니다.
                  </div>
                )}
                {(block.caption || block.alt) && <figcaption>{block.caption || block.alt}</figcaption>}
              </figure>
            );
          }
          case "divider":
            return <hr key={key} />;
          default:
            return null;
        }
      })}
    </section>
  );
}

function getInitialLearningSelection() {
  const subject = subjects[0];
  if (!subject) throw new Error("학습 과목이 없습니다.");
  const chapter = subject.chapters.find((item) =>
    item.topics.some((topic) => topic.kind === "notion-original"),
  ) ?? subject.chapters[0];
  if (!chapter) throw new Error("학습 장이 없습니다.");
  const topic = chapter.topics.find((item) => item.kind === "notion-original") ?? chapter.topics[0];
  if (!topic) throw new Error("학습 문서가 없습니다.");
  return { subjectId: subject.id, chapterId: chapter.id, topicId: topic.id };
}

const initialLearningSelection = getInitialLearningSelection();

export default function Home() {
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialLearningSelection.subjectId);
  const [selectedChapterId, setSelectedChapterId] = useState(initialLearningSelection.chapterId);
  const [selectedTopicId, setSelectedTopicId] = useState(initialLearningSelection.topicId);
  const [completed, setCompleted] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [lastTopicId, setLastTopicId] = useState<string | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notionPayload, setNotionPayload] = useState<NotionTopicPayload | null>(null);
  const [notionPayloadLoading, setNotionPayloadLoading] = useState(false);
  const [notionPayloadError, setNotionPayloadError] = useState("");
  const [notionReloadKey, setNotionReloadKey] = useState(0);
  const [topicAnswer, setTopicAnswer] = useState("");
  const [topicResult, setTopicResult] = useState<"correct" | "wrong" | null>(null);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceSelections, setPracticeSelections] = useState<string[]>([]);
  const [practiceText, setPracticeText] = useState("");
  const [practiceOrder, setPracticeOrder] = useState<string[]>(
    practiceQuestions[4].orderItems ?? [],
  );
  const [practiceResult, setPracticeResult] = useState<"correct" | "wrong" | null>(null);
  const [visualOpen, setVisualOpen] = useState(false);
  const [mobileActive, setMobileActive] = useState("home");
  const [toast, setToast] = useState("");
  const lessonHeadingRef = useRef<HTMLHeadingElement>(null);

  const selectedSubject =
    subjects.find((subject) => subject.id === selectedSubjectId) ?? subjects[0];
  const selectedChapter =
    selectedSubject.chapters.find((chapter) => chapter.id === selectedChapterId) ??
    selectedSubject.chapters[0];
  const selectedTopic = getTopicById(selectedTopicId) ?? selectedChapter.topics[0];
  const selectedPath = getTopicPath(selectedTopic.id);
  const activePractice = practiceQuestions[practiceIndex];
  const hasNotionCatalog = notionCatalogStats.topics > 0;
  const completedSet = useMemo(
    () => new Set(completed.filter((topicId) => knownTopicIds.has(topicId))),
    [completed],
  );
  const bookmarkSet = useMemo(
    () => new Set(bookmarks.filter((topicId) => knownTopicIds.has(topicId))),
    [bookmarks],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<StoredStudyState>;
          setCompleted(Array.isArray(parsed.completed) ? parsed.completed.filter((id) => knownTopicIds.has(id)) : []);
          setBookmarks(Array.isArray(parsed.bookmarks) ? parsed.bookmarks.filter((id) => knownTopicIds.has(id)) : []);
          setLastTopicId(typeof parsed.lastTopicId === "string" && knownTopicIds.has(parsed.lastTopicId) ? parsed.lastTopicId : null);
          setWrongAnswers(Array.isArray(parsed.wrongAnswers) ? parsed.wrongAnswers : []);
        }
      } catch {
        // Corrupt or unavailable storage falls back to a clean local state.
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const state: StoredStudyState = { completed, bookmarks, lastTopicId, wrongAnswers };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // The learning flow remains available for the current session.
    }
  }, [bookmarks, completed, hydrated, lastTopicId, wrongAnswers]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setNotionPayload(null);
      setNotionPayloadError("");
      setNotionPayloadLoading(false);

      if (selectedTopic.kind !== "notion-original" || !selectedTopic.contentUrl) return;
      if (!selectedTopic.contentUrl.startsWith("/generated/topics/")) {
        setNotionPayloadError("허용되지 않은 원문 경로입니다.");
        return;
      }

      const cached = notionTopicCache.get(selectedTopic.id);
      if (cached) {
        setNotionPayload(cached);
        return;
      }

      setNotionPayloadLoading(true);
      void fetch(selectedTopic.contentUrl, { signal: controller.signal, cache: "force-cache" })
        .then(async (response) => {
          if (!response.ok) throw new Error(`원문을 불러오지 못했습니다 (${response.status})`);
          const parsed = parseNotionTopicPayload(await response.json(), selectedTopic.id);
          if (!parsed) throw new Error("원문 데이터 검증에 실패했습니다.");
          notionTopicCache.set(selectedTopic.id, parsed);
          setNotionPayload(parsed);
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          setNotionPayloadError(error instanceof Error ? error.message : "원문을 불러오지 못했습니다.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setNotionPayloadLoading(false);
        });
    }, 0);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [notionReloadKey, selectedTopic.contentUrl, selectedTopic.id, selectedTopic.kind]);

  const progress = allTopics.length
    ? Math.round((completedSet.size / allTopics.length) * 100)
    : 0;

  const searchResults = useMemo(() => {
    const needle = normalize(searchQuery);
    if (!needle) return [];
    const aliases: Record<string, string> = {
      ndt: "비파괴검사",
      oee: "설비종합효율",
      tpm: "전사적생산보전",
      plc: "programmablelogiccontroller",
    };
    const expanded = aliases[needle] ?? needle;
    return allTopics.filter((topic) => {
      const path = getTopicPath(topic.id);
      const haystack = normalize(
        [
          topic.title,
          topic.summary30s,
          ...topic.tags,
          ...topic.synonyms,
          ...(topic.categoryPath ?? []),
          topic.plainTextExcerpt ?? "",
          bundledSearchIndex.get(topic.id)?.normalizedText ?? "",
          path?.subject.title ?? "",
          path?.chapter.title ?? "",
          path?.chapter.title === "비파괴검사" ? "NDT" : "",
          topic.id === "oee-calculation" ? "설비종합효율" : "",
          topic.id === "tpm-autonomous-maintenance" ? "전사적생산보전" : "",
        ].join(" "),
      );
      return haystack.includes(needle) || haystack.includes(normalize(expanded));
    });
  }, [searchQuery]);

  const openTopic = (topicId: string, shouldScroll = true) => {
    const path = getTopicPath(topicId);
    if (!path) return;
    setSelectedSubjectId(path.subject.id);
    setSelectedChapterId(path.chapter.id);
    setSelectedTopicId(topicId);
    setTopicAnswer("");
    setTopicResult(null);
    setNotionPayload(null);
    setNotionPayloadError("");
    setNotionPayloadLoading(path.topic.kind === "notion-original");
    setLastTopicId(topicId);
    setSearchOpen(false);
    setSearchQuery("");
    if (shouldScroll) {
      window.setTimeout(() => {
        document.getElementById("learning-workspace")?.scrollIntoView({ behavior: "smooth" });
        lessonHeadingRef.current?.focus();
      }, 80);
    }
  };

  const selectPractice = (index: number) => {
    setPracticeIndex(index);
    setPracticeSelections([]);
    setPracticeText("");
    setPracticeOrder(practiceQuestions[index].orderItems ?? []);
    setPracticeResult(null);
  };

  const navigateTo = (id: string) => {
    setMobileActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleCompleted = (topicId: string) => {
    setCompleted((current) =>
      current.includes(topicId)
        ? current.filter((id) => id !== topicId)
        : [...current, topicId],
    );
    setToast(completedSet.has(topicId) ? "학습 완료를 해제했습니다." : "학습 완료로 기록했습니다.");
  };

  const toggleBookmark = (topicId: string) => {
    setBookmarks((current) =>
      current.includes(topicId)
        ? current.filter((id) => id !== topicId)
        : [...current, topicId],
    );
    setToast(bookmarkSet.has(topicId) ? "북마크를 해제했습니다." : "북마크에 저장했습니다.");
  };

  const saveWrongAnswer = (item: Omit<WrongAnswer, "attempts">) => {
    setWrongAnswers((current) => {
      const existing = current.find((wrong) => wrong.questionId === item.questionId);
      if (existing) {
        return current.map((wrong) =>
          wrong.questionId === item.questionId
            ? { ...item, attempts: wrong.attempts + 1 }
            : wrong,
        );
      }
      return [...current, { ...item, attempts: 1 }];
    });
  };

  const submitTopicQuiz = () => {
    const quiz = selectedTopic.quiz;
    if (!quiz || !topicAnswer) {
      setToast("답을 먼저 선택해 주세요.");
      return;
    }
    const isCorrect = topicAnswer === quiz.answerId;
    setTopicResult(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setWrongAnswers((current) =>
        current.filter((wrong) => wrong.questionId !== `topic-${selectedTopic.id}`),
      );
      setToast("정답입니다. 핵심 개념을 잘 이해했습니다.");
    } else {
      const correct = quiz.options.find((option) => option.id === quiz.answerId)?.text ?? quiz.answerId;
      const chosen = quiz.options.find((option) => option.id === topicAnswer)?.text ?? topicAnswer;
      saveWrongAnswer({
        questionId: `topic-${selectedTopic.id}`,
        topicId: selectedTopic.id,
        prompt: quiz.question,
        userAnswer: chosen,
        correctAnswer: correct,
        explanation: quiz.explanation,
      });
      setToast("오답노트에 저장했습니다.");
    }
  };

  const togglePracticeSelection = (id: string) => {
    if (activePractice.type === "복수선택") {
      setPracticeSelections((current) =>
        current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
      );
      return;
    }
    setPracticeSelections([id]);
  };

  const moveOrderItem = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= practiceOrder.length) return;
    setPracticeOrder((current) => {
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const submitPractice = () => {
    let userAnswers: string[] = [];
    if (activePractice.type === "순서") userAnswers = practiceOrder;
    else if (activePractice.type === "계산" || activePractice.type === "단답") {
      if (!practiceText.trim()) {
        setToast("답을 먼저 입력해 주세요.");
        return;
      }
      userAnswers = [practiceText.trim()];
    } else {
      if (!practiceSelections.length) {
        setToast("답을 먼저 선택해 주세요.");
        return;
      }
      userAnswers = [...practiceSelections].sort();
    }

    const expected = [...activePractice.answers].sort();
    const isCorrect =
      activePractice.type === "계산" || activePractice.type === "단답"
        ? expected.some((answer) => normalize(answer) === normalize(userAnswers[0]))
        : JSON.stringify(userAnswers) === JSON.stringify(expected);
    setPracticeResult(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setWrongAnswers((current) =>
        current.filter((wrong) => wrong.questionId !== activePractice.id),
      );
      setToast("정답입니다. 오답 기록이 있다면 복습 완료로 정리했습니다.");
    } else {
      saveWrongAnswer({
        questionId: activePractice.id,
        topicId: activePractice.topicId,
        prompt: activePractice.prompt,
        userAnswer:
          activePractice.type === "순서"
            ? userAnswers.join(" → ")
            : activePractice.options
              ? userAnswers
                  .map(
                    (answer) =>
                      activePractice.options?.find((option) => option.id === answer)?.text ?? answer,
                  )
                  .join(", ")
              : userAnswers.join(", "),
        correctAnswer: answerLabel(activePractice),
        explanation: activePractice.explanation,
      });
      setToast("오답노트에 저장했습니다.");
    }
  };

  const resetStudyData = () => {
    if (!window.confirm("이 기기에 저장된 진도·북마크·오답을 모두 초기화할까요?")) return;
    setCompleted([]);
    setBookmarks([]);
    setLastTopicId(null);
    setWrongAnswers([]);
    window.localStorage.removeItem(STORAGE_KEY);
    setToast("이 기기의 학습 기록을 초기화했습니다.");
  };

  const bookmarkedTopics = bookmarks
    .map((id) => getTopicById(id))
    .filter((topic): topic is IndexedTopic => Boolean(topic));

  return (
    <div className="shell">
      <a className="skip-link" href="#main-content">
        본문 바로가기
      </a>

      <header className="topbar">
        <div className="topbar-inner">
          <button className="brand" type="button" onClick={() => navigateTo("home")}>
            <span className="brand-mark" aria-hidden="true">M</span>
            <span className="brand-copy">
              <strong>설비보전 마스터북</strong>
              <small>Maintenance Masterbook</small>
            </span>
          </button>

          <nav className="nav-tabs" aria-label="주요 메뉴">
            <button type="button" onClick={() => navigateTo("home")}>홈</button>
            <button type="button" onClick={() => navigateTo("curriculum")}>이론 교과서</button>
            <button type="button" onClick={() => navigateTo("ncs-source")}>NCS 실무</button>
            <button type="button" onClick={() => navigateTo("photo-lab")}>사진·도감</button>
            <button type="button" onClick={() => navigateTo("practice")}>문제풀이</button>
          </nav>

          <div className="header-progress" aria-label={`전체 진도 ${progress}%`}>
            <span className="header-progress-value">{progress}%</span>
            <span>전체 진도</span>
          </div>
        </div>

        <div className="search-wrap">
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <span className="sr-only">개념 검색</span>
            <input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setSearchOpen(false);
                  event.currentTarget.blur();
                }
              }}
              placeholder="키워드, 약어, 장비명 검색 — 예: OEE, NDT, 베어링"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                className="search-clear"
                type="button"
                aria-label="검색어 지우기"
                onClick={() => setSearchQuery("")}
              >
                ×
              </button>
            )}
            <kbd>⌘ K</kbd>
          </label>
          {searchOpen && searchQuery && (
            <div className="search-panel" role="dialog" aria-label="검색 결과">
              <div className="search-panel-head">
                <strong>검색 결과 {searchResults.length}건</strong>
                <button type="button" className="ghost-button" onClick={() => setSearchOpen(false)}>
                  닫기
                </button>
              </div>
              <div className="search-results" role="list">
                {searchResults.length ? (
                  searchResults.slice(0, 10).map((topic) => {
                    const path = getTopicPath(topic.id);
                    const excerpt = bundledSearchIndex.get(topic.id)?.excerpt?.trim();
                    return (
                      <button
                        type="button"
                        className="search-result"
                        key={topic.id}
                        onClick={() => openTopic(topic.id)}
                      >
                        <span>
                          <strong>{topic.title}</strong>
                          <small>{[path?.subject.title, path?.chapter.title, ...(topic.categoryPath ?? [])].filter(Boolean).join(" · ")}</small>
                          {excerpt ? <span className="search-result-excerpt">{excerpt}</span> : null}
                        </span>
                        <span className="search-result-badges">
                          <Badge tone={topic.kind === "notion-original" ? "notion" : "explain"}>{topic.sourceType}</Badge>
                          <Badge tone="check">{topic.reviewStatus}</Badge>
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="empty-state compact">
                    <strong>일치하는 개념이 없습니다.</strong>
                    <span>띄어쓰기를 줄이거나 약어 대신 한글 명칭을 검색해 보세요.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main id="main-content">
        <section className="hero" id="home">
          <div className="hero-copy">
            <div className="eyebrow"><span /> {hasNotionCatalog ? "Notion 원문 전수 이관판" : "공개형 학습 기본판"} · 검토 기준일 {REVIEW_DATE}</div>
            <h1>현장에서 찾고,<br />시험장에서 떠올리는<br /><em>설비보전 이론서</em></h1>
            <p className="hero-lead">
              4과목·19개 장을 학습 단위로 나누고, 원문 이론과 출처, 문제풀이와 오답을 한 화면에 연결했습니다.
            </p>
            <div className="hero-actions">
              <button className="primary-button" type="button" onClick={() => navigateTo("curriculum")}>
                목차에서 시작하기 <span aria-hidden="true">→</span>
              </button>
              {lastTopicId ? (
                <button className="secondary-button" type="button" onClick={() => openTopic(lastTopicId)}>
                  이어서 공부하기
                </button>
              ) : (
                <button className="secondary-button" type="button" onClick={() => openTopic("tapered-roller-bearing")}>
                  대표 개념 둘러보기
                </button>
              )}
            </div>
          </div>
          <div className="hero-board" aria-label="학습 구성 요약">
            <div className="board-label">MASTER MAP</div>
            <div className="board-dial">
              <span style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties} />
              <strong>{progress}%</strong>
              <small>전체 진도</small>
            </div>
            <div className="board-grid">
              <div><strong>{String(subjects.length).padStart(2, "0")}</strong><span>과목·부록</span></div>
              <div><strong>{allChapters.length}</strong><span>목차 그룹</span></div>
              <div><strong>{allTopics.length}</strong><span>학습 문서</span></div>
              <div><strong>06</strong><span>문제 유형</span></div>
            </div>
            <p>{hasNotionCatalog
              ? `${notionCatalogStats.topics}개 학습 페이지로 재구성했고, 표 ${notionCatalogStats.tables}개와 이미지 ${notionCatalogStats.images}개를 원래 순서로 보존했습니다.`
              : "Notion 원문 전수 변환과 출처 검수를 준비하고 있습니다."}</p>
          </div>
        </section>

        <section className="section curriculum" id="curriculum">
          <div className="section-heading">
            <div>
              <span className="section-kicker">CURRICULUM</span>
              <h2>{subjects.length}개 과목·부록, {allChapters.length}개 목차 그룹</h2>
            </div>
            <p>과목을 고르면 장과 세부 개념을 바로 펼쳐볼 수 있습니다.</p>
          </div>

          <div className="subject-grid">
            {subjects.map((subject, index) => {
              const subjectTopicIds = subject.chapters.flatMap((chapter) => chapter.topics.map((topic) => topic.id));
              const done = subjectTopicIds.filter((id) => completedSet.has(id)).length;
              const value = Math.round((done / subjectTopicIds.length) * 100);
              return (
                <button
                  type="button"
                  key={subject.id}
                  className={`subject-card accent-${subjectAccents[index % subjectAccents.length]} ${selectedSubject.id === subject.id ? "active" : ""}`}
                  onClick={() => {
                    const firstChapter = subject.chapters[0];
                    setSelectedSubjectId(subject.id);
                    setSelectedChapterId(firstChapter.id);
                    openTopic(firstChapter.topics[0].id);
                  }}
                >
                  <span className="subject-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="subject-card-body">
                    <strong>{subject.title}</strong>
                    <small>{subject.chapters.length}개 목차 그룹 · {subjectTopicIds.length}개 학습 문서</small>
                    <ProgressBar value={value} label={`${subject.title} 진도`} />
                  </span>
                  <span className="subject-arrow" aria-hidden="true">↗</span>
                </button>
              );
            })}
          </div>

          <div className="workspace" id="learning-workspace">
            <aside className="chapter-panel" aria-label="장과 세부 개념">
              <div className="panel-heading">
                <span>선택 과목</span>
                <strong>{selectedSubject.title}</strong>
              </div>
              <div className="subject-pills" aria-label="과목 선택">
                {subjects.map((subject, index) => (
                  <button
                    type="button"
                    key={subject.id}
                    aria-pressed={selectedSubject.id === subject.id}
                    onClick={() => {
                      const chapter = subject.chapters[0];
                      setSelectedSubjectId(subject.id);
                      setSelectedChapterId(chapter.id);
                      openTopic(chapter.topics[0].id, false);
                    }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="chapter-list">
                {selectedSubject.chapters.map((chapter) => {
                  const chapterDone = chapter.topics.filter((topic) => completedSet.has(topic.id)).length;
                  const active = chapter.id === selectedChapter.id;
                  return (
                    <div className={`chapter-group ${active ? "active" : ""}`} key={chapter.id}>
                      <button
                        type="button"
                        className="chapter-item"
                        aria-expanded={active}
                        onClick={() => {
                          setSelectedChapterId(chapter.id);
                          if (!chapter.topics.some((topic) => topic.id === selectedTopic.id)) {
                            openTopic(chapter.topics[0].id, false);
                          }
                        }}
                      >
                        <span>{chapter.title}</span>
                        <small>{chapterDone}/{chapter.topics.length}</small>
                      </button>
                      {active && (
                        <div className="topic-list">
                          {groupTopicsByCategory(chapter.topics).map(([label, topics]) => {
                            const groupSelected = topics.some((topic) => topic.id === selectedTopic.id);
                            const groupDone = topics.filter((topic) => completedSet.has(topic.id)).length;
                            return (
                              <details className="topic-category" key={`${label}-${groupSelected}`} open={groupSelected}>
                                <summary><span>{label}</span><small>{groupDone}/{topics.length}</small></summary>
                                <div className="topic-sublist">
                                  {topics.map((topic) => (
                                    <button
                                      type="button"
                                      key={topic.id}
                                      className={`topic-item ${selectedTopic.id === topic.id ? "active" : ""}`}
                                      onClick={() => openTopic(topic.id, false)}
                                    >
                                      <span className={`status-dot ${completedSet.has(topic.id) ? "done" : ""}`} />
                                      <span>{topic.title}</span>
                                      {bookmarkSet.has(topic.id) && <span aria-label="북마크됨">★</span>}
                                    </button>
                                  ))}
                                </div>
                              </details>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </aside>

            <article className="lesson">
              <div className="lesson-header">
                <div className="breadcrumb" aria-label="현재 위치">
                  <span>{selectedPath?.subject.title}</span>
                  <span aria-hidden="true">/</span>
                  <span>{selectedPath?.chapter.title}</span>
                  {selectedTopic.categoryPath?.length ? <><span aria-hidden="true">/</span><span>{selectedTopic.categoryPath.join(" › ")}</span></> : null}
                </div>
                <div className="lesson-title-row">
                  <div>
                    <div className="lesson-badges">
                      <Badge tone={selectedTopic.kind === "notion-original" ? "notion" : "explain"}>{selectedTopic.sourceType}</Badge>
                      <Badge tone="check">{selectedTopic.reviewStatus}</Badge>
                    </div>
                    <h2 ref={lessonHeadingRef} tabIndex={-1}>{selectedTopic.title}</h2>
                  </div>
                  <div className="lesson-actions">
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={bookmarkSet.has(selectedTopic.id) ? "북마크 해제" : "북마크 추가"}
                      aria-pressed={bookmarkSet.has(selectedTopic.id)}
                      onClick={() => toggleBookmark(selectedTopic.id)}
                    >
                      {bookmarkSet.has(selectedTopic.id) ? "★" : "☆"}
                    </button>
                    <button
                      type="button"
                      className={completedSet.has(selectedTopic.id) ? "complete-button done" : "complete-button"}
                      aria-pressed={completedSet.has(selectedTopic.id)}
                      onClick={() => toggleCompleted(selectedTopic.id)}
                    >
                      {completedSet.has(selectedTopic.id) ? "✓ 학습 완료" : "학습 완료하기"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="lesson-content">
              {selectedTopic.kind !== "notion-original" ? (
                <section className="summary-card" aria-labelledby="summary-title">
                  <span className="card-number">01</span>
                  <div>
                    <h3 id="summary-title">30초 핵심</h3>
                    <p>{selectedTopic.summary30s}</p>
                  </div>
                </section>
              ) : null}

              {selectedTopic.kind === "notion-original" && notionPayloadLoading ? (
                <section className="notion-loading" aria-live="polite">
                  <span className="loading-pulse" aria-hidden="true" />
                  <div><strong>원문 이론을 불러오는 중입니다.</strong><p>선택한 학습 문서만 불러와 초기 화면 속도를 유지합니다.</p></div>
                </section>
              ) : null}

              {selectedTopic.kind === "notion-original" && notionPayloadError ? (
                <section className="notion-error" role="alert">
                  <div><strong>원문을 표시하지 못했습니다.</strong><p>{notionPayloadError}</p></div>
                  <button className="secondary-button" type="button" onClick={() => setNotionReloadKey((value) => value + 1)}>다시 불러오기</button>
                </section>
              ) : null}

              {selectedTopic.kind === "notion-original" && notionPayload ? (
                <>
                  <NotionPageToc blocks={notionPayload.blocks} topicId={notionPayload.id} />
                  <NotionTheoryContent blocks={notionPayload.blocks} topicId={notionPayload.id} />
                </>
              ) : null}

              {selectedTopic.keyPoints?.length ? (
                <section className="lesson-section">
                  <div className="lesson-section-title"><span>02</span><h3>상세 이론</h3></div>
                  <div className="key-grid">
                    {selectedTopic.keyPoints.map((point, index) => (
                      <div className="key-card" key={point}>
                        <strong>{String(index + 1).padStart(2, "0")}</strong>
                        <p>{point}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {selectedTopic.detailSections?.length ? (
                <section className="theory-blocks" aria-label="개념 상세 설명">
                  {selectedTopic.detailSections.map((section, index) => (
                    <div className="theory-block" key={section.title}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <h3>{section.title}</h3>
                        <p>{section.body}</p>
                      </div>
                    </div>
                  ))}
                </section>
              ) : null}

              {selectedTopic.id === "oee-calculation" && (
                <section className="formula-card">
                  <div><span>공식</span><strong>OEE = 시간가동률 × 성능가동률 × 양품률</strong></div>
                  <p>각 비율을 소수로 환산해 곱한 뒤 100을 곱합니다.</p>
                </section>
              )}

              {selectedTopic.comparisons?.length ? (
                <section className="comparison-card">
                  <div className="lesson-section-title"><span>03</span><h3>공식·비교</h3></div>
                  <div className="comparison-list" role="table" aria-label={`${selectedTopic.title} 핵심 비교`}>
                    <div role="row"><strong role="columnheader">구분</strong><strong role="columnheader">핵심 내용</strong><strong role="columnheader">판단 포인트</strong></div>
                    {selectedTopic.comparisons.map((row) => (
                      <div role="row" key={`${row.label}-${row.value}`}>
                        <strong role="cell">{row.label}</strong>
                        <span role="cell">{row.value}</span>
                        <span role="cell">{row.note ?? "—"}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {selectedTopic.workSteps?.length ? (
                <section className="procedure-card" id="ncs-procedure">
                  <div className="lesson-section-title"><span>04</span><h3>점검·작업 순서</h3></div>
                  <ol>
                    {selectedTopic.workSteps.map((step, index) => (
                      <li key={step}><span>{index + 1}</span><p>{step}</p></li>
                    ))}
                  </ol>
                  <div className="source-caution">
                    <Badge tone="ncs">실무 연결</Badge>
                    <span>현장에서는 설비 제작사 절차와 사업장 안전기준을 우선 적용합니다.</span>
                  </div>
                </section>
              ) : null}

              {selectedTopic.examConnection ? (
                <section className="exam-card">
                  <span className="exam-label">출제 연결</span>
                  <div>
                    <h3>시험에서는 이렇게 연결됩니다</h3>
                    <p>{selectedTopic.examConnection}</p>
                  </div>
                </section>
              ) : null}

              {selectedTopic.commonTrap && (
                <section className="trap-card">
                  <div><h3>자주 틀리는 함정</h3><p>{selectedTopic.commonTrap}</p></div>
                </section>
              )}

              {selectedTopic.quiz ? (
                <section className="quiz-card">
                  <div className="quiz-header">
                    <div>
                      <span className="section-kicker">QUICK CHECK</span>
                      <h3>바로 확인하는 1문제</h3>
                    </div>
                    <Badge tone="forecast">출제 예상·변형</Badge>
                  </div>
                  <p className="quiz-question">{selectedTopic.quiz.question}</p>
                  <div className="quiz-options">
                    {selectedTopic.quiz.options.map((option) => (
                      <label className={`quiz-choice ${topicAnswer === option.id ? "is-selected" : ""}`} key={option.id}>
                        <input
                          type="radio"
                          name={`topic-${selectedTopic.id}`}
                          value={option.id}
                          checked={topicAnswer === option.id}
                          onChange={() => {
                            setTopicAnswer(option.id);
                            setTopicResult(null);
                          }}
                        />
                        <span>{option.id}</span>
                        <strong>{option.text}</strong>
                      </label>
                    ))}
                  </div>
                  <button className="primary-button full-width" type="button" onClick={submitTopicQuiz}>정답 확인</button>
                  {topicResult && (
                    <div className={`answer-feedback is-${topicResult}`} role="status">
                      <strong>{topicResult === "correct" ? "정답입니다." : "다시 확인해 보세요."}</strong>
                      <p>{selectedTopic.quiz.explanation}</p>
                    </div>
                  )}
                </section>
              ) : selectedTopic.kind === "notion-original" ? (
                <div className="notion-quiz-note">
                  <Badge tone="pending">문제 연결 예정</Badge>
                  <span>원문 학습 완료는 기록할 수 있으며, 검수된 문제는 이후 연결됩니다.</span>
                </div>
              ) : (
                <section className="empty-state lesson-empty">
                  <strong>이 개념의 문제는 검수 중입니다.</strong>
                  <span>대표 문제 6종은 아래 문제풀이에서 먼저 연습할 수 있습니다.</span>
                  <button className="secondary-button" type="button" onClick={() => navigateTo("practice")}>대표 문제 풀기</button>
                </section>
              )}

              <section className="source-card">
                <div className="lesson-section-title"><span>05</span><h3>출처·검토 정보</h3></div>
                <dl>
                  <div><dt>자료 성격</dt><dd>{selectedTopic.sourceType}</dd></div>
                  <div><dt>검증 상태</dt><dd>{selectedTopic.reviewStatus}</dd></div>
                  <div><dt>{selectedTopic.kind === "notion-original" ? "수집 기준일" : "검토 기준일"}</dt><dd>{selectedTopic.reviewedAt}</dd></div>
                  {selectedTopic.kind === "notion-original" && selectedTopic.categoryPath?.length ? <div><dt>원문 계층</dt><dd>{selectedTopic.categoryPath.join(" › ")}</dd></div> : null}
                  <div><dt>공개 기준</dt><dd>{selectedTopic.kind === "notion-original" ? "사용 승인된 원문 이미지 포함" : "원문 대조 후 공개"}</dd></div>
                </dl>
                <p>{selectedTopic.kind === "notion-original"
                  ? "Notion 원문을 제목 계층과 블록 구조에 따라 분리한 학습 문서입니다. 수치·법령·표현은 검토 상태 배지를 함께 확인하세요."
                  : "현재 본문은 학습 구조 검증용 상세 해설입니다. 공식 기준이나 NCS 원문으로 확정하기 전 원문 대조가 필요합니다."}</p>
              </section>
              </div>
            </article>

            <aside className="study-rail" aria-label="나의 학습 현황">
              <div className="quick-card progress-card">
                <span className="section-kicker">MY PROGRESS</span>
                <div className="progress-big"><strong>{progress}%</strong><span>완료 {completedSet.size}/{allTopics.length}</span></div>
                <ProgressBar value={progress} label="전체 진도" />
              </div>
              <div className="quick-card">
                <div className="quick-card-head"><strong>북마크</strong><span>{bookmarkSet.size}</span></div>
                {bookmarkedTopics.length ? (
                  <div className="mini-list">
                    {bookmarkedTopics.slice(0, 4).map((topic) => (
                      <button type="button" key={topic.id} onClick={() => openTopic(topic.id, false)}>{topic.title}<span>→</span></button>
                    ))}
                  </div>
                ) : (
                  <p className="muted">별표를 누르면 다시 볼 개념이 여기에 모입니다.</p>
                )}
              </div>
              <div className="quick-card caution-card">
                <strong>저장 안내</strong>
                <p>진도·북마크·오답은 로그인 없이 이 기기의 브라우저에만 저장됩니다.</p>
                <button type="button" className="ghost-button danger" onClick={resetStudyData}>학습 기록 초기화</button>
              </div>
            </aside>
          </div>
        </section>

        <section className="section photo-section" id="photo-lab">
          <div className="section-heading light">
            <div><span className="section-kicker">VISUAL LAB</span><h2>사진·도감 학습실</h2></div>
            <p>캡션을 가린 채 확대해서 보고, 명칭과 점검 포인트를 맞히는 학습 자산입니다.</p>
          </div>
          <div className="photo-layout">
            <button type="button" className="photo-stage" onClick={() => setVisualOpen(true)} aria-label="학습 도식 확대">
              <Image src="/og.png" alt="명칭을 가린 기계 부품과 제어회로 학습 도식" fill sizes="(max-width: 800px) 100vw, 58vw" />
              <span className="photo-cover">명칭 가림 · 눌러서 확대</span>
            </button>
            <div className="photo-copy">
              <Badge tone="official">직접 제작 학습 도식</Badge>
              <h3>대표 시각자료 01</h3>
              <p>베어링 단면과 PLC 래더 회로의 식별 포인트를 한 장에 배치한 공개 가능 샘플입니다.</p>
              <ul>
                <li><strong>식별 특징</strong><span>궤도·롤러 형상, 접점·코일 배치</span></li>
                <li><strong>연결 개념</strong><span>구동장치 조립, 공정제어</span></li>
                <li><strong>출처 상태</strong><span>AI 직접 제작 · 원문 이미지 미사용</span></li>
              </ul>
              <button className="secondary-button light-button" type="button" onClick={() => {
                selectPractice(5);
                navigateTo("practice");
              }}>사진판별 문제 풀기</button>
              <small>{hasNotionCatalog ? `원문 이미지 ${notionCatalogStats.images}개는 각 이론 페이지의 원래 위치에서 확대해 볼 수 있습니다.` : "Notion 원본 이미지는 권리·출처 검수 후 자체 저장소로 이관합니다."}</small>
            </div>
          </div>
        </section>

        <section className="section practice-section" id="practice">
          <div className="section-heading">
            <div><span className="section-kicker">PRACTICE</span><h2>6가지 문제 유형 연습</h2></div>
            <p>정답을 확인하면 해설이 열리고, 틀린 문제는 자동으로 오답노트에 저장됩니다.</p>
          </div>
          <div className="practice-shell">
            <div className="practice-tabs" role="tablist" aria-label="문제 유형">
              {practiceQuestions.map((question, index) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={practiceIndex === index}
                  className={practiceIndex === index ? "active" : ""}
                  onClick={() => selectPractice(index)}
                  key={question.id}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>{question.type}
                </button>
              ))}
            </div>
            <div className="practice-card">
              <div className="practice-meta">
                <Badge tone="forecast">출제 예상·변형</Badge>
                <span>{activePractice.type}</span>
              </div>
              <h3>{activePractice.prompt}</h3>

              {activePractice.visual && (
                <button type="button" className="quiz-visual" onClick={() => setVisualOpen(true)} aria-label="판별 도식 확대">
                  <Image src="/og.png" alt="명칭이 표시되지 않은 부품 단면 학습 도식" fill sizes="(max-width: 800px) 100vw, 50vw" />
                  <span>확대해서 보기</span>
                </button>
              )}

              {activePractice.options && (
                <div className="quiz-options two-column">
                  {activePractice.options.map((option) => (
                    <label className={`quiz-choice ${practiceSelections.includes(option.id) ? "selected" : ""}`} key={option.id}>
                      <input
                        type={activePractice.type === "복수선택" ? "checkbox" : "radio"}
                        name={activePractice.id}
                        value={option.id}
                        checked={practiceSelections.includes(option.id)}
                        onChange={() => {
                          togglePracticeSelection(option.id);
                          setPracticeResult(null);
                        }}
                      />
                      <span>{option.id}</span><strong>{option.text}</strong>
                    </label>
                  ))}
                </div>
              )}

              {(activePractice.type === "계산" || activePractice.type === "단답") && (
                <label className="answer-input">
                  <span>답 입력</span>
                  <input
                    value={practiceText}
                    onChange={(event) => {
                      setPracticeText(event.target.value);
                      setPracticeResult(null);
                    }}
                    placeholder={activePractice.type === "계산" ? "숫자 또는 %로 입력" : "한글 또는 약어로 입력"}
                  />
                </label>
              )}

              {activePractice.type === "순서" && (
                <ol className="order-list">
                  {practiceOrder.map((item, index) => (
                    <li key={item}>
                      <span>{index + 1}</span><strong>{item}</strong>
                      <div>
                        <button type="button" aria-label={`${item} 위로 이동`} onClick={() => moveOrderItem(index, -1)} disabled={index === 0}>↑</button>
                        <button type="button" aria-label={`${item} 아래로 이동`} onClick={() => moveOrderItem(index, 1)} disabled={index === practiceOrder.length - 1}>↓</button>
                      </div>
                    </li>
                  ))}
                </ol>
              )}

              <button className="primary-button full-width" type="button" onClick={submitPractice}>채점하고 해설 보기</button>
              {practiceResult && (
                <div className={`answer-feedback is-${practiceResult}`} role="status">
                  <strong>{practiceResult === "correct" ? "정답입니다." : `정답: ${answerLabel(activePractice)}`}</strong>
                  <p>{activePractice.explanation}</p>
                  <button type="button" className="ghost-button" onClick={() => openTopic(activePractice.topicId)}>관련 개념 복습하기 →</button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="section wrong-section" id="wrong-notes">
          <div className="section-heading">
            <div><span className="section-kicker">REVIEW</span><h2>나의 오답노트</h2></div>
            <p>같은 문제를 다시 틀리면 카드가 늘어나는 대신 시도 횟수가 누적됩니다.</p>
          </div>
          {wrongAnswers.length ? (
            <div className="wrong-grid">
              {wrongAnswers.map((wrong) => (
                <article className="wrong-card" key={wrong.questionId}>
                  <div className="wrong-card-head"><Badge tone="restore">복습 필요</Badge><span>{wrong.attempts}회 오답</span></div>
                  <h3>{wrong.prompt}</h3>
                  <dl><div><dt>내 답</dt><dd>{wrong.userAnswer}</dd></div><div><dt>정답</dt><dd>{wrong.correctAnswer}</dd></div></dl>
                  <p>{wrong.explanation}</p>
                  <div className="wrong-actions">
                    <button className="secondary-button" type="button" onClick={() => openTopic(wrong.topicId)}>개념 복습</button>
                    <button className="ghost-button" type="button" onClick={() => setWrongAnswers((current) => current.filter((item) => item.questionId !== wrong.questionId))}>복습 완료</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">✓</span>
              <strong>아직 저장된 오답이 없습니다.</strong>
              <span>문제를 풀고 틀린 항목은 자동으로 여기에 모입니다.</span>
              <button className="secondary-button" type="button" onClick={() => navigateTo("practice")}>첫 문제 풀기</button>
            </div>
          )}
        </section>

        <section className="section standards-section" id="ncs-source">
          <div>
            <span className="section-kicker">SOURCE STANDARD</span>
            <h2>자료의 성격과 확실도를 분리합니다.</h2>
            <p>공식 자료, 해설, 수험자 복원, 예상 문제를 같은 무게로 보이지 않도록 모든 콘텐츠에 두 종류의 정보를 표시합니다.</p>
          </div>
          <div className="standards-grid">
            <div><strong>자료 유형</strong><span><Badge tone="ncs">NCS 원문</Badge><Badge tone="official">공식 기준</Badge><Badge tone="explain">상세 해설</Badge><Badge tone="restore">비공식 수험자 복원</Badge><Badge tone="forecast">출제 예상·변형</Badge></span></div>
            <div><strong>검증 상태</strong><span><Badge tone="check">검토 완료</Badge><Badge tone="pending">부분 확인</Badge><Badge tone="warning">확인 필요</Badge></span></div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div><strong>설비보전 마스터북</strong><p>Notion은 편집 원본으로, 웹은 검증된 학습판으로 운영합니다.</p></div>
        <div><span>공개형 MVP</span><span>검토 기준일 {REVIEW_DATE}</span></div>
      </footer>

      <nav className="mobile-nav" aria-label="모바일 주요 메뉴">
        {[
          ["home", "⌂", "홈"],
          ["curriculum", "▤", "과목"],
          ["photo-lab", "▧", "사진"],
          ["practice", "?", "문제"],
          ["wrong-notes", "!", "오답"],
        ].map(([id, icon, label]) => (
          <button type="button" key={id} aria-current={mobileActive === id ? "page" : undefined} onClick={() => navigateTo(id)}>
            <span aria-hidden="true">{icon}</span>{label}
          </button>
        ))}
      </nav>

      {visualOpen && (
        <div className="modal" role="dialog" aria-modal="true" aria-label="학습 도식 확대" onKeyDown={(event) => {
          if (event.key === "Escape") setVisualOpen(false);
        }}>
          <button className="modal-backdrop" type="button" aria-label="확대 화면 닫기" onClick={() => setVisualOpen(false)} />
          <div className="modal-card">
            <button className="modal-close" type="button" autoFocus onClick={() => setVisualOpen(false)}>닫기 ×</button>
            <div className="modal-image"><Image src="/og.png" alt="베어링 단면과 PLC 래더 회로 학습 도식 확대" fill sizes="95vw" /></div>
            <p><Badge tone="official">직접 제작</Badge> 공개용 학습 샘플 · 원문 이미지 미사용</p>
          </div>
        </div>
      )}

      <div className="toast" role="status" aria-live="polite" data-visible={Boolean(toast)}>{toast}</div>
    </div>
  );
}
