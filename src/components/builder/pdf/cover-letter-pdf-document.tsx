"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

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
    fontSize: 11,
    padding: 50,
    lineHeight: 1.6,
  },
  name: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 20,
  },
  paragraph: {
    marginBottom: 12,
  },
});

interface Props {
  content: string;
  contactName?: string;
}

export function CoverLetterPdfDocument({ content, contactName }: Props) {
  const paragraphs = content.split(/\n\n+/).filter(Boolean);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {contactName && <Text style={styles.name}>{contactName}</Text>}
        {paragraphs.map((paragraph, i) => (
          <View key={i} style={styles.paragraph}>
            <Text>{paragraph}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
