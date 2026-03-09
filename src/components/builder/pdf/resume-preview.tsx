"use client";

import type { ResumeData } from "@/lib/types/resume";

function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-auto bg-white shadow-md"
      style={{
        width: "8.5in",
        minHeight: "11in",
        padding: "0.5in",
        fontFamily: "Georgia, serif",
        fontSize: "10pt",
        lineHeight: 1.4,
        color: "#222",
      }}
    >
      {children}
    </div>
  );
}

interface Props {
  data: ResumeData;
}

export function ResumePreview({ data }: Props) {
  return (
    <PageLayout>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: "20pt", fontWeight: "bold", margin: 0 }}>
          {data.contactInfo.name}
        </h1>
        <p style={{ fontSize: "9pt", color: "#555", margin: "4px 0 0" }}>
          {[
            data.contactInfo.email,
            data.contactInfo.phone,
            data.contactInfo.location,
            data.contactInfo.linkedin,
            data.contactInfo.portfolio,
          ]
            .filter(Boolean)
            .join(" | ")}
        </p>
      </div>

      {/* Summary */}
      {data.summary && (
        <section style={{ marginBottom: 12 }}>
          <h2 style={sectionTitleStyle}>Summary</h2>
          <p style={{ margin: 0 }}>{data.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <section style={{ marginBottom: 12 }}>
          <h2 style={sectionTitleStyle}>Experience</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>
                  {exp.title} — {exp.company}
                </strong>
                <span style={{ fontSize: "9pt", color: "#555" }}>
                  {exp.startDate} – {exp.endDate}
                </span>
              </div>
              {exp.location && (
                <div style={{ fontSize: "9pt", color: "#555" }}>{exp.location}</div>
              )}
              <ul style={{ margin: "4px 0 0", paddingLeft: 16 }}>
                {exp.bullets.map((bullet, i) => (
                  <li key={i} style={{ marginBottom: 2 }}>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section style={{ marginBottom: 12 }}>
          <h2 style={sectionTitleStyle}>Education</h2>
          {data.education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{edu.degree}</strong>
                <span style={{ fontSize: "9pt", color: "#555" }}>{edu.graduationDate}</span>
              </div>
              <div style={{ fontSize: "9pt", color: "#555" }}>
                {edu.institution}
                {edu.gpa ? ` — GPA: ${edu.gpa}` : ""}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section style={{ marginBottom: 12 }}>
          <h2 style={sectionTitleStyle}>Skills</h2>
          <p style={{ margin: 0 }}>{data.skills.join(" • ")}</p>
        </section>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <section>
          <h2 style={sectionTitleStyle}>Certifications</h2>
          {data.certifications.map((cert) => (
            <div key={cert.id} style={{ marginBottom: 4 }}>
              <strong>{cert.name}</strong>
              <span style={{ fontSize: "9pt", color: "#555" }}>
                {" "}
                — {cert.issuer}
                {cert.date ? `, ${cert.date}` : ""}
              </span>
            </div>
          ))}
        </section>
      )}
    </PageLayout>
  );
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "12pt",
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  borderBottom: "1px solid #333",
  paddingBottom: 2,
  marginBottom: 8,
  marginTop: 0,
};
