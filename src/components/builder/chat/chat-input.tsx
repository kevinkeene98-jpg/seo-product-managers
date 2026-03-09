"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  onSend: (message: string) => void;
  disabled: boolean;
  remaining: number;
}

export function ChatInput({ onSend, disabled, remaining }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    if (!value.trim() || disabled || remaining <= 0) return;
    onSend(value.trim());
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, remaining, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const atLimit = remaining <= 0;

  return (
    <div className="border-t p-3">
      {atLimit ? (
        <p className="py-2 text-center text-sm text-muted-foreground">
          Daily limit reached. Resets at midnight EST.
        </p>
      ) : (
        <>
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                // Auto-resize
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask for resume advice..."
              rows={1}
              className="min-h-[36px] flex-1 resize-none"
              disabled={disabled}
            />
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={disabled || !value.trim()}
              className="shrink-0 self-end"
            >
              Send
            </Button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {remaining} message{remaining !== 1 ? "s" : ""} remaining today
          </p>
        </>
      )}
    </div>
  );
}
