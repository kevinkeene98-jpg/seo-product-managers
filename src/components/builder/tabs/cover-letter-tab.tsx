"use client";

import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Props {
  content: string | null;
  onChange: (content: string) => void;
  applicationId: number;
  hasResume: boolean;
}

export function CoverLetterTab({ content, onChange, applicationId, hasResume }: Props) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setError(null);
    onChange("");

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
              onChange(full);
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
  }, [applicationId, onChange]);

  if (!content && !generating) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <div className="text-4xl">✉️</div>
        <h3 className="text-lg font-semibold">Cover Letter</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Generate a tailored cover letter based on your resume and this job description.
        </p>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button onClick={handleGenerate} disabled={!hasResume}>
          Generate Cover Letter
        </Button>
        {!hasResume && (
          <p className="text-xs text-muted-foreground">Upload your resume first</p>
        )}
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Cover Letter
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={generating || !hasResume}
        >
          {generating ? "Generating..." : "Regenerate"}
        </Button>
      </div>
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
