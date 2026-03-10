"use client";

import { useCallback, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ResumeData } from "@/lib/types/resume";

interface Props {
  onParsed: (data: ResumeData) => void;
}

export function ResumeInputStep({ onParsed }: Props) {
  const [mode, setMode] = useState<"choose" | "paste">("choose");
  const [pasteText, setPasteText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/builder/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        onParsed(data.resumeData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setLoading(false);
      }
    },
    [onParsed]
  );

  const handlePaste = useCallback(async () => {
    if (!pasteText.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/builder/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: pasteText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Parse failed");
      onParsed(data.resumeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Parse failed");
    } finally {
      setLoading(false);
    }
  }, [pasteText, onParsed]);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-muted-foreground">
          Parsing your resume with AI — this may take a moment...
        </p>
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-8 w-3/4" />
      </div>
    );
  }

  if (mode === "paste") {
    return (
      <div className="space-y-4 p-6">
        <h2 className="text-lg font-semibold">Paste your resume</h2>
        <Textarea
          placeholder="Paste your resume text here..."
          rows={16}
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          className="font-mono text-sm"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={handlePaste} disabled={!pasteText.trim()}>
            Parse resume
          </Button>
          <Button variant="ghost" onClick={() => setMode("choose")}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8">
      <h2 className="text-xl font-semibold">Add your resume</h2>
      <p className="text-sm text-muted-foreground">
        Upload a file or paste your resume text. AI will structure it for you.
      </p>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="grid w-full max-w-md gap-4 sm:grid-cols-2">
        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => fileRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
            <span className="font-medium">Upload file</span>
            <span className="text-xs text-muted-foreground">.pdf or .docx</span>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => setMode("paste")}
        >
          <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
            <span className="font-medium">Paste text</span>
            <span className="text-xs text-muted-foreground">Copy & paste</span>
          </CardContent>
        </Card>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />
    </div>
  );
}
