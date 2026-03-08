export interface Job {
  id: number;
  serpJobId: string;
  title: string;
  companyName: string;
  companyLogoUrl: string | null;
  location: string;
  workType: "remote" | "hybrid" | "in_office" | null;
  jobType: "product" | "growth" | null;
  experienceLevel: "entry" | "mid" | "senior" | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryRaw: string | null;
  description: string;
  highlights: Array<{ title: string; items: string[] }> | null;
  applyUrl: string | null;
  source: string | null;
  postedAt: string | null;
  status: "active" | "inactive";
  lastSeenAt: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface JobFilters {
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  workType?: string;
  jobType?: string;
  experience?: string;
  newOnly?: boolean;
  sort?: string;
  page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
