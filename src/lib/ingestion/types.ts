export interface RawJobResult {
  externalId: string;
  title: string;
  companyName: string;
  companyLogoUrl: string | null;
  location: string;
  description: string;
  highlights: Array<{ title: string; items: string[] }> | null;
  applyUrl: string | null;
  salaryRaw: string | null;
  postedAtRaw: string | null;
  extensions: string[];
  detectedExtensions: {
    workFromHome?: boolean;
    scheduleType?: string;
    salary?: string;
    postedAt?: string;
  };
  rawData: Record<string, unknown>;
}

export interface SearchQuery {
  keyword: string;
  location: string;
  locationExtra?: Record<string, string>;
}

export interface JobProvider {
  name: string;
  search(query: SearchQuery): Promise<RawJobResult[]>;
}

export interface CrawlSummary {
  totalNew: number;
  totalUpdated: number;
  totalDeactivated: number;
  totalErrors: number;
  queries: number;
}
