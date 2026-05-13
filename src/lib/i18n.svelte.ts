import { browser } from '$app/environment';
import { m } from '$lib/paraglide/messages.js';
import {
	baseLocale,
	getLocale,
	isLocale,
	type Locale,
	setLocale as paraglideSetLocale,
} from '$lib/paraglide/runtime.js';

let currentLocale = $state<Locale>(browser ? getLocale() : baseLocale);

export const localeStore = {
	get locale(): Locale {
		return currentLocale;
	},
	resolve(candidate: string): void {
		this.set(isLocale(candidate) ? candidate : baseLocale);
	},
	set(next: Locale): void {
		if (currentLocale === next) {
			return;
		}

		currentLocale = next;

		// eslint-disable-next-line @typescript-eslint/no-floating-promises -- paraglide's reload:false path is synchronous, the return is a no-op promise
		paraglideSetLocale(next, { reload: false });
	},
};

type MessageFn<K extends keyof Messages> = Messages[K];
type Messages = typeof m;

export function t<K extends keyof Messages>(
	key: K,
	...args: Parameters<MessageFn<K>>
): ReturnType<MessageFn<K>> {
	return translateForLocale(currentLocale, key, ...args);
}

function translateForLocale<K extends keyof Messages>(
	_locale: Locale,
	key: K,
	...args: Parameters<MessageFn<K>>
): ReturnType<MessageFn<K>> {
	const fn = m[key] as unknown as (
		...callArgs: Parameters<MessageFn<K>>
	) => ReturnType<MessageFn<K>>;

	return fn(...args);
}
