"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/types/resume";

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
    { src: "Helvetica-Oblique", fontStyle: "italic" },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 40,
    lineHeight: 1.4,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    fontSize: 9,
    color: "#555",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 2,
    marginBottom: 8,
    marginTop: 12,
    letterSpacing: 0.5,
  },
  summary: {
    marginBottom: 4,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  entryTitle: {
    fontWeight: "bold",
  },
  entrySubtitle: {
    color: "#555",
    fontSize: 9,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 8,
  },
  bulletDot: {
    width: 12,
  },
  bulletText: {
    flex: 1,
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
});

interface Props {
  data: ResumeData;
}

export function ResumePdfDocument({ data }: Props) {
  const labels = data.sectionLabels ?? {};

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Contact Info */}
        <Text style={styles.name}>{data.contactInfo.name}</Text>
        <View style={styles.contactRow}>
          {data.contactInfo.email && <Text>{data.contactInfo.email}</Text>}
          {data.contactInfo.phone && <Text>{data.contactInfo.phone}</Text>}
          {data.contactInfo.location && <Text>{data.contactInfo.location}</Text>}
          {data.contactInfo.linkedin && <Text>{data.contactInfo.linkedin}</Text>}
          {data.contactInfo.portfolio && <Text>{data.contactInfo.portfolio}</Text>}
        </View>

        {/* Summary */}
        {data.summary && (
          <>
            <Text style={styles.sectionTitle}>{labels.summary || "Summary"}</Text>
            <Text style={styles.summary}>{data.summary}</Text>
          </>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{labels.experience || "Experience"}</Text>
            {data.experience.map((exp) => (
              <View key={exp.id} style={{ marginBottom: 8 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>
                    {exp.title} — {exp.company}
                  </Text>
                  <Text style={styles.entrySubtitle}>
                    {exp.startDate} – {exp.endDate}
                  </Text>
                </View>
                {exp.location && (
                  <Text style={styles.entrySubtitle}>{exp.location}</Text>
                )}
                {exp.bullets.map((bullet, i) => (
                  <View key={i} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{labels.education || "Education"}</Text>
            {data.education.map((edu) => (
              <View key={edu.id} style={{ marginBottom: 6 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{edu.degree}</Text>
                  <Text style={styles.entrySubtitle}>{edu.graduationDate}</Text>
                </View>
                <Text style={styles.entrySubtitle}>
                  {edu.institution}
                  {edu.gpa ? ` — GPA: ${edu.gpa}` : ""}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{labels.skills || "Skills"}</Text>
            <Text>{data.skills.join(" • ")}</Text>
          </>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{labels.certifications || "Certifications"}</Text>
            {data.certifications.map((cert) => (
              <View key={cert.id} style={{ marginBottom: 4 }}>
                <Text style={styles.entryTitle}>{cert.name}</Text>
                <Text style={styles.entrySubtitle}>
                  {cert.issuer}
                  {cert.date ? ` — ${cert.date}` : ""}
                </Text>
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  );
}
