import type { ProblemRef } from '../types';

type ApiResponse<T> = {
  status: 'OK' | 'FAILED';
  comment?: string;
  result: T;
};

export type CfSubmission = {
  id: number;
  creationTimeSeconds: number;
  programmingLanguage: string;
  timeConsumedMillis: number;
  memoryConsumedBytes: number;
  verdict?: string;
  problem: {
    contestId?: number;
    index: string;
    name: string;
    type?: string;
    rating?: number;
    tags?: string[];
  };
};

type CfProblem = {
  contestId: number;
  index: string;
  name: string;
  type?: string;
  rating?: number;
  tags?: string[];
};

const API_BASE = 'https://codeforces.com/api';

function cfJsonp<T>(method: string, params: Record<string, string | number>): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    const callbackName = `cfCallback_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const url = new URL(`${API_BASE}/${method}`);
    const script = document.createElement('script');

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
    url.searchParams.set('jsonp', callbackName);

    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Codeforces API request timed out'));
    }, 15000);

    function cleanup() {
      window.clearTimeout(timeout);
      script.remove();
      delete (window as unknown as Record<string, unknown>)[callbackName];
    }

    (window as unknown as Record<string, unknown>)[callbackName] = (data: ApiResponse<T>) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('Codeforces API request failed'));
    };
    script.src = url.toString();
    document.body.appendChild(script);
  });
}

async function cfGet<T>(method: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${API_BASE}/${method}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  let data: ApiResponse<T>;
  try {
    const response = await fetch(url.toString());
    data = (await response.json()) as ApiResponse<T>;
  } catch {
    data = await cfJsonp<T>(method, params);
  }

  if (data.status !== 'OK') {
    throw new Error(data.comment || 'Codeforces API request failed');
  }

  return data.result;
}

export async function checkHandle(handle: string): Promise<string> {
  const users = await cfGet<Array<{ handle: string }>>('user.info', { handles: handle });
  return users[0].handle;
}

export async function getUserSubmissions(handle: string, count = 1000): Promise<CfSubmission[]> {
  return cfGet<CfSubmission[]>('user.status', { handle, from: 1, count });
}

export async function getProblemset(): Promise<ProblemRef[]> {
  const data = await cfGet<{ problems: CfProblem[] }>('problemset.problems');
  return data.problems
    .filter((problem) => problem.contestId && problem.rating)
    .map((problem) => ({
      contestId: problem.contestId,
      index: problem.index,
      name: problem.name,
      rating: problem.rating!,
      tags: problem.tags || [],
    }));
}

export function problemKey(problem: Pick<ProblemRef, 'contestId' | 'index'>): string {
  return `${problem.contestId}/${problem.index}`;
}

export function problemUrl(problem: Pick<ProblemRef, 'contestId' | 'index'>): string {
  return `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`;
}
