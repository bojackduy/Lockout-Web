import { getUserSubmissions, problemKey } from '../api/codeforces';
import type { MatchConfig } from '../types';

export type MatchSubmission = {
  id: number;
  playerIndex: 0 | 1;
  handle: string;
  problemKey: string;
  problemName: string;
  verdict: string;
  language: string;
  submittedAt: number;
  timeMillis: number;
  memoryBytes: number;
};

export async function getMatchSubmissions(match: MatchConfig): Promise<MatchSubmission[]> {
  const [p1Subs, p2Subs] = await Promise.all([
    getUserSubmissions(match.players[0].handle, 1000),
    getUserSubmissions(match.players[1].handle, 1000),
  ]);

  const endTime = match.startTime + match.durationMinutes * 60;
  const selectedProblems = new Map(match.problems.map((problem) => [problemKey(problem), problem]));

  return [p1Subs, p2Subs]
    .flatMap((submissions, playerIndex) => submissions.map((submission) => ({ submission, playerIndex: playerIndex as 0 | 1 })))
    .filter(({ submission }) => submission.problem.contestId)
    .map(({ submission, playerIndex }) => {
      const key = problemKey({ contestId: submission.problem.contestId!, index: submission.problem.index });
      const problem = selectedProblems.get(key);
      if (!problem || submission.creationTimeSeconds < match.startTime || submission.creationTimeSeconds > endTime) {
        return null;
      }

      return {
        id: submission.id,
        playerIndex,
        handle: match.players[playerIndex].handle,
        problemKey: key,
        problemName: problem.name,
        verdict: submission.verdict || 'TESTING',
        language: submission.programmingLanguage,
        submittedAt: submission.creationTimeSeconds,
        timeMillis: submission.timeConsumedMillis,
        memoryBytes: submission.memoryConsumedBytes,
      } satisfies MatchSubmission;
    })
    .filter((submission): submission is MatchSubmission => submission !== null)
    .sort((a, b) => b.submittedAt - a.submittedAt || b.id - a.id)
    .slice(0, 40);
}
