import { zodResolver } from "@hookform/resolvers/zod";
import { LucideArrowUp, LucideLoader2, LucideX } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ShineBorder } from "@/components/shine-border";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MAX_ANALYSIS_LIMIT } from "@/lib/constants";
import { AlertMessage } from "./alert-message";
import { UsageCounter } from "./usage-counter";

const urlSchema = z.object({
  url: z
    .string()
    .min(1, "URL is required")
    .refine(
      (url) => {
        if (url.includes("://")) {
          return false;
        }

        try {
          const urlObj = new URL(`https://${url}`);
          return urlObj.hostname.includes(".");
        } catch {
          return false;
        }
      },
      {
        message:
          "Please enter a domain without http:// or https:// (e.g., example.com)",
      }
    ),
});

type UrlFormData = z.infer<typeof urlSchema>;

interface UrlInputProps {
  onAnalyze: (url: string) => void;
  onCancel?: () => void;
  loading: boolean;
  error?: string;
  count: number;
  cached: boolean;
}

export function UrlInput({
  onAnalyze,
  onCancel,
  loading,
  error,
  count,
  cached,
}: UrlInputProps) {
  const isMaxedOut = useMemo(() => count >= MAX_ANALYSIS_LIMIT, [count]);

  const form = useForm<UrlFormData>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: "",
    },
  });

  async function onSubmit(values: UrlFormData) {
    const urlWithProtocol = `https://${values.url}`;
    onAnalyze(urlWithProtocol);
  }

  return (
    <section className="max-w-5xl mx-auto">
      <div className="p-0.5 border bg-secondary rounded-md space-y-1">
        {error && (
          <AlertMessage id="error-message" message={error} type="error" />
        )}
        {form.formState.errors.url && (
          <AlertMessage
            id="validation-error"
            message={form.formState.errors.url.message || "Invalid URL"}
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
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex border rounded-md overflow-hidden h-12 bg-background relative"
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
            <div className="h-full flex items-center pl-3">
              <Badge variant="secondary">https://</Badge>
            </div>
            <div className="flex-1 h-full pr-2">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="h-full">
                    <FormControl>
                      <Input
                        {...field}
                        type="url"
                        placeholder="kennethbass.com"
                        className="border-none rounded-none px-4 h-full"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
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
                  title="Cancel analysis"
                >
                  <LucideX className="w-4 h-4" aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading || !form.formState.isValid}
                  size="icon"
                  variant="secondary"
                  title={
                    loading
                      ? "Analysis in progress"
                      : isMaxedOut
                      ? "Analysis limit reached"
                      : "Analyze website"
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
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}
