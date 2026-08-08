export type ReleaseFeatureKey =
  | "mock_choice_shuffle"
  | "busan_kopo_media";

const FEATURE_ENV: Record<ReleaseFeatureKey, string> = {
  mock_choice_shuffle: "ENABLE_MOCK_CHOICE_SHUFFLE",
  busan_kopo_media: "ENABLE_BUSAN_KOPO_MEDIA",
};

export function isReleaseFeatureEnabled(feature: ReleaseFeatureKey) {
  return process.env[FEATURE_ENV[feature]] === "true";
}
