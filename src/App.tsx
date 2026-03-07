import { useState } from 'react';
import TopicPicker from './components/TopicPicker';
import StudyMode from './components/StudyMode';
import BubbleChart from './components/BubbleChart';
import type { StudyConfig } from './types';

export default function App() {
  const [config, setConfig]   = useState<StudyConfig | null>(null);
  const [showMap, setShowMap] = useState(false);

  if (config) {
    return (
      <StudyMode
        topic={config.topic}
        fromDate={config.fromDate}
        onExit={() => setConfig(null)}
      />
    );
  }

  if (showMap) {
    return (
      <BubbleChart
        onExit={() => setShowMap(false)}
        onStudy={(topic) => { setShowMap(false); setConfig({ topic, fromDate: null }); }}
      />
    );
  }

  return <TopicPicker onSelect={setConfig} onShowMap={() => setShowMap(true)} />;
}
