import { completeOnboarding, expect, test, wipeIndexedDb } from '../fixtures';
import { CHAT_TEST_IDS } from '../test-ids';

const STREAM_REPLY_TIMEOUT_MS = 15_000;

test.describe('session', () => {
	test('streams a tutor reply and accepts an answer', async ({ page }) => {
		await wipeIndexedDb(page);
		await completeOnboarding(page);

		await page.goto('/session?format=new-vocab');

		const assistantBubble = page.getByTestId(CHAT_TEST_IDS.assistantBubble);

		await expect(assistantBubble.first()).toBeVisible({ timeout: STREAM_REPLY_TIMEOUT_MS });

		await page.getByRole('textbox', { name: 'Your answer' }).fill('Querría un café.');
		await page.getByRole('textbox', { name: 'Your answer' }).press('Enter');

		await expect(page.getByTestId(CHAT_TEST_IDS.userBubble).first()).toBeVisible();
		await expect(assistantBubble.nth(1)).toBeVisible({ timeout: STREAM_REPLY_TIMEOUT_MS });
	});
});
