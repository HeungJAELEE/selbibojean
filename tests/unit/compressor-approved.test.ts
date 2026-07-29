import { describe, expect, it } from "vitest";
import rawContent from "@/data/generated/content.json";
import { mergeApprovedCompressorContent } from "@/lib/content/compressor-approved";
import type { GeneratedContent } from "@/lib/domain/types";

const content = mergeApprovedCompressorContent(rawContent as GeneratedContent);

describe("approved compressor learning content", () => {
  it.each(["lesson-1jbssv6", "lesson-37xkxo"])(
    "adds the complete compressor classification and sequences to %s",
    (lessonId) => {
      const lesson = content.lessons.find((candidate) => candidate.id === lessonId);
      expect(lesson).toBeDefined();

      const definition = lesson?.blocks.find((block) => block.id === "definition");
      const principle = lesson?.blocks.find((block) => block.id === "principle");
      const source = lesson?.blocks.find((block) => block.id === "source");

      expect(definition?.body).toContain("용적형 압축기");
      expect(definition?.body).toContain("왕복동식");
      expect(definition?.body).toContain("스크루식");
      expect(definition?.body).toContain("베인식");
      expect(definition?.body).toContain("루츠식·로브식");
      expect(definition?.body).toContain("스크롤식");
      expect(definition?.body).toContain("액봉식");
      expect(definition?.body).toContain("동력형(터보형)");
      expect(definition?.body).toContain("원심식");
      expect(definition?.body).toContain("축류식");
      expect(definition?.body).toContain("사류식");
      expect(definition?.body).toContain("기어형");
      expect(definition?.body).toContain("유압 용적식 펌프");

      expect(principle?.body).toContain("형식별 작동 순서");
      expect(principle?.body).toContain("흡입밸브 열림");
      expect(principle?.body).toContain("작업실에 기체 포획");
      expect(principle?.body).toContain("속도에너지를 압력으로 변환");
      expect(source?.body).toContain("energy.gov");
    },
  );

  it("does not alter unrelated lessons", () => {
    const before = (rawContent as GeneratedContent).lessons.find(
      (lesson) => lesson.id === "lesson-y0oy73",
    );
    const after = content.lessons.find((lesson) => lesson.id === "lesson-y0oy73");

    expect(after).toEqual(before);
  });
});
