import type { ClueDto } from '../types';
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

        {/* Front — the clue (Jeopardy calls this the "answer") */}
        <div className="card-face card-front" onClick={!revealed ? onReveal : undefined}>
          <div className="card-meta">
            <span className="card-value">{clue.clueValue}</span>
            <span className="card-topic">{clue.canonicalTopic}</span>
          </div>
          <p className="card-question">{clue.answer}</p>
          <p className="card-hint">Click or wait for reveal</p>
        </div>

        {/* Back — the correct response (Jeopardy calls this the "question") */}
        <div className="card-face card-back">
          <p className="card-label">RESPONSE</p>
          <p className="card-answer">{clue.question}</p>
          <p className="card-question-echo">{clue.answer}</p>
        </div>

      </div>
    </div>
  );
}
