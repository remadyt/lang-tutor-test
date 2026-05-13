<script lang="ts">
	import type { UIMessage } from '@ai-sdk/svelte';

	import { CHAT_TEST_IDS } from '$lib/testing/test-ids';
	import { renderMarkdown } from '$lib/utils/markdown';

	interface Props {
		message: UIMessage;
	}

	let { message }: Props = $props();

	const testId = $derived(
		message.role === 'user' ? CHAT_TEST_IDS.userBubble : CHAT_TEST_IDS.assistantBubble,
	);

	const text = $derived(
		message.parts
			.map((part) => (part.type === 'text' ? part.text : ''))
			.filter(Boolean)
			.join(''),
	);

	const html = $derived(text.length > 0 ? renderMarkdown(text) : '');
</script>

{#if html.length > 0}
	<div
		class={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
		data-testid={testId}
	>
		<div
			class={`prose prose-sm dark:prose-invert max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed ${
				message.role === 'user'
					? 'bg-violet-600 text-white shadow-sm shadow-violet-950/30'
					: 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-100'
			}`}
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- sanitised by DOMPurify -->
			{@html html}
		</div>
	</div>
{/if}
