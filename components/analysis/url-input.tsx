import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_ANALYSIS_LIMIT } from "@/lib/constants";
import {
  LucideArrowUp,
  LucideLoader2,
  LucideTriangleAlert,
} from "lucide-react";

interface UrlInputProps {
  url: string;
  onUrlChange: (url: string) => void;
  onAnalyze: () => void;
  loading: boolean;
  error?: string;
  count: number;
}

export function UrlInput({
  url,
  onUrlChange,
  onAnalyze,
  loading,
  error,
  count,
}: UrlInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze();
  };

  return (
    <div className="px-8 pb-8 w-full bg-background">
      <div className="p-0.5 border bg-secondary rounded-md">
        {error && (
          <div className="px-2 py-1 bg-destructive rounded-md flex flex-row gap-2 items-center">
            <LucideTriangleAlert className="size-4 flex-none" />
            <p className="text-xs text-destructive-foreground mt-1">{error}</p>
          </div>
        )}
        <div className="px-2 py-1">
          <p className="text-xs text-muted-foreground">
            You have used {count}/{MAX_ANALYSIS_LIMIT} analyzations.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex border rounded-md overflow-hidden h-12 bg-background"
        >
          <div className="flex-1 h-full pr-2">
            <Input
              type="url"
              placeholder="Enter website URL (e.g., https://example.com)"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              disabled={loading}
              className="border-none rounded-none px-4 h-full"
            />
          </div>
          <div className="h-full grid place-items-center pr-1.5">
            <Button
              type="submit"
              disabled={loading || !url}
              size="icon"
              variant="secondary"
            >
              {loading ? (
                <LucideLoader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LucideArrowUp className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
