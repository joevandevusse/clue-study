import { useEffect, useState } from 'react';
import { fetchTopics } from '../api/client';
import './TopicPicker.css';

interface Props {
  onSelect: (topic: string) => void;
}

export default function TopicPicker({ onSelect }: Props) {
  const [topics, setTopics] = useState<string[]>([]);
  const [selected, setSelected] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopics()
      .then(setTopics)
      .catch(() => setError('Could not load topics. Is ClueApi running?'));
  }, []);

  function handleStart() {
    if (selected) onSelect(selected);
  }

  if (error) return <p className="error">{error}</p>;

  return (
    <div className="topic-picker">
      <h1 className="logo">JEOPARDY!</h1>
      <p className="subtitle">Select a topic to study</p>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="topic-select"
      >
        <option value="" disabled>-- Choose a topic --</option>
        {topics.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <button
        className="btn-primary"
        onClick={handleStart}
        disabled={!selected}
      >
        Start Studying
      </button>
    </div>
  );
}
