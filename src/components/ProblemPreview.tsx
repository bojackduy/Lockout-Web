import { problemUrl } from '../api/codeforces';
import type { MatchConfig, ProblemRef, ScoreResult } from '../types';

type Props = {
  match: MatchConfig;
  problem: ProblemRef;
  score: ScoreResult | null;
};

function problemIndex(match: MatchConfig, problem: ProblemRef): number {
  return match.problems.findIndex((item) => item.contestId === problem.contestId && item.index === problem.index);
}

function statusText(match: MatchConfig, score: ScoreResult | null, index: number): string {
  const status = score?.statuses[index];
  if (status === 'p1') return `Solved by ${match.players[0].handle}`;
  if (status === 'p2') return `Solved by ${match.players[1].handle}`;
  if (status === 'both') return 'Solved by both';
  return 'Open objective';
}

export function ProblemPreview({ match, problem, score }: Props) {
  const index = problemIndex(match, problem);
  const points = (index + 1) * 100;

  return (
    <section className="panel problem-preview">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">Problem preview</p>
          <h2>{problem.name}</h2>
        </div>
        <span>{points} pts</span>
      </div>

      <div className="preview-grid">
        <div>
          <small>Contest</small>
          <strong>{problem.contestId}{problem.index}</strong>
        </div>
        <div>
          <small>Rating</small>
          <strong>{problem.rating}</strong>
        </div>
        <div>
          <small>Status</small>
          <strong>{statusText(match, score, index)}</strong>
        </div>
      </div>

      <div className="tag-cloud">
        {problem.tags.length === 0 ? <span>No tags listed</span> : problem.tags.map((tag) => <span key={tag}>{tag}</span>)}
      </div>

      <p className="statement-note">
        Codeforces does not expose full problem statements through its public API. This panel shows the available contest,
        rating, tags, and lockout status; use the problem link for the official statement and submit page.
      </p>

      <div className="preview-actions">
        <a className="button primary" href={problemUrl(problem)} target="_blank" rel="noreferrer">Open statement</a>
        <a className="button" href={`https://codeforces.com/problemset/submit/${problem.contestId}/${problem.index}`} target="_blank" rel="noreferrer">Open submit</a>
      </div>
    </section>
  );
}
