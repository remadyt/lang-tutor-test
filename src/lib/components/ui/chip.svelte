<script lang="ts">
	import type { Snippet } from 'svelte';

	import { cn } from '$lib/utils/cn';

	interface Props {
		children: Snippet;
		onclick: () => void;
		selected: boolean;
	}

	let { children, onclick, selected }: Props = $props();
</script>

<button
	type="button"
	{onclick}
	aria-pressed={selected}
	class={cn(
		'rounded-full border px-3 py-1.5 text-xs transition focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:outline-none',
		selected
			? 'border-violet-500 bg-violet-500 text-white'
			: 'border-zinc-200 text-zinc-700 hover:border-violet-300 dark:border-zinc-800 dark:text-zinc-300',
	)}
>
	{@render children()}
</button>
