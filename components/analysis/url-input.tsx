import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Loader2 } from "lucide-react";

interface UrlInputProps {
  url: string;
  onUrlChange: (url: string) => void;
  onAnalyze: () => void;
  loading: boolean;
  error?: string;
}

export function UrlInput({
  url,
  onUrlChange,
  onAnalyze,
  loading,
  error,
}: UrlInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <Input
            type="url"
            placeholder="Enter website URL (e.g., https://example.com)"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            disabled={loading}
            className={error ? "border-red-500" : ""}
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
        <Button type="submit" disabled={loading || !url}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Globe className="w-4 h-4" />
          )}
          {loading ? "Analyzing..." : "Analyze"}
        </Button>
      </form>
    </div>
  );
}
