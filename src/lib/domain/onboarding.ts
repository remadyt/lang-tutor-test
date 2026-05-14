export const ONBOARDING_STEPS = ['languages', 'level', 'preferences'] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export const ONBOARDING_STEP_COUNT = ONBOARDING_STEPS.length;

export function nextOnboardingStep(step: OnboardingStep): OnboardingStep | undefined {
	const index = ONBOARDING_STEPS.indexOf(step);

	return ONBOARDING_STEPS[index + 1];
}

export function onboardingStepNumber(step: OnboardingStep): number {
	return ONBOARDING_STEPS.indexOf(step) + 1;
}

export function previousOnboardingStep(step: OnboardingStep): OnboardingStep | undefined {
	const index = ONBOARDING_STEPS.indexOf(step);

	return index > 0 ? ONBOARDING_STEPS[index - 1] : undefined;
}
