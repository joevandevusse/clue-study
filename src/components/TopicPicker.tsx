import { useEffect, useState } from 'react';
import { fetchTopics } from '../api/client';
import { SEASON_OPTIONS, DEFAULT_SEASON } from '../types';
import type { SeasonOption, StudyConfig } from '../types';
import './TopicPicker.css';

interface Props {
  onSelect: (config: StudyConfig) => void;
}

export default function TopicPicker({ onSelect }: Props) {
  const [topics, setTopics]   = useState<string[]>([]);
  const [topic, setTopic]     = useState('');
  const [season, setSeason]   = useState<SeasonOption>(DEFAULT_SEASON);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetchTopics()
      .then(setTopics)
      .catch(() => setError('Could not load topics. Is ClueApi running?'));
  }, []);

  function handleStart() {
    if (topic) onSelect({ topic, fromDate: season.fromDate });
  }

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="topic-picker">
      <h1 className="logo">JEOPARDY!</h1>
      <p className="subtitle">Select a topic to study</p>

      <select
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="topic-select"
      >
        <option value="" disabled>-- Choose a topic --</option>
        {topics.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <div className="season-row">
        <label className="season-label" htmlFor="season-select">Era</label>
        <select
          id="season-select"
          value={season.label}
          onChange={(e) =>
            setSeason(SEASON_OPTIONS.find((o) => o.label === e.target.value)!)
          }
          className="season-select"
        >
          {SEASON_OPTIONS.map((o) => (
            <option key={o.label} value={o.label}>{o.label}</option>
          ))}
        </select>
      </div>

      <button
        className="btn-primary"
        onClick={handleStart}
        disabled={!topic}
      >
        Start Studying
      </button>
    </div>
  );
}
