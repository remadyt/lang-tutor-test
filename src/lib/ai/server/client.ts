import type { LanguageModel } from 'ai';

import { serverEnv } from '$lib/env/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export class MissingApiKeyError extends Error {
	public constructor() {
		super(
			'GOOGLE_GENERATIVE_AI_API_KEY is not set. Add it to .env to enable the tutor (see .env.example).',
		);

		this.name = 'MissingApiKeyError';
	}
}

export function chatModel(): LanguageModel {
	const apiKey = serverEnv.GOOGLE_GENERATIVE_AI_API_KEY;

	if (apiKey === undefined || apiKey.length === 0) {
		throw new MissingApiKeyError();
	}

	return createGoogleGenerativeAI({ apiKey })(serverEnv.GEMINI_MODEL);
}
