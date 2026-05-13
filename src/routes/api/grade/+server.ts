import { GradeRequestSchema, GradeSchema } from '$lib/ai/schemas';
import { chatModel, MissingApiKeyError } from '$lib/ai/server/client';
import { json } from '@sveltejs/kit';
// eslint-disable-next-line sonarjs/deprecation -- `generateObject` is the current public API for structured output; the SDK marks a specific overload deprecated, not this usage
import { generateObject } from 'ai';
import { z } from 'zod';

import type { RequestHandler } from './$types';

const GRADER_SYSTEM_PROMPT = [
	'You are a meticulous language-tutor grader.',
	'Given a target-language prompt, an expected answer, and the learner answer,',
	'return a structured grade. Verdicts: "correct" / "partial" / "incorrect".',
	'Score is 0–10 (10 = native-speaker level). Rating follows FSRS: 1=Again, 2=Hard, 3=Good, 4=Easy.',
	'Feedback MUST be one short, encouraging sentence in English.',
].join(' ');

export const POST: RequestHandler = async ({ request }) => {
	let requestBody: unknown;

	try {
		requestBody = await request.json();
	} catch {
		return json({ error: 'invalid_json' }, { status: 400 });
	}

	const parseResult = GradeRequestSchema.safeParse(requestBody);

	if (!parseResult.success) {
		return json({ error: z.treeifyError(parseResult.error) }, { status: 400 });
	}

	let model;

	try {
		model = chatModel();
	} catch (error) {
		if (error instanceof MissingApiKeyError) {
			return json({ error: error.message }, { status: 503 });
		}

		throw error;
	}

	const { expected, format, level, nativeLanguage, prompt, targetLanguage, userAnswer } =
		parseResult.data;

	// eslint-disable-next-line @typescript-eslint/no-deprecated, sonarjs/deprecation -- see top-of-file note on `generateObject`
	const { object: grade } = await generateObject({
		model,
		prompt: [
			`Native language: ${nativeLanguage} (write the feedback in this language)`,
			`Target language: ${targetLanguage} (level ${level})`,
			`Lesson format: ${format}`,
			`Prompt: ${prompt}`,
			`Expected answer: ${expected}`,
			`Learner answer: ${userAnswer}`,
		].join('\n'),
		schema: GradeSchema,
		system: GRADER_SYSTEM_PROMPT,
	});

	return json(grade);
};
