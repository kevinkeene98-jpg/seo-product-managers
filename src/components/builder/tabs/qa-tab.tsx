"use client";

import { useState, useCallback, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { QAEntry } from "@/lib/types/resume";

interface Props {
  content: QAEntry[] | null;
  onChange: (content: QAEntry[]) => void;
  applicationId: number;
  hasResume: boolean;
}

const EMPTY_ENTRIES: QAEntry[] = [
  { question: "", answer: "" },
  { question: "", answer: "" },
  { question: "", answer: "" },
];

export function QATab({ content, onChange, applicationId, hasResume }: Props) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with 3 empty fields if no content
  useEffect(() => {
    if (!content || content.length === 0) {
      onChange(EMPTY_ENTRIES);
    }
  }, []);

  const entries = content && content.length > 0 ? content : EMPTY_ENTRIES;

  const handleGenerateQuestions = useCallback(async () => {
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

      // Fill in questions only, preserve existing answers
      const questions: string[] = data.entries;
      const updated = entries.map((entry, i) => ({
        question: questions[i] || entry.question,
        answer: entry.answer,
      }));
      // Add any extra generated questions beyond current count
      for (let i = entries.length; i < questions.length; i++) {
        updated.push({ question: questions[i], answer: "" });
      }
      onChange(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }, [applicationId, entries, onChange]);

  const handleAdd = () => {
    onChange([...entries, { question: "", answer: "" }]);
  };

  const handleRemove = (index: number) => {
    if (entries.length <= 1) return;
    onChange(entries.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Interview Q&A preparation
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateQuestions}
          disabled={generating || !hasResume}
        >
          {generating ? "Generating..." : "Generate questions with AI"}
        </Button>
      </div>

      {!hasResume && (
        <p className="text-xs text-muted-foreground">Upload your resume to generate questions with AI</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {entries.map((qa, i) => (
        <div key={i} className="rounded-md border p-3">
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              Question {i + 1}
            </label>
            {entries.length > 1 && (
              <button
                onClick={() => handleRemove(i)}
                className="text-xs text-muted-foreground hover:text-red-500"
              >
                Remove
              </button>
            )}
          </div>
          <Textarea
            rows={2}
            value={qa.question}
            onChange={(e) => handleUpdate(i, "question", e.target.value)}
            className="mb-2 resize-none font-medium"
            placeholder="Enter a question..."
          />
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Your answer
          </label>
          <Textarea
            rows={3}
            value={qa.answer}
            onChange={(e) => handleUpdate(i, "answer", e.target.value)}
            placeholder="Write your answer..."
          />
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={handleAdd} className="w-full">
        + Add question
      </Button>
    </div>
  );
}
