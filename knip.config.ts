import type { KnipConfig } from 'knip';

const config: KnipConfig = {
	entry: [
		'src/routes/**/+{page,layout,server,error}.{ts,svelte}',
		'src/hooks.{client,server}.ts',
		'src/hooks.ts',
	],
	ignore: ['.svelte-kit/**', '.vercel/**', 'static/**', 'src/lib/paraglide/**'],
	ignoreDependencies: [
		'@sveltejs/adapter-auto',
		'prettier-plugin-svelte',
		'prettier-plugin-organize-imports',
		'prettier-plugin-tailwindcss',
		// peer of tailwind-variants
		'tailwind-merge',
	],
	ignoreExportsUsedInFile: true,
	project: ['src/**/*.{ts,svelte}'],
	rules: { exports: 'off', nsExports: 'off', nsTypes: 'off', types: 'off' },
};

export default config;
