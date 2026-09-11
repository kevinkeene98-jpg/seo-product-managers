import type { JobProvider, RawJobResult, SearchQuery } from "./types";

interface SerpApiJob {
  job_id: string;
  title: string;
  company_name: string;
  thumbnail?: string;
  location: string;
  via?: string;
  description: string;
  share_link?: string;
  extensions?: string[];
  detected_extensions?: {
    posted_at?: string;
    schedule_type?: string;
    salary?: string;
    work_from_home?: boolean;
    [key: string]: unknown;
  };
  job_highlights?: Array<{ title: string; items: string[] }>;
  apply_options?: Array<{ title: string; link: string }>;
}

interface SerpApiResponse {
  jobs_results?: SerpApiJob[];
  serpapi_pagination?: {
    next_page_token?: string;
    next?: string;
  };
  error?: string;
}

const MAX_PAGES = 3;

export class SerpProvider implements JobProvider {
  name = "serpapi";

  async search(query: SearchQuery): Promise<RawJobResult[]> {
    const apiKey = process.env.SERPAPI_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("SERPAPI_API_KEY is not configured");
    }
    const allResults: RawJobResult[] = [];
    let nextPageToken: string | undefined;

    for (let page = 0; page < MAX_PAGES; page++) {
      const params = new URLSearchParams({
        engine: "google_jobs",
        q: query.keyword,
        location: query.location,
        api_key: apiKey,
        hl: "en",
        gl: "us",
      });

      if (query.locationExtra) {
        for (const [key, value] of Object.entries(query.locationExtra)) {
          params.set(key, value);
        }
      }

      if (nextPageToken) {
        params.set("next_page_token", nextPageToken);
      }

      const url = `https://serpapi.com/search.json?${params.toString()}`;

      const response = await fetch(url, {
        signal: AbortSignal.timeout(30_000),
        cache: "no-store",
      });
      const data: SerpApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          `SerpApi request failed: ${response.status} ${data.error || response.statusText}`
        );
      }

      // Google Jobs reports an exhausted/empty search in the error field.
      // In particular, this must not discard jobs from earlier pages.
      if (data.error === "Google hasn't returned any results for this query.") break;
      if (data.error) {
        throw new Error(`SerpApi error: ${data.error}`);
      }

      const jobs = data.jobs_results || [];
      if (jobs.length === 0) break;

      for (const job of jobs) {
        allResults.push(this.mapToRawResult(job));
      }

      nextPageToken = data.serpapi_pagination?.next_page_token;
      if (!nextPageToken) break;
    }

    return allResults;
  }

  private mapToRawResult(job: SerpApiJob): RawJobResult {
    const ext = job.detected_extensions || {};
    return {
      externalId: job.job_id,
      title: job.title,
      companyName: job.company_name,
      companyLogoUrl: job.thumbnail || null,
      location: job.location,
      description: job.description,
      highlights: job.job_highlights || null,
      applyUrl:
        job.apply_options?.[0]?.link || job.share_link || null,
      salaryRaw: ext.salary || this.extractSalaryFromExtensions(job.extensions),
      postedAtRaw: ext.posted_at || null,
      extensions: job.extensions || [],
      detectedExtensions: {
        workFromHome: ext.work_from_home,
        scheduleType: ext.schedule_type,
        salary: ext.salary,
        postedAt: ext.posted_at,
      },
      rawData: job as unknown as Record<string, unknown>,
    };
  }

  private extractSalaryFromExtensions(
    extensions?: string[]
  ): string | null {
    if (!extensions) return null;
    const salaryExt = extensions.find((e) => /\$[\d,]+/.test(e));
    return salaryExt || null;
  }
}
