"use client";

import { useState, useCallback, useRef } from "react";

const MAX_HISTORY = 50;

export function useUndo<T>(initialState: T) {
  const [state, setState] = useState(initialState);
  const pastRef = useRef<T[]>([]);
  const futureRef = useRef<T[]>([]);

  // Replace imported/generated content without retaining intermediate edits.
  const replace = useCallback((newState: T) => {
    pastRef.current = [];
    futureRef.current = [];
    setState(() => newState);
  }, []);

  const set = useCallback((newState: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof newState === "function" ? (newState as (prev: T) => T)(prev) : newState;
      pastRef.current = [...pastRef.current.slice(-MAX_HISTORY + 1), prev];
      futureRef.current = [];
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setState((current) => {
      if (pastRef.current.length === 0) return current;
      const previous = pastRef.current[pastRef.current.length - 1];
      pastRef.current = pastRef.current.slice(0, -1);
      futureRef.current = [current, ...futureRef.current];
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    setState((current) => {
      if (futureRef.current.length === 0) return current;
      const next = futureRef.current[0];
      futureRef.current = futureRef.current.slice(1);
      pastRef.current = [...pastRef.current, current];
      return next;
    });
  }, []);

  const canUndo = pastRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  return { state, set, replace, undo, redo, canUndo, canRedo };
}
