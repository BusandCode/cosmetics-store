export function RatingSquares({ value, size = 10 }: { value: number; size?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{ width: size, height: size }}
          className={i <= Math.round(value) ? "bg-[#6B1D1D]" : "border border-neutral-300"}
        />
      ))}
    </div>
  );
}