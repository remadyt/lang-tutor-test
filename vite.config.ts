import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		paraglideVitePlugin({ outdir: './src/lib/paraglide', project: './project.inlang' }),
	],
	test: {
		coverage: {
			exclude: [
				'src/lib/**/*.{test,spec}.ts',
				'src/lib/**/*.svelte.{test,spec}.ts',
				'src/lib/server/**',
				'src/lib/assets/**',
			],
			include: ['src/lib/**/*.{ts,svelte}'],
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'],
			thresholds: { branches: 70, functions: 75, lines: 75, statements: 75 },
		},
		environment: 'node',
		exclude: ['src/**/*.svelte.{test,spec}.{js,ts}', '**/node_modules/**', 'tests/e2e/**'],
		expect: { requireAssertions: true },
		include: ['src/**/*.{test,spec}.{js,ts}'],
	},
});
