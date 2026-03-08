import { formatSalary } from "@/lib/format";

interface SalaryBadgeProps {
  salaryMin: number | null;
  salaryMax: number | null;
}

export function SalaryBadge({ salaryMin, salaryMax }: SalaryBadgeProps) {
  const text = formatSalary(salaryMin, salaryMax);
  const hasSalary = salaryMin !== null || salaryMax !== null;

  return (
    <span
      className={`text-sm font-medium ${hasSalary ? "text-foreground" : "text-muted-foreground"}`}
    >
      {text}
    </span>
  );
}
