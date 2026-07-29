import { notFound, redirect } from "next/navigation";
import {
  getBdaNotionSnapshot,
  getBdaNotionSnapshots,
} from "@/lib/content/bda-notion-snapshot-repository";

export function generateStaticParams() {
  return getBdaNotionSnapshots().map((snapshot) => ({
    sourceId: snapshot.id,
  }));
}

export default async function BdaPrivateSourceRedirect({
  params,
}: {
  params: Promise<{ sourceId: string }>;
}) {
  const { sourceId } = await params;
  const snapshot = getBdaNotionSnapshot(sourceId);
  if (!snapshot) notFound();

  redirect(`/bda/textbook/${snapshot.subjectId}`);
}
