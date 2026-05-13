import type { CardRow, ReviewRow } from '$lib/database/types';

import { addDays, endOfDay, MILLISECONDS_PER_DAY, startOfDay, toIsoDate } from '$lib/datetime';

const DEFAULT_HISTORY_DAYS = 14;
const DEFAULT_TOP_LIMIT = 5;
// FSRS stability is "days until 90% retention". 21d ≈ comfortably remembered, < 7d ≈ shaky.
const MASTERED_STABILITY_DAYS = 21;
const STRUGGLING_STABILITY_DAYS = 7;

export interface DayBucket {
	readonly count: number;
	readonly date: string;
}

export function currentStreak(reviews: readonly ReviewRow[], now: Date = new Date()): number {
	if (reviews.length === 0) {
		return 0;
	}

	const reviewedDays = new Set(reviews.map((review) => toIsoDate(review.reviewedAt)));
	let streak = 0;
	let cursorMs = startOfDay(now.getTime());

	while (reviewedDays.has(toIsoDate(cursorMs))) {
		streak += 1;
		cursorMs = cursorMs - MILLISECONDS_PER_DAY;
	}

	return streak;
}

export function dueToday(cards: readonly CardRow[], now: Date = new Date()): readonly CardRow[] {
	const cutoffMs = endOfDay(now.getTime());

	return cards.filter((card) => card.fsrs.due <= cutoffMs);
}

export function reviewsByDay(
	reviews: readonly ReviewRow[],
	days: number = DEFAULT_HISTORY_DAYS,
	now: Date = new Date(),
): readonly DayBucket[] {
	const windowStartMs = addDays(startOfDay(now.getTime()), -(days - 1));
	const buckets = new Map<string, number>();

	for (let dayIndex = 0; dayIndex < days; dayIndex += 1) {
		const date = toIsoDate(addDays(windowStartMs, dayIndex));

		buckets.set(date, 0);
	}

	for (const review of reviews) {
		if (review.reviewedAt < windowStartMs) {
			continue;
		}

		const date = toIsoDate(review.reviewedAt);

		buckets.set(date, (buckets.get(date) ?? 0) + 1);
	}

	return [...buckets.entries()].map(([date, count]) => ({ count, date }));
}

export function strongestCards(
	cards: readonly CardRow[],
	limit: number = DEFAULT_TOP_LIMIT,
): readonly CardRow[] {
	return cards
		.filter((card) => card.fsrs.reps > 0 && card.fsrs.stability >= MASTERED_STABILITY_DAYS)
		.toSorted(
			(a, b) => b.fsrs.stability - a.fsrs.stability || a.fsrs.difficulty - b.fsrs.difficulty,
		)
		.slice(0, limit);
}

export function weakestCards(
	cards: readonly CardRow[],
	limit: number = DEFAULT_TOP_LIMIT,
): readonly CardRow[] {
	return cards
		.filter((card) => card.fsrs.reps > 0 && card.fsrs.stability < STRUGGLING_STABILITY_DAYS)
		.toSorted(
			(a, b) => a.fsrs.stability - b.fsrs.stability || b.fsrs.difficulty - a.fsrs.difficulty,
		)
		.slice(0, limit);
}
