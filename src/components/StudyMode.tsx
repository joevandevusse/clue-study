import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchClues, recordStat } from '../api/client';
import type { ClueDto } from '../types';
import FlashCard from './FlashCard';
import Timer from './Timer';
import './StudyMode.css';

const TIMER_SECONDS = 15;
const REFETCH_THRESHOLD = 5; // fetch more clues when queue falls below this

interface Props {
  topic: string;
  fromDate: string | null;
  onExit: () => void;
}

export default function StudyMode({ topic, fromDate, onExit }: Props) {
  const [queue, setQueue]       = useState<ClueDto[]>([]);
  const [current, setCurrent]   = useState<ClueDto | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [seconds, setSeconds]   = useState(TIMER_SECONDS);
  const [streak, setStreak]     = useState({ pass: 0, fail: 0 });
  const [loading, setLoading]   = useState(true);
  const [trackStats, setTrackStats] = useState(false);

  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoFired = useRef(false); // prevents double-recording on auto-fail

  // ── Load clues ────────────────────────────────────────────────────────

  const loadClues = useCallback(async () => {
    const clues = await fetchClues(topic, fromDate);
    setQueue((prev) => [...prev, ...clues]);
  }, [topic, fromDate]);

  useEffect(() => {
    loadClues().then(() => setLoading(false));
  }, [loadClues]);

  // ── Advance to next clue ──────────────────────────────────────────────

  const advance = useCallback((incoming: ClueDto[]) => {
    const [next, ...rest] = incoming;
    setCurrent(next ?? null);
    setQueue(rest);
    setRevealed(false);
    setSeconds(TIMER_SECONDS);
    autoFired.current = false;

    if (rest.length < REFETCH_THRESHOLD) {
      fetchClues(topic, fromDate).then((more) =>
        setQueue((prev) => [...prev, ...more])
      );
    }
  }, [topic, fromDate]);

  // Kick off first card once queue is populated
  useEffect(() => {
    if (!loading && queue.length > 0 && current === null) {
      advance(queue);
    }
  }, [loading, queue, current, advance]);

  // ── Countdown timer ───────────────────────────────────────────────────

  useEffect(() => {
    if (revealed || current === null) return;

    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          if (!autoFired.current) {
            autoFired.current = true;
            if (trackStats) recordStat(topic, false);
            setStreak((st) => ({ ...st, fail: st.fail + 1 }));
            setRevealed(true);
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [current, revealed, topic, trackStats]);

  // ── User interactions ─────────────────────────────────────────────────

  function handleReveal() {
    clearInterval(timerRef.current!);
    setRevealed(true);
  }

  function handleGrade(passed: boolean) {
    if (trackStats) recordStat(topic, passed);
    setStreak((st) => ({
      pass: passed ? st.pass + 1 : st.pass,
      fail: passed ? st.fail : st.fail + 1,
    }));
    advance([...queue]);
  }

  // ── Render ────────────────────────────────────────────────────────────

  if (loading || current === null) {
    return <p className="loading-msg">Loading clues…</p>;
  }

  const total = streak.pass + streak.fail;
  const pct   = total === 0 ? 0 : Math.round((streak.pass / total) * 100);

  return (
    <div className="study-mode">

      <header className="study-header">
        <button className="btn-ghost" onClick={onExit}>← Topics</button>
        <h2 className="study-topic">{topic}</h2>
        <div className="header-right">
          <label className="track-toggle" title="Record pass/fail results to the database">
            <input
              type="checkbox"
              checked={trackStats}
              onChange={(e) => setTrackStats(e.target.checked)}
            />
            <span className={`track-label ${trackStats ? 'track-on' : 'track-off'}`}>
              {trackStats ? 'Tracking' : 'Practice'}
            </span>
          </label>
          <span className="study-score">
            {streak.pass}/{total} &nbsp;
            <span className={pct >= 70 ? 'score-good' : pct >= 40 ? 'score-mid' : 'score-bad'}>
              {total > 0 ? `${pct}%` : '—'}
            </span>
          </span>
        </div>
      </header>

      <div className="study-body">
        {!revealed && (
          <Timer seconds={seconds} total={TIMER_SECONDS} />
        )}

        <FlashCard
          clue={current}
          revealed={revealed}
          onReveal={handleReveal}
        />

        {revealed && (
          <div className="grade-buttons">
            <button className="btn-fail" onClick={() => handleGrade(false)}>
              ✗ &nbsp;Miss
            </button>
            <button className="btn-pass" onClick={() => handleGrade(true)}>
              ✓ &nbsp;Got it
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
