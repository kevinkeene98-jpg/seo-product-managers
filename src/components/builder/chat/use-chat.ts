"use client";

import { useState, useCallback, useRef } from "react";

export interface ChatMessage {
  id?: number;
  role: "user" | "assistant";
  content: string;
  targetSection?: string | null;
  suggestedContent?: unknown;
  suggestionStatus?: string | null;
}

interface UseChatOptions {
  applicationId: number;
  initialMessages: ChatMessage[];
  initialRemaining: number;
}

export function useChat({ applicationId, initialMessages, initialRemaining }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [remaining, setRemaining] = useState(initialRemaining);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string, activeTab: string) => {
      if (!content.trim() || isLoading) return;
      setError(null);

      // Add user message optimistically
      const userMsg: ChatMessage = { role: "user", content };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        abortRef.current = new AbortController();
        const res = await fetch("/api/builder/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applicationId, message: content, activeTab }),
          signal: abortRef.current.signal,
        });

        if (res.status === 429) {
          const data = await res.json();
          setError(`Daily limit reached. Resets at midnight EST.`);
          setRemaining(0);
          setIsLoading(false);
          return;
        }

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Chat failed");
        }

        // Check if it's a streaming response or JSON
        const contentType = res.headers.get("content-type") || "";

        if (contentType.includes("text/event-stream")) {
          // Streaming response
          const reader = res.body!.getReader();
          const decoder = new TextDecoder();
          let assistantContent = "";

          setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const json = line.slice(6);
              try {
                const data = JSON.parse(json);
                if (data.text) {
                  assistantContent += data.text;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: "assistant",
                      content: assistantContent,
                    };
                    return updated;
                  });
                }
                if (data.done && data.remaining !== undefined) {
                  setRemaining(data.remaining);
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        } else {
          // Non-streaming JSON response (fit assessment)
          const data = await res.json();
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.content },
          ]);
          if (data.remaining !== undefined) {
            setRemaining(data.remaining);
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Chat failed");
      } finally {
        setIsLoading(false);
      }
    },
    [applicationId, isLoading]
  );

  const acceptSuggestion = useCallback(async (messageId: number) => {
    await fetch("/api/builder/chat/suggestion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, status: "accepted" }),
    });
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, suggestionStatus: "accepted" } : m
      )
    );
  }, []);

  const dismissSuggestion = useCallback(async (messageId: number) => {
    await fetch("/api/builder/chat/suggestion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, status: "dismissed" }),
    });
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, suggestionStatus: "dismissed" } : m
      )
    );
  }, []);

  return {
    messages,
    isLoading,
    remaining,
    error,
    sendMessage,
    acceptSuggestion,
    dismissSuggestion,
    setMessages,
  };
}
