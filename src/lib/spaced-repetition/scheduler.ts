import type { FsrsCardState, FsrsRating } from '$lib/database/types';

import { createEmptyCard, fsrs, type Card as FsrsCard, type Grade, Rating } from 'ts-fsrs';

const scheduler = fsrs();

export function createInitialCardState(now: Date = new Date()): FsrsCardState {
	return toCardState(createEmptyCard(now));
}

export function gradeCard(
	state: FsrsCardState,
	rating: FsrsRating,
	now: Date = new Date(),
): { readonly intervalDays: number; readonly state: FsrsCardState } {
	const fsrsCard = toFsrsCard(state);
	const { card: nextCard, log } = scheduler.next(fsrsCard, now, rating);

	return { intervalDays: log.scheduled_days, state: toCardState(nextCard) };
}

export function previewNextIntervals(
	state: FsrsCardState,
	now: Date = new Date(),
): Readonly<Record<FsrsRating, number>> {
	const fsrsCard = toFsrsCard(state);
	const preview = scheduler.repeat(fsrsCard, now);

	return {
		1: preview[Rating.Again as Grade].log.scheduled_days,
		2: preview[Rating.Hard as Grade].log.scheduled_days,
		3: preview[Rating.Good as Grade].log.scheduled_days,
		4: preview[Rating.Easy as Grade].log.scheduled_days,
	};
}

function toCardState(card: FsrsCard): FsrsCardState {
	const cardState: Omit<FsrsCardState, 'lastReview'> = {
		difficulty: card.difficulty,
		due: card.due.getTime(),
		// eslint-disable-next-line @typescript-eslint/no-deprecated, sonarjs/deprecation -- ts-fsrs<6 still requires this field
		elapsedDays: card.elapsed_days,
		lapses: card.lapses,
		reps: card.reps,
		scheduledDays: card.scheduled_days,
		stability: card.stability,
		state: card.state,
	};

	return card.last_review ? { ...cardState, lastReview: card.last_review.getTime() } : cardState;
}

function toFsrsCard(state: FsrsCardState): FsrsCard {
	const fsrsCard: Omit<FsrsCard, 'last_review'> = {
		difficulty: state.difficulty,
		due: new Date(state.due),

		elapsed_days: state.elapsedDays,
		lapses: state.lapses,
		learning_steps: 0,
		reps: state.reps,
		scheduled_days: state.scheduledDays,
		stability: state.stability,
		state: state.state,
	};

	return state.lastReview === undefined
		? fsrsCard
		: { ...fsrsCard, last_review: new Date(state.lastReview) };
}
