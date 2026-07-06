import type { MatchConfig, ScoreResult } from '../types';

type Props = {
  match: MatchConfig;
  score: ScoreResult | null;
};

export function Scoreboard({ match, score }: Props) {
  const p1 = score?.scores[0] ?? 0;
  const p2 = score?.scores[1] ?? 0;
  const total = match.problems.reduce((sum, _, index) => sum + (index + 1) * 100, 0);
  const p1Percent = Math.min(100, (p1 / total) * 100);
  const p2Percent = Math.min(100, (p2 / total) * 100);
  const state = p1 === p2 ? 'Tied' : p1 > p2 ? `${match.players[0].handle} leads` : `${match.players[1].handle} leads`;

  return (
    <section className="scoreboard">
      <div className={p1 >= p2 ? 'score-card leading' : 'score-card'}>
        <div className="score-topline">
          <span>{match.players[0].handle}</span>
          <strong>{p1}</strong>
        </div>
        <div className="score-track"><i style={{ width: `${p1Percent}%` }} /></div>
      </div>
      <div className="versus">
        <span>vs</span>
        <small>{state}</small>
      </div>
      <div className={p2 >= p1 ? 'score-card leading' : 'score-card'}>
        <div className="score-topline">
          <span>{match.players[1].handle}</span>
          <strong>{p2}</strong>
        </div>
        <div className="score-track"><i style={{ width: `${p2Percent}%` }} /></div>
      </div>
    </section>
  );
}
