export interface ResumeData {
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  certifications?: CertificationEntry[];
}

export interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  graduationDate: string;
  gpa?: string;
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  date?: string;
}

export interface ApplicationState {
  resumeContent: ResumeData | null;
  coverLetterContent: string | null;
  qaContent: QAEntry[] | null;
  fitAssessment: string | null;
}

export interface QAEntry {
  question: string;
  answer: string;
}

export type BuilderTab = "resume" | "cover-letter" | "qa" | "job-description";
