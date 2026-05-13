import { describe, expect, it } from 'vitest';

import { ChatRequestSchema, GradeSchema, NewCardSchema } from './schemas';

describe('ai/schemas', () => {
	it('GradeSchema accepts a valid grade payload', () => {
		const parsed = GradeSchema.safeParse({
			feedback: 'Great job!',
			rating: 3,
			score: 9,
			verdict: 'correct',
		});

		expect(parsed.success).toBe(true);
	});

	it('GradeSchema rejects out-of-range scores', () => {
		const parsed = GradeSchema.safeParse({
			feedback: 'Nope',
			rating: 1,
			score: 11,
			verdict: 'incorrect',
		});

		expect(parsed.success).toBe(false);
	});

	it('NewCardSchema rejects unknown levels', () => {
		const parsed = NewCardSchema.safeParse({
			answer: 'house',
			kind: 'vocab',
			level: 'D1',
			prompt: 'la casa',
		});

		expect(parsed.success).toBe(false);
	});

	it('ChatRequestSchema accepts a valid envelope', () => {
		const parsed = ChatRequestSchema.safeParse({
			format: 'review',
			messages: [{ content: 'hi', role: 'user' }],
			profile: {
				interests: ['travel'],
				level: 'A2',
				nativeLanguage: 'ru',
				nativeLanguageLabel: 'Russian',
				targetLanguage: 'pl',
				targetLanguageLabel: 'Polish',
			},
		});

		expect(parsed.success).toBe(true);
	});
});
