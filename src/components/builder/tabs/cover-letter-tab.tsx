"use client";

import { useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Props {
  content: string | null;
  onChange: (content: string) => void;
  onReplace: (content: string) => void;
  applicationId: number;
  hasResume: boolean;
  onGeneratingChange?: (generating: boolean) => void;
  onNavigateToResume?: () => void;
}

export interface CoverLetterTabHandle {
  generate: () => void;
  generating: boolean;
}

export const CoverLetterTab = forwardRef<CoverLetterTabHandle, Props>(
  function CoverLetterTab({ content, onChange, onReplace, applicationId, hasResume, onGeneratingChange, onNavigateToResume }, ref) {
    const [generating, setGeneratingState] = useState(false);
    const setGenerating = useCallback((v: boolean) => {
      setGeneratingState(v);
      onGeneratingChange?.(v);
    }, [onGeneratingChange]);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
      setGenerating(true);
      setError(null);
      onReplace("");

      try {
        const res = await fetch("/api/builder/cover-letter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Generation failed");
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let full = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                full += data.text;
                onReplace(full);
              }
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Generation failed");
      } finally {
        setGenerating(false);
      }
    }, [applicationId, onReplace, setGenerating]);

    useImperativeHandle(ref, () => ({ generate: handleGenerate, generating }), [handleGenerate, generating]);

    if (!content && !generating) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
          <h3 className="text-lg font-semibold">Cover letter</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Generate a tailored cover letter based on your resume and this job description.
          </p>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!hasResume ? (
            <button
              onClick={onNavigateToResume}
              className="text-sm font-medium text-primary hover:underline"
            >
              Upload your resume first
            </button>
          ) : (
            <Button onClick={handleGenerate}>
              Generate cover letter
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="p-4">
        {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
        <Textarea
          rows={20}
          value={content || ""}
          onChange={(e) => onChange(e.target.value)}
          className="font-serif text-sm leading-relaxed"
          disabled={generating}
          placeholder={generating ? "Generating your cover letter..." : ""}
        />
      </div>
    );
  }
);
