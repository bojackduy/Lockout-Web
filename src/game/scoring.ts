import { getUserSubmissions, problemKey } from '../api/codeforces';
import type { MatchConfig, ProblemStatus, ScoreResult } from '../types';

function firstAcceptedTime(submissions: Awaited<ReturnType<typeof getUserSubmissions>>, key: string): number | null {
  let best: number | null = null;
  for (const submission of submissions) {
    if (!submission.problem.contestId || submission.verdict !== 'OK') {
      continue;
    }

    const submissionKey = problemKey({ contestId: submission.problem.contestId, index: submission.problem.index });
    if (submissionKey !== key) {
      continue;
    }

    best = best === null ? submission.creationTimeSeconds : Math.min(best, submission.creationTimeSeconds);
  }
  return best;
}

export async function scoreMatch(match: MatchConfig): Promise<ScoreResult> {
  const [p1Subs, p2Subs] = await Promise.all([
    getUserSubmissions(match.players[0].handle, 1000),
    getUserSubmissions(match.players[1].handle, 1000),
  ]);

  const endTime = match.startTime + match.durationMinutes * 60;
  const statuses: ProblemStatus[] = [];
  const solveTimes: Array<[number | null, number | null]> = [];
  const scores: [number, number] = [0, 0];

  match.problems.forEach((problem, index) => {
    const points = (index + 1) * 100;
    const key = problemKey(problem);
    const p1 = firstAcceptedTime(p1Subs, key);
    const p2 = firstAcceptedTime(p2Subs, key);
    const p1Valid = p1 !== null && p1 >= match.startTime && p1 <= endTime;
    const p2Valid = p2 !== null && p2 >= match.startTime && p2 <= endTime;

    solveTimes.push([p1Valid ? p1 : null, p2Valid ? p2 : null]);

    if (p1Valid && p2Valid && p1 === p2) {
      statuses.push('both');
      scores[0] += points / 2;
      scores[1] += points / 2;
    } else if (p1Valid && (!p2Valid || p1! < p2!)) {
      statuses.push('p1');
      scores[0] += points;
    } else if (p2Valid && (!p1Valid || p2! < p1!)) {
      statuses.push('p2');
      scores[1] += points;
    } else {
      statuses.push('open');
    }
  });

  return {
    statuses,
    solveTimes,
    scores,
    isOver: Date.now() / 1000 >= endTime || statuses.every((status) => status !== 'open'),
    updatedAt: Math.floor(Date.now() / 1000),
  };
}
