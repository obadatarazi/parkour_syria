export type SeoScoreTone = "poor" | "ok" | "good";

export type SeoFieldScore = {
  score: number;
  tone: SeoScoreTone;
};

const TITLE_IDEAL_MIN = 30;
const TITLE_IDEAL_MAX = 60;
const DESCRIPTION_IDEAL_MIN = 70;
const DESCRIPTION_IDEAL_MAX = 160;

function clampScore(value: number): number {
  return Math.max(0, Math.min(10, Math.round(value)));
}

function toneFromScore(score: number): SeoScoreTone {
  if (score >= 8) return "good";
  if (score >= 5) return "ok";
  return "poor";
}

/**
 * Rank Math–style length score for SEO title (0–10).
 * Ideal: ~30–60 characters. Empty = 0.
 */
export function scoreSeoTitle(value: string): SeoFieldScore {
  const length = value.trim().length;
  if (length === 0) return { score: 0, tone: "poor" };

  let score: number;
  if (length >= TITLE_IDEAL_MIN && length <= TITLE_IDEAL_MAX) {
    score = 10;
  } else if (length < TITLE_IDEAL_MIN) {
    score = (length / TITLE_IDEAL_MIN) * 8;
  } else if (length <= 70) {
    score = 8 - ((length - TITLE_IDEAL_MAX) / 10) * 3;
  } else {
    score = Math.max(1, 5 - (length - 70) / 20);
  }

  const next = clampScore(score);
  return { score: next, tone: toneFromScore(next) };
}

/**
 * Rank Math–style length score for SEO description (0–10).
 * Ideal: ~70–160 characters. Empty = 0.
 */
export function scoreSeoDescription(value: string): SeoFieldScore {
  const length = value.trim().length;
  if (length === 0) return { score: 0, tone: "poor" };

  let score: number;
  if (length >= DESCRIPTION_IDEAL_MIN && length <= DESCRIPTION_IDEAL_MAX) {
    score = 10;
  } else if (length < DESCRIPTION_IDEAL_MIN) {
    score = (length / DESCRIPTION_IDEAL_MIN) * 8;
  } else if (length <= 180) {
    score = 8 - ((length - DESCRIPTION_IDEAL_MAX) / 20) * 3;
  } else {
    score = Math.max(1, 5 - (length - 180) / 40);
  }

  const next = clampScore(score);
  return { score: next, tone: toneFromScore(next) };
}

/** Average of title + description scores, rounded 0–10. */
export function scoreSeoOverall(title: string, description: string): SeoFieldScore {
  const titleScore = scoreSeoTitle(title).score;
  const descriptionScore = scoreSeoDescription(description).score;
  const score = clampScore((titleScore + descriptionScore) / 2);
  return { score, tone: toneFromScore(score) };
}
