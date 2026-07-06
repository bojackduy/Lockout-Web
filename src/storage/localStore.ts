import type { CodeLanguage, MatchConfig, RecentMatch } from '../types';
import { matchHash } from '../game/matchUrl';

const RECENTS_KEY = 'lockout-web:recents';
const LANGUAGE_KEY = 'lockout-web:language';

export function draftKey(matchId: string, problemKey: string, language: CodeLanguage): string {
  return `lockout-web:draft:${matchId}:${problemKey}:${language}`;
}

export function saveDraft(matchId: string, problemKey: string, language: CodeLanguage, code: string): void {
  localStorage.setItem(draftKey(matchId, problemKey, language), code);
}

export function loadDraft(matchId: string, problemKey: string, language: CodeLanguage): string | null {
  return localStorage.getItem(draftKey(matchId, problemKey, language));
}

export function saveLanguage(language: CodeLanguage): void {
  localStorage.setItem(LANGUAGE_KEY, language);
}

export function loadLanguage(): CodeLanguage {
  const value = localStorage.getItem(LANGUAGE_KEY);
  return value === 'cpp' || value === 'python' || value === 'java' || value === 'javascript' ? value : 'cpp';
}

export function addRecentMatch(match: MatchConfig): void {
  const recents = loadRecentMatches().filter((recent) => recent.id !== match.id);
  const recent: RecentMatch = {
    id: match.id,
    title: `${match.players[0].handle} vs ${match.players[1].handle}`,
    urlHash: matchHash(match),
    createdAt: Date.now(),
  };
  localStorage.setItem(RECENTS_KEY, JSON.stringify([recent, ...recents].slice(0, 10)));
}

export function loadRecentMatches(): RecentMatch[] {
  try {
    return JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]') as RecentMatch[];
  } catch {
    return [];
  }
}

export function clearLocalData(): void {
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('lockout-web:')) {
      localStorage.removeItem(key);
    }
  }
}
