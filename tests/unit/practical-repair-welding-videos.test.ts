import { describe, expect, it } from "vitest";
import {
  getYouTubeNoCookieEmbedUrl,
  practicalRepairWeldingVideos,
} from "@/data/source/practical-repair-welding-videos";

describe("practical repair welding video resources", () => {
  it("keeps exactly the six user-supplied supplemental videos", () => {
    expect(practicalRepairWeldingVideos).toHaveLength(6);
    expect(new Set(practicalRepairWeldingVideos.map((video) => video.id)).size).toBe(6);
    expect(new Set(practicalRepairWeldingVideos.map((video) => video.videoId)).size).toBe(6);
    expect(practicalRepairWeldingVideos.map((video) => video.videoId)).toEqual([
      "jgTCtTlQjro",
      "5ae44u6P9sE",
      "V06hKuKermc",
      "VwtceMYlGOo",
      "z6oQEGsvl10",
      "9xxk6SPZ0yI",
    ]);
  });

  it("labels the new welding demonstration as an industrial-engineer resource", () => {
    const industrialEngineerVideo = practicalRepairWeldingVideos.find(
      (video) => video.id === "industrial-engineer-task-3-drawing-1",
    );

    expect(industrialEngineerVideo?.label).toBe(
      "설비보전산업기사 3과제 용접 · 1번 도면",
    );
    expect(industrialEngineerVideo?.sourceTitle).toBe(
      "2026년 설비보전산업기사 실기 3과제 용접 시연 영상 (1번도면)",
    );
    expect(industrialEngineerVideo?.videoId).toBe("9xxk6SPZ0yI");
  });

  it("uses privacy-enhanced embeds and links every video to NCS-based theory", () => {
    for (const video of practicalRepairWeldingVideos) {
      expect(getYouTubeNoCookieEmbedUrl(video.videoId)).toBe(
        `https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0`,
      );
      expect(video.sourceUrl).toMatch(/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//);
      expect(video.relatedLessons.length).toBeGreaterThan(0);
      expect(video.caution).toContain("WPS");
    }
  });
});
