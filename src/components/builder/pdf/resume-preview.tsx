"use client";

import { PageLayout } from "./page-layout";
import type { ResumeData } from "@/lib/types/resume";

interface Props {
  data: ResumeData;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 mt-3 border-b border-gray-800 pb-0.5 text-xs font-bold uppercase tracking-wider">
      {children}
    </h2>
  );
}

export function ResumePreview({ data }: Props) {
  const labels = data.sectionLabels ?? {};

  return (
    <PageLayout name={data.contactInfo.name}>
      {/* Contact Info */}
      <div>
        <h1 className="mb-1 text-xl font-bold">{data.contactInfo.name}</h1>
        <div className="mb-4 flex flex-wrap gap-2 text-[9px] text-gray-500">
          {data.contactInfo.email && <span>{data.contactInfo.email}</span>}
          {data.contactInfo.phone && <span>{data.contactInfo.phone}</span>}
          {data.contactInfo.location && <span>{data.contactInfo.location}</span>}
          {data.contactInfo.linkedin && <span>{data.contactInfo.linkedin}</span>}
          {data.contactInfo.portfolio && <span>{data.contactInfo.portfolio}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div>
          <SectionHeading>{labels.summary || "Summary"}</SectionHeading>
          <p className="mb-1">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div>
          <SectionHeading>{labels.experience || "Experience"}</SectionHeading>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-2">
              <div className="flex items-start justify-between">
                <span className="font-bold">
                  {exp.title} — {exp.company}
                </span>
                <span className="shrink-0 text-[9px] text-gray-500">
                  {exp.startDate} – {exp.endDate}
                </span>
              </div>
              {exp.location && (
                <div className="text-[9px] text-gray-500">{exp.location}</div>
              )}
              <div className="mt-0.5 space-y-0.5 pl-2">
                {exp.bullets.map((bullet, i) => (
                  <div key={i}>{bullet}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div>
          <SectionHeading>{labels.education || "Education"}</SectionHeading>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-1.5">
              <div className="flex items-start justify-between">
                <span className="font-bold">{edu.degree}</span>
                <span className="text-[9px] text-gray-500">{edu.graduationDate}</span>
              </div>
              <div className="text-[9px] text-gray-500">
                {edu.institution}
                {edu.gpa ? ` — GPA: ${edu.gpa}` : ""}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div>
          <SectionHeading>{labels.skills || "Skills"}</SectionHeading>
          <p>{data.skills.join(", ")}</p>
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div>
          <SectionHeading>{labels.certifications || "Certifications"}</SectionHeading>
          {data.certifications.map((cert) => (
            <div key={cert.id} className="mb-1">
              <span className="font-bold">{cert.name}</span>
              <div className="text-[9px] text-gray-500">
                {cert.issuer}
                {cert.date ? ` — ${cert.date}` : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
