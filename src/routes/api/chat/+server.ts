import { buildSystemPrompt } from '$lib/ai/prompts';
import { ChatRequestSchema } from '$lib/ai/schemas';
import { chatModel, MissingApiKeyError } from '$lib/ai/server/client';
import { tutorTools } from '$lib/ai/tools';
import { clientIdFromRequest, consumeToken } from '$lib/server/rate-limit';
import { json } from '@sveltejs/kit';
import { convertToModelMessages, stepCountIs, streamText, type ToolSet, type UIMessage } from 'ai';
import { z } from 'zod';

import type { RequestHandler } from './$types';

const MODEL_TEMPERATURE = 0.4;
const MAX_TOOL_ROUNDS = 4;
const RATE_LIMIT_BURST = 10;
const RATE_LIMIT_REFILL_PER_SECOND = 0.2;
const HTTP_STATUS_TOO_MANY_REQUESTS = 429;

export const POST: RequestHandler = async ({ request }) => {
	const limit = consumeToken(clientIdFromRequest(request), {
		burst: RATE_LIMIT_BURST,
		refillPerSecond: RATE_LIMIT_REFILL_PER_SECOND,
	});

	if (!limit.success) {
		return json(
			{ error: 'rate_limited', retryAfterSeconds: limit.retryAfterSeconds },
			{
				headers: {
					'retry-after': String(limit.retryAfterSeconds),
					'x-ratelimit-limit': String(limit.limit),
					'x-ratelimit-remaining': '0',
				},
				status: HTTP_STATUS_TOO_MANY_REQUESTS,
			},
		);
	}

	let requestBody: unknown;

	try {
		requestBody = await request.json();
	} catch {
		return json({ error: 'invalid_json' }, { status: 400 });
	}

	const parseResult = ChatRequestSchema.safeParse(requestBody);

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

	const systemPrompt = buildSystemPrompt(
		parseResult.data.profile,
		parseResult.data.format,
		parseResult.data.sessionCards ?? [],
	);

	const uiMessages = ((requestBody as { messages?: UIMessage[] }).messages ??
		[]) satisfies UIMessage[];

	const modelMessages = await convertToModelMessages(uiMessages);

	const streamResult = streamText({
		messages: modelMessages,
		model,
		stopWhen: stepCountIs(MAX_TOOL_ROUNDS),
		system: systemPrompt,
		temperature: MODEL_TEMPERATURE,
		tools: tutorTools as unknown as ToolSet,
	});

	return streamResult.toUIMessageStreamResponse();
};
