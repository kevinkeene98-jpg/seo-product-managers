"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { QAEntry } from "@/lib/types/resume";

interface Props {
  content: QAEntry[] | null;
  onChange: (content: QAEntry[]) => void;
  applicationId: number;
  hasResume: boolean;
}

export function QATab({ content, onChange, applicationId, hasResume }: Props) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/builder/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      onChange(data.entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }, [applicationId, onChange]);

  const handleAdd = () => {
    onChange([...(content || []), { question: "", answer: "" }]);
  };

  const handleRemove = (index: number) => {
    if (!content) return;
    onChange(content.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: "question" | "answer", value: string) => {
    if (!content) return;
    const updated = [...content];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  if ((!content || content.length === 0) && !generating) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <div className="text-4xl">❓</div>
        <h3 className="text-lg font-semibold">Interview Q&A Prep</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Generate interview questions and suggested answers based on your resume and this job description.
        </p>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button onClick={handleGenerate} disabled={!hasResume}>
          {generating ? "Generating..." : "Generate Q&A"}
        </Button>
        {!hasResume && (
          <p className="text-xs text-muted-foreground">Upload your resume first</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Interview Q&A Preparation
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={generating || !hasResume}
          >
            {generating ? "Generating..." : "Regenerate"}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {generating && (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">Generating interview questions...</p>
        </div>
      )}

      {!generating && content && content.map((qa, i) => (
        <div key={i} className="rounded-md border p-3">
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              Question {i + 1}
            </label>
            <button
              onClick={() => handleRemove(i)}
              className="text-xs text-muted-foreground hover:text-red-500"
            >
              Remove
            </button>
          </div>
          <Input
            value={qa.question}
            onChange={(e) => handleUpdate(i, "question", e.target.value)}
            className="mb-2 font-medium"
            placeholder="Enter a question..."
          />
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Answer
          </label>
          <Textarea
            rows={3}
            value={qa.answer}
            onChange={(e) => handleUpdate(i, "answer", e.target.value)}
            placeholder="Enter your answer..."
          />
        </div>
      ))}

      {!generating && (
        <Button variant="outline" size="sm" onClick={handleAdd} className="w-full">
          + Add Question
        </Button>
      )}
    </div>
  );
}
