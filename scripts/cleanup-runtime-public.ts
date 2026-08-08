import { rm } from "node:fs/promises";
import path from "node:path";

const transientPublicData = path.join(process.cwd(), "public", "data");
const gatedBusanMedia = path.join(
  process.cwd(),
  "public",
  "practical",
  "test-centers",
  "busan-kopo",
);

await Promise.all([
  rm(transientPublicData, { recursive: true, force: true }),
  rm(gatedBusanMedia, { recursive: true, force: true }),
]);

console.log("Removed transient public/data and gated media staging.");
