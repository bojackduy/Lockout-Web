export type ProblemRef = {
  contestId: number;
  index: string;
  name: string;
  rating: number;
  tags: string[];
};

export type Player = {
  handle: string;
};

export type MatchConfig = {
  id: string;
  players: [Player, Player];
  problems: ProblemRef[];
  startTime: number;
  durationMinutes: number;
  createdAt: number;
};

export type ProblemStatus = 'open' | 'p1' | 'p2' | 'both';

export type ScoreResult = {
  statuses: ProblemStatus[];
  solveTimes: Array<[number | null, number | null]>;
  scores: [number, number];
  isOver: boolean;
  updatedAt: number;
};

export type CodeLanguage = 'cpp' | 'python' | 'java' | 'javascript';

export type RecentMatch = {
  id: string;
  title: string;
  urlHash: string;
  createdAt: number;
};
