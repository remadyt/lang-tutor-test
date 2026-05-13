<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button.svelte';
	import Card from '$lib/components/ui/card.svelte';
	import Chip from '$lib/components/ui/chip.svelte';
	import OptionTile from '$lib/components/ui/option-tile.svelte';
	import SectionHeading from '$lib/components/ui/section-heading.svelte';
	import Select from '$lib/components/ui/select.svelte';
	import { PROFILE_SINGLETON_ID } from '$lib/database/types';
	import { type Cefr, CEFR_LABELS, CEFR_LEVELS } from '$lib/domain/cefr';
	import { type Interest, interestLabel, INTERESTS } from '$lib/domain/interests';
	import { findLanguage, LANGUAGES } from '$lib/domain/languages';
	import { formatLabel, LESSON_FORMATS, type LessonFormat } from '$lib/domain/lesson-format';
	import { localeStore, t } from '$lib/i18n.svelte';
	import { Routes } from '$lib/routing/routes';
	import { profileStore } from '$lib/stores/profile.svelte';
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';

	type Step = 1 | 2 | 3;

	const TOTAL_STEPS = 3;
	const DEFAULT_NATIVE_LANGUAGE_CODE = 'en';
	const DEFAULT_TARGET_LANGUAGE_CODE = 'es';
	const DEFAULT_LEVEL: Cefr = 'A2';
	const DEFAULT_INTERESTS: readonly Interest[] = ['everyday'];
	const DEFAULT_FORMATS: readonly LessonFormat[] = ['new-vocab', 'review'];

	let step = $state<Step>(1);
	let nativeLanguageCode = $state<string>(DEFAULT_NATIVE_LANGUAGE_CODE);
	let targetLanguageCode = $state<string>(DEFAULT_TARGET_LANGUAGE_CODE);
	let selectedLevel = $state<Cefr>(DEFAULT_LEVEL);
	const selectedInterests = new SvelteSet<Interest>(DEFAULT_INTERESTS);
	const selectedFormats = new SvelteSet<LessonFormat>(DEFAULT_FORMATS);
	let isSaving = $state(false);

	const canContinueStep1 = $derived(
		nativeLanguageCode !== '' &&
			targetLanguageCode !== '' &&
			nativeLanguageCode !== targetLanguageCode,
	);

	const stepTitle = $derived.by(() => {
		switch (step) {
			case 1: {
				return t('onboarding_step1_title');
			}

			case 2: {
				return t('onboarding_step2_title');
			}

			case 3: {
				return t('onboarding_step3_title');
			}
		}
	});

	const stepDescription = $derived.by(() => {
		switch (step) {
			case 1: {
				return t('onboarding_step1_description');
			}

			case 2: {
				return t('onboarding_step2_description');
			}

			case 3: {
				return t('onboarding_step3_description');
			}
		}
	});

	$effect(() => {
		localeStore.resolve(nativeLanguageCode);
	});

	$effect(() => {
		if (nativeLanguageCode === targetLanguageCode) {
			const fallback = LANGUAGES.find((language) => language.code !== nativeLanguageCode);

			if (fallback !== undefined) {
				targetLanguageCode = fallback.code;
			}
		}
	});

	onMount(async () => {
		await profileStore.load();

		if (profileStore.profile !== undefined) {
			await goto(Routes.home);
		}
	});

	function toggleInterest(interest: Interest): void {
		if (selectedInterests.has(interest)) {
			selectedInterests.delete(interest);
		} else {
			selectedInterests.add(interest);
		}
	}

	function toggleFormat(format: LessonFormat): void {
		if (selectedFormats.has(format)) {
			selectedFormats.delete(format);
		} else {
			selectedFormats.add(format);
		}
	}

	async function finish(): Promise<void> {
		isSaving = true;

		const nativeLanguage = findLanguage(nativeLanguageCode);
		const targetLanguage = findLanguage(targetLanguageCode);

		if (nativeLanguage === undefined || targetLanguage === undefined) {
			isSaving = false;

			return;
		}

		await profileStore.save({
			createdAt: Date.now(),
			id: PROFILE_SINGLETON_ID,
			interests: [...selectedInterests],
			level: selectedLevel,
			nativeLanguage: nativeLanguage.code,
			nativeLanguageLabel: nativeLanguage.label,
			preferredFormats: [...selectedFormats],
			targetLanguage: targetLanguage.code,
			targetLanguageLabel: targetLanguage.label,
		});

		await goto(Routes.home);
	}
