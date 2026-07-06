import { useEffect, useMemo, useState } from 'react';
import { problemKey, problemUrl } from '../api/codeforces';
import { scoreMatch } from '../game/scoring';
import { addRecentMatch, loadDraft, loadLanguage, saveDraft, saveLanguage } from '../storage/localStore';
import type { CodeLanguage, MatchConfig, ProblemRef, ScoreResult } from '../types';
import { CodeEditor } from './CodeEditor';
import { ProblemList } from './ProblemList';
import { Scoreboard } from './Scoreboard';
import { Timer } from './Timer';

const templates: Record<CodeLanguage, string> = {
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nusing ll = long long;\nusing pii = pair<int, int>;\nusing pll = pair<ll, ll>;\n\n#define all(x) (x).begin(), (x).end()\n#define rall(x) (x).rbegin(), (x).rend()\n\nvoid solve() {\n    \n}\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    int t = 1;\n    // cin >> t;\n    while (t--) {\n        solve();\n    }\n\n    return 0;\n}\n`,
  python: `import sys\n\ndef solve():\n    pass\n\nif __name__ == "__main__":\n    solve()\n`,
  java: `import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        FastScanner fs = new FastScanner(System.in);\n    }\n\n    static class FastScanner {\n        private final InputStream in;\n        private final byte[] buffer = new byte[1 << 16];\n        private int ptr = 0, len = 0;\n\n        FastScanner(InputStream is) { in = is; }\n\n        private int read() throws IOException {\n            if (ptr >= len) {\n                len = in.read(buffer);\n                ptr = 0;\n                if (len <= 0) return -1;\n            }\n            return buffer[ptr++];\n        }\n\n        String next() throws IOException {\n            StringBuilder sb = new StringBuilder();\n            int c;\n            while ((c = read()) <= ' ' && c != -1);\n            while (c > ' ') {\n                sb.append((char)c);\n                c = read();\n            }\n            return sb.toString();\n        }\n    }\n}\n`,
  javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);\nlet ptr = 0;\n\nfunction next() {\n  return input[ptr++];\n}\n`,
};

type Props = {
  match: MatchConfig;
  onExit: () => void;
};

export function MatchPage({ match, onExit }: Props) {
  const [selectedProblem, setSelectedProblem] = useState<ProblemRef>(match.problems[0]);
  const [language, setLanguage] = useState<CodeLanguage>(() => loadLanguage());
  const [code, setCode] = useState('');
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const shareUrl = useMemo(() => `${window.location.origin}${window.location.pathname}${window.location.hash}`, []);
  const selectedKey = problemKey(selectedProblem);
  const lastChecked = score ? new Date(score.updatedAt * 1000).toLocaleTimeString() : 'Not checked yet';

  useEffect(() => {
    addRecentMatch(match);
  }, [match]);

  useEffect(() => {
    const saved = loadDraft(match.id, selectedKey, language);
    setCode(saved ?? templates[language]);
  }, [match.id, selectedKey, language]);

  useEffect(() => {
    saveDraft(match.id, selectedKey, language, code);
  }, [match.id, selectedKey, language, code]);

  async function refreshScore() {
    setRefreshing(true);
    setError(null);
    try {
      setScore(await scoreMatch(match));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to refresh Codeforces submissions.');
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    refreshScore();
    const interval = window.setInterval(refreshScore, 20000);
    return () => window.clearInterval(interval);
  }, [match]);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  function changeLanguage(next: CodeLanguage) {
    setLanguage(next);
    saveLanguage(next);
  }

  return (
    <main className="match-page">
      <header className="match-header">
        <div className="match-nav">
          <button className="ghost" onClick={onExit}>New match</button>
          <div className="match-meta">
            <span>{match.problems.length} problems</span>
            <span>{match.durationMinutes} minutes</span>
            <span>Local session</span>
          </div>
        </div>
        <div className="arena-title">
          <p className="eyebrow">Share link lockout</p>
          <h1><span>{match.players[0].handle}</span><em>vs</em><span>{match.players[1].handle}</span></h1>
        </div>
        <Timer startTime={match.startTime} durationMinutes={match.durationMinutes} />
      </header>

      <Scoreboard match={match} score={score} />

      <section className="share-panel">
        <input value={shareUrl} readOnly onFocus={(event) => event.currentTarget.select()} />
        <button onClick={() => navigator.clipboard.writeText(shareUrl)}>Copy match link</button>
        <button onClick={refreshScore} disabled={refreshing}>{refreshing ? 'Refreshing...' : 'Refresh score'}</button>
        <span className="last-checked">Last checked: {lastChecked}</span>
      </section>

      {error && <div className="error">{error}</div>}

      <div className="workspace">
        <ProblemList match={match} score={score} selectedProblem={selectedProblem} onSelectProblem={setSelectedProblem} />

        <section className="panel code-panel">
          <div className="editor-toolbar">
            <div>
              <p className="eyebrow">Battle station</p>
              <h2>{selectedProblem.name}</h2>
              <p>{selectedProblem.contestId}{selectedProblem.index} · {selectedProblem.rating} rated</p>
            </div>
            <select value={language} onChange={(event) => changeLanguage(event.target.value as CodeLanguage)}>
              <option value="cpp">C++17</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>

          <CodeEditor value={code} language={language} onChange={setCode} />

          <div className="editor-actions">
            <button className="primary" onClick={copyCode}>{copied ? 'Copied' : 'Copy code'}</button>
            <a className="button" href={problemUrl(selectedProblem)} target="_blank" rel="noreferrer">Open problem</a>
            <button onClick={() => setCode(templates[language])}>Reset template</button>
            <span className="autosave">Draft autosaved locally</span>
          </div>
        </section>
      </div>
    </main>
  );
}
