import { getProblemset, getUserSubmissions, problemKey } from '../api/codeforces';
import type { ProblemRef } from '../types';

const NON_STANDARD_CONTEST_WORDS = [
  'wild',
  'fools',
  'unrated',
  'surprise',
  'unknown',
  'friday',
  'marathon',
  'kotlin',
  'experimental',
];

function seededRandom(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function isProbablyStandard(problem: ProblemRef): boolean {
  const name = problem.name.toLowerCase();
  return !NON_STANDARD_CONTEST_WORDS.some((word) => name.includes(word));
}

export async function selectProblems(
  handles: [string, string],
  ratings: number[],
  seed = Date.now(),
): Promise<ProblemRef[]> {
  const [problemset, p1Subs, p2Subs] = await Promise.all([
    getProblemset(),
    getUserSubmissions(handles[0]),
    getUserSubmissions(handles[1]),
  ]);

  const solved = new Set<string>();
  for (const submission of [...p1Subs, ...p2Subs]) {
    if (submission.verdict === 'OK' && submission.problem.contestId) {
      solved.add(problemKey({ contestId: submission.problem.contestId, index: submission.problem.index }));
    }
  }

  const random = seededRandom(seed);
  const selected: ProblemRef[] = [];
  const selectedKeys = new Set<string>();

  for (const rating of ratings) {
    const options = problemset.filter((problem) => {
      const key = problemKey(problem);
      return problem.rating === rating && !solved.has(key) && !selectedKeys.has(key) && isProbablyStandard(problem);
    });

    if (options.length === 0) {
      throw new Error(`Not enough unsolved ${rating}-rated problems for these handles.`);
    }

    const picked = options[Math.floor(random() * options.length)];
    selected.push(picked);
    selectedKeys.add(problemKey(picked));
  }

  return selected;
}
