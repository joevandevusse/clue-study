import type { ClueDto } from '../types';
import './FlashCard.css';

interface Props {
  clue: ClueDto;
  revealed: boolean;
  onReveal: () => void;
}

function formatDate(dateStr: string): string {
  // Append time to avoid off-by-one from UTC timezone conversion
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function FlashCard({ clue, revealed, onReveal }: Props) {
  return (
    <div className={`card-scene ${revealed ? 'is-flipped' : ''}`}>
      <div className="card-body">

        {/* Front — the clue (Jeopardy calls this the "answer") */}
        <div className="card-face card-front" onClick={!revealed ? onReveal : undefined}>
          <div className="card-meta">
            <span className="card-value">{clue.clueValue}</span>
            <span className="card-topic">{clue.category}</span>
          </div>
          <p className="card-question">{clue.answer}</p>
          <p className="card-hint">Click or wait for reveal</p>
        </div>

        {/* Back — the correct response (Jeopardy calls this the "question") */}
        <div className="card-face card-back">
          <p className="card-label">RESPONSE</p>
          <p className="card-answer">{clue.question}</p>
          <p className="card-question-echo">{clue.answer}</p>
          <p className="card-canonical">Topic: {clue.canonicalTopic}</p>
          <p className="card-airdate">Aired {formatDate(clue.gameDate)}</p>
        </div>

      </div>
    </div>
  );
}
