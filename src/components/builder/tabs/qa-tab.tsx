"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { QAEntry } from "@/lib/types/resume";

interface Props {
  content: QAEntry[] | null;
  onChange: (content: QAEntry[]) => void;
}

export function QATab({ content, onChange }: Props) {
  if (!content || content.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <div className="text-4xl">❓</div>
        <h3 className="text-lg font-semibold">No Q&A Prep Yet</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Use the AI assistant to generate interview questions and answers.
          Just ask: &quot;Help me prepare for interview questions.&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Interview Q&A Preparation
      </h3>
      {content.map((qa, i) => (
        <div key={i} className="rounded-md border p-3">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Question {i + 1}
          </label>
          <Input
            value={qa.question}
            onChange={(e) => {
              const updated = [...content];
              updated[i] = { ...updated[i], question: e.target.value };
              onChange(updated);
            }}
            className="mb-2 font-medium"
          />
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Answer
          </label>
          <Textarea
            rows={3}
            value={qa.answer}
            onChange={(e) => {
              const updated = [...content];
              updated[i] = { ...updated[i], answer: e.target.value };
              onChange(updated);
            }}
          />
        </div>
      ))}
    </div>
  );
}
