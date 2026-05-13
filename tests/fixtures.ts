import { test as basePlaywrightTest, expect, type Page } from '@playwright/test';

const MOCK_TUTOR_REPLIES: readonly string[] = [
	'¡Hola! Translate to Spanish: **"I would like a coffee, please."**',
	'Spot on — 10/10. Natural phrasing: _"Querría un café, por favor."_ Try: **"Where is the train station?"**',
	'Great. Vocabulary check: what does **"madrugar"** mean?',
	'Nice! Complete: _"Si yo ____ (tener) más tiempo, viajaría más."_',
];

const STREAM_FIRST_CHUNK_DELAY_MS = 20;
const WHITESPACE_SEPARATOR_REGEX = /(\s+)/u;
const INDEXED_DB_NAME = 'lang-tutor';
const HTTP_STATUS_OK = 200;

// Vercel-AI-SDK UI-message-stream: one `data: {...}` line per chunk, terminated by `data: [DONE]`.
function buildUiMessageStream(text: string, messageId: string): string {
	const tokens = text.split(WHITESPACE_SEPARATOR_REGEX).filter(Boolean);

	const events = [
		{ type: 'start' },
		{ id: messageId, type: 'text-start' },
		...tokens.map((delta) => ({ delta, id: messageId, type: 'text-delta' })),
		{ id: messageId, type: 'text-end' },
		{ type: 'finish' },
	];

	return events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join('') + 'data: [DONE]\n\n';
}

async function installChatStreamMock(page: Page): Promise<void> {
	let replyIndex = 0;

	await page.route('**/api/chat', async (route) => {
		const reply =
			MOCK_TUTOR_REPLIES[replyIndex % MOCK_TUTOR_REPLIES.length] ?? MOCK_TUTOR_REPLIES[0] ?? '…';

		replyIndex += 1;
		await new Promise((resolve) => setTimeout(resolve, STREAM_FIRST_CHUNK_DELAY_MS));

		await route.fulfill({
			body: buildUiMessageStream(reply, `mock-${String(replyIndex)}`),
			contentType: 'text/event-stream',
			headers: {
				'cache-control': 'no-cache, no-transform',
				'x-vercel-ai-ui-message-stream': 'v1',
			},
			status: HTTP_STATUS_OK,
		});
	});
}

async function installGradeMock(page: Page): Promise<void> {
	await page.route('**/api/grade', async (route) => {
		await route.fulfill({
			body: JSON.stringify({
				feedback: 'Looks good — keep going.',
				rating: 3,
				score: 8,
				verdict: 'correct',
			}),
			contentType: 'application/json',
			status: HTTP_STATUS_OK,
		});
	});
}

export const test = basePlaywrightTest.extend({
	page: async ({ page }, use) => {
		await installChatStreamMock(page);
		await installGradeMock(page);
		await use(page);
	},
});

export async function completeOnboarding(page: Page): Promise<void> {
	await page.goto('/');
	await expect(page).toHaveURL(/\/onboarding/u);
	await expect(page.getByRole('heading', { level: 2, name: 'Pick your languages' })).toBeVisible();

	await page.getByLabel('I speak').selectOption('fr');
	await page.getByLabel('I want to learn').selectOption('de');

	await page.getByRole('button', { name: 'Continue' }).click();

	await expect(
		page.getByRole('heading', { level: 2, name: 'How confident are you?' }),
	).toBeVisible();

	await page.getByRole('button', { name: 'A2 — Elementary' }).click();
	await page.getByRole('button', { name: 'Continue' }).click();

	await expect(
		page.getByRole('heading', { level: 2, name: 'What do you care about?' }),
	).toBeVisible();

	await page.getByRole('button', { name: 'Start learning' }).click();

	await expect(page).toHaveURL('/');
}

export async function wipeIndexedDb(page: Page): Promise<void> {
	await page.context().clearCookies();
	await page.goto('/');

	await page.evaluate(
		(databaseName) =>
			new Promise<void>((resolve) => {
				const request = indexedDB.deleteDatabase(databaseName);

				request.addEventListener('success', () => {
					resolve();
				});

				request.addEventListener('error', () => {
					resolve();
				});

				request.addEventListener('blocked', () => {
					resolve();
				});
			}),
		INDEXED_DB_NAME,
	);
}

export { expect } from '@playwright/test';
