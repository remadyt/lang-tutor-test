<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		description?: string;
		eyebrow?: string;
		title: string;
	}

	let { children, description, eyebrow, title }: Props = $props();
</script>

<header class="space-y-1">
	{#if eyebrow}
		<p class="text-xs font-medium tracking-wider text-violet-500 uppercase">{eyebrow}</p>
	{/if}
	<h2 class="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
	{#if description}
		<p class="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
	{/if}
	{#if children}{@render children()}{/if}
</header>
