export function RatingSquares({ value, size = 10 }: { value: number; size?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{ width: size, height: size }}
          className={i <= Math.round(value) ? "bg-black" : "border border-neutral-300"}
        />
      ))}
    </div>
  );
}