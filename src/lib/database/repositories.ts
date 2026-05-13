import type { CardRow, MessageRow, ProfileRow, ReviewRow, SessionRow } from './types';

import { getDatabase } from './client';
import { PROFILE_SINGLETON_ID } from './types';

export const profileRepository = {
	async clear(): Promise<void> {
		const database = getDatabase();

		await database.profile.clear();
		await database.cards.clear();
		await database.reviews.clear();
		await database.sessions.clear();
		await database.messages.clear();
	},
	async get(): Promise<ProfileRow | undefined> {
		return getDatabase().profile.get(PROFILE_SINGLETON_ID);
	},
	async save(profile: ProfileRow): Promise<void> {
		await getDatabase().profile.put(profile);
	},
};

export const cardsRepository = {
	async add(card: CardRow): Promise<void> {
		await getDatabase().cards.add(card);
	},
	async all(): Promise<CardRow[]> {
		return getDatabase().cards.toArray();
	},
	async byId(id: string): Promise<CardRow | undefined> {
		return getDatabase().cards.get(id);
	},
	async update(card: CardRow): Promise<void> {
		await getDatabase().cards.put(card);
	},
};

export const reviewsRepository = {
	async add(review: ReviewRow): Promise<void> {
		await getDatabase().reviews.add(review);
	},
	async all(): Promise<ReviewRow[]> {
		return getDatabase().reviews.toArray();
	},
	async forCard(cardId: string): Promise<ReviewRow[]> {
		return getDatabase().reviews.where('cardId').equals(cardId).toArray();
	},
};

export const sessionsRepository = {
	async add(session: SessionRow): Promise<void> {
		await getDatabase().sessions.add(session);
	},
	async all(): Promise<SessionRow[]> {
		return getDatabase().sessions.toArray();
	},
	async update(session: SessionRow): Promise<void> {
		await getDatabase().sessions.put(session);
	},
};

export const messagesRepository = {
	async addMany(messages: readonly MessageRow[]): Promise<void> {
		if (messages.length === 0) {
			return;
		}

		await getDatabase().messages.bulkPut([...messages]);
	},
	async byFormat(format: string): Promise<MessageRow[]> {
		return getDatabase().messages.where('format').equals(format).sortBy('sequence');
	},
	async clearFormat(format: string): Promise<void> {
		await getDatabase().messages.where('format').equals(format).delete();
	},
};
