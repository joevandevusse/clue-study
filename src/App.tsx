import { useState } from 'react';
import TopicPicker from './components/TopicPicker';
import StudyMode from './components/StudyMode';
import type { StudyConfig } from './types';

export default function App() {
  const [config, setConfig] = useState<StudyConfig | null>(null);

  if (config) {
    return (
      <StudyMode
        topic={config.topic}
        fromDate={config.fromDate}
        onExit={() => setConfig(null)}
      />
    );
  }

  return <TopicPicker onSelect={setConfig} />;
}
