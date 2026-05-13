import { defineConfig, devices } from '@playwright/test';

const DEV_SERVER_PORT = 4173;
const WEB_SERVER_BOOT_TIMEOUT_MS = 120_000;
const CI_RETRY_COUNT = 2;

export default defineConfig({
	forbidOnly: Boolean(process.env['CI']),
	fullyParallel: true,
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'list',
	retries: process.env['CI'] ? CI_RETRY_COUNT : 0,
	testDir: 'tests/e2e',
	testMatch: '**/*.{spec,e2e}.ts',
	use: {
		baseURL: `http://localhost:${String(DEV_SERVER_PORT)}`,
		screenshot: 'only-on-failure',
		trace: 'on-first-retry',
	},
	webServer: {
		// `vite preview` doesn't serve SvelteKit endpoints — dev keeps `/api/chat` alive for `page.route` mocks.
		command: `pnpm dev --port ${String(DEV_SERVER_PORT)}`,
		port: DEV_SERVER_PORT,
		reuseExistingServer: !process.env['CI'],
		timeout: WEB_SERVER_BOOT_TIMEOUT_MS,
	},
});
