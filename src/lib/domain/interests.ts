import { t } from '$lib/i18n.svelte';

export const INTERESTS = [
	'everyday',
	'travel',
	'business',
	'tech',
	'culture',
	'food',
	'sports',
	'science',
	'literature',
	'cinema',
] as const;
export type Interest = (typeof INTERESTS)[number];

export function interestLabel(interest: Interest): string {
	switch (interest) {
		case 'business': {
			return t('interest_business');
		}

		case 'cinema': {
			return t('interest_cinema');
		}

		case 'culture': {
			return t('interest_culture');
		}

		case 'everyday': {
			return t('interest_everyday');
		}

		case 'food': {
			return t('interest_food');
		}

		case 'literature': {
			return t('interest_literature');
		}

		case 'science': {
			return t('interest_science');
		}

		case 'sports': {
			return t('interest_sports');
		}

		case 'tech': {
			return t('interest_tech');
		}

		case 'travel': {
			return t('interest_travel');
		}
	}
}
