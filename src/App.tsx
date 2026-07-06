import { useEffect, useState } from 'react';
import { CreateMatch } from './components/CreateMatch';
import { MatchPage } from './components/MatchPage';
import { readMatchFromLocation } from './game/matchUrl';
import type { MatchConfig } from './types';

export function App() {
  const [match, setMatch] = useState<MatchConfig | null>(() => {
    try {
      return readMatchFromLocation();
    } catch {
      return null;
    }
  });

  useEffect(() => {
    function handleHashChange() {
      try {
        setMatch(readMatchFromLocation());
      } catch {
        setMatch(null);
      }
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (match) {
    return <MatchPage match={match} onExit={() => { window.location.hash = ''; setMatch(null); }} />;
  }

  return <CreateMatch onMatchCreated={setMatch} />;
}
