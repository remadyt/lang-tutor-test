import AxeBuilder from '@axe-core/playwright';

import { expect, test, wipeIndexedDb } from '../fixtures';

test.describe('onboarding', () => {
	test('first visit routes to /onboarding and completes in three steps', async ({ page }) => {
		await wipeIndexedDb(page);
		await page.goto('/');

		await expect(page).toHaveURL(/\/onboarding/u);

		await expect(
			page.getByRole('heading', { level: 2, name: 'Pick your languages' }),
		).toBeVisible();

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
		await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();
		await expect(page.getByText(/German.*A2/u)).toBeVisible();
	});

	test('onboarding has no critical axe violations', async ({ page }) => {
		await wipeIndexedDb(page);
		await page.goto('/onboarding');

		await expect(
			page.getByRole('heading', { level: 2, name: 'Pick your languages' }),
		).toBeVisible();

		const axeResults = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa'])
			.disableRules(['color-contrast'])
			.analyze();

		const criticalViolations = axeResults.violations.filter(
			(violation) => violation.impact === 'critical',
		);

		expect(criticalViolations, JSON.stringify(criticalViolations, null, 2)).toStrictEqual([]);
	});
});
