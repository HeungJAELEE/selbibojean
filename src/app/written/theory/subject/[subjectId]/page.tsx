import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WrittenTheoryIndex } from "@/components/written-theory-index";

export const metadata: Metadata = { title: "필기 이론" };

export default async function WrittenTheorySubjectPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  if (!/^subject-[1-4]$/.test(subjectId)) {
    notFound();
  }

  return <WrittenTheoryIndex selectedSubjectId={subjectId} />;
}
