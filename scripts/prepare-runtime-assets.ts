import { rm } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.join(process.cwd(), ".runtime-assets", "data");

await rm(outputDirectory, { recursive: true, force: true });
console.log("Prepared server-embedded learning content; no answer-bearing public runtime assets.");
