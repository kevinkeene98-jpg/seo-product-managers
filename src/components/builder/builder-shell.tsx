"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { BuilderHeader } from "./builder-header";
import { TabBar } from "./tab-bar";
import { UnsavedBanner } from "./unsaved-banner";
import { ResumeTab } from "./tabs/resume-tab";
import { CoverLetterTab } from "./tabs/cover-letter-tab";
import { QATab } from "./tabs/qa-tab";
import { JobDescriptionTab } from "./tabs/job-description-tab";
import { ResumePreview } from "./pdf/resume-preview";
import { CoverLetterPreview } from "./pdf/cover-letter-preview";
import { ChatPanel } from "./chat/chat-panel";
import { useUndo } from "./use-undo";
import { useAuth } from "@/components/auth/auth-context";
import type { ChatMessage } from "./chat/use-chat";
import type { Job } from "@/lib/types";
import type { ResumeData, QAEntry, BuilderTab } from "@/lib/types/resume";

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
  const { user, openAuthDialog } = useAuth();
  const hasPromptedSignIn = useRef(false);
  const [activeTab, setActiveTab] = useState<BuilderTab>("resume");
  const [editing, setEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [remaining, setRemaining] = useState(initialRemaining);

  const {
    state: resumeData,
    set: setResumeData,
  } = useUndo<ResumeData | null>(initialResumeData);
  const [coverLetter, setCoverLetter] = useState<string | null>(initialCoverLetter);
  const [qa, setQA] = useState<QAEntry[] | null>(initialQA);

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
      } catch {
        setSaveStatus("idle");
      }
    },
    [applicationId]
  );

  const debouncedSave = useCallback(
    (field: string, content: unknown) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => save(field, content), 1000);
    },
    [save]
  );

  // Resume change handler
  const handleResumeChange = useCallback(
    (data: ResumeData) => {
      setResumeData(data);
      debouncedSave("resumeContent", data);
    },
    [setResumeData, debouncedSave]
  );

  const handleResumeParsed = useCallback(
    (data: ResumeData) => {
      setResumeData(data);
      save("resumeContent", data);
      // Prompt anonymous users to sign in after parsing resume
      if (!user && !hasPromptedSignIn.current) {
        hasPromptedSignIn.current = true;
        setTimeout(() => {
          openAuthDialog("Sign in to save your resume and track applications");
        }, 2000);
      }
    },
    [setResumeData, save, user, openAuthDialog]
  );

  // Cover letter change handler
  const handleCoverLetterChange = useCallback(
    (content: string) => {
      setCoverLetter(content);
      debouncedSave("coverLetterContent", content);
    },
    [debouncedSave]
  );

  // QA change handler
  const handleQAChange = useCallback(
    (content: QAEntry[]) => {
      setQA(content);
      debouncedSave("qaContent", content);
    },
    [debouncedSave]
  );

  // Handle suggestion acceptance from chat
  const handleSuggestionAccepted = useCallback(
    (sectionPath: string, content: unknown) => {
      if (sectionPath === "coverLetter" && typeof content === "string") {
        setCoverLetter(content);
        save("coverLetterContent", content);
        return;
      }

      if (sectionPath === "qa" && Array.isArray(content)) {
        setQA(content as QAEntry[]);
        save("qaContent", content);
        return;
      }

      if (!resumeData) return;

      // Apply to resume data
      const updated = { ...resumeData };
      if (sectionPath === "summary" && typeof content === "string") {
        updated.summary = content;
      } else if (sectionPath === "skills" && typeof content === "string") {
        updated.skills = content.split(",").map((s) => s.trim());
      } else if (sectionPath.startsWith("experience.")) {
        const parts = sectionPath.split(".");
        const index = parseInt(parts[1], 10);
        if (parts[2] === "bullets" && typeof content === "string") {
          const experience = [...updated.experience];
          experience[index] = {
            ...experience[index],
            bullets: content.split("\n").filter(Boolean),
          };
          updated.experience = experience;
        }
      }

      setResumeData(updated);
      save("resumeContent", updated);
    },
    [resumeData, setResumeData, save]
  );

  // Export PDF
  const handleExportPdf = useCallback(async () => {
    if (!resumeData) return;
    const { exportResumePdf } = await import("./pdf/export-pdf");
    await exportResumePdf(resumeData);
  }, [resumeData]);

  // Clear save timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // Determine what to show on left panel
  const renderLeftPanel = () => {
    if (activeTab === "job-description") {
      return (
        <div className="flex-1 overflow-y-auto">
          <JobDescriptionTab job={job} />
        </div>
      );
    }

    if (editing) {
      // Show editor
      return (
        <div className="flex-1 overflow-y-auto">
          {activeTab === "resume" && (
            <ResumeTab
              data={resumeData}
              onParsed={handleResumeParsed}
              onChange={handleResumeChange}
            />
          )}
          {activeTab === "cover-letter" && (
            <CoverLetterTab
              content={coverLetter}
              onChange={handleCoverLetterChange}
            />
          )}
          {activeTab === "qa" && (
            <QATab content={qa} onChange={handleQAChange} />
          )}
        </div>
      );
    }

    // Show preview
    return (
      <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
        {activeTab === "resume" && resumeData && (
          <ResumePreview data={resumeData} />
        )}
        {activeTab === "resume" && !resumeData && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">No resume yet</p>
              <p className="text-sm">Click Edit to upload or paste your resume.</p>
            </div>
          </div>
        )}
        {activeTab === "cover-letter" && coverLetter && (
          <CoverLetterPreview content={coverLetter} />
        )}
        {activeTab === "cover-letter" && !coverLetter && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">No cover letter yet</p>
              <p className="text-sm">
                Ask the AI assistant to write one, or click Edit.
              </p>
            </div>
          </div>
        )}
        {activeTab === "qa" && qa && qa.length > 0 && (
          <div className="mx-auto max-w-2xl space-y-4 bg-white p-6 shadow-md">
            {qa.map((entry, i) => (
              <div key={i}>
                <p className="font-semibold">Q: {entry.question}</p>
                <p className="text-muted-foreground">A: {entry.answer}</p>
              </div>
            ))}
          </div>
        )}
        {activeTab === "qa" && (!qa || qa.length === 0) && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">No Q&A prep yet</p>
              <p className="text-sm">
                Ask the AI assistant to generate interview questions.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const showEditToggle = activeTab !== "job-description";
  // For resume tab, only show edit if resume exists (upload step is always edit mode)
  const needsInput = activeTab === "resume" && !resumeData;

  return (
    <div className="flex h-screen flex-col">
      <BuilderHeader
        jobId={job.id}
        jobTitle={job.title}
        companyName={job.companyName}
        remainingMessages={remaining}
        resumeData={resumeData}
        onExportPdf={handleExportPdf}
        saveStatus={saveStatus}
      />

      {!user && <UnsavedBanner />}

      <div className="flex min-h-0 flex-1">
        {/* Left panel */}
        <div className="flex min-h-0 flex-1 flex-col border-r">
          <div className="flex items-center border-b">
            <div className="flex-1">
              <TabBar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setEditing(false); }} />
            </div>
            {showEditToggle && !needsInput && (
              <button
                onClick={() => setEditing(!editing)}
                className="mr-3 rounded px-3 py-1 text-sm font-medium text-primary hover:bg-muted"
              >
                {editing ? "Done" : "Edit"}
              </button>
            )}
          </div>

          {needsInput ? (
            <div className="flex-1 overflow-y-auto">
              <ResumeTab
                data={resumeData}
                onParsed={handleResumeParsed}
                onChange={handleResumeChange}
              />
            </div>
          ) : (
            renderLeftPanel()
          )}
        </div>

        {/* Right panel — Chat */}
        <div className="hidden w-[380px] flex-col md:flex">
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
