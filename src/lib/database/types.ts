import type { Cefr } from '$lib/domain/cefr';
import type { LessonFormat } from '$lib/domain/lesson-format';

export const PROFILE_SINGLETON_ID = 'singleton' as const;
export type CardKind = 'grammar' | 'phrase' | 'vocab';

export interface CardRow {
	readonly answer: string;
	readonly createdAt: number;
	readonly fsrs: FsrsCardState;
	readonly id: string;
	readonly kind: CardKind;
	readonly language: string;
	readonly lastReviewedAt?: number;
	readonly level: Cefr;
	readonly prompt: string;
}
export interface FsrsCardState {
	readonly difficulty: number;
	readonly due: number;
	readonly elapsedDays: number;
	readonly lapses: number;
	readonly lastReview?: number;
	readonly reps: number;
	readonly scheduledDays: number;
	readonly stability: number;
	readonly state: FsrsState;
}

export type FsrsRating = 1 | 2 | 3 | 4;
// Mirrors `ts-fsrs`'s State enum so the database layer doesn't import it.
export type FsrsState = 0 | 1 | 2 | 3;

export interface MessageRow {
	readonly format: LessonFormat;
	readonly id: string;
	readonly partsJson: string;
	readonly role: 'assistant' | 'system' | 'user';
	readonly sequence: number;
}

export type ProfileId = typeof PROFILE_SINGLETON_ID;

export interface ProfileRow {
	readonly createdAt: number;
	readonly id: ProfileId;
	readonly interests: readonly string[];
	readonly level: Cefr;
	readonly nativeLanguage: string;
	readonly nativeLanguageLabel: string;
	readonly preferredFormats: readonly LessonFormat[];
	readonly targetLanguage: string;
	readonly targetLanguageLabel: string;
}

export interface ReviewRow {
	readonly cardId: string;
	readonly feedback: string;
	readonly id: string;
	readonly rating: FsrsRating;
	readonly reviewedAt: number;
	readonly score: number;
	readonly verdict: Verdict;
}

export interface SessionRow {
	readonly cardIds: readonly string[];
	readonly endedAt?: number;
	readonly format: LessonFormat;
	readonly id: string;
	readonly startedAt: number;
}

export type Verdict = 'correct' | 'incorrect' | 'partial';
