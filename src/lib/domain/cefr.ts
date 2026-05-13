export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type Cefr = (typeof CEFR_LEVELS)[number];

export const CEFR_LABELS: Readonly<Record<Cefr, string>> = {
	A1: 'A1 — Beginner',
	A2: 'A2 — Elementary',
	B1: 'B1 — Intermediate',
	B2: 'B2 — Upper-Intermediate',
	C1: 'C1 — Advanced',
	C2: 'C2 — Mastery',
};
