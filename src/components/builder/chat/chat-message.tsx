"use client";

import { Button } from "@/components/ui/button";
import type { ChatMessage as ChatMessageType } from "./use-chat";

function renderMarkdown(text: string) {
  // Split into lines, then process inline formatting
  const parts: React.ReactNode[] = [];
  // Process bold, italic, and inline code
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // Text before this match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      // **bold**
      parts.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3]) {
      // *italic*
      parts.push(<em key={key++}>{match[4]}</em>);
    } else if (match[5]) {
      // `code`
      parts.push(
        <code key={key++} className="rounded bg-black/10 px-1 text-xs dark:bg-white/10">
          {match[6]}
        </code>
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : [text];
}

interface Props {
  message: ChatMessageType;
  onAccept?: (id: number, sectionPath: string, content: string) => void;
  onDismiss?: (id: number) => void;
}

interface ParsedSegment {
  type: "text" | "suggestion";
  content: string;
  sectionPath?: string;
}

function parseMessageContent(text: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  const regex = /\[SUGGESTION:([^\]]+)\]\n?([\s\S]*?)\n?\[\/SUGGESTION\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text before this suggestion
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index).trim();
      if (before) segments.push({ type: "text", content: before });
    }
    segments.push({
      type: "suggestion",
      sectionPath: match[1].trim(),
      content: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last suggestion
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex).trim();
    if (remaining) segments.push({ type: "text", content: remaining });
  }

  // No suggestions found — return as plain text
  if (segments.length === 0) {
    segments.push({ type: "text", content: text });
  }

  return segments;
}

function formatSectionLabel(path: string): string {
  if (path === "summary") return "Summary";
  if (path === "skills") return "Skills";
  if (path === "coverLetter") return "Cover Letter";
  if (path === "qa") return "Q&A Prep";
  if (path.startsWith("experience.")) {
    const parts = path.split(".");
    const index = parseInt(parts[1], 10);
    if (parts[2] === "bullets") return `Experience #${index + 1} Bullets`;
    return `Experience #${index + 1}`;
  }
  return path;
}

export function ChatMessageBubble({ message, onAccept, onDismiss }: Props) {
  const isUser = message.role === "user";

  // Skip standalone suggestion-tracking messages (they're rendered inline in the main message)
  if (message.targetSection && message.content.startsWith("Suggestion for ")) {
    return null;
  }

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
          <div className="whitespace-pre-wrap">{renderMarkdown(message.content)}</div>
        </div>
      </div>
    );
  }

  // Parse assistant message for inline suggestions
  const segments = parseMessageContent(message.content);

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] space-y-2">
        {segments.map((seg, i) => {
          if (seg.type === "text") {
            return (
              <div
                key={i}
                className="rounded-lg bg-muted px-3 py-2 text-sm text-foreground"
              >
                <div className="whitespace-pre-wrap">{renderMarkdown(seg.content)}</div>
              </div>
            );
          }

          // Suggestion block
          return (
            <div
              key={i}
              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm dark:border-blue-800 dark:bg-blue-950/30"
            >
              <div className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                Suggested change: {formatSectionLabel(seg.sectionPath!)}
              </div>
              <div className="max-h-32 overflow-y-auto whitespace-pre-wrap text-xs text-muted-foreground">
                {seg.content.length > 200
                  ? seg.content.slice(0, 200) + "..."
                  : seg.content}
              </div>
              {message.id && (
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="h-7 text-xs"
                    onClick={() =>
                      onAccept?.(message.id!, seg.sectionPath!, seg.content)
                    }
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => onDismiss?.(message.id!)}
                  >
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
