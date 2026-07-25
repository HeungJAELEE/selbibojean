"use client";

import Link from "next/link";
import { ExternalLink, Play, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getYouTubeNoCookieEmbedUrl,
  type PracticalRepairWeldingVideo,
} from "@/data/source/practical-repair-welding-videos";

export function PracticalRepairWeldingVideoGuide({
  videos,
}: {
  videos: readonly PracticalRepairWeldingVideo[];
}) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.dataset.hydrated = "true";
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      id="repair-welding-video-guide"
      data-testid="practical-work-welding-videos"
      data-hydrated="false"
      className="mt-12"
      aria-labelledby="repair-welding-video-heading"
    >
      <div className="rounded-3xl border border-teal-200 bg-teal-50/70 p-6 md:p-8">
        <p className="eyebrow text-teal-800">외부 보조 학습자료 · YouTube</p>
        <h2
          id="repair-welding-video-heading"
          className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900"
        >
          보수용접 실습 영상
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
          자세와 운봉 동작을 관찰하기 위한 보조 영상입니다. 실제 시험·현장
          작업의 조건과 순서는 NCS 원문, Q-Net 공개과제, WPS, 작업지시와
          안전절차를 우선합니다.
        </p>
        <div className="mt-5 flex gap-3 rounded-2xl border border-teal-200 bg-white/80 p-4 text-sm leading-6 text-slate-700">
          <ShieldCheck className="mt-0.5 shrink-0 text-teal-700" size={19} aria-hidden="true" />
          <p>
            영상의 전류·용접봉·자세·작업순서는 외부 제작자가 제시한 예시일 수
            있습니다. 화면에 보이는 설정값을 답안 또는 실제 작업조건으로
            그대로 단정하지 마세요.
          </p>
        </div>
        <div
          data-testid="practical-work-dream-workshop"
          className="mt-4 rounded-2xl border border-teal-200 bg-white p-5"
        >
          <h3 className="text-base font-extrabold text-slate-900">
            용접 연습 장소 안내
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            한국폴리텍대학 꿈드림공작소에서 지역별 용접 실습 프로그램과
            시설을 확인해 신청할 수 있습니다. 운영 공정·장비·일정과 이용
            자격은 각 캠퍼스 안내를 확인하세요.
          </p>
          <a
            href="https://dream.kopo.ac.kr/"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-teal-300 bg-teal-50 px-4 py-2.5 text-sm font-extrabold text-teal-900 transition hover:border-teal-500"
          >
            꿈드림공작소 프로그램 확인
            <ExternalLink size={16} aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5 md:px-8">
          <h3 className="text-lg font-extrabold text-slate-900">영상 선택</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            하나를 열면 해당 영상만 불러옵니다.
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            제목은 제공 영상의 현장 표기를 따릅니다. 공식 용어와 적용조건은 연결한
            NCS 기반 이론에서 확인하세요.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {videos.map((video, index) => {
            const isActive = video.id === activeVideoId;

            return (
              <div
                key={video.id}
                data-testid={`practical-work-video-${video.id}`}
                className="px-4 py-3 md:px-6"
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16697a]"
                  aria-expanded={isActive}
                  aria-controls={`practical-work-video-panel-${video.id}`}
                  onClick={() => setActiveVideoId(isActive ? null : video.id)}
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#eaf7f6] text-sm font-extrabold text-[#16697a]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-extrabold text-slate-900">
                      {video.label}
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-slate-600">
                      {video.learningFocus}
                    </span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-2 text-sm font-extrabold text-[#16697a]">
                    <Play size={16} aria-hidden="true" />
                    {isActive ? "닫기" : "영상 보기"}
                  </span>
                </button>
                {isActive ? (
                  <RepairWeldingVideoPanel video={video} />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RepairWeldingVideoPanel({
  video,
}: {
  video: PracticalRepairWeldingVideo;
}) {
  return (
    <div
      id={`practical-work-video-panel-${video.id}`}
      data-testid="practical-work-video-panel"
      className="mt-3 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 px-6 py-5 md:px-8">
        <p className="text-xs font-extrabold tracking-wide text-[#8f3f0a]">
          외부 보조 영상
        </p>
        <h3 className="mt-1 text-xl font-extrabold text-slate-900">
          {video.label}
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          YouTube · {video.channel} · {video.sourceTitle}
        </p>
      </div>

      <div className="p-4 md:p-6">
        <div className="aspect-video overflow-hidden rounded-2xl bg-slate-950 shadow-inner">
          <iframe
            data-testid={`practical-work-video-frame-${video.id}`}
            className="size-full"
            src={getYouTubeNoCookieEmbedUrl(video.videoId)}
            title={`${video.label} 보조 실습 영상 - ${video.channel}`}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">
              작업 관찰 포인트
            </h4>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {video.learningFocus}
            </p>
          </div>
          <a
            href={video.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-extrabold text-slate-800 transition hover:border-[#16697a] hover:text-[#16697a]"
          >
            YouTube에서 원문 열기
            <ExternalLink size={16} aria-hidden="true" />
          </a>
        </div>

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h4 className="text-sm font-extrabold text-amber-900">
            작업 전 유의사항
          </h4>
          <p className="mt-2 text-sm leading-6 text-amber-950/80">
            {video.caution}
          </p>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-5">
          <h4 className="text-sm font-extrabold text-slate-900">
            함께 볼 NCS 기반 이론
          </h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {video.relatedLessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/practical/written/theory/${lesson.id}`}
                className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-bold text-sky-900 transition hover:border-sky-400"
              >
                {lesson.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
