"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessageBubble } from "./chat-message";
import { ChatInput } from "./chat-input";
import { useChat, type ChatMessage } from "./use-chat";
import type { BuilderTab, ResumeData } from "@/lib/types/resume";

interface Props {
  applicationId: number;
  initialMessages: ChatMessage[];
  initialRemaining: number;
  activeTab: BuilderTab;
  resumeData: ResumeData | null;
  onSuggestionAccepted?: (sectionPath: string, content: unknown) => void;
  onUndo?: () => void;
}

export function ChatPanel({
  applicationId,
  initialMessages,
  initialRemaining,
  activeTab,
  resumeData,
  onSuggestionAccepted,
  onUndo,
}: Props) {
  const {
    messages,
    isLoading,
    remaining,
    error,
    sendMessage,
    acceptSuggestion,
    dismissSuggestion,
  } = useChat({ applicationId, initialMessages, initialRemaining });

  const scrollRef = useRef<HTMLDivElement>(null);
  const hasTriggeredAssessment = useRef(false);

  // Auto-scroll only when a new message is added (not during streaming updates)
  const messageCount = messages.length;
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messageCount]);

  // Auto-trigger fit assessment on first load if resume exists and no messages
  useEffect(() => {
    if (
      resumeData &&
      initialMessages.length === 0 &&
      !hasTriggeredAssessment.current
    ) {
      hasTriggeredAssessment.current = true;
      sendMessage("Please assess my fit for this role and suggest improvements to my resume.", activeTab);
    }
  }, [resumeData, initialMessages.length, sendMessage, activeTab]);

  const handleAccept = (sectionPath: string, content: string) => {
    onSuggestionAccepted?.(sectionPath, content);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-3 py-2">
        <h3 className="text-sm font-semibold">AI Assistant</h3>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="space-y-3 p-3">
          {messages.length === 0 && !isLoading && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {resumeData
                ? "Getting your fit assessment..."
                : "Upload your resume to get started. The AI will assess your fit for this role."}
            </p>
          )}
          {messages.map((msg, i) => (
            <ChatMessageBubble
              key={msg.id || i}
              message={msg}
              onAccept={handleAccept}
              onUndo={onUndo}
            />
          ))}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="border-t px-3 py-2 text-sm text-red-500">{error}</div>
      )}

      <ChatInput
        onSend={(msg) => sendMessage(msg, activeTab)}
        disabled={isLoading}
        remaining={remaining}
      />
    </div>
  );
}
