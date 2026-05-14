<script lang="ts">
	import type { MessageRow } from '$lib/database/types';
	import type { UIMessage } from '@ai-sdk/svelte';

	import { goto } from '$app/navigation';
	import { type SessionCard } from '$lib/ai/schemas';
	import { GradeAttemptInputSchema } from '$lib/ai/tools';
	import MessageBubble from '$lib/components/chat/message-bubble.svelte';
	import Button from '$lib/components/ui/button.svelte';
	import { cardsRepository, messagesRepository } from '$lib/database/repositories';
	import {
		formatLabel,
		isLessonFormat,
		LESSON_FORMATS,
		type LessonFormat,
	} from '$lib/domain/lesson-format';
	import {
		QUICK_ACTIONS_BY_FORMAT,
		quickActionLabel,
		quickActionMessage,
	} from '$lib/domain/quick-actions';
	import { t } from '$lib/i18n.svelte';
	import { Routes } from '$lib/routing/routes';
	import { recordGradedAttempt } from '$lib/spaced-repetition/card-flow';
	import { dueToday, weakestCards } from '$lib/spaced-repetition/stats';
	import { profileStore } from '$lib/stores/profile.svelte';
	import { CHAT_TEST_IDS } from '$lib/testing/test-ids';
	import { Chat } from '@ai-sdk/svelte';
	import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
	import { ArrowLeft, Send } from 'lucide-svelte';
	import { onMount, tick } from 'svelte';

	const params = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);
	const formatParam = params.get('format');
	const format: LessonFormat =
		formatParam !== null && isLessonFormat(formatParam) ? formatParam : 'review';

	const HISTORY_SEND_LIMIT = 20;
	const HISTORY_RENDER_LIMIT = 200;

	let input = $state('');
	let scrollContainer = $state<HTMLDivElement | undefined>();
	let chat = $state<Chat | undefined>();
	let sessionCards = $state<SessionCard[]>([]);

	const cardsRemaining = $derived(sessionCards.length);
	const isBusy = $derived(
		chat === undefined || chat.status === 'streaming' || chat.status === 'submitted',
	);

	onMount(async () => {
		await profileStore.load();

		const profile = profileStore.profile;

		if (profile === undefined) {
			await goto(Routes.onboarding);

			return;
		}

		const targetLanguage = profile.targetLanguage;

		sessionCards = await buildSessionCards(format);

		const storedMessages = await loadPersistedMessages(format);

		const profilePayload = {
			interests: profile.interests,
			level: profile.level,
			nativeLanguage: profile.nativeLanguage,
			nativeLanguageLabel: profile.nativeLanguageLabel,
			targetLanguage: profile.targetLanguage,
			targetLanguageLabel: profile.targetLanguageLabel,
		};

		chat = new Chat({
			messages: storedMessages,
			onToolCall: async ({ toolCall }) => {
				if (toolCall.toolName !== 'gradeAttempt' || chat === undefined) {
					return;
				}

				const parseResult = GradeAttemptInputSchema.safeParse(toolCall.input);

				if (!parseResult.success) {
					chat.addToolOutput({
						errorText: parseResult.error.message,
						state: 'output-error',
						tool: 'gradeAttempt',
						toolCallId: toolCall.toolCallId,
					});

					return;
				}

				try {
					const validated = parseResult.data;

					const { card } = await recordGradedAttempt({
						cefrLevel: validated.cefrLevel,
						expectedAnswer: validated.expectedAnswer,
						feedback: validated.feedback,
						kind: validated.kind,
						prompt: validated.prompt,
						rating: validated.rating as 1 | 2 | 3 | 4,
						score: validated.score,
						targetLanguage,
						userAnswer: validated.userAnswer,
						verdict: validated.verdict,
					});

					sessionCards = await buildSessionCards(format);

					chat.addToolOutput({
						output: { cardId: card.id, ok: true, remaining: sessionCards.length },
						tool: 'gradeAttempt',
						toolCallId: toolCall.toolCallId,
					});
				} catch (error) {
					chat.addToolOutput({
						errorText: error instanceof Error ? error.message : 'persist_failed',
						state: 'output-error',
						tool: 'gradeAttempt',
						toolCallId: toolCall.toolCallId,
					});
				}
			},
			sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
			transport: new DefaultChatTransport({
				api: '/api/chat',
				prepareSendMessagesRequest: ({ messages }) => ({
					body: {
						format,
						messages: messages.slice(-HISTORY_SEND_LIMIT),
						profile: profilePayload,
						sessionCards,
					},
				}),
			}),
		});

		if (storedMessages.length === 0) {
			await chat.sendMessage({ text: introMessage(format) });
		} else {
			await tick();
			scrollToBottom('auto');
		}
	});

	function introMessage(value: LessonFormat): string {
		return t('session_tutor_intro', { format: formatLabel(value) });
	}

	async function loadPersistedMessages(value: LessonFormat): Promise<UIMessage[]> {
		const rows = await messagesRepository.byFormat(value);

		return rows.slice(-HISTORY_RENDER_LIMIT).map((row) => ({
			id: row.id,
			parts: JSON.parse(row.partsJson) as UIMessage['parts'],
			role: row.role,
		}));
	}

	function serializeMessage(
		message: UIMessage,
		format: LessonFormat,
		sequence: number,
	): MessageRow {
		return {
			format,
			id: message.id,
			partsJson: JSON.stringify(message.parts),
			role: message.role,
			sequence,
		};
	}

	async function buildSessionCards(value: LessonFormat): Promise<SessionCard[]> {
		const SESSION_CARD_LIMIT = 8;
		const allCards = await cardsRepository.all();

		const candidates =
			value === 'review'
				? dueToday(allCards).toSorted((a, b) => a.fsrs.due - b.fsrs.due)
				: weakestCards(allCards, SESSION_CARD_LIMIT);

		return candidates
			.slice(0, SESSION_CARD_LIMIT)
			.map((card) => ({ answer: card.answer, kind: card.kind, prompt: card.prompt }));
	}

	async function send(event: Event): Promise<void> {
		event.preventDefault();

		await sendText(input.trim());
	}

	async function sendText(text: string): Promise<void> {
		if (text.length === 0 || chat === undefined) {
			return;
		}

		input = '';
		await chat.sendMessage({ text });
		await tick();
		scrollToBottom('smooth');
	}

	function scrollToBottom(behavior: ScrollBehavior): void {
		if (scrollContainer === undefined) {
			return;
		}

		scrollContainer.scrollTo({ behavior, top: scrollContainer.scrollHeight });
	}

	function isNearBottom(): boolean {
		const NEAR_BOTTOM_THRESHOLD_PX = 120;

		if (scrollContainer === undefined) {
			return true;
		}

		const distanceFromBottom =
			scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight;

		return distanceFromBottom < NEAR_BOTTOM_THRESHOLD_PX;
	}

	function collectMessagesToPersist(): MessageRow[] {
		if (chat === undefined) {
			return [];
		}

		const rows: MessageRow[] = [];

		for (const [index, message] of chat.messages.entries()) {
			const hasContent = message.parts.some((part) => part.type !== 'text' || part.text.length > 0);

			if (!hasContent) {
				continue;
			}

			rows.push(serializeMessage(message, format, index));
		}

		return rows;
	}

	// Upsert every reactive tick — tool-call completions never expose a "ready" status
	// (sendAutomaticallyWhen flips straight to submitted), so we can't gate on it. bulkPut
	// handles dedup by id and refreshes parts as streaming tokens arrive.
	$effect(() => {
		const rows = collectMessagesToPersist();

		if (rows.length > 0) {
			void messagesRepository.addMany(rows);
		}
	});

	function flushPendingMessages(): void {
		const rows = collectMessagesToPersist();

		if (rows.length > 0) {
			void messagesRepository.addMany(rows);
		}
	}

	// Last-chance save when the page is hidden mid-stream (refresh, navigate, tab close).
	$effect(() => {
		globalThis.addEventListener('pagehide', flushPendingMessages);

		return () => {
			globalThis.removeEventListener('pagehide', flushPendingMessages);
		};
	});

	$effect(() => {
		if (chat === undefined) {
			return;
		}

		// Track message count and total text length so the effect re-runs as tokens stream in.
		const trackedSignal =
			chat.messages.length +
			chat.messages.reduce(
				(total, message) =>
					total +
					message.parts.reduce(
						(partTotal, part) => partTotal + (part.type === 'text' ? part.text.length : 0),
						0,
					),
				0,
			);

		if (trackedSignal < 0 || !isNearBottom()) {
			return;
		}

		queueMicrotask(() => {
			scrollToBottom('auto');
		});
	});
