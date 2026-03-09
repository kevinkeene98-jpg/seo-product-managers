"use client";

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
  jdOpen: boolean;
  onToggleJd: () => void;
}

export function BuilderHeader({
  job,
  remainingMessages,
  resumeData,
  onExportPdf,
  saveStatus,
  jdOpen,
  onToggleJd,
}: Props) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        {job.companyLogoUrl ? (
          <img
            src={job.companyLogoUrl}
            alt={job.companyName}
            className="h-6 w-6 rounded object-contain"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-bold text-muted-foreground">
            {job.companyName.charAt(0)}
          </div>
        )}
        <Link
          href={jobUrl({ id: job.id, companyName: job.companyName, title: job.title })}
          className="hover:underline"
        >
          <span className="font-semibold">{job.title}</span>
          <span className="text-muted-foreground"> at {job.companyName}</span>
        </Link>
        <button
          onClick={onToggleJd}
          className="ml-1 text-muted-foreground hover:text-foreground"
          aria-label="Toggle job description"
        >
          <svg
            width="14"
            height="14"
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
    </header>
  );
}
