"use client";

import { pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import { ResumePdfDocument } from "./resume-pdf-document";
import type { ResumeData } from "@/lib/types/resume";

export async function exportResumePdf(data: ResumeData, filename?: string) {
  const doc = createElement(ResumePdfDocument, { data });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = await pdf(doc as any).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `${data.contactInfo.name.replace(/\s+/g, "_")}_Resume.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
