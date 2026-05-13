import eslintComments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import vitest from '@vitest/eslint-plugin';
import prettier from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import noSecrets from 'eslint-plugin-no-secrets';
import perfectionist from 'eslint-plugin-perfectionist';
import playwright from 'eslint-plugin-playwright';
import promise from 'eslint-plugin-promise';
import regexp from 'eslint-plugin-regexp';
import security from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import svelte from 'eslint-plugin-svelte';
import testingLibrary from 'eslint-plugin-testing-library';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import svelteParser from 'svelte-eslint-parser';
import ts from 'typescript-eslint';

const TS_FILES = ['**/*.ts'];
const SVELTE_FILES = ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'];
const CONFIG_FILES = ['*.config.{js,ts,mjs,cjs}', '*.config.*.{js,ts,mjs,cjs}'];

export default ts.config(
	{
		ignores: [
			'.DS_Store',
			'node_modules',
			'build',
			'.svelte-kit',
			'.vercel',
			'.netlify',
			'.output',
			'src/lib/paraglide',
			'package',
			'.env',
			'.env.*',
			'!.env.example',
			'pnpm-lock.yaml',
			'package-lock.json',
			'yarn.lock',
			'coverage',
			'test-results',
			'playwright-report',
			'static',
		],
	},
	js.configs.recommended,
	...ts.configs.strictTypeChecked,
	...ts.configs.stylisticTypeChecked,
	...svelte.configs.recommended,
	...svelte.configs.prettier,
	unicorn.configs.recommended,
	sonarjs.configs.recommended,
	regexp.configs['flat/recommended'],
	security.configs.recommended,
	promise.configs['flat/recommended'],
	importX.flatConfigs.recommended,
	importX.flatConfigs.typescript,
	eslintComments.recommended,
	perfectionist.configs['recommended-natural'],
	{
		languageOptions: {
			ecmaVersion: 2024,
			globals: { ...globals.browser, ...globals.node },
			sourceType: 'module',
		},
		plugins: { '@stylistic': stylistic, 'no-secrets': noSecrets },
		rules: {
			'@eslint-community/eslint-comments/require-description': 'error',

			'@stylistic/padding-line-between-statements': [
				'error',
				{ blankLine: 'always', next: ['return', 'throw', 'block-like'], prev: '*' },
				{ blankLine: 'always', next: '*', prev: ['const', 'let', 'var', 'block-like'] },
				{ blankLine: 'any', next: ['const', 'let', 'var'], prev: ['const', 'let', 'var'] },
				{ blankLine: 'any', next: 'export', prev: 'export' },
				{ blankLine: 'always', next: ['multiline-const', 'multiline-expression'], prev: '*' },
				{ blankLine: 'always', next: '*', prev: ['multiline-const', 'multiline-expression'] },
			],

			// Re-enabled below `prettier` config — see end of file.
			curly: ['error', 'all'],
			// Paraglide generates loose JS without type info; ignoring keeps linting fast.
			'import-x/namespace': 'off',
			// `svelte` + `svelte/reactivity` resolve to the same types file; the rule sees that as a duplicate.
			'import-x/no-duplicates': 'off',
			// DOMPurify, AxeBuilder, and several eslint plugins expose their API only as a default export.
			'import-x/no-named-as-default': 'off',
			'import-x/no-named-as-default-member': 'off',

			// SvelteKit virtual aliases are resolved at build time.
			'import-x/no-unresolved': [
				'error',
				{ ignore: [String.raw`^\$app/`, String.raw`^\$env/`, String.raw`^\$service-worker`] },
			],

			'no-secrets/no-secrets': ['error', { tolerance: 4.5 }],
			// Heuristic rules with high false-positive rate on env checks and dictionary lookups.
			'security/detect-object-injection': 'off',
			'security/detect-possible-timing-attacks': 'off',
			'sonarjs/cognitive-complexity': ['error', 15],

			'sonarjs/no-duplicate-string': ['error', { threshold: 4 }],
			'unicorn/filename-case': ['error', { cases: { kebabCase: true } }],
			'unicorn/no-null': 'off',
			'unicorn/no-useless-undefined': ['error', { checkArguments: false }],
			'unicorn/prefer-global-this': 'off',

			'unicorn/prevent-abbreviations': 'off',
		},
		settings: {
			'import-x/resolver-next': [
				(await import('eslint-import-resolver-typescript')).createTypeScriptImportResolver(),
			],
		},
	},
	{
		files: [...TS_FILES, ...SVELTE_FILES],
		languageOptions: {
			parserOptions: {
				extraFileExtensions: ['.svelte'],
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{ fixStyle: 'inline-type-imports', prefer: 'type-imports' },
			],
			'@typescript-eslint/no-misused-promises': [
				'error',
				{ checksVoidReturn: { attributes: false } },
			],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],
		},
	},
	{
		files: SVELTE_FILES,
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				projectService: true,
				svelteConfig: (await import('./svelte.config.js')).default,
			},
		},
		rules: {
			// Svelte runes use `prop = $bindable()` / `$state()` syntax on required props.
			'@typescript-eslint/no-useless-default-assignment': 'off',
			// sonarjs/deprecation crashes on Svelte source maps (upstream bug).
			'sonarjs/deprecation': 'off',
			// SvelteKit typed routes are experimental; opting in here costs more than it earns.
			'svelte/no-navigation-without-resolve': 'off',
			'unicorn/filename-case': 'off',
		},
	},
	{
		files: ['**/*.{test,spec}.{ts,js}', 'tests/**/*.{ts,js}'],
		plugins: { vitest },
		rules: {
			...vitest.configs.recommended.rules,
			'@typescript-eslint/no-non-null-assertion': 'off',
			'sonarjs/no-duplicate-string': 'off',
			'unicorn/no-empty-file': 'off',
		},
	},
	{
		files: ['src/**/*.{test,spec}.{ts,js}', 'src/**/*.svelte.{test,spec}.{ts,js}'],
		plugins: { 'testing-library': testingLibrary },
		rules: {
			...testingLibrary.configs['flat/svelte'].rules,
		},
	},
	{
		files: ['tests/e2e/**/*.{ts,js}', '**/*.e2e.{ts,js}'],
		...playwright.configs['flat/recommended'],
	},
	{
		files: CONFIG_FILES,
		...ts.configs.disableTypeChecked,
		rules: {
			...ts.configs.disableTypeChecked.rules,
			'no-secrets/no-secrets': 'off',
			'unicorn/no-await-expression-member': 'off',
		},
	},
	{
		files: ['**/*.d.ts'],
		rules: {
			'unicorn/no-empty-file': 'off',
			'unicorn/require-module-specifiers': 'off',
		},
	},
	prettier,
	{
		// `eslint-config-prettier` turns `curly` off; Prettier doesn't add braces itself.
		rules: { curly: ['error', 'all'] },
	},
);
