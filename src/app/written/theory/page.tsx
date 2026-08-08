import type { Metadata } from "next";
import { WrittenTheoryIndex } from "@/components/written-theory-index";

export const metadata: Metadata = { title: "필기 이론" };

export default async function TheoryIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject: requestedSubject } = await searchParams;
  const selectedSubjectId =
    requestedSubject && /^subject-[1-4]$/.test(requestedSubject)
      ? requestedSubject
      : "subject-1";

  return <WrittenTheoryIndex selectedSubjectId={selectedSubjectId} />;
}
