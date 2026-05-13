import { describe, expect, it } from 'vitest';

import { buildGreeting, buildSystemPrompt } from './prompts';

const PROFILE = {
	interests: ['travel', 'food'],
	level: 'A2',
	nativeLanguage: 'ru',
	nativeLanguageLabel: 'Russian',
	targetLanguage: 'pl',
	targetLanguageLabel: 'Polish',
} as const;

describe('ai/prompts', () => {
	it('buildSystemPrompt mentions both languages, level and interests', () => {
		const prompt = buildSystemPrompt(PROFILE, 'review');

		expect(prompt).toContain('Russian');
		expect(prompt).toContain('Polish');
		expect(prompt).toContain('A2');
		expect(prompt).toContain('travel');
		expect(prompt).toContain('food');
	});

	it('buildSystemPrompt instructs the model to speak in the native language', () => {
		const prompt = buildSystemPrompt(PROFILE, 'review');

		expect(prompt).toMatch(/MUST be written in Russian/u);
	});

	it('buildSystemPrompt embeds the chosen lesson format meta', () => {
		const prompt = buildSystemPrompt(PROFILE, 'grammar');

		expect(prompt).toContain('Grammar drill');
	});

	it('buildGreeting pluralises card counts correctly', () => {
		expect(buildGreeting(PROFILE, 0)).toContain('No cards are due today');
		expect(buildGreeting(PROFILE, 1)).toContain('1 card due');
		expect(buildGreeting(PROFILE, 5)).toContain('5 cards due');
	});
});
