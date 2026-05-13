export const Routes = {
	home: '/',
	onboarding: '/onboarding',
	progress: '/progress',
	session: '/session',
} as const;

export type Route = (typeof Routes)[keyof typeof Routes];

export function sessionWith(format: string): string {
	return `${Routes.session}?format=${format}`;
}
