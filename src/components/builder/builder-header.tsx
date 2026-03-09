"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { jobUrl } from "@/lib/format";
import type { ResumeData } from "@/lib/types/resume";

interface Props {
  jobId: number;
  jobTitle: string;
  companyName: string;
  remainingMessages: number;
  resumeData: ResumeData | null;
  onExportPdf: () => void;
  saveStatus: "idle" | "saving" | "saved";
}

export function BuilderHeader({
  jobId,
  jobTitle,
  companyName,
  remainingMessages,
  resumeData,
  onExportPdf,
  saveStatus,
}: Props) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-3">
        <Link
          href={jobUrl({ id: jobId, companyName, title: jobTitle })}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          &larr; Back
        </Link>
        <div className="hidden sm:block">
          <span className="font-semibold">{jobTitle}</span>
          <span className="text-muted-foreground"> at {companyName}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Save status */}
        <span className="text-xs text-muted-foreground">
          {saveStatus === "saving" && "Saving..."}
          {saveStatus === "saved" && "Saved"}
        </span>

        {/* Message counter */}
        <span className="text-xs text-muted-foreground">
          {remainingMessages >= 999 ? "Unlimited" : `${remainingMessages}/20 messages`}
        </span>

        {/* Export */}
        <Button size="sm" disabled={!resumeData} onClick={onExportPdf}>
          Export PDF
        </Button>
      </div>
    </header>
  );
}
