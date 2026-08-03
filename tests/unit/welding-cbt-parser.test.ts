import { describe, expect, it } from "vitest";
import {
  extractExamUrls,
  parseWeldingCbtExamPage,
  type WeldingCbtTrackManifest,
} from "@/lib/content/welding-cbt-parser";

const manifest: WeldingCbtTrackManifest = {
  key: "welding-engineer",
  title: "용접기사",
  categoryUrl: "https://cbtbank.kr/category/test",
  examPathPrefix: "np",
  includeSubjectTitles: [/용접일반\s*및\s*안전관리/],
};

describe("welding CBT source parser", () => {
  it("discovers deterministic exam URLs and strips tracking fragments", () => {
    const html = `
      <a href="/exam/np20210814#google_vignette">1</a>
      <a href="https://cbtbank.kr/exam/np20210515?from=list">2</a>
      <a href="/exam/bx20210814">wrong track</a>
    `;

    expect(
      extractExamUrls(html, manifest.categoryUrl, manifest.examPathPrefix),
    ).toEqual([
      "https://cbtbank.kr/exam/np20210515",
      "https://cbtbank.kr/exam/np20210814",
    ]);
  });

  it("preserves Korean prompt and choices while excluding reply explanations", () => {
    const html = `
      <html><head><title>용접기사 2021-08-14 필기 기출문제복원</title></head>
      <body>
        <div class="exam-class-title"><div><p>5과목: 용접일반 및 안전관리</p></div></div>
        <article question-id="q81" question-num="81">
          <p class="exam-title"><span class="exam-number">81</span>. 용접 안전에 관한 설명으로 옳은 것은?</p>
          <ol correct="2">
            <li>누설은 불꽃으로 확인한다.</li>
            <li>이상 발견 시 작업을 중지한다.</li>
            <li>산소로 밀폐공간을 환기한다.</li>
            <li>젖은 장갑으로 홀더를 잡는다.</li>
          </ol>
          <div class="reply collapse">외부 해설은 수집하지 않는다.</div>
        </article>
      </body></html>
    `;

    const [record] = parseWeldingCbtExamPage(
      html,
      "https://cbtbank.kr/exam/np20210814",
      manifest,
    );

    expect(record.stem).toBe("용접 안전에 관한 설명으로 옳은 것은?");
    expect(record.choices).toEqual([
      "누설은 불꽃으로 확인한다.",
      "이상 발견 시 작업을 중지한다.",
      "산소로 밀폐공간을 환기한다.",
      "젖은 장갑으로 홀더를 잡는다.",
    ]);
    expect(record.correctIndex).toBe(1);
    expect(JSON.stringify(record)).not.toContain("외부 해설");
    expect(record.auditResolution).toBe("approved");
  });

  it("holds image-dependent questions instead of publishing external images", () => {
    const html = `
      <div class="exam-class-title"><div><p>5과목: 용접일반 및 안전관리</p></div></div>
      <article question-id="q82" question-num="82">
        <p class="exam-title"><span class="exam-number">82</span>. 다음 그림의 안전표지는?</p>
        <img src="/images/sign.png" alt="표지">
        <ol correct="1"><li>금지</li><li>경고</li><li>지시</li><li>안내</li></ol>
      </article>
    `;

    const [record] = parseWeldingCbtExamPage(
      html,
      "https://cbtbank.kr/exam/np20210814",
      manifest,
    );

    expect(record.assetStatus).toBe("rights_hold");
    expect(record.auditResolution).toBe("hold");
    expect(record.holdReasons).toContain("external_image_rights");
  });
});
