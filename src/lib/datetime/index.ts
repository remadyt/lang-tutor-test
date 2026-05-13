// Facade over `dayjs`. Call sites use only this module so the library can be swapped.
import dayjs from 'dayjs';

export const MILLISECONDS_PER_DAY = 86_400_000;
export const MILLISECONDS_PER_HOUR = 3_600_000;

export function addDays(timestamp: number, days: number): number {
	return dayjs(timestamp).add(days, 'day').valueOf();
}

export function endOfDay(timestamp: number): number {
	return dayjs(timestamp).endOf('day').valueOf();
}

export function startOfDay(timestamp: number): number {
	return dayjs(timestamp).startOf('day').valueOf();
}

export function toIsoDate(timestamp: number): string {
	return dayjs(timestamp).format('YYYY-MM-DD');
}