</script>

<svelte:head>
	<title>Lang Tutor — session</title>
</svelte:head>

<div class="mx-auto flex h-dvh max-w-3xl flex-col px-4">
	<header
		class="flex items-center justify-between border-b border-zinc-200 py-4 dark:border-zinc-800"
	>
		<Button href={Routes.home} variant="ghost" size="sm">
			<ArrowLeft size="16" aria-hidden="true" />
			{t('common_back')}
		</Button>
		<div class="flex items-center gap-3">
			{#if format === 'review' && cardsRemaining > 0}
				<span
					class="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700 tabular-nums dark:bg-violet-500/10 dark:text-violet-300"
					aria-label={t('session_cards_remaining', { count: cardsRemaining })}
				>
					{t('session_cards_remaining', { count: cardsRemaining })}
				</span>
			{/if}
			<div class="text-right">
				<p class="text-xs tracking-wider text-zinc-500 uppercase">{t('session_todays_format')}</p>
				<p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">
					{formatLabel(format)}
				</p>
			</div>
		</div>
	</header>

	<div
		bind:this={scrollContainer}
		class="scrollbar-soft -mr-3 flex-1 space-y-4 overflow-y-auto py-6 pr-3"
	>
		{#if chat}
			{@const visibleMessages = chat.messages.slice(1)}
			{@const lastMessage = visibleMessages.at(-1)}
			{@const lastIsAssistantWithText =
				lastMessage?.role === 'assistant' &&
				lastMessage.parts.some((part) => part.type === 'text' && part.text.length > 0)}
			{@const isStreaming = chat.status === 'submitted' || chat.status === 'streaming'}
			{@const isThinking = isStreaming && !lastIsAssistantWithText}
			{@const needsRetry =
				!isStreaming &&
				!chat.error &&
				visibleMessages.length > 0 &&
				(lastMessage?.role === 'user' || !lastIsAssistantWithText)}
			{#each visibleMessages as message (message.id)}
				<MessageBubble {message} />
			{/each}
			{#if isThinking}
				<div class="flex justify-start" data-testid={CHAT_TEST_IDS.streamingIndicator}>
					<div
						class="rounded-2xl bg-zinc-100 px-4 py-3 text-sm leading-relaxed text-zinc-500 italic dark:bg-zinc-800/80 dark:text-zinc-400"
					>
						{t('session_tutor_thinking')}
					</div>
				</div>
			{/if}
			{#if needsRetry}
				<div class="flex justify-start">
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							void chat?.regenerate();
						}}
					>
						{t('session_retry_response')}
					</Button>
				</div>
			{/if}
			{#if chat.error}
				<div
					class="flex items-center justify-between gap-3 rounded-lg bg-red-100 p-3 text-sm text-red-700"
				>
					<span>{t('session_failed_to_reach')}</span>
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							void chat?.regenerate();
						}}
					>
						{t('common_retry')}
					</Button>
				</div>
			{/if}
		{:else}
			<p class="text-sm text-zinc-500">{t('common_loading')}</p>
		{/if}
	</div>

	<form
		class="border-t border-zinc-200 py-4 dark:border-zinc-800"
		onsubmit={send}
		aria-label={t('session_send_label')}
	>
		<div class="mb-2 flex flex-wrap gap-1.5">
			{#each QUICK_ACTIONS_BY_FORMAT[format] as actionId (actionId)}
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={isBusy}
					onclick={() => sendText(quickActionMessage(actionId))}
				>
					{quickActionLabel(actionId)}
				</Button>
			{/each}
		</div>
		<div class="flex items-stretch gap-2">
			<label class="flex-1">
				<span class="sr-only">{t('common_your_answer')}</span>
				<textarea
					bind:value={input}
					rows="1"
					disabled={isBusy}
					placeholder={t('common_your_answer_placeholder')}
					class="block h-11 max-h-40 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-base leading-6 shadow-sm focus:ring-2 focus:ring-violet-500/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
					onkeydown={(event) => {
						if (event.key === 'Enter' && !event.shiftKey && !isBusy) {
							event.preventDefault();
							void send(event);
						}
					}}
				></textarea>
			</label>
			<Button type="submit" class="h-11 w-11 px-0" disabled={isBusy || input.trim().length === 0}>
				<Send size="16" aria-hidden="true" />
				<span class="sr-only">{t('common_send')}</span>
			</Button>
		</div>
		<nav class="mt-2 flex flex-wrap gap-1" aria-label={t('session_switch_format')}>
			{#each LESSON_FORMATS as value (value)}
				<Button
					href={`?format=${value}`}
					variant={value === format ? 'subtle' : 'ghost'}
					size="sm"
					data-sveltekit-reload
				>
					{formatLabel(value)}
				</Button>
			{/each}
		</nav>
	</form>
</div>
