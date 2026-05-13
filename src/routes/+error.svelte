<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button.svelte';
	import { t } from '$lib/i18n.svelte';
	import { Routes } from '$lib/routing/routes';
	import { TriangleAlert } from 'lucide-svelte';

	const NOT_FOUND_STATUS = 404;
	const status = $derived(page.status);
	const isNotFound = $derived(status === NOT_FOUND_STATUS);
	const message = $derived(
		isNotFound ? t('error_not_found_message') : (page.error?.message ?? t('error_default_message')),
	);

	function reload(): void {
		globalThis.location.reload();
	}
</script>

<svelte:head>
	<title>Lang Tutor — {String(status)}</title>
</svelte:head>

<main
	class="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-4 py-10 text-center"
>
	<div
		class="rounded-full bg-amber-100 p-4 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
	>
		<TriangleAlert size="32" aria-hidden="true" />
	</div>
	<div class="space-y-2">
		<p class="text-xs font-medium tracking-wider text-violet-500 uppercase">
			{String(status)} · {t('error_title')}
		</p>
		<p class="text-lg text-zinc-900 dark:text-zinc-50">{message}</p>
	</div>
	<div class="flex gap-2">
		<Button href={Routes.home}>{t('error_action_back_home')}</Button>
		{#if !isNotFound}
			<Button variant="outline" onclick={reload}>{t('error_action_reload')}</Button>
		{/if}
	</div>
</main>
