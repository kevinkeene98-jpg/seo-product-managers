"use client";

function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-auto bg-white shadow-md"
      style={{
        width: "8.5in",
        minHeight: "11in",
        padding: "1in",
        fontFamily: "Georgia, serif",
        fontSize: "11pt",
        lineHeight: 1.6,
        color: "#222",
      }}
    >
      {children}
    </div>
  );
}

interface Props {
  content: string;
}

export function CoverLetterPreview({ content }: Props) {
  return (
    <PageLayout>
      <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>
    </PageLayout>
  );
}
