<script lang="ts">
	import type { Snippet } from 'svelte';

	import { cn } from '$lib/utils/cn';

	interface Props {
		children: Snippet;
		class?: string;
		onclick: () => void;
		selected: boolean;
	}

	let { children, class: className, onclick, selected }: Props = $props();
</script>

<button
	type="button"
	{onclick}
	aria-pressed={selected}
	class={cn(
		'flex w-full flex-col items-start rounded-xl border p-3 text-left transition focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:outline-none',
		selected
			? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10'
			: 'border-zinc-200 hover:border-violet-300 dark:border-zinc-800 dark:hover:border-violet-500/60',
		className,
	)}
>
	{@render children()}
</button>
