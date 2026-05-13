import { CEFR_LEVELS } from '$lib/domain/cefr';
import { LESSON_FORMATS } from '$lib/domain/lesson-format';
import { z } from 'zod';

export const GradeSchema = z.object({
	feedback: z.string().min(1).max(500),
	nextHint: z.string().max(200).optional(),
	rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
	score: z.number().int().min(0).max(10),
	verdict: z.enum(['correct', 'partial', 'incorrect']),
});
export type Grade = z.infer<typeof GradeSchema>;

export const NewCardSchema = z.object({
	answer: z.string().min(1).max(400),
	kind: z.enum(['vocab', 'phrase', 'grammar']),
	level: z.enum(CEFR_LEVELS),
	prompt: z.string().min(1).max(200),
});
export type NewCard = z.infer<typeof NewCardSchema>;

export const SessionPlanSchema = z.object({
	dueCount: z.number().int().min(0),
	focus: z.array(z.string()).max(5),
	greeting: z.string().min(1).max(400),
	suggestedFormat: z.enum(LESSON_FORMATS),
});
export type SessionPlan = z.infer<typeof SessionPlanSchema>;

export const SessionCardSchema = z.object({
	answer: z.string(),
	kind: z.enum(['vocab', 'phrase', 'grammar']),
	prompt: z.string(),
});
export type SessionCard = z.infer<typeof SessionCardSchema>;

// Messages are passed straight to the SDK helpers; we only validate the envelope.
export const ChatRequestSchema = z.object({
	format: z.enum(LESSON_FORMATS),
	messages: z.array(z.unknown()).optional(),
	profile: z.object({
		interests: z.array(z.string()),
		level: z.enum(CEFR_LEVELS),
		nativeLanguage: z.string(),
		nativeLanguageLabel: z.string(),
		targetLanguage: z.string(),
		targetLanguageLabel: z.string(),
	}),
	sessionCards: z.array(SessionCardSchema).optional(),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export const GradeRequestSchema = z.object({
	cardId: z.string(),
	expected: z.string(),
	format: z.enum(LESSON_FORMATS),
	level: z.enum(CEFR_LEVELS),
	nativeLanguage: z.string(),
	prompt: z.string(),
	targetLanguage: z.string(),
	userAnswer: z.string(),
});
export type GradeRequest = z.infer<typeof GradeRequestSchema>;
