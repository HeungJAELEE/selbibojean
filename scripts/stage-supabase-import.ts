import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { normalizeCanonicalTaxonomy } from "../src/lib/content/taxonomy-normalization";
import type { GeneratedContent } from "../src/lib/domain/types";

function chunks<T>(items: T[], size: number) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));
}

function checksum(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 필요합니다.");
  const filePath = path.join(process.cwd(), "src", "data", "generated", "content.json");
  const content = normalizeCanonicalTaxonomy(
    JSON.parse(await readFile(filePath, "utf8")) as GeneratedContent,
  );
  const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const expectedCounts = content.report.expected;
  const actualCounts = content.report.rows;
  const { data: batch, error: batchError } = await supabase
    .from("import_batches")
    .upsert(
      {
        checksum: content.report.sourceSha256,
        filename: content.report.sourceFile,
        status: "staging",
        expected_counts: expectedCounts,
        actual_counts: actualCounts,
        reconciliation_passed: false,
      },
      { onConflict: "checksum" },
    )
    .select("id,last_completed_chunk,status")
    .single();
  if (batchError || !batch) throw batchError ?? new Error("배치를 만들지 못했습니다.");
  if (batch.status === "published") {
    console.log("같은 체크섬의 배치가 이미 발행되었습니다.");
    return;
  }

  const rows = [
    ...content.questions.map((payload, index) => ({ sheet_name: "고유문제_통합_26차", row_number: index + 2, external_id: payload.id, payload })),
    ...content.variants.map((payload, index) => ({ sheet_name: "원문문항_통합_26차", row_number: index + 2, external_id: payload.externalId, payload })),
    ...content.backlog.map((payload, index) => ({ sheet_name: "부분완료_최종잔여_26차", row_number: index + 2, external_id: String(payload["원문ID"] ?? ""), payload })),
  ];

  const rowChunks = chunks(rows, 250);
  for (let chunkIndex = batch.last_completed_chunk ?? 0; chunkIndex < rowChunks.length; chunkIndex += 1) {
    const payload = rowChunks[chunkIndex].map((row) => ({
      import_batch_id: batch.id,
      ...row,
      row_checksum: checksum(row.payload),
      status: "validated",
      errors: [],
    }));
    const { error } = await supabase.from("import_rows").upsert(payload, { onConflict: "import_batch_id,sheet_name,row_number" });
    if (error) {
      await supabase.from("import_batches").update({ status: "failed", error_log: error.message }).eq("id", batch.id);
      throw error;
    }
    await supabase.from("import_batches").update({ last_completed_chunk: chunkIndex + 1 }).eq("id", batch.id);
    console.log(`staged ${chunkIndex + 1}/${rowChunks.length}`);
  }

  const reconciliationPassed =
    content.report.exactMatch &&
    content.questions.length === expectedCounts.canonicalQuestions &&
    content.variants.length === expectedCounts.originals &&
    content.backlog.length === expectedCounts.backlog;
  const { error: finishError } = await supabase
    .from("import_batches")
    .update({ status: reconciliationPassed ? "review" : "failed", reconciliation_passed: reconciliationPassed })
    .eq("id", batch.id);
  if (finishError) throw finishError;
  console.log(reconciliationPassed ? `review-ready batch ${batch.id}` : "reconciliation failed; publication is blocked");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
