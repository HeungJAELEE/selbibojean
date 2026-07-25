"use client";

import { useEffect, useState } from "react";
import { useHydrated } from "@/lib/use-hydrated";

export function LibraryClient() {
  const isHydrated = useHydrated();
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setBookmarks(
          JSON.parse(
            localStorage.getItem("seolbi:bookmarks") ?? "[]",
          ) as string[],
        );
        setNote(localStorage.getItem("seolbi:notes") ?? "");
      } catch {
        setBookmarks([]);
        setNote("");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className="card p-7">
        <h2 className="text-xl font-extrabold">북마크</h2>
        <p className="mt-3 text-sm text-slate-500">저장한 항목 {bookmarks.length}개</p>
        {bookmarks.length === 0 && (
          <p className="mt-8 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">
            아직 저장한 이론이나 문제가 없습니다.
          </p>
        )}
      </section>
      <section className="card p-7">
        <h2 className="text-xl font-extrabold">내 메모</h2>
        <textarea
          value={note}
          disabled={!isHydrated}
          onChange={(event) => {
            setNote(event.target.value);
            localStorage.setItem("seolbi:notes", event.target.value);
          }}
          rows={10}
          className="mt-4 w-full rounded-xl border border-slate-300 p-4 disabled:bg-slate-50"
          placeholder="개념을 내 말로 정리해 보세요."
        />
      </section>
    </div>
  );
}
