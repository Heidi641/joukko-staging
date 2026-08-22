export function nextTarget(count: number, preferred?: number | null) {
  const targets = preferred ? [preferred, 1000, 5000, 10000, 25000] : [100, 500, 1000, 5000, 10000, 25000];
  const target = targets.find((value) => value > count) ?? 50000;
  return {
    target,
    left: Math.max(0, target - count),
    percent: Math.min(100, Math.round((count / target) * 100))
  };
}

export function ProgressBar({ count, target }: { count: number; target?: number | null }) {
  const progress = nextTarget(count, target);
  return (
    <>
      <div className="bar" aria-label={`Edistyminen ${progress.percent} prosenttia`}>
        <span style={{ width: `${progress.percent}%` }} />
      </div>
      <p className="muted">{progress.left.toLocaleString("fi-FI")} lisää → {progress.target.toLocaleString("fi-FI")}</p>
    </>
  );
}
