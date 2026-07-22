import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-white py-10 text-sm text-slate-500">
      <div className="page-wrap flex flex-col justify-between gap-5 md:flex-row">
        <div><strong className="text-slate-800">설비마스터</strong><p className="mt-2">근거와 복습 흐름을 갖춘 설비보전기사 학습 플랫폼</p></div>
        <div className="flex gap-5"><Link href="/library">자료실</Link><Link href="/privacy">개인정보</Link><Link href="/settings/account">계정 정책</Link><Link href="/admin">관리자</Link></div>
      </div>
    </footer>
  );
}
