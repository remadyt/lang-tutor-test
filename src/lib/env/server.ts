import { env as privateEnv } from '$env/dynamic/private';
import { z } from 'zod';

const Schema = z.object({
	GEMINI_MODEL: z.string().min(1).default('gemini-2.5-flash'),
	GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1).optional(),
});

const parsed = Schema.safeParse(privateEnv);

if (!parsed.success) {
	const issues = parsed.error.issues.map((issue) => `- ${issue.path.join('.')}: ${issue.message}`);

	throw new Error(`Invalid server environment:\n${issues.join('\n')}`);
}

export const serverEnv = parsed.data;

export function hasApiKey(): boolean {
	return Boolean(serverEnv.GOOGLE_GENERATIVE_AI_API_KEY);
}
