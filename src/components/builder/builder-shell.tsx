"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { BuilderHeader } from "./builder-header";
import { TabBar } from "./tab-bar";
import { ResumeTab } from "./tabs/resume-tab";
import { CoverLetterTab } from "./tabs/cover-letter-tab";
import { QATab } from "./tabs/qa-tab";

import { ResumePreview } from "./pdf/resume-preview";
import { CoverLetterPreview } from "./pdf/cover-letter-preview";
import { ChatPanel } from "./chat/chat-panel";
import { UnsavedBanner } from "./unsaved-banner";
import { useUndo } from "./use-undo";
import { Button } from "@/components/ui/button";
import type { ResumeData, BuilderTab, QAEntry } from "@/lib/types/resume";
import type { Job } from "@/lib/types";
import type { ChatMessage } from "./chat/use-chat";

interface Props {
  job: Job;
  applicationId: number;
  initialResumeData: ResumeData | null;
  initialCoverLetter: string | null;
  initialQA: QAEntry[] | null;
  initialChatMessages: ChatMessage[];
  initialRemaining: number;
}

export function BuilderShell({
  job,
  applicationId,
  initialResumeData,
  initialCoverLetter,
  initialQA,
  initialChatMessages,
  initialRemaining,
}: Props) {
  const [activeTab, setActiveTab] = useState<BuilderTab>("resume");
  const {
    state: resumeData,
    set: setResumeData,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndo<ResumeData | null>(initialResumeData);
  const [coverLetter, setCoverLetter] = useState<string | null>(initialCoverLetter);
  const [qaContent, setQAContent] = useState<QAEntry[] | null>(initialQA);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounced auto-save
  const save = useCallback(
    async (field: string, content: unknown) => {
      setSaveStatus("saving");
      try {
        await fetch("/api/builder/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId, field, content }),
        });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("idle");
      }
    },
    [applicationId]
  );

  const debouncedSave = useCallback(
    (field: string, content: unknown) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => save(field, content), 500);
    },
    [save]
  );

  // Auto-save on changes
  useEffect(() => {
    if (resumeData && resumeData !== initialResumeData) {
      debouncedSave("resumeContent", resumeData);
    }
  }, [resumeData, debouncedSave, initialResumeData]);

  useEffect(() => {
    if (coverLetter !== initialCoverLetter) {
      debouncedSave("coverLetterContent", coverLetter);
    }
  }, [coverLetter, debouncedSave, initialCoverLetter]);

  useEffect(() => {
    if (qaContent !== initialQA) {
      debouncedSave("qaContent", qaContent);
    }
  }, [qaContent, debouncedSave, initialQA]);

  const handleResumeParsed = useCallback(
    (data: ResumeData) => {
      setResumeData(data);
      save("resumeContent", data);
    },
    [setResumeData, save]
  );

  const handleExportPdf = useCallback(async () => {
    if (!resumeData) return;
    const { exportResumePdf } = await import("./pdf/export-pdf");
    await exportResumePdf(resumeData);
  }, [resumeData]);

  // Handle suggestion acceptance from chat
  const handleSuggestionAccepted = useCallback(
    (sectionPath: string, content: unknown) => {
      if (sectionPath === "coverLetter") {
        setCoverLetter(content as string);
        setActiveTab("cover-letter");
        return;
      }
      if (sectionPath === "qa") {
        // Parse Q&A format
        const text = content as string;
        const pairs: QAEntry[] = [];
        const qRegex = /Q:\s*(.*?)(?:\n|$)\s*A:\s*([\s\S]*?)(?=\nQ:|$)/g;
        let match;
        while ((match = qRegex.exec(text)) !== null) {
          pairs.push({ question: match[1].trim(), answer: match[2].trim() });
        }
        if (pairs.length > 0) {
          setQAContent(pairs);
          setActiveTab("qa");
        }
        return;
      }
      if (!resumeData) return;

      // Handle resume section suggestions
      if (sectionPath === "summary") {
        setResumeData({ ...resumeData, summary: content as string });
      } else if (sectionPath === "skills") {
        const skills = typeof content === "string"
          ? content.split(",").map((s) => s.trim()).filter(Boolean)
          : (content as string[]);
        setResumeData({ ...resumeData, skills });
      } else if (sectionPath.startsWith("experience.")) {
        const parts = sectionPath.split(".");
        const index = parseInt(parts[1], 10);
        if (isNaN(index) || index >= resumeData.experience.length) return;

        if (parts[2] === "bullets") {
          const bullets = typeof content === "string"
            ? content.split("\n").filter(Boolean)
            : (content as string[]);
          const exp = [...resumeData.experience];
          exp[index] = { ...exp[index], bullets };
          setResumeData({ ...resumeData, experience: exp });
        }
      }
    },
    [resumeData, setResumeData]
  );

  // Editing mode: when true, left panel shows editor; when false, shows preview
  const [isEditing, setIsEditing] = useState(false);

  // Determine if the current tab has previewable content
  const hasResumePreview = activeTab === "resume" && resumeData;
  const hasCoverLetterPreview = activeTab === "cover-letter" && coverLetter;
  const hasPreview = hasResumePreview || hasCoverLetterPreview;

  // For tabs without preview (Q&A, Job Description, or no content yet), always show the content directly
  const showEditor = !hasPreview || isEditing;

  // Reset editing mode when switching tabs
  const handleTabChange = useCallback(
    (tab: BuilderTab) => {
      setActiveTab(tab);
      setIsEditing(false);
    },
    []
  );

  return (
    <div className="flex h-screen flex-col">
      <UnsavedBanner />
      <BuilderHeader
        job={job}
        remainingMessages={initialRemaining}
        resumeData={resumeData}
        onExportPdf={handleExportPdf}
        saveStatus={saveStatus}
      />

      <div className="flex min-h-0 flex-1">
        {/* Left Panel: Preview or Editor */}
        <div className="flex w-1/2 flex-col border-r">
          <div className="border-b px-4 pt-2">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
              </div>
              <div className="flex gap-1 pb-2">
                {/* Edit / Done toggle */}
                {hasPreview && (
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "Done" : "Edit"}
                  </Button>
                )}
                {/* Undo / Redo (only in edit mode on resume tab) */}
                {isEditing && activeTab === "resume" && resumeData && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={undo}
                      disabled={!canUndo}
                      className="h-7 text-xs"
                    >
                      Undo
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={redo}
                      disabled={!canRedo}
                      className="h-7 text-xs"
                    >
                      Redo
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {showEditor ? (
              <>
                {activeTab === "resume" && (
                  <ResumeTab
                    data={resumeData}
                    onParsed={handleResumeParsed}
                    onChange={setResumeData}
                  />
                )}
                {activeTab === "cover-letter" && (
                  <CoverLetterTab content={coverLetter} onChange={setCoverLetter} />
                )}
                {activeTab === "qa" && (
                  <QATab content={qaContent} onChange={setQAContent} />
                )}
              </>
            ) : (
              <div className="overflow-y-auto bg-gray-100 p-6 dark:bg-gray-900/50">
                {hasResumePreview && <ResumePreview data={resumeData!} />}
                {hasCoverLetterPreview && (
                  <CoverLetterPreview
                    content={coverLetter!}
                    contactName={resumeData?.contactInfo.name}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Chat */}
        <div className="flex w-1/2 flex-col">
          <ChatPanel
            applicationId={applicationId}
            initialMessages={initialChatMessages}
            initialRemaining={initialRemaining}
            activeTab={activeTab}
            resumeData={resumeData}
            onSuggestionAccepted={handleSuggestionAccepted}
          />
        </div>
      </div>
    </div>
  );
}
