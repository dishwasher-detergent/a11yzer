import { zodResolver } from "@hookform/resolvers/zod";
import { LucideArrowUp, LucideLoader2, LucideX } from "lucide-react";
import { memo, useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ShineBorder } from "@/components/shine-border";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MAX_ANALYSIS_LIMIT } from "@/lib/constants";
import { AlertMessage } from "./url-input/alert-message";
import { UsageCounter } from "./url-input/usage-counter";

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
  cached: boolean;
}

export const UrlInput = memo<UrlInputProps>(function UrlInput({
  url,
  onUrlChange,
  onAnalyze,
  onCancel,
  loading,
  error,
  count,
  cached,
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
      className="px-4 pb-4 md:px-8 md:pb-8 w-full bg-background z-10"
      aria-labelledby="url-analysis-heading"
    >
      <h2 id="url-analysis-heading" className="sr-only">
        Website Accessibility Analysis
      </h2>
      <div className="p-0.5 border bg-secondary rounded-md space-y-1">
        {error && (
          <AlertMessage id="error-message" message={error} type="error" />
        )}
        {errors.url && (
          <AlertMessage
            id="validation-error"
            message={errors.url.message || "Invalid URL"}
            type="warning"
          />
        )}
        {cached && !error && (
          <AlertMessage
            id="cache-hit"
            message="This analysis was served from cache. We cache results by domain for 1 hour to reduce load and improve performance. This does not use your quota."
            type="info"
          />
        )}
        <UsageCounter count={count} isMaxedOut={isMaxedOut} />
        <form
          onSubmit={handleFormSubmit}
          className="flex border rounded-md overflow-hidden h-12 bg-background relative"
          role="search"
          aria-labelledby="form-label"
          noValidate
        >
          <ShineBorder
            shineColor={[
              "var(--color-pink-300)",
              "var(--color-red-300)",
              "var(--color-yellow-300)",
              "var(--color-green-300)",
              "var(--color-blue-300)",
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
