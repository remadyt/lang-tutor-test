import type { CardRow, ReviewRow } from '$lib/database/types';

import { MILLISECONDS_PER_DAY, MILLISECONDS_PER_HOUR } from '$lib/datetime';
import { describe, expect, it } from 'vitest';

import { currentStreak, dueToday, reviewsByDay, strongestCards, weakestCards } from './stats';

const NOW = new Date('2026-05-13T10:00:00Z');

function makeCard(overrides: Partial<CardRow> & { id: string }): CardRow {
	return {
		answer: 'a',
		createdAt: NOW.getTime(),
		fsrs: {
			difficulty: 5,
			due: NOW.getTime(),
			elapsedDays: 0,
			lapses: 0,
			reps: 1,
			scheduledDays: 0,
			stability: 1,
			state: 2,
		},
		kind: 'vocab',
		language: 'es',
		level: 'A2',
		prompt: 'p',
		...overrides,
	};
}

function makeReview(overrides: Partial<ReviewRow> & { id: string }): ReviewRow {
	return {
		cardId: 'c1',
		feedback: 'ok',
		rating: 3,
		reviewedAt: NOW.getTime(),
		score: 8,
		verdict: 'correct',
		...overrides,
	};
}

describe('spaced-repetition/stats', () => {
	it('dueToday includes cards whose due is today or earlier', () => {
		const baseCard = makeCard({ id: '_' });

		const cards = [
			makeCard({ fsrs: { ...baseCard.fsrs, due: NOW.getTime() - MILLISECONDS_PER_HOUR }, id: 'a' }),
			makeCard({
				fsrs: { ...baseCard.fsrs, due: NOW.getTime() + 2 * MILLISECONDS_PER_DAY },
				id: 'b',
			}),
		];

		expect(dueToday(cards, NOW).map((card) => card.id)).toStrictEqual(['a']);
	});

	it('weakestCards keeps only struggling items (stability below 7 days)', () => {
		const baseCard = makeCard({ id: '_' });

		const cards = [
			makeCard({ fsrs: { ...baseCard.fsrs, reps: 0, stability: 0 }, id: 'fresh' }),
			makeCard({ fsrs: { ...baseCard.fsrs, stability: 0.5 }, id: 'shaky' }),
			makeCard({ fsrs: { ...baseCard.fsrs, stability: 12 }, id: 'comfortable' }),
			makeCard({ fsrs: { ...baseCard.fsrs, stability: 30 }, id: 'mastered' }),
		];

		expect(weakestCards(cards).map((card) => card.id)).toStrictEqual(['shaky']);
	});

	it('strongestCards keeps only mastered items (stability ≥ 21 days)', () => {
		const baseCard = makeCard({ id: '_' });

		const cards = [
			makeCard({ fsrs: { ...baseCard.fsrs, stability: 0.5 }, id: 'shaky' }),
			makeCard({ fsrs: { ...baseCard.fsrs, stability: 12 }, id: 'comfortable' }),
			makeCard({ fsrs: { ...baseCard.fsrs, stability: 30 }, id: 'mastered' }),
			makeCard({ fsrs: { ...baseCard.fsrs, stability: 90 }, id: 'rock-solid' }),
		];

		expect(strongestCards(cards).map((card) => card.id)).toStrictEqual(['rock-solid', 'mastered']);
	});

	it('reviewsByDay returns the requested number of consecutive days', () => {
		const buckets = reviewsByDay([], 14, NOW);

		expect(buckets).toHaveLength(14);
	});

	it('currentStreak counts back from today while consecutive days have a review', () => {
		const reviews: readonly ReviewRow[] = [
			makeReview({ id: '1', reviewedAt: NOW.getTime() }),
			makeReview({ id: '2', reviewedAt: NOW.getTime() - MILLISECONDS_PER_DAY }),
			makeReview({ id: '3', reviewedAt: NOW.getTime() - 2 * MILLISECONDS_PER_DAY }),
			makeReview({ id: '4', reviewedAt: NOW.getTime() - 5 * MILLISECONDS_PER_DAY }),
		];

		expect(currentStreak(reviews, NOW)).toBe(3);
	});

	it('currentStreak is zero when there are no reviews', () => {
		expect(currentStreak([], NOW)).toBe(0);
	});
});
