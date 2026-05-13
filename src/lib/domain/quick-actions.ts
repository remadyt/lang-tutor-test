import { t } from '$lib/i18n.svelte';

import type { LessonFormat } from './lesson-format';

export const QUICK_ACTION_IDS = [
	'hint',
	'skip',
	'dont_know',
	'another_example',
	'rule',
	'done_reading',
	'translate',
	'help_start',
	'stuck',
	'done',
] as const;
export type QuickActionId = (typeof QUICK_ACTION_IDS)[number];

export const QUICK_ACTIONS_BY_FORMAT: Readonly<Record<LessonFormat, readonly QuickActionId[]>> = {
	grammar: ['rule', 'another_example', 'skip'],
	'new-vocab': ['hint', 'another_example', 'skip'],
	reading: ['done_reading', 'translate', 'skip'],
	review: ['hint', 'dont_know', 'skip'],
	writing: ['help_start', 'stuck', 'done'],
};

export function quickActionLabel(id: QuickActionId): string {
	switch (id) {
		case 'another_example': {
			return t('session_action_another_example_label');
		}

		case 'done': {
			return t('session_action_done_label');
		}

		case 'done_reading': {
			return t('session_action_done_reading_label');
		}

		case 'dont_know': {
			return t('session_action_dont_know_label');
		}

		case 'help_start': {
			return t('session_action_help_start_label');
		}

		case 'hint': {
			return t('session_action_hint_label');
		}

		case 'rule': {
			return t('session_action_rule_label');
		}

		case 'skip': {
			return t('session_action_skip_label');
		}

		case 'stuck': {
			return t('session_action_stuck_label');
		}

		case 'translate': {
			return t('session_action_translate_label');
		}
	}
}

export function quickActionMessage(id: QuickActionId): string {
	switch (id) {
		case 'another_example': {
			return t('session_action_another_example_message');
		}

		case 'done': {
			return t('session_action_done_message');
		}

		case 'done_reading': {
			return t('session_action_done_reading_message');
		}

		case 'dont_know': {
			return t('session_action_dont_know_message');
		}

		case 'help_start': {
			return t('session_action_help_start_message');
		}

		case 'hint': {
			return t('session_action_hint_message');
		}

		case 'rule': {
			return t('session_action_rule_message');
		}

		case 'skip': {
			return t('session_action_skip_message');
		}

		case 'stuck': {
			return t('session_action_stuck_message');
		}

		case 'translate': {
			return t('session_action_translate_message');
		}
	}
}
