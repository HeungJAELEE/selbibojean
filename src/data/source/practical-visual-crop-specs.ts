import type { PracticalVisualCropSpec } from "@/lib/domain/practical-types";

/**
 * PDF 크롭은 페이지·회전·원본 해시와 정규화 좌표가 모두 확정된 뒤에만
 * 등록한다. 현재 대표 6개는 기존 검수 자산 또는 자체 SVG이므로 신규
 * PDF 크롭 작업은 없다.
 */
export const PRACTICAL_VISUAL_CROP_SPECS: PracticalVisualCropSpec[] = [];
