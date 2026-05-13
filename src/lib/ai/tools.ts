import { CEFR_LEVELS } from '$lib/domain/cefr';
import { tool } from 'ai';
import { z } from 'zod';

export const GradeAttemptInputSchema = z.object({
	cefrLevel: z.enum(CEFR_LEVELS),
	expectedAnswer: z.string().min(1).max(400),
	feedback: z.string().min(1).max(500),
	kind: z.enum(['vocab', 'phrase', 'grammar']),
	// The target item being learned: a single word, short phrase, or named grammar concept.
	// NOT the full pedagogical sentence. Examples: "team", "ir/venir", "past simple negation".
	prompt: z.string().min(1).max(80),
	rating: z.number().int().min(1).max(4),
	score: z.number().int().min(0).max(10),
	userAnswer: z.string().min(1).max(400),
	verdict: z.enum(['correct', 'partial', 'incorrect']),
});

export type GradeAttemptInput = z.infer<typeof GradeAttemptInputSchema>;

export const tutorTools = {
	gradeAttempt: tool({
		description: [
			"Record the learner's attempt at an exercise.",
			'Call this AFTER you have shown the learner what to translate or complete',
			'AND received their answer. Pass the exact prompt text you presented,',
			"the expected answer, the user's answer, an FSRS rating 1–4",
			'(1=Again, 2=Hard, 3=Good, 4=Easy), a 0–10 score, a verdict and a short feedback string.',
			'The host application uses this to track spaced-repetition progress.',
		].join(' '),
		inputSchema: GradeAttemptInputSchema,
	}),
};

export type TutorToolName = keyof typeof tutorTools;
