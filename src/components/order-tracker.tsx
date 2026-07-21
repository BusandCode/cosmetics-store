type Status = "PENDING" | "AWAITING_CONFIRMATION" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STEPS: { status: Status; label: string }[] = [
  { status: "AWAITING_CONFIRMATION", label: "Payment" },
  { status: "PAID", label: "Confirmed" },
  { status: "PROCESSING", label: "Processing" },
  { status: "SHIPPED", label: "Shipped" },
  { status: "DELIVERED", label: "Delivered" },
];

const ORDER: Status[] = ["PENDING", "AWAITING_CONFIRMATION", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export function OrderTracker({ status }: { status: Status }) {
  if (status === "CANCELLED") {
    return (
      <div className="border border-black p-4 text-sm">
        <span className="font-medium">Order cancelled</span>
      </div>
    );
  }

  const currentIndex = ORDER.indexOf(status);

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const stepIndex = ORDER.indexOf(step.status);
        const reached = currentIndex >= stepIndex;
        const isLast = i === STEPS.length - 1;
        return (
          <div key={step.status} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-3 h-3 rounded-full border border-black ${reached ? "bg-black" : "bg-white"}`} />
              <span className={`text-[10px] uppercase tracking-widest whitespace-nowrap ${reached ? "text-black font-medium" : "text-neutral-400"}`}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-px mx-1 ${currentIndex > stepIndex ? "bg-black" : "bg-neutral-300"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}