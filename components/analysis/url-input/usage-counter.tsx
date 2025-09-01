import { MAX_ANALYSIS_LIMIT } from "@/lib/constants";

interface UsageCounterProps {
  count: number;
  isMaxedOut: boolean;
}

export function UsageCounter({ count, isMaxedOut }: UsageCounterProps) {
  return (
    <div className="px-2 py-1">
      <div aria-live="polite" aria-atomic="true">
        <p
          className="text-xs text-muted-foreground"
          id="usage-counter"
          aria-label={`Analysis usage: ${count} of ${MAX_ANALYSIS_LIMIT} used${
            isMaxedOut ? ". Limit reached." : ""
          }`}
        >
          {isMaxedOut ? (
            <span className="text-destructive font-medium">
              Analysis limit reached ({count}/{MAX_ANALYSIS_LIMIT})
            </span>
          ) : (
            <>
              You have used {count}/{MAX_ANALYSIS_LIMIT} analyses today.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
