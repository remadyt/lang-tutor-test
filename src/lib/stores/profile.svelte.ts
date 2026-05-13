import type { ProfileRow } from '$lib/database/types';

import { browser } from '$app/environment';
import { profileRepository } from '$lib/database/repositories';
import { localeStore } from '$lib/i18n.svelte';

type LoadStatus = 'idle' | 'loading' | 'ready';

interface ProfileState {
	profile: ProfileRow | undefined;
	status: LoadStatus;
}

const state = $state<ProfileState>({ profile: undefined, status: 'idle' });

function syncLocaleWithProfile(profile: ProfileRow | undefined): void {
	if (profile !== undefined) {
		localeStore.resolve(profile.nativeLanguage);
	}
}

export const profileStore = {
	async clear(): Promise<void> {
		await profileRepository.clear();
		state.profile = undefined;
	},
	async load(): Promise<void> {
		if (!browser) {
			return;
		}

		if (state.status === 'ready') {
			return;
		}

		state.status = 'loading';
		state.profile = await profileRepository.get();
		state.status = 'ready';
		syncLocaleWithProfile(state.profile);
	},
	get profile(): ProfileRow | undefined {
		return state.profile;
	},
	async save(profile: ProfileRow): Promise<void> {
		await profileRepository.save(profile);
		state.profile = profile;
		syncLocaleWithProfile(profile);
	},
	get status(): LoadStatus {
		return state.status;
	},
};
