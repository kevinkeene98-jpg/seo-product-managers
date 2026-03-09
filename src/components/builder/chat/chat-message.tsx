"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ChatMessage as ChatMessageType } from "./use-chat";

/** Render inline markdown: **bold**, *italic*, `code` */
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={key++}>{match[4]}</em>);
    } else if (match[5]) {
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

/** Parse markdown text into structured blocks */
function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headings
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      const className =
        level === 1
          ? "text-base font-bold mt-3 mb-1"
          : level === 2
            ? "text-sm font-bold mt-3 mb-1"
            : "text-sm font-semibold mt-2 mb-0.5";
      elements.push(
        <div key={key++} className={className}>
          {renderInline(content)}
        </div>
      );
      i++;
      continue;
    }

    // Unordered list items (collect consecutive)
    if (/^\s*[-*]\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^\s*[-*]\s+/, "");
        items.push(
          <li key={key++} className="flex gap-1.5">
            <span className="shrink-0 text-muted-foreground">&#8226;</span>
            <span>{renderInline(itemText)}</span>
          </li>
        );
        i++;
      }
      elements.push(
        <ul key={key++} className="my-1 space-y-0.5 pl-1">
          {items}
        </ul>
      );
      continue;
    }

    // Numbered list items (collect consecutive)
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      let num = 1;
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^\s*\d+[.)]\s+/, "");
        items.push(
          <li key={key++} className="flex gap-1.5">
            <span className="shrink-0 text-muted-foreground">{num}.</span>
            <span>{renderInline(itemText)}</span>
          </li>
        );
        num++;
        i++;
      }
      elements.push(
        <ol key={key++} className="my-1 space-y-0.5 pl-1">
          {items}
        </ol>
      );
      continue;
    }

    // Empty line = paragraph break
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Regular paragraph — collect consecutive non-empty, non-special lines
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^#{1,4}\s+/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+[.)]\s+/.test(lines[i])
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }
    if (paragraphLines.length > 0) {
      elements.push(
        <p key={key++} className="my-1">
          {renderInline(paragraphLines.join(" "))}
        </p>
      );
    }
  }

  return <>{elements}</>;
}

interface Props {
  message: ChatMessageType;
  onAccept?: (sectionPath: string, content: string) => void;
  onDismiss?: () => void;
  onUndo?: () => void;
}

interface ParsedSegment {
  type: "text" | "suggestion";
  content: string;
  sectionPath?: string;
  title?: string;
}

function parseMessageContent(text: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  const regex = /\[SUGGESTION:([^\]]+)\]\n?([\s\S]*?)\n?\[\/SUGGESTION\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index).trim();
      if (before) segments.push({ type: "text", content: before });
    }
    // Parse "section_path|Title" or just "section_path"
    const header = match[1].trim();
    const pipeIndex = header.indexOf("|");
    const sectionPath = pipeIndex >= 0 ? header.slice(0, pipeIndex).trim() : header;
    const title = pipeIndex >= 0 ? header.slice(pipeIndex + 1).trim() : undefined;
    segments.push({
      type: "suggestion",
      sectionPath,
      title,
      content: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex).trim();
    if (remaining) segments.push({ type: "text", content: remaining });
  }

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

function SuggestionBlock({
  segment,
  onAccept,
  onDismiss,
  onUndo,
}: {
  segment: ParsedSegment;
  onAccept?: (sectionPath: string, content: string) => void;
  onDismiss?: () => void;
  onUndo?: () => void;
}) {
  const [status, setStatus] = useState<"pending" | "accepted" | "dismissed">("pending");
  const label = segment.title || formatSectionLabel(segment.sectionPath!);

  if (status === "dismissed") {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900/30">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{label}</span>
            {" "}&mdash; dismissed
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-xs text-muted-foreground"
            onClick={() => setStatus("pending")}
          >
            Reopen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm dark:border-blue-800 dark:bg-blue-950/30">
      <div className="mb-1 text-sm font-bold text-foreground">
        {label}
      </div>
      <div className="max-h-32 overflow-y-auto whitespace-pre-wrap text-xs text-muted-foreground">
        {segment.content}
      </div>
      {status === "pending" && (
        <div className="mt-2 flex gap-2">
          <Button
            size="sm"
            variant="default"
            className="h-7 text-xs"
            onClick={() => {
              setStatus("accepted");
              onAccept?.(segment.sectionPath!, segment.content);
            }}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={() => {
              setStatus("dismissed");
              onDismiss?.();
            }}
          >
            Dismiss
          </Button>
        </div>
      )}
      {status === "accepted" && (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs font-medium text-green-600 dark:text-green-400">
            Applied
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-xs text-muted-foreground"
            onClick={() => {
              setStatus("pending");
              onUndo?.();
            }}
          >
            Undo
          </Button>
        </div>
      )}
    </div>
  );
}

export function ChatMessageBubble({ message, onAccept, onDismiss, onUndo }: Props) {
  const isUser = message.role === "user";

  // Skip standalone suggestion-tracking messages
  if (message.targetSection && message.content.startsWith("Suggestion for ")) {
    return null;
  }

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
          {renderMarkdown(message.content)}
        </div>
      </div>
    );
  }

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
                {renderMarkdown(seg.content)}
              </div>
            );
          }

          return (
            <SuggestionBlock
              key={i}
              segment={seg}
              onAccept={onAccept}
              onDismiss={onDismiss}
              onUndo={onUndo}
            />
          );
        })}
      </div>
    </div>
  );
}
