import { ClueDto } from '../types';
import './FlashCard.css';

interface Props {
  clue: ClueDto;
  revealed: boolean;
  onReveal: () => void;
}

export default function FlashCard({ clue, revealed, onReveal }: Props) {
  return (
    <div className={`card-scene ${revealed ? 'is-flipped' : ''}`}>
      <div className="card-body">

        {/* Front — question */}
        <div className="card-face card-front" onClick={!revealed ? onReveal : undefined}>
          <div className="card-meta">
            <span className="card-value">{clue.clueValue}</span>
            <span className="card-topic">{clue.canonicalTopic}</span>
          </div>
          <p className="card-question">{clue.question}</p>
          <p className="card-hint">Click or wait for reveal</p>
        </div>

        {/* Back — answer */}
        <div className="card-face card-back">
          <p className="card-label">ANSWER</p>
          <p className="card-answer">{clue.answer}</p>
          <p className="card-question-echo">{clue.question}</p>
        </div>

      </div>
    </div>
  );
}
