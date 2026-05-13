import { t } from '$lib/i18n.svelte';

export const LESSON_FORMATS = ['review', 'new-vocab', 'grammar', 'reading', 'writing'] as const;
export type LessonFormat = (typeof LESSON_FORMATS)[number];

// English meta used only inside the server-side system prompt — the model speaks any language fine.
export const LESSON_FORMAT_PROMPT_META: Readonly<
	Record<LessonFormat, { readonly description: string; readonly label: string }>
> = {
	grammar: { description: 'Targeted grammar drills with explanations.', label: 'Grammar drill' },
	'new-vocab': {
		description: 'Introduce fresh vocabulary tuned to your interests.',
		label: 'Learn new vocabulary',
	},
	reading: {
		description: 'A short passage and comprehension questions.',
		label: 'Reading comprehension',
	},
	review: {
		description: 'Cards that are due today, drawn from your history.',
		label: 'Review due cards',
	},
	writing: { description: 'Free writing with structured feedback.', label: 'Guided writing' },
};

export function formatDescription(format: LessonFormat): string {
	switch (format) {
		case 'grammar': {
			return t('format_grammar_description');
		}

		case 'new-vocab': {
			return t('format_new_vocab_description');
		}

		case 'reading': {
			return t('format_reading_description');
		}

		case 'review': {
			return t('format_review_description');
		}

		case 'writing': {
			return t('format_writing_description');
		}
	}
}

export function formatLabel(format: LessonFormat): string {
	switch (format) {
		case 'grammar': {
			return t('format_grammar_label');
		}

		case 'new-vocab': {
			return t('format_new_vocab_label');
		}

		case 'reading': {
			return t('format_reading_label');
		}

		case 'review': {
			return t('format_review_label');
		}

		case 'writing': {
			return t('format_writing_label');
		}
	}
}

export function isLessonFormat(value: unknown): value is LessonFormat {
	return typeof value === 'string' && (LESSON_FORMATS as readonly string[]).includes(value);
}
