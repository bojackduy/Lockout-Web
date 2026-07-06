import type { MatchSubmission } from '../game/submissions';

type Props = {
  submissions: MatchSubmission[];
  loading: boolean;
};

function formatMemory(bytes: number): string {
  if (!bytes) return '-';
  return `${Math.round(bytes / 1024)} KB`;
}

function verdictClass(verdict: string): string {
  if (verdict === 'OK') return 'accepted';
  if (verdict === 'TESTING') return 'testing';
  return 'rejected';
}

function verdictLabel(verdict: string): string {
  if (verdict === 'OK') return 'Accepted';
  return verdict.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function SubmissionFeed({ submissions, loading }: Props) {
  return (
    <section className="panel submission-feed">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">Live judge feed</p>
          <h2>Submissions</h2>
        </div>
        <span>{loading ? 'Syncing...' : `${submissions.length} attempts`}</span>
      </div>

      {submissions.length === 0 ? (
        <div className="empty-feed">No match submissions detected yet.</div>
      ) : (
        <div className="submission-table">
          <div className="submission-row submission-head">
            <span>Player</span>
            <span>Problem</span>
            <span>Verdict</span>
            <span>Lang</span>
            <span>Time</span>
            <span>Memory</span>
          </div>
          {submissions.map((submission) => (
            <div className="submission-row" key={`${submission.playerIndex}-${submission.id}`}>
              <span className="handle-cell">{submission.handle}</span>
              <span title={submission.problemName}>{submission.problemName}</span>
              <span className={`verdict ${verdictClass(submission.verdict)}`}>{verdictLabel(submission.verdict)}</span>
              <span>{submission.language}</span>
              <span>{submission.timeMillis} ms</span>
              <span>{formatMemory(submission.memoryBytes)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
