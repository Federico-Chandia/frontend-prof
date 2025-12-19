export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

export interface OnboardingState {
  currentStep: number;
  steps: OnboardingStep[];
  isCompleted: boolean;
  skipped: boolean;
}

export interface OnboardingContextType {
  state: OnboardingState;
  nextStep: () => void;
  prevStep: () => void;
  completeStep: (stepId: string) => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
}