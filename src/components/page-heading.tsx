import type { ReactNode } from "react";

export function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-5 pb-9 pt-12 md:flex-row md:items-end">
      <div><p className="eyebrow">{eyebrow}</p><h1 className="display mt-3 text-4xl font-bold md:text-5xl">{title}</h1>{description && <p className="mt-4 max-w-2xl text-slate-600">{description}</p>}</div>
      {action}
    </div>
  );
}

