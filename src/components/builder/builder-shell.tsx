"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { BuilderHeader } from "./builder-header";
import { TabBar } from "./tab-bar";
import { ResumeTab } from "./tabs/resume-tab";
import { CoverLetterTab, type CoverLetterTabHandle } from "./tabs/cover-letter-tab";
import { QATab, type QATabHandle } from "./tabs/qa-tab";
import { JobDescriptionTab } from "./tabs/job-description-tab";
import { ResumePreview } from "./pdf/resume-preview";
import { CoverLetterPreview } from "./pdf/cover-letter-preview";
import { ChatPanel } from "./chat/chat-panel";
import { BuilderSidebar } from "./builder-sidebar";
import { UnsavedBanner } from "./unsaved-banner";
import { useUndo } from "./use-undo";
import { useAuth } from "@/components/auth/auth-context";
import { cn } from "@/lib/utils";
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
    undo: undoResume,
    redo: redoResume,
    canUndo: canUndoResume,
    canRedo: canRedoResume,
  } = useUndo<ResumeData | null>(initialResumeData);
  const {
    state: coverLetter,
    set: setCoverLetter,
    undo: undoCoverLetter,
    redo: redoCoverLetter,
    canUndo: canUndoCoverLetter,
    canRedo: canRedoCoverLetter,
  } = useUndo<string | null>(initialCoverLetter);
  const {
    state: qaContent,
    set: setQAContent,
    undo: undoQA,
    redo: redoQA,
    canUndo: canUndoQA,
    canRedo: canRedoQA,
  } = useUndo<QAEntry[] | null>(initialQA);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [generatingCL, setGeneratingCL] = useState(false);
  const [generatingQA, setGeneratingQA] = useState(false);
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

  const handleExportResumePdf = useCallback(async () => {
    if (!resumeData) return;
    const { exportResumePdf } = await import("./pdf/export-pdf");
    await exportResumePdf(resumeData);
  }, [resumeData]);

  const handleExportCoverLetterPdf = useCallback(async () => {
    if (!coverLetter) return;
    const { exportCoverLetterPdf } = await import("./pdf/export-pdf");
    await exportCoverLetterPdf(coverLetter, resumeData?.contactInfo.name);
  }, [coverLetter, resumeData]);

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

  const { user } = useAuth();

  const coverLetterRef = useRef<CoverLetterTabHandle>(null);
  const qaRef = useRef<QATabHandle>(null);

  // JD accordion state
  const [jdOpen, setJdOpen] = useState(false);

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
    <div className="flex h-screen">
      {/* Sidebar — logged in only */}
      {user && (
        <div className="hidden md:flex">
          <BuilderSidebar />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {!user && <UnsavedBanner />}
        <BuilderHeader
          job={job}
          remainingMessages={initialRemaining}
          saveStatus={saveStatus}
          jdOpen={jdOpen}
          onToggleJd={() => setJdOpen(!jdOpen)}
          showBreadcrumb={!user}
        />

        <div className="flex min-h-0 flex-1">
          {/* Left Panel: Preview or Editor */}
          <div className={cn("flex flex-col border-r", user ? "w-3/5" : "w-1/2")}>
            <div className="flex-1 overflow-y-auto">
              {/* Expandable Job Description — pushes content below it down */}
              {jdOpen && (
                <div className="border-b">
                  <JobDescriptionTab job={job} />
                </div>
              )}

              {/* Tab bar */}
              <div className="sticky top-0 z-10 border-b bg-background px-4 pt-2">
                <TabBar activeTab={activeTab} onTabChange={handleTabChange} />

                {/* Toolbar */}
                <div className="flex items-center gap-2 py-2">
                  {activeTab === "resume" && resumeData && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleExportResumePdf}
                    >
                      Download PDF
                    </Button>
                  )}
                  {activeTab === "cover-letter" && coverLetter && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleExportCoverLetterPdf}
                    >
                      Download PDF
                    </Button>
                  )}
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
                  {activeTab === "cover-letter" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={!resumeData || generatingCL}
                      onClick={() => coverLetterRef.current?.generate()}
                    >
                      {generatingCL ? "Generating..." : "Generate with AI"}
                    </Button>
                  )}
                  {activeTab === "qa" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={generatingQA}
                      onClick={() => qaRef.current?.generate()}
                    >
                      {generatingQA ? "Generating..." : "Generate with AI"}
                    </Button>
                  )}
                  {activeTab === "resume" && resumeData && (
                    <div className="ml-auto flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={undoResume}
                        disabled={!canUndoResume}
                        className="h-7 text-xs"
                      >
                        Undo
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={redoResume}
                        disabled={!canRedoResume}
                        className="h-7 text-xs"
                      >
                        Redo
                      </Button>
                    </div>
                  )}
                  {activeTab === "cover-letter" && coverLetter && (
                    <div className="ml-auto flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={undoCoverLetter}
                        disabled={!canUndoCoverLetter}
                        className="h-7 text-xs"
                      >
                        Undo
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={redoCoverLetter}
                        disabled={!canRedoCoverLetter}
                        className="h-7 text-xs"
                      >
                        Redo
                      </Button>
                    </div>
                  )}
                  {activeTab === "qa" && qaContent && qaContent.length > 0 && (
                    <div className="ml-auto flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={undoQA}
                        disabled={!canUndoQA}
                        className="h-7 text-xs"
                      >
                        Undo
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={redoQA}
                        disabled={!canRedoQA}
                        className="h-7 text-xs"
                      >
                        Redo
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tab content */}
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
                    <CoverLetterTab
                      ref={coverLetterRef}
                      content={coverLetter}
                      onChange={setCoverLetter}
                      applicationId={applicationId}
                      hasResume={!!resumeData}
                      onGeneratingChange={setGeneratingCL}
                      onNavigateToResume={() => handleTabChange("resume")}
                    />
                  )}
                  {activeTab === "qa" && (
                    <QATab
                      ref={qaRef}
                      content={qaContent}
                      onChange={setQAContent}
                      applicationId={applicationId}
                      hasResume={!!resumeData}
                      onGeneratingChange={setGeneratingQA}
                    />
                  )}
                </>
              ) : (
                <div className="min-h-full bg-gray-100 p-6 dark:bg-gray-900/50">
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
          <div className={cn("flex flex-col", user ? "w-2/5" : "w-1/2")}>
            <ChatPanel
              applicationId={applicationId}
              initialMessages={initialChatMessages}
              initialRemaining={initialRemaining}
              activeTab={activeTab}
              resumeData={resumeData}
              onSuggestionAccepted={handleSuggestionAccepted}
              onUndo={undoResume}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
