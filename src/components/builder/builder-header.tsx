"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { jobUrl } from "@/lib/format";
import type { ResumeData } from "@/lib/types/resume";
import type { Job } from "@/lib/types";

interface Props {
  job: Job;
  remainingMessages: number;
  resumeData: ResumeData | null;
  onExportPdf: () => void;
  saveStatus: "idle" | "saving" | "saved";
}

export function BuilderHeader({
  job,
  remainingMessages,
  resumeData,
  onExportPdf,
  saveStatus,
}: Props) {
  const [jdOpen, setJdOpen] = useState(false);

  return (
    <div className="border-b bg-background">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link
            href={jobUrl({ id: job.id, companyName: job.companyName, title: job.title })}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            &larr; Back
          </Link>
          <div className="hidden sm:block">
            <span className="font-semibold">{job.title}</span>
            <span className="text-muted-foreground"> at {job.companyName}</span>
          </div>
          <button
            onClick={() => setJdOpen(!jdOpen)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <span>View job description</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${jdOpen ? "rotate-180" : ""}`}
            >
              <path d="M3 4.5L6 7.5L9 4.5" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "saved" && "Saved"}
          </span>
          <span className="text-xs text-muted-foreground">
            {remainingMessages >= 999 ? "Unlimited" : `${remainingMessages}/20 messages`}
          </span>
          <Button size="sm" disabled={!resumeData} onClick={onExportPdf}>
            Export PDF
          </Button>
        </div>
      </div>

      {jdOpen && (
        <div className="max-h-96 overflow-y-auto border-t px-4 py-4">
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </div>
      )}
    </div>
  );
}
