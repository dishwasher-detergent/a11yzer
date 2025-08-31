import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_ANALYSIS_LIMIT } from "@/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LucideArrowUp,
  LucideLoader2,
  LucideTriangleAlert,
  LucideX,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ShineBorder } from "../shine-border";

const urlSchema = z.object({
  url: z
    .string()
    .min(1, "URL is required")
    .url("Please enter a valid URL")
    .refine(
      (url) => {
        try {
          const urlObj = new URL(url);
          return urlObj.protocol === "http:" || urlObj.protocol === "https:";
        } catch {
          return false;
        }
      },
      {
        message: "URL must start with http:// or https://",
      }
    ),
});

type UrlFormData = z.infer<typeof urlSchema>;

interface UrlInputProps {
  url: string;
  onUrlChange: (url: string) => void;
  onAnalyze: () => void;
  onCancel?: () => void;
  loading: boolean;
  error?: string;
  count: number;
}

export const UrlInput = memo<UrlInputProps>(function UrlInput({
  url,
  onUrlChange,
  onAnalyze,
  onCancel,
  loading,
  error,
  count,
}) {
  const isMaxedOut = useMemo(() => count >= MAX_ANALYSIS_LIMIT, [count]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UrlFormData>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: url,
    },
    mode: "onChange",
  });

  const watchedUrl = watch("url");

  useEffect(() => {
    if (watchedUrl !== url) {
      onUrlChange(watchedUrl || "");
    }
  }, [watchedUrl, onUrlChange]);

  useEffect(() => {
    if (url !== watchedUrl) {
      setValue("url", url);
    }
  }, [url, setValue]);

  const onSubmit = useCallback(() => {
    if (!isMaxedOut && !loading) {
      onAnalyze();
    }
  }, [onAnalyze, isMaxedOut, loading]);

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!loading) {
        handleSubmit(onSubmit)(e);
      }
    },
    [handleSubmit, onSubmit, loading]
  );

  const isSubmitDisabled = loading || !watchedUrl || !!errors.url || isMaxedOut;

  return (
    <section
      className="px-8 pb-8 w-full bg-background z-10"
      aria-labelledby="url-analysis-heading"
    >
      <h2 id="url-analysis-heading" className="sr-only">
        Website Accessibility Analysis
      </h2>
      <div className="p-0.5 border bg-secondary rounded-md space-y-1">
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {error && `Error: ${error}`}
          {errors.url && `Validation error: ${errors.url.message}`}
        </div>
        {error && (
          <div
            className="px-2 py-1 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2"
            role="alert"
            aria-describedby="error-message"
          >
            <LucideTriangleAlert
              className="size-3 flex-shrink-0 text-destructive"
              aria-hidden="true"
            />
            <p id="error-message" className="text-xs text-destructive">
              {error}
            </p>
          </div>
        )}

        {errors.url && (
          <div
            className="px-2 py-1 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2"
            role="alert"
            aria-describedby="validation-error"
          >
            <LucideTriangleAlert
              className="size-3 flex-shrink-0 text-destructive"
              aria-hidden="true"
            />
            <p id="validation-error" className="text-xs text-destructive">
              {errors.url.message}
            </p>
          </div>
        )}
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
                  You have used {count}/{MAX_ANALYSIS_LIMIT} analyses
                </>
              )}
            </p>
          </div>
        </div>
        <form
          onSubmit={handleFormSubmit}
          className="flex border rounded-md overflow-hidden h-12 bg-background relative"
          role="search"
          aria-labelledby="form-label"
          noValidate
        >
          <ShineBorder
            shineColor={[
              "var(--color-pink-400)",
              "var(--color-red-400)",
              "var(--color-yellow-400)",
              "var(--color-green-400)",
              "var(--color-blue-400)",
            ]}
          />
          <label id="form-label" className="sr-only">
            Enter a website URL to analyze its accessibility
          </label>
          <div className="flex-1 h-full pr-2">
            <Input
              type="url"
              placeholder="Enter website URL (e.g., https://example.com)"
              {...register("url")}
              disabled={loading || isMaxedOut}
              className={`border-none rounded-none px-4 h-full ${
                errors.url ? "text-destructive" : ""
              }`}
              aria-label="Website URL to analyze"
              aria-describedby="url-input-description url-input-requirements"
              aria-invalid={errors.url ? "true" : "false"}
              aria-required="true"
              autoComplete="url"
              spellCheck="false"
            />
            <div id="url-input-description" className="sr-only">
              Enter a valid website URL to analyze its accessibility compliance
            </div>
            <div id="url-input-requirements" className="sr-only">
              URL must start with http:// or https://
            </div>
          </div>
          <div className="h-full flex items-center pr-1.5">
            {loading && onCancel ? (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCancel();
                }}
                size="icon"
                variant="destructive"
                aria-label="Cancel current accessibility analysis"
                title="Cancel analysis"
              >
                <LucideX className="w-4 h-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitDisabled}
                size="icon"
                variant="secondary"
                aria-label={
                  loading
                    ? "Analyzing website accessibility..."
                    : isMaxedOut
                    ? "Analysis limit reached. Cannot analyze more websites."
                    : "Start accessibility analysis"
                }
                title={
                  loading
                    ? "Analysis in progress"
                    : isMaxedOut
                    ? "Analysis limit reached"
                    : "Analyze website"
                }
                aria-describedby={
                  isSubmitDisabled ? "button-disabled-reason" : undefined
                }
              >
                {loading ? (
                  <>
                    <LucideLoader2
                      className="w-4 h-4 animate-spin"
                      aria-hidden="true"
                    />
                    <span className="sr-only">Analysis in progress</span>
                  </>
                ) : (
                  <LucideArrowUp className="w-4 h-4" aria-hidden="true" />
                )}
              </Button>
            )}
            {isSubmitDisabled && !loading && (
              <div id="button-disabled-reason" className="sr-only">
                {isMaxedOut
                  ? "Analysis limit has been reached"
                  : errors.url
                  ? "Please enter a valid URL"
                  : "Please enter a URL to analyze"}
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
});
