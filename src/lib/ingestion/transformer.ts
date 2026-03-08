import { subDays, subWeeks, subMonths, subHours } from "date-fns";
import { RawJobResult } from "./types";

export interface JobInsertData {
  serpJobId: string;
  title: string;
  companyName: string;
  companyLogoUrl: string | null;
  location: string;
  workType: "remote" | "hybrid" | "in_office";
  jobType: "product" | "growth";
  experienceLevel: "entry" | "mid" | "senior";
  salaryMin: number | null;
  salaryMax: number | null;
  salaryRaw: string | null;
  description: string;
  highlights: unknown;
  applyUrl: string | null;
  source: string;
  postedAt: Date | null;
  status: "active";
  lastSeenAt: Date;
  missedCrawlCount: number;
  searchKeyword: string;
  searchLocation: string;
  rawSerpData: unknown;
}

export function transformToJobInsert(
  raw: RawJobResult,
  searchKeyword: string,
  searchLocation: string
): JobInsertData {
  return {
    serpJobId: raw.externalId,
    title: raw.title,
    companyName: raw.companyName,
    companyLogoUrl: raw.companyLogoUrl,
    location: raw.location,
    workType: classifyWorkType(raw),
    jobType: classifyJobType(searchKeyword),
    experienceLevel: classifyExperience(raw.title, raw.description),
    salaryMin: parseSalary(raw.salaryRaw).min,
    salaryMax: parseSalary(raw.salaryRaw).max,
    salaryRaw: raw.salaryRaw,
    description: raw.description,
    highlights: raw.highlights,
    applyUrl: raw.applyUrl,
    source: "serpapi",
    postedAt: parsePostedAt(raw.postedAtRaw),
    status: "active",
    lastSeenAt: new Date(),
    missedCrawlCount: 0,
    searchKeyword,
    searchLocation,
    rawSerpData: raw.rawData,
  };
}

function classifyWorkType(
  raw: RawJobResult
): "remote" | "hybrid" | "in_office" {
  if (raw.detectedExtensions.workFromHome === true) return "remote";

  const extStr = raw.extensions.join(" ").toLowerCase();
  if (extStr.includes("work from home") || extStr.includes("remote"))
    return "remote";
  if (extStr.includes("hybrid")) return "hybrid";

  const locLower = raw.location.toLowerCase();
  if (locLower.includes("remote") || locLower === "anywhere") return "remote";

  return "in_office";
}

function classifyJobType(searchKeyword: string): "product" | "growth" {
  return searchKeyword.toLowerCase().includes("growth")
    ? "growth"
    : "product";
}

function classifyExperience(
  title: string,
  description: string
): "entry" | "mid" | "senior" {
  const text = `${title} ${description.slice(0, 500)}`.toLowerCase();

  const seniorPatterns = [
    /\bsenior\b/,
    /\bsr\.\b/,
    /\bsr\b/,
    /\blead\b/,
    /\bhead of\b/,
    /\bdirector\b/,
    /\bprincipal\b/,
    /\bstaff\b/,
    /\bvp\b/,
    /\bvice president\b/,
  ];
  const entryPatterns = [
    /\bjunior\b/,
    /\bjr\.\b/,
    /\bjr\b/,
    /\bentry[- ]level\b/,
    /\bassociate\b/,
    /\bintern\b/,
    /\bearly career\b/,
  ];

  // Check title first (more weight)
  const titleLower = title.toLowerCase();
  for (const p of seniorPatterns) {
    if (p.test(titleLower)) return "senior";
  }
  for (const p of entryPatterns) {
    if (p.test(titleLower)) return "entry";
  }

  // Then check description
  for (const p of seniorPatterns) {
    if (p.test(text)) return "senior";
  }
  for (const p of entryPatterns) {
    if (p.test(text)) return "entry";
  }

  return "mid";
}

function parseSalary(raw: string | null): {
  min: number | null;
  max: number | null;
} {
  if (!raw) return { min: null, max: null };

  // Normalize the string
  const s = raw.replace(/,/g, "").toLowerCase();

  // Check if hourly rate
  const isHourly = /\b(hour|hr)\b/.test(s);
  const multiplier = isHourly ? 2080 : 1;

  // Extract numbers with optional K suffix
  const matches = s.match(/\$?([\d.]+)\s*k?/g);
  if (!matches || matches.length === 0) return { min: null, max: null };

  const numbers = matches.map((m) => {
    const num = parseFloat(m.replace(/[^0-9.]/g, ""));
    const hasK = /k/i.test(m);
    return (hasK ? num * 1000 : num) * multiplier;
  });

  // Filter out unreasonably small numbers (likely not salary)
  const salaryNumbers = numbers.filter((n) => n >= 10000);

  if (salaryNumbers.length === 0) {
    // Maybe hourly that didn't get multiplied properly
    const smallNumbers = numbers.filter((n) => n >= 10 && n < 10000);
    if (smallNumbers.length > 0 && isHourly) {
      const sorted = smallNumbers.sort((a, b) => a - b);
      return {
        min: Math.round(sorted[0]),
        max: Math.round(sorted[sorted.length - 1]),
      };
    }
    return { min: null, max: null };
  }

  const sorted = salaryNumbers.sort((a, b) => a - b);
  return {
    min: Math.round(sorted[0]),
    max: Math.round(sorted[sorted.length - 1]),
  };
}

function parsePostedAt(raw: string | null): Date | null {
  if (!raw) return null;

  const s = raw.toLowerCase().trim();
  const now = new Date();

  const hourMatch = s.match(/(\d+)\s*hours?\s*ago/);
  if (hourMatch) return subHours(now, parseInt(hourMatch[1]));

  const dayMatch = s.match(/(\d+)\s*days?\s*ago/);
  if (dayMatch) return subDays(now, parseInt(dayMatch[1]));

  const weekMatch = s.match(/(\d+)\s*weeks?\s*ago/);
  if (weekMatch) return subWeeks(now, parseInt(weekMatch[1]));

  const monthMatch = s.match(/(\d+)\s*months?\s*ago/);
  if (monthMatch) return subMonths(now, parseInt(monthMatch[1]));

  return null;
}
