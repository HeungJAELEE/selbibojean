import { describe, expect, it } from "vitest";
import {
  getFluidPowerYouTubeEmbedUrl,
  practicalFluidPowerVideoGroups,
} from "@/data/source/practical-fluid-power-videos";

describe("practical fluid power video resources", () => {
  it("keeps the user-supplied circuit, article, industrial-engineer, and paid groups", () => {
    expect(practicalFluidPowerVideoGroups.map((group) => group.id)).toEqual([
      "circuit-memorization",
      "pneumatic-1-to-8",
      "hydraulic-1-to-8",
      "industrial-engineer-busan",
      "paid-course",
      "hydraulic-beginner-review",
    ]);

    const counts = practicalFluidPowerVideoGroups.map(
      (group) => group.videos.length,
    );
    expect(counts).toEqual([3, 8, 8, 8, 1, 6]);

    const videos = practicalFluidPowerVideoGroups.flatMap(
      (group) => group.videos,
    );
    expect(videos).toHaveLength(34);
    expect(new Set(videos.map((video) => video.id)).size).toBe(34);
    expect(videos.every((video) => video.relatedLessons.length > 0)).toBe(true);
  });

  it("keeps the beginner hydraulic review series last and in the supplied order", () => {
    const beginner = practicalFluidPowerVideoGroups.at(-1);

    expect(beginner?.id).toBe("hydraulic-beginner-review");
    expect(beginner?.eyebrow).toBe("헷갈리기 쉬운 기초");
    expect(beginner?.title).toBe("시험 직전 보기 좋은 초보자 기초 실기");
    expect(
      beginner?.videos.map((video) =>
        video.embed.type === "video" ? video.embed.videoId : null,
      ),
    ).toEqual([
      "Wy83q8tOIMY",
      "2cfRnrg2XMU",
      "DbTVGZi6XYA",
      "cXvjBAN96BM",
      "JaqbOmTLNWk",
      "JwTt-oBo02g",
    ]);
    expect(beginner?.videos.map((video) => video.sourceUrl)).toEqual([
      "https://youtu.be/Wy83q8tOIMY?si=gAA_rNcwrP-Xb7HP",
      "https://youtu.be/2cfRnrg2XMU?si=zvB-BBklOliBTvjS",
      "https://youtu.be/DbTVGZi6XYA?si=nvRMhJVneQmr5kSo",
      "https://youtu.be/cXvjBAN96BM?si=Jpziptitpa0jn3Wv",
      "https://youtu.be/JaqbOmTLNWk?si=-_bMwuPqcY5UNHHT",
      "https://youtu.be/JwTt-oBo02g?si=Isw15tF42NdJTMw6",
    ]);
  });

  it("uses privacy-enhanced video and playlist embeds", () => {
    expect(
      getFluidPowerYouTubeEmbedUrl({
        type: "video",
        videoId: "5dAqJzIHIGk",
      }),
    ).toBe("https://www.youtube-nocookie.com/embed/5dAqJzIHIGk?rel=0");

    expect(
      getFluidPowerYouTubeEmbedUrl({
        type: "playlist",
        playlistId: "PL2xmFQlX28AE_MZt3okK0k9fCvwGZ1EvT",
      }),
    ).toBe(
      "https://www.youtube-nocookie.com/embed/videoseries?list=PL2xmFQlX28AE_MZt3okK0k9fCvwGZ1EvT&rel=0",
    );
  });

  it("keeps the exact eight hydraulic playlist videos in order", () => {
    const hydraulic = practicalFluidPowerVideoGroups.find(
      (group) => group.id === "hydraulic-1-to-8",
    );
    expect(
      hydraulic?.videos.map((video) =>
        video.embed.type === "video" ? video.embed.videoId : null,
      ),
    ).toEqual([
      "U1n_JPx_RjM",
      "Rzg61pHH7HI",
      "djo3jp76avA",
      "qw0PN6hrRbk",
      "GkNmScDyzug",
      "YffbkIbFPQA",
      "0ceJp3FJs-U",
      "HWk32oJHY84",
    ]);
  });

  it("keeps the industrial-engineer playlist separate and in the supplied Busan Technical High School order", () => {
    const industrialEngineer = practicalFluidPowerVideoGroups.find(
      (group) => group.id === "industrial-engineer-busan",
    );
    expect(industrialEngineer?.title).toContain("부산공고 설비와 동일");
    expect(industrialEngineer?.videos.map((video) => video.label)).toEqual([
      "산업기사 유압 5",
      "산업기사 유압 3",
      "산업기사 유압 2",
      "산업기사 유압 1",
      "산업기사 공압 5",
      "산업기사 공압 3",
      "산업기사 공압 2",
      "산업기사 공압 1",
    ]);
    expect(
      industrialEngineer?.videos.map((video) =>
        video.embed.type === "video" ? video.embed.videoId : null,
      ),
    ).toEqual([
      "SvBD-bm_gXM",
      "egTqSbdtEpE",
      "Owi9GODjsCs",
      "g0zatKxCQak",
      "vFfCQ6lH85s",
      "4eO2o2tDtjI",
      "ykBH2ab2V6Y",
      "9Mw7pHW2xvs",
    ]);
  });
});
