import type { ClueDto } from '../types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:7070';

export async function fetchTopics(): Promise<string[]> {
  const res = await fetch(`${BASE}/api/topics`);
  if (!res.ok) throw new Error(`Failed to fetch topics: ${res.status}`);
  return res.json();
}

export async function fetchClues(topic: string, fromDate?: string | null): Promise<ClueDto[]> {
  let url = `${BASE}/api/clues?topic=${encodeURIComponent(topic)}`;
  if (fromDate) url += `&fromDate=${encodeURIComponent(fromDate)}`;
  const res = await fetch(url);
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
