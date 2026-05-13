import Dexie, { type Table } from 'dexie';

import type { CardRow, MessageRow, ProfileId, ProfileRow, ReviewRow, SessionRow } from './types';

const DATABASE_NAME = 'lang-tutor';
const SCHEMA_VERSION = 4;

export class LangTutorDatabase extends Dexie {
	public readonly cards!: Table<CardRow, string>;
	public readonly messages!: Table<MessageRow, string>;
	public readonly profile!: Table<ProfileRow, ProfileId>;
	public readonly reviews!: Table<ReviewRow, string>;
	public readonly sessions!: Table<SessionRow, string>;

	public constructor() {
		super(DATABASE_NAME);

		this.version(1).stores({
			cards: 'id, language, level, kind, fsrs.due, createdAt',
			messages: 'id, sessionId, createdAt',
			profile: 'id',
			reviews: 'id, cardId, reviewedAt',
			sessions: 'id, startedAt, format',
		});

		// v2: profile.language → profile.{native,target}Language. Older rows are dropped.
		this.version(2)
			.stores({})
			.upgrade(async (transaction) => {
				await transaction.table('profile').clear();
			});

		// v3: messages keyed by lesson format + carry serialized UI parts (incl. tool calls).
		this.version(3)
			.stores({ messages: 'id, format, createdAt' })
			.upgrade(async (transaction) => {
				await transaction.table('messages').clear();
			});

		// v4: messages ordered by `sequence` (chat.messages index) for stable order under upsert.
		this.version(SCHEMA_VERSION)
			.stores({ messages: 'id, format, sequence' })
			.upgrade(async (transaction) => {
				await transaction.table('messages').clear();
			});
	}
}

let databaseInstance: LangTutorDatabase | undefined;

export function getDatabase(): LangTutorDatabase {
	if (typeof window === 'undefined') {
		throw new TypeError('IndexedDB is browser-only');
	}

	databaseInstance ??= new LangTutorDatabase();

	return databaseInstance;
}
