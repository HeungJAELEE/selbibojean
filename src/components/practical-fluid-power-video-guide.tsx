"use client";

import Link from "next/link";
import {
  BadgeDollarSign,
  CircuitBoard,
  ExternalLink,
  Play,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getFluidPowerYouTubeEmbedUrl,
  type PracticalFluidPowerVideo,
  type PracticalFluidPowerVideoGroup,
} from "@/data/source/practical-fluid-power-videos";

export function PracticalFluidPowerVideoGuide({
  groups,
}: {
  groups: readonly PracticalFluidPowerVideoGroup[];
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
      id="fluid-power-video-guide"
      data-testid="practical-work-fluid-power-videos"
      data-hydrated="false"
      className="mt-12"
      aria-labelledby="fluid-power-video-heading"
    >
      <div className="rounded-3xl border border-sky-200 bg-sky-50/70 p-6 md:p-8">
        <p className="eyebrow text-sky-800">외부 보조 학습자료 · YouTube</p>
        <h2
          id="fluid-power-video-heading"
          className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900"
        >
          공유압 도면·공압·유압 실습 영상
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
          도면 암기 3개, 기사 공압·유압 1~8형, 설비보전산업기사
          공유압 작업과 외부 유료강의를 구분했습니다. 영상을 먼저
          외우기보다 회로의 입력 → 제어 → 출력 → 완료신호 흐름을
          확인하세요.
        </p>
        <div className="mt-5 flex gap-3 rounded-2xl border border-sky-200 bg-white/80 p-4 text-sm leading-6 text-slate-700">
          <ShieldCheck
            className="mt-0.5 shrink-0 text-sky-700"
            size={19}
            aria-hidden="true"
          />
          <p>
            영상은 공식 공개문제나 NCS 원문을 대체하지 않습니다. 회로도,
            지급부품, 설정압력과 요구동작은 해당 연도의 Q-Net 공개문제를
            최종 기준으로 확인하세요.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-5">
        {groups.map((group) => (
          <section
            key={group.id}
            data-testid={`practical-fluid-video-group-${group.id}`}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            aria-labelledby={`practical-fluid-video-group-heading-${group.id}`}
          >
            <div className="border-b border-slate-100 px-6 py-5 md:px-8">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-800">
                  {group.id === "paid-course" ? (
                    <BadgeDollarSign size={20} aria-hidden="true" />
                  ) : (
                    <CircuitBoard size={20} aria-hidden="true" />
                  )}
                </span>
                <div>
                  <h3
                    id={`practical-fluid-video-group-heading-${group.id}`}
                    className="text-lg font-extrabold text-slate-900"
                  >
                    {group.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {group.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {group.videos.map((video, index) => {
                const isActive = video.id === activeVideoId;

                return (
                  <div
                    key={video.id}
                    data-testid={`practical-fluid-video-${video.id}`}
                    className="px-4 py-3 md:px-6"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16697a]"
                      aria-expanded={isActive}
                      aria-controls={`practical-fluid-video-panel-${video.id}`}
                      onClick={() =>
                        setActiveVideoId(isActive ? null : video.id)
                      }
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#eaf7f6] text-sm font-extrabold text-[#16697a]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-extrabold text-slate-900">
                            {video.label}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                              video.accessLabel === "외부 유료강의"
                                ? "bg-amber-100 text-amber-900"
                                : "bg-sky-100 text-sky-900"
                            }`}
                          >
                            {video.accessLabel}
                          </span>
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
                      <FluidPowerVideoPanel video={video} />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function FluidPowerVideoPanel({
  video,
}: {
  video: PracticalFluidPowerVideo;
}) {
  return (
    <div
      id={`practical-fluid-video-panel-${video.id}`}
      data-testid="practical-fluid-video-panel"
      className="mt-3 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 px-6 py-5 md:px-8">
        <p className="text-xs font-extrabold tracking-wide text-[#8f3f0a]">
          {video.accessLabel}
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
            data-testid={`practical-fluid-video-frame-${video.id}`}
            className="size-full"
            src={getFluidPowerYouTubeEmbedUrl(video.embed)}
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
            적용 전 유의사항
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
