<script lang="ts">
	import type { CardRow, ReviewRow } from '$lib/database/types';

	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import SectionHeading from '$lib/components/ui/section-heading.svelte';
	import { cardsRepository, reviewsRepository } from '$lib/database/repositories';
	import { t } from '$lib/i18n.svelte';
	import { Routes } from '$lib/routing/routes';
	import {
		currentStreak,
		dueToday,
		reviewsByDay,
		strongestCards,
		weakestCards,
	} from '$lib/spaced-repetition/stats';
	import { profileStore } from '$lib/stores/profile.svelte';
	import { ArrowLeft } from 'lucide-svelte';
	import { onMount } from 'svelte';

	const HISTORY_DAYS = 14;
	const TOP_LIST_LIMIT = 5;
	const CHART_BAR_HEIGHT_MAX_PX = 80;

	let cards = $state<readonly CardRow[]>([]);
	let reviews = $state<readonly ReviewRow[]>([]);

	const streak = $derived(currentStreak(reviews));
	const dueCount = $derived(dueToday(cards).length);
	const weakest = $derived(weakestCards(cards, TOP_LIST_LIMIT));
	const strongest = $derived(strongestCards(cards, TOP_LIST_LIMIT));
	const history = $derived(reviewsByDay(reviews, HISTORY_DAYS));
	const peakDailyReviewCount = $derived(Math.max(1, ...history.map((bucket) => bucket.count)));

	onMount(async () => {
		await profileStore.load();

		if (profileStore.profile === undefined) {
			await goto(Routes.onboarding);

			return;
		}

		const [loadedCards, loadedReviews] = await Promise.all([
			cardsRepository.all(),
			reviewsRepository.all(),
		]);

		cards = loadedCards;
		reviews = loadedReviews;
	});
</script>

<svelte:head>
	<title>Lang Tutor — progress</title>
</svelte:head>

<main class="mx-auto max-w-3xl space-y-8 px-4 py-10">
	<Button href={Routes.home} variant="ghost" size="sm">
		<ArrowLeft size="16" aria-hidden="true" />
		{t('common_back')}
	</Button>

	<SectionHeading
		eyebrow={t('progress_eyebrow')}
		title={t('progress_title')}
		description={t('progress_description')}
	/>

	<div class="grid gap-4 sm:grid-cols-3">
		<Card>
			<p class="text-xs tracking-wider text-zinc-500 uppercase">{t('progress_streak')}</p>
			<p class="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{streak}</p>
			<p class="text-xs text-zinc-500">{t('progress_consecutive_days')}</p>
		</Card>
		<Card>
			<p class="text-xs tracking-wider text-zinc-500 uppercase">{t('progress_due_today')}</p>
			<p class="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{dueCount}</p>
			<p class="text-xs text-zinc-500">{t('progress_n_total_cards', { count: cards.length })}</p>
		</Card>
		<Card>
			<p class="text-xs tracking-wider text-zinc-500 uppercase">{t('progress_reviews')}</p>
			<p class="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{reviews.length}</p>
			<p class="text-xs text-zinc-500">{t('progress_all_time')}</p>
		</Card>
	</div>

	<Card>
		<p class="mb-3 text-xs tracking-wider text-zinc-500 uppercase">
			{t('progress_last_n_days', { days: HISTORY_DAYS })}
		</p>
		<div
			class="flex items-end gap-1.5"
			aria-label={t('progress_bar_label', { days: HISTORY_DAYS })}
		>
			{#each history as bucket (bucket.date)}
				{@const barHeightPx = (bucket.count / peakDailyReviewCount) * CHART_BAR_HEIGHT_MAX_PX}
				<div class="flex flex-1 flex-col items-center gap-1">
					<div
						class="w-full rounded-t bg-violet-500/70 transition-all dark:bg-violet-400/80"
						style:height={`${String(barHeightPx)}px`}
						title={`${bucket.date}: ${String(bucket.count)}`}
					></div>
					<span class="text-[10px] text-zinc-500">{bucket.date.slice(5)}</span>
				</div>
			{/each}
		</div>
	</Card>

	<div class="grid gap-4 sm:grid-cols-2">
		<Card>
			<SectionHeading title={t('progress_strongest')} />
			<ul class="mt-3 space-y-2 text-sm">
				{#each strongest as card (card.id)}
					<li
						class="flex items-baseline gap-2 truncate text-zinc-900 dark:text-zinc-100"
						title={`${card.prompt} — ${card.answer}`}
					>
						<span class="font-medium">{card.prompt}</span>
						<span class="truncate text-zinc-500 dark:text-zinc-400">— {card.answer}</span>
					</li>
				{:else}
					<li class="text-sm text-zinc-500">{t('progress_no_mastered_yet')}</li>
				{/each}
			</ul>
		</Card>
		<Card>
			<SectionHeading title={t('progress_weakest')} />
			<ul class="mt-3 space-y-2 text-sm">
				{#each weakest as card (card.id)}
					<li
						class="flex items-baseline gap-2 truncate text-zinc-900 dark:text-zinc-100"
						title={`${card.prompt} — ${card.answer}`}
					>
						<span class="font-medium">{card.prompt}</span>
						<span class="truncate text-zinc-500 dark:text-zinc-400">— {card.answer}</span>
					</li>
				{:else}
					<li class="text-sm text-zinc-500">{t('progress_no_struggling_items')}</li>
				{/each}
			</ul>
		</Card>
	</div>
</main>
