import { ClueDto } from '../types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:7070';

export async function fetchTopics(): Promise<string[]> {
  const res = await fetch(`${BASE}/api/topics`);
  if (!res.ok) throw new Error(`Failed to fetch topics: ${res.status}`);
  return res.json();
}

export async function fetchClues(topic: string): Promise<ClueDto[]> {
  const res = await fetch(`${BASE}/api/clues?topic=${encodeURIComponent(topic)}`);
  if (!res.ok) throw new Error(`Failed to fetch clues: ${res.status}`);
  return res.json();
}

export async function recordStat(canonicalTopic: string, passed: boolean): Promise<void> {
  await fetch(`${BASE}/api/stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ canonicalTopic, passed }),
  });
}
