import "server-only";

import rawDataset from "@/data/generated/welding-safety-review.json";
import { weldingSafetyReviewDatasetSchema } from "@/lib/content/welding-safety-supplement";

export function getWeldingSafetyReviewDataset() {
  return weldingSafetyReviewDatasetSchema.parse(rawDataset);
}