</script>

<svelte:head>
	<title>Lang Tutor — setup</title>
</svelte:head>

<main class="mx-auto max-w-2xl space-y-6 px-4 py-10">
	<SectionHeading
		eyebrow={t('onboarding_step_of', { current: step, total: TOTAL_STEPS })}
		title={stepTitle}
		description={stepDescription}
	/>

	<Card>
		{#if step === 1}
			{@const nativeOptions = LANGUAGES.filter(
				(language) => language.code !== targetLanguageCode,
			).map((language) => ({
				description: language.nativeLabel,
				label: language.label,
				value: language.code,
			}))}
			{@const targetOptions = LANGUAGES.filter(
				(language) => language.code !== nativeLanguageCode,
			).map((language) => ({
				description: language.nativeLabel,
				label: language.label,
				value: language.code,
			}))}
			<div class="grid gap-4 sm:grid-cols-2">
				<Select
					label={t('onboarding_legend_i_speak')}
					options={nativeOptions}
					bind:value={nativeLanguageCode}
				/>
				<Select
					label={t('onboarding_legend_i_want_to_learn')}
					options={targetOptions}
					bind:value={targetLanguageCode}
				/>
			</div>
		{:else if step === 2}
			<ul class="grid gap-2">
				{#each CEFR_LEVELS as level (level)}
					<li>
						<OptionTile
							selected={selectedLevel === level}
							onclick={() => {
								selectedLevel = level;
							}}
							class="flex-row items-center justify-between"
						>
							<span class="font-medium">{level}</span>
							<span class="text-xs text-zinc-500">{CEFR_LABELS[level]}</span>
						</OptionTile>
					</li>
				{/each}
			</ul>
		{:else}
			<div class="space-y-5">
				<fieldset>
					<legend class="mb-2 text-xs font-medium tracking-wider text-zinc-500 uppercase">
						{t('onboarding_legend_interests')}
					</legend>
					<ul class="flex flex-wrap gap-2">
						{#each INTERESTS as interest (interest)}
							<li>
								<Chip
									selected={selectedInterests.has(interest)}
									onclick={() => {
										toggleInterest(interest);
									}}
								>
									{interestLabel(interest)}
								</Chip>
							</li>
						{/each}
					</ul>
				</fieldset>
				<fieldset>
					<legend class="mb-2 text-xs font-medium tracking-wider text-zinc-500 uppercase">
						{t('onboarding_legend_formats')}
					</legend>
					<ul class="flex flex-wrap gap-2">
						{#each LESSON_FORMATS as format (format)}
							<li>
								<Chip
									selected={selectedFormats.has(format)}
									onclick={() => {
										toggleFormat(format);
									}}
								>
									{formatLabel(format)}
								</Chip>
							</li>
						{/each}
					</ul>
				</fieldset>
			</div>
		{/if}
	</Card>

	<nav class="flex items-center justify-between">
		<Button
			variant="ghost"
			disabled={step === 1}
			onclick={() => {
				step = (step - 1) as Step;
			}}
		>
			{t('common_back')}
		</Button>
		{#if step < 3}
			<Button
				disabled={step === 1 && !canContinueStep1}
				onclick={() => {
					step = (step + 1) as Step;
				}}
			>
				{t('common_continue')}
			</Button>
		{:else}
			<Button onclick={finish} disabled={isSaving || selectedInterests.size === 0}>
				{isSaving ? t('onboarding_start_learning_saving') : t('onboarding_start_learning')}
			</Button>
		{/if}
	</nav>
</main>
