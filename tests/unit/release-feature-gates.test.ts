import { afterEach, describe, expect, it } from "vitest";
import { isReleaseFeatureEnabled } from "@/lib/release-features";

const previousShuffle = process.env.ENABLE_MOCK_CHOICE_SHUFFLE;
const previousBusan = process.env.ENABLE_BUSAN_KOPO_MEDIA;

afterEach(() => {
  restore("ENABLE_MOCK_CHOICE_SHUFFLE", previousShuffle);
  restore("ENABLE_BUSAN_KOPO_MEDIA", previousBusan);
});

describe("release feature gates", () => {
  it("fails closed when flags are missing or not exactly true", () => {
    delete process.env.ENABLE_MOCK_CHOICE_SHUFFLE;
    process.env.ENABLE_BUSAN_KOPO_MEDIA = "TRUE";

    expect(isReleaseFeatureEnabled("mock_choice_shuffle")).toBe(false);
    expect(isReleaseFeatureEnabled("busan_kopo_media")).toBe(false);
  });

  it("enables each feature only through its explicit flag", () => {
    process.env.ENABLE_MOCK_CHOICE_SHUFFLE = "true";
    process.env.ENABLE_BUSAN_KOPO_MEDIA = "true";

    expect(isReleaseFeatureEnabled("mock_choice_shuffle")).toBe(true);
    expect(isReleaseFeatureEnabled("busan_kopo_media")).toBe(true);
  });
});

function restore(key: string, value: string | undefined) {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}
