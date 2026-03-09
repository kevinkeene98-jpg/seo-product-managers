"use client";

import { Textarea } from "@/components/ui/textarea";

interface Props {
  content: string | null;
  onChange: (content: string) => void;
}

export function CoverLetterTab({ content, onChange }: Props) {
  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <div className="text-4xl">✉️</div>
        <h3 className="text-lg font-semibold">No Cover Letter Yet</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Use the AI assistant to generate a cover letter tailored to this role.
          Just ask: &quot;Write me a cover letter for this position.&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Cover Letter
      </h3>
      <Textarea
        rows={20}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="font-serif text-sm leading-relaxed"
      />
    </div>
  );
}
