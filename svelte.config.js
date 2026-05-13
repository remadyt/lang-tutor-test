import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true),
	},
	kit: {
		adapter: adapter({ runtime: 'nodejs22.x' }),
		alias: {
			$lib: 'src/lib',
			'$lib/*': 'src/lib/*',
		},
	},
	preprocess: vitePreprocess(),
};

export default config;
