export function formatSalary(
  min: number | null,
  max: number | null
): string {
  if (min === null && max === null) return "Salary not listed";

  const fmt = (n: number) => {
    if (n >= 1000) return `$${Math.round(n / 1000)}K`;
    return `$${n}`;
  };

  if (min !== null && max !== null) {
    if (min === max) return fmt(min);
    return `${fmt(min)} - ${fmt(max)}`;
  }
  if (min !== null) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

export function isNewJob(createdAt: string | Date | null): boolean {
  if (!createdAt) return false;
  const date = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return date > sevenDaysAgo;
}

export function formatWorkType(type: string | null): string {
  if (!type) return "Unknown";
  const map: Record<string, string> = {
    remote: "Remote",
    hybrid: "Hybrid",
    in_office: "In Office",
  };
  return map[type] || type;
}

export function formatExperience(level: string | null): string {
  if (!level) return "Unknown";
  const map: Record<string, string> = {
    entry: "Entry Level",
    mid: "Mid Level",
    senior: "Senior",
  };
  return map[level] || level;
}

export function formatJobType(type: string | null): string {
  if (!type) return "Unknown";
  const map: Record<string, string> = {
    product: "Product",
    growth: "Growth",
  };
  return map[type] || type;
}

export function timeAgo(date: string | Date | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return "1 month ago";
  return `${Math.floor(diffDays / 30)} months ago`;
}
