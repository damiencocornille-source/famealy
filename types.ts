
export type Status = 'HOME' | 'AWAY' | 'UNSET';

export interface User {
  id: string;
  name: string;
  email: string;
  familyId?: string;
  currentStatus: Status;
}

export interface Family {
  id: string;
  name: string;
  inviteCode: string;
}

export interface MealRating {
  userId: string;
  userName: string;
  score: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  timestamp: number;
}

export interface Meal {
  id: string;
  familyId: string;
  name: string;
  ratings: MealRating[];
  createdAt: number;
}

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
};

export const RATING_LABELS: Record<number, string> = {
  1: "I hate it, never again",
  2: "Don't like",
  3: "It's okay",
  4: "I like it",
  5: "Love it, remake it"
};

export const getAverageRating = (ratings: MealRating[]): number => {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, curr) => acc + curr.score, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
};
