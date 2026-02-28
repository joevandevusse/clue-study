import './Timer.css';

interface Props {
  seconds: number;
  total: number;   // used to compute the progress arc
}

export default function Timer({ seconds, total }: Props) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / total;
  const dashOffset = circumference * (1 - progress);

  const colorClass =
    seconds > total * 0.6 ? 'timer-green' :
    seconds > total * 0.3 ? 'timer-yellow' :
    'timer-red';

  return (
    <div className={`timer ${colorClass}`}>
      <svg width="64" height="64" viewBox="0 0 64 64">
        {/* Track */}
        <circle
          cx="32" cy="32" r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="5"
        />
        {/* Progress arc — starts at 12 o'clock */}
        <circle
          cx="32" cy="32" r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 32 32)"
        />
      </svg>
      <span className="timer-label">{seconds}</span>
    </div>
  );
}
