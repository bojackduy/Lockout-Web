import type { MatchConfig } from '../types';

export function encodeMatch(match: MatchConfig): string {
  return btoa(encodeURIComponent(JSON.stringify(match)));
}

export function decodeMatch(encoded: string): MatchConfig {
  return JSON.parse(decodeURIComponent(atob(encoded))) as MatchConfig;
}

export function matchHash(match: MatchConfig): string {
  return `#/match/${encodeMatch(match)}`;
}

export function readMatchFromLocation(): MatchConfig | null {
  const prefix = '#/match/';
  if (!window.location.hash.startsWith(prefix)) {
    return null;
  }

  return decodeMatch(window.location.hash.slice(prefix.length));
}

export function makeMatchId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
