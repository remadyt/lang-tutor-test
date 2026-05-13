import { describe, expect, it } from 'vitest';

import { createInitialCardState, gradeCard, previewNextIntervals } from './scheduler';

const NOW = new Date('2026-05-13T10:00:00Z');
const MILLISECONDS_PER_DAY = 86_400_000;

describe('spaced-repetition/scheduler', () => {
	it('creates a fresh card in New state with zero reps and lapses', () => {
		const state = createInitialCardState(NOW);

		expect(state.state).toBe(0);
		expect(state.reps).toBe(0);
		expect(state.lapses).toBe(0);
		expect(state.stability).toBe(0);
		expect(state.difficulty).toBe(0);
		expect(state.due).toBeGreaterThanOrEqual(NOW.getTime());
	});

	it('grading "easy" schedules further out than grading "again"', () => {
		const start = createInitialCardState(NOW);

		const gradedEasy = gradeCard(start, 4, NOW);
		const gradedAgain = gradeCard(start, 1, NOW);

		expect(gradedEasy.state.due).toBeGreaterThan(gradedAgain.state.due);
		expect(gradedEasy.intervalDays).toBeGreaterThanOrEqual(gradedAgain.intervalDays);
	});

	it('grading "again" on a Review card increments lapses', () => {
		let state = createInitialCardState(NOW);

		state = gradeCard(state, 3, NOW).state;
		state = gradeCard(state, 3, new Date(NOW.getTime() + 7 * MILLISECONDS_PER_DAY)).state;

		const lapsesBefore = state.lapses;

		const afterLapse = gradeCard(
			state,
			1,
			new Date(NOW.getTime() + 30 * MILLISECONDS_PER_DAY),
		).state;

		expect(afterLapse.lapses).toBeGreaterThanOrEqual(lapsesBefore);
	});

	it('previewNextIntervals returns one entry per FSRS rating', () => {
		const state = createInitialCardState(NOW);
		const preview = previewNextIntervals(state, NOW);

		expect(Object.keys(preview).toSorted((a, b) => a.localeCompare(b))).toStrictEqual([
			'1',
			'2',
			'3',
			'4',
		]);

		for (const days of Object.values(preview)) {
			expect(days).toBeGreaterThanOrEqual(0);
		}
	});

	it('grading is idempotent on the source state object (immutability)', () => {
		const start = createInitialCardState(NOW);
		const snapshot = { ...start };

		gradeCard(start, 3, NOW);

		expect(start).toStrictEqual(snapshot);
	});
});
