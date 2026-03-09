"use client";

import { ResumeInputStep } from "./resume-input-step";
import { ResumeSectionEditor } from "./resume-section-editor";
import type { ResumeData } from "@/lib/types/resume";

interface Props {
  data: ResumeData | null;
  onParsed: (data: ResumeData) => void;
  onChange: (data: ResumeData) => void;
}

export function ResumeTab({ data, onParsed, onChange }: Props) {
  if (!data) {
    return <ResumeInputStep onParsed={onParsed} />;
  }

  return <ResumeSectionEditor data={data} onChange={onChange} />;
}
