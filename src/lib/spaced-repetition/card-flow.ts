import type { CardRow, FsrsRating, ReviewRow, Verdict } from '$lib/database/types';
import type { Cefr } from '$lib/domain/cefr';

import { cardsRepository, reviewsRepository } from '$lib/database/repositories';
import { nanoid } from 'nanoid';

import { createInitialCardState, gradeCard } from './scheduler';

export interface GradeAttemptArguments {
	readonly cefrLevel: Cefr;
	readonly expectedAnswer: string;
	readonly feedback: string;
	readonly kind: 'grammar' | 'phrase' | 'vocab';
	readonly prompt: string;
	readonly rating: FsrsRating;
	readonly score: number;
	readonly targetLanguage: string;
	readonly userAnswer: string;
	readonly verdict: Verdict;
}

export async function recordGradedAttempt(
	args: GradeAttemptArguments,
	now: Date = new Date(),
): Promise<{ readonly card: CardRow; readonly review: ReviewRow }> {
	const allCards = await cardsRepository.all();

	const existingCard = allCards.find(
		(candidate) =>
			candidate.language === args.targetLanguage &&
			candidate.prompt.trim().toLowerCase() === args.prompt.trim().toLowerCase(),
	);

	const baseCard: CardRow =
		existingCard ??
		({
			answer: args.expectedAnswer,
			createdAt: now.getTime(),
			fsrs: createInitialCardState(now),
			id: nanoid(),
			kind: args.kind,
			language: args.targetLanguage,
			level: args.cefrLevel,
			prompt: args.prompt,
		} satisfies CardRow);

	const { state: nextFsrsState } = gradeCard(baseCard.fsrs, args.rating, now);

	const card: CardRow = {
		...baseCard,
		answer: args.expectedAnswer,
		fsrs: nextFsrsState,
		lastReviewedAt: now.getTime(),
	};

	await (existingCard === undefined ? cardsRepository.add(card) : cardsRepository.update(card));

	const review: ReviewRow = {
		cardId: card.id,
		feedback: args.feedback,
		id: nanoid(),
		rating: args.rating,
		reviewedAt: now.getTime(),
		score: args.score,
		verdict: args.verdict,
	};

	await reviewsRepository.add(review);

	return { card, review };
}
