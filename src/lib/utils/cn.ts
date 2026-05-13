import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: readonly ClassValue[]): string {
	return clsx(inputs);
}
