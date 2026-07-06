import { FormEvent, useMemo, useState } from 'react';
import { checkHandle } from '../api/codeforces';
import { makeMatchId, matchHash } from '../game/matchUrl';
import { selectProblems } from '../game/problemSelection';
import { addRecentMatch, clearLocalData, loadRecentMatches } from '../storage/localStore';
import type { MatchConfig } from '../types';

type Props = {
  onMatchCreated: (match: MatchConfig) => void;
};

function ratingSequence(base: number, count: number): number[] {
  return Array.from({ length: count }, (_, index) => base + index * 100);
}

export function CreateMatch({ onMatchCreated }: Props) {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [baseRating, setBaseRating] = useState(800);
  const [problemCount, setProblemCount] = useState(5);
  const [duration, setDuration] = useState(90);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recents, setRecents] = useState(() => loadRecentMatches());
  const ratings = useMemo(() => ratingSequence(baseRating, problemCount), [baseRating, problemCount]);

  async function createMatch(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const handles = [await checkHandle(p1.trim()), await checkHandle(p2.trim())] as [string, string];
      if (handles[0].toLowerCase() === handles[1].toLowerCase()) {
        throw new Error('Use two different Codeforces handles.');
      }

      const problems = await selectProblems(handles, ratings);
      const match: MatchConfig = {
        id: makeMatchId(),
        players: [{ handle: handles[0] }, { handle: handles[1] }],
        problems,
        startTime: Math.floor(Date.now() / 1000),
        durationMinutes: duration,
        createdAt: Date.now(),
      };

      addRecentMatch(match);
      window.location.hash = matchHash(match);
      onMatchCreated(match);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create match.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="home">
      <section className="home-grid">
        <div className="hero">
          <p className="eyebrow">Frontend-only Codeforces lockout</p>
          <h1>Spin up a coding arena in one link.</h1>
          <p>
            Pick unsolved Codeforces problems, write drafts in-browser, copy into Codeforces, and let public submissions
            light up the scoreboard.
          </p>
          <div className="hero-chips" aria-label="App capabilities">
            <span>Static deploy</span>
            <span>Codeforces judged</span>
            <span>Local drafts</span>
          </div>
        </div>

        <form className="create-card setup-console" onSubmit={createMatch}>
          <div className="console-header">
            <div>
              <p className="eyebrow">Match setup</p>
              <h2>Configure duel</h2>
            </div>
            <span className="console-light">Live</span>
          </div>

          <div className="player-inputs">
            <label>
              Player 1 handle
              <input value={p1} onChange={(event) => setP1(event.target.value)} placeholder="tourist" required />
            </label>
            <label>
              Player 2 handle
              <input value={p2} onChange={(event) => setP2(event.target.value)} placeholder="Benq" required />
            </label>
          </div>

          <div className="setup-options">
            <label>
              Starting rating
              <select value={baseRating} onChange={(event) => setBaseRating(Number(event.target.value))}>
                {Array.from({ length: 25 }, (_, index) => 800 + index * 100).map((rating) => (
                  <option key={rating} value={rating}>{rating}</option>
                ))}
              </select>
            </label>
            <label>
              Problem count
              <select value={problemCount} onChange={(event) => setProblemCount(Number(event.target.value))}>
                {[3, 4, 5, 6, 7].map((count) => <option key={count} value={count}>{count}</option>)}
              </select>
            </label>
            <label>
              Duration
              <select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>
                {[30, 45, 60, 90, 120, 180].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}
              </select>
            </label>
          </div>

          <div className="ratings-preview" aria-label="Selected ratings">
            <span>Ratings</span>
            <div>
              {ratings.map((rating) => <b key={rating}>{rating}</b>)}
            </div>
          </div>
          {error && <div className="error">{error}</div>}
          <button className="primary launch-button" disabled={loading}>{loading ? 'Creating match...' : 'Create share link'}</button>
        </form>
      </section>

      <section className="recent-card">
        <div className="section-heading">
          <h2>Local recent matches</h2>
          <button
            type="button"
            onClick={() => {
              clearLocalData();
              setRecents([]);
            }}
          >
            Clear local data
          </button>
        </div>
        <div className="recent-list">
          {recents.length === 0 ? <p>No browser-local history yet.</p> : recents.map((recent) => (
            <a key={recent.id} href={recent.urlHash}>
              <strong>{recent.title}</strong>
              <span>{new Date(recent.createdAt).toLocaleString()}</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
