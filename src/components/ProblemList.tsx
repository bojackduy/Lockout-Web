import { problemKey, problemUrl } from '../api/codeforces';
import type { MatchConfig, ProblemRef, ScoreResult } from '../types';

type Props = {
  match: MatchConfig;
  score: ScoreResult | null;
  selectedProblem: ProblemRef;
  onSelectProblem: (problem: ProblemRef) => void;
};

function statusLabel(status: string | undefined, match: MatchConfig): string {
  if (status === 'p1') return `Solved by ${match.players[0].handle}`;
  if (status === 'p2') return `Solved by ${match.players[1].handle}`;
  if (status === 'both') return 'Solved by both';
  return 'Open';
}

function statusClass(status: string | undefined): string {
  if (status === 'p1') return 'solved-p1';
  if (status === 'p2') return 'solved-p2';
  if (status === 'both') return 'solved-both';
  return 'open';
}

export function ProblemList({ match, score, selectedProblem, onSelectProblem }: Props) {
  return (
    <section className="panel problem-list">
      <h2>Problems</h2>
      {match.problems.map((problem, index) => {
        const key = problemKey(problem);
        const selected = problemKey(selectedProblem) === key;
        const status = score?.statuses[index];
        return (
          <button key={key} className={selected ? 'problem selected' : 'problem'} onClick={() => onSelectProblem(problem)}>
            <span className="problem-points">{(index + 1) * 100}</span>
            <span className="problem-main">
              <strong>{problem.name}</strong>
              <small>
                <b>{problem.contestId}{problem.index}</b>
                <b>{problem.rating}</b>
                <em className={`status-badge ${statusClass(status)}`}>{statusLabel(status, match)}</em>
              </small>
            </span>
            <a href={problemUrl(problem)} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
              Open
            </a>
          </button>
        );
      })}
    </section>
  );
}
