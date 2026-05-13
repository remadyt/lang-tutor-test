<script lang="ts">
	import type { Snippet } from 'svelte';

	import { cn } from '$lib/utils/cn';

	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: className }: Props = $props();
</script>

<div
	class={cn(
		'rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60',
		className,
	)}
>
	{@render children()}
</div>
