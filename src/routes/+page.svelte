<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import ConfirmDialog from '$lib/components/ui/confirm-dialog.svelte';
	import OptionTile from '$lib/components/ui/option-tile.svelte';
	import SectionHeading from '$lib/components/ui/section-heading.svelte';
	import { cardsRepository, reviewsRepository } from '$lib/database/repositories';
	import {
		formatDescription,
		formatLabel,
		LESSON_FORMATS,
		type LessonFormat,
	} from '$lib/domain/lesson-format';
	import { t } from '$lib/i18n.svelte';
	import { Routes, sessionWith } from '$lib/routing/routes';
	import { currentStreak, dueToday } from '$lib/spaced-repetition/stats';
	import { profileStore } from '$lib/stores/profile.svelte';
	import { Sparkles } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let dueCount = $state(0);
	let totalCards = $state(0);
	let streak = $state(0);
	let isResetDialogOpen = $state(false);

	const isFirstVisit = $derived(totalCards === 0);
	const hasNothingDue = $derived(totalCards > 0 && dueCount === 0);

	onMount(async () => {
		await profileStore.load();

		if (profileStore.profile === undefined) {
			await goto(Routes.onboarding);

			return;
		}

		const [cards, reviews] = await Promise.all([cardsRepository.all(), reviewsRepository.all()]);

		totalCards = cards.length;
		dueCount = dueToday(cards).length;
		streak = currentStreak(reviews);
	});

	function startSession(format: LessonFormat): void {
		void goto(sessionWith(format));
	}

	async function performReset(): Promise<void> {
		await profileStore.clear();
		await goto(Routes.onboarding);
	}
</script>

<svelte:head>
	<title>Lang Tutor — your daily session</title>
</svelte:head>

<main class="mx-auto max-w-3xl space-y-8 px-4 py-10">
	{#if profileStore.profile}
		{@const profile = profileStore.profile}
		<SectionHeading
			eyebrow={t('dashboard_eyebrow')}
			title={t('dashboard_title')}
			description={streak > 0
				? `${profile.targetLanguageLabel} • ${profile.level} • ${String(streak)} ${t('dashboard_streak_suffix')}`
				: `${profile.targetLanguageLabel} • ${profile.level}`}
		/>

		<Card>
			<div class="flex items-start gap-4">
				<div class="rounded-xl bg-violet-100 p-3 text-violet-600 dark:bg-violet-500/10">
					<Sparkles size="22" aria-hidden="true" />
				</div>
				<div class="flex-1 space-y-3">
					<p class="text-base text-zinc-900 dark:text-zinc-100">
						{#if isFirstVisit}
							{t('dashboard_first_visit_message', { language: profile.targetLanguageLabel })}
						{:else if hasNothingDue}
							{t('dashboard_nothing_due_message')}
						{:else}
							{t('dashboard_you_have_n_cards_due', { count: dueCount })}
						{/if}
					</p>
					{#if dueCount > 0}
						<Button
							onclick={() => {
								startSession('review');
							}}
						>
							{t('dashboard_start_review')}
						</Button>
					{:else}
						<Button
							onclick={() => {
								startSession('new-vocab');
							}}
						>
							{t('dashboard_learn_something_new')}
						</Button>
					{/if}
				</div>
			</div>
		</Card>

		<section class="space-y-3">
			<h3 class="text-sm font-medium tracking-wider text-zinc-500 uppercase">
				{t('dashboard_pick_format')}
			</h3>
			<ul class="grid gap-3 sm:grid-cols-2">
				{#each LESSON_FORMATS as format (format)}
					<li>
						<OptionTile
							selected={false}
							onclick={() => {
								startSession(format);
							}}
						>
							<span class="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
								{formatLabel(format)}
							</span>
							<span class="text-xs text-zinc-600 dark:text-zinc-400">
								{formatDescription(format)}
							</span>
						</OptionTile>
					</li>
				{/each}
			</ul>
		</section>

		<footer
			class="flex items-center justify-between border-t border-zinc-200 pt-6 dark:border-zinc-800"
		>
			<Button href={Routes.progress} variant="ghost" size="sm">
				{t('dashboard_view_progress')}
			</Button>
			<Button
				variant="ghost"
				size="sm"
				onclick={() => {
					isResetDialogOpen = true;
				}}
			>
				{t('dashboard_reset_profile')}
			</Button>
		</footer>

		<ConfirmDialog
			open={isResetDialogOpen}
			title={t('dashboard_reset_profile_title')}
			description={t('dashboard_reset_profile_confirm')}
			confirmLabel={t('dashboard_reset_profile_confirm_action')}
			cancelLabel={t('dashboard_reset_profile_cancel')}
			destructive
			onClose={() => {
				isResetDialogOpen = false;
			}}
			onConfirm={performReset}
		/>
	{/if}
</main>
