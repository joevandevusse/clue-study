import { useState } from 'react';
import TopicPicker from './components/TopicPicker';
import StudyMode from './components/StudyMode';

export default function App() {
  const [topic, setTopic] = useState<string | null>(null);

  if (topic) {
    return <StudyMode topic={topic} onExit={() => setTopic(null)} />;
  }

  return <TopicPicker onSelect={setTopic} />;
}
