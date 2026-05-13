export interface Language {
	readonly code: string; // ISO 639-1
	readonly label: string;
	readonly nativeLabel: string;
}

export const LANGUAGES: readonly Language[] = [
	{ code: 'en', label: 'English', nativeLabel: 'English' },
	{ code: 'es', label: 'Spanish', nativeLabel: 'Español' },
	{ code: 'fr', label: 'French', nativeLabel: 'Français' },
	{ code: 'de', label: 'German', nativeLabel: 'Deutsch' },
	{ code: 'it', label: 'Italian', nativeLabel: 'Italiano' },
	{ code: 'pt', label: 'Portuguese', nativeLabel: 'Português' },
	{ code: 'nl', label: 'Dutch', nativeLabel: 'Nederlands' },
	{ code: 'pl', label: 'Polish', nativeLabel: 'Polski' },
	{ code: 'cs', label: 'Czech', nativeLabel: 'Čeština' },
	{ code: 'ru', label: 'Russian', nativeLabel: 'Русский' },
	{ code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
	{ code: 'ko', label: 'Korean', nativeLabel: '한국어' },
	{ code: 'zh', label: 'Mandarin Chinese', nativeLabel: '中文' },
	{ code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
	{ code: 'tr', label: 'Turkish', nativeLabel: 'Türkçe' },
];

export function findLanguage(code: string): Language | undefined {
	return LANGUAGES.find((lang) => lang.code === code);
}
