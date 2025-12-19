export interface ProfileProgress {
  completionPercentage: number;
  missingFields: string[];
  completedSections: string[];
}

export interface ProfileState {
  progress: ProfileProgress;
  isProfileComplete: boolean;
  lastUpdated: Date | null;
}

export interface ProfileContextType {
  state: ProfileState;
  updateProgress: () => void;
  markSectionComplete: (section: string) => void;
}