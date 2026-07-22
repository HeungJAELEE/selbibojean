import { LibraryClient } from "@/components/library-client";
import { PageHeading } from "@/components/page-heading";
export default function LibraryPage(){return <div className="page-wrap"><PageHeading eyebrow="My library" title="북마크와 메모" description="게스트는 브라우저에 저장하고, 계정 사용자는 서버와 동기화합니다."/><LibraryClient/></div>}

