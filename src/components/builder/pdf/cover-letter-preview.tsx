"use client";

import { PageLayout } from "./page-layout";

interface Props {
  content: string;
  contactName?: string;
}

export function CoverLetterPreview({ content, contactName }: Props) {
  // Split content into paragraphs so each is a section that won't be split across pages
  const paragraphs = content.split(/\n\n+/).filter(Boolean);

  return (
    <PageLayout name={contactName}>
      {/* Header with contact name */}
      {contactName && (
        <div className="mb-6 text-base font-semibold">{contactName}</div>
      )}

      {/* Each paragraph is its own section for pagination */}
      {paragraphs.map((paragraph, i) => (
        <div key={i} className="mb-4 whitespace-pre-wrap font-serif text-sm leading-relaxed">
          {paragraph}
        </div>
      ))}
    </PageLayout>
  );
}
