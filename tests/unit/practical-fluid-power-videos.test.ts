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
    ]);

    const counts = practicalFluidPowerVideoGroups.map(
      (group) => group.videos.length,
    );
    expect(counts).toEqual([3, 8, 8, 8, 1]);

    const videos = practicalFluidPowerVideoGroups.flatMap(
      (group) => group.videos,
    );
    expect(videos).toHaveLength(28);
    expect(new Set(videos.map((video) => video.id)).size).toBe(28);
    expect(videos.every((video) => video.relatedLessons.length > 0)).toBe(true);
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
