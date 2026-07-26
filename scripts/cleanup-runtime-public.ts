import { rm } from "node:fs/promises";
import path from "node:path";

const transientPublicData = path.join(process.cwd(), "public", "data");

await rm(transientPublicData, { recursive: true, force: true });

console.log("Removed transient public/data runtime staging.");
