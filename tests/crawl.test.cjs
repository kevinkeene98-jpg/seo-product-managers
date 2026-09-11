/* eslint-disable @typescript-eslint/no-require-imports -- Node's CommonJS test harness */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

// Load the real TypeScript modules with isolated external services.
function load(file, dependencies = {}, globals = {}) {
  const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, URLSearchParams, AbortSignal, Date, Error,
    console: { error() {} },
    process: { env: { SERPAPI_API_KEY: "test-key", CRON_SECRET: "test-secret" } },
    require(name) {
      if (!(name in dependencies)) throw new Error(`Unexpected import: ${name}`);
      return dependencies[name];
    },
    ...globals,
  }, { filename: file });
  return exports;
}

const query = { keyword: "SEO product manager", location: "United States" };

test("missing optional payment credentials do not prevent importing the app", () => {
  const { getStripe } = load("src/lib/stripe/client.ts", {
    stripe: { default: class { constructor() { assert.fail("must not construct without key"); } } },
  }, { process: { env: {} } });
  assert.throws(getStripe, /STRIPE_SECRET_KEY is not set/);
});

test("missing optional email credentials do not prevent importing the app", async () => {
  const { sendJobAlertEmail } = load("src/lib/email/client.ts", {
    resend: { Resend: class { constructor() { assert.fail("must not construct without key"); } } },
  }, { process: { env: {} } });
  await assert.rejects(sendJobAlertEmail("test@example.com", []), /RESEND_API_KEY is not set/);
});
const job = {
  job_id: "job-1", title: "SEO Product Manager", company_name: "Example",
  location: "Anywhere", description: "Manage SEO products",
  apply_options: [{ link: "https://example.com/apply" }],
};

test("pagination keeps earlier jobs when Google reports no more results", async () => {
  const calls = [];
  const { SerpProvider } = load("src/lib/ingestion/serp-provider.ts", {}, {
    fetch: async (url, options) => {
      calls.push({ url: new URL(url), options });
      return Response.json(calls.length === 1
        ? { jobs_results: [job], serpapi_pagination: { next_page_token: "page-2" } }
        : { error: "Google hasn't returned any results for this query." });
    },
  });
  const results = await new SerpProvider().search(query);
  assert.equal(results.length, 1);
  assert.equal(results[0].applyUrl, "https://example.com/apply");
  assert.equal(calls[1].url.searchParams.get("next_page_token"), "page-2");
  assert.equal(calls[0].options.cache, "no-store");
  assert.ok(calls[0].options.signal instanceof AbortSignal);
});

test("missing API key fails before any network request", async () => {
  const { SerpProvider } = load("src/lib/ingestion/serp-provider.ts", {}, {
    process: { env: { SERPAPI_API_KEY: "  " } },
    fetch: () => assert.fail("must not call SerpApi without a key"),
  });
  await assert.rejects(new SerpProvider().search(query), /SERPAPI_API_KEY is not configured/);
});

test("quota and authentication errors retain the upstream explanation", async () => {
  for (const status of [401, 429]) {
    const { SerpProvider } = load("src/lib/ingestion/serp-provider.ts", {}, {
      fetch: async () => Response.json({ error: "Account search limit reached" }, { status }),
    });
    await assert.rejects(new SerpProvider().search(query), new RegExp(`${status} Account search limit reached`));
  }
});

test("HTTP failures are not mistaken for an empty successful search", async () => {
  const { SerpProvider } = load("src/lib/ingestion/serp-provider.ts", {}, {
    fetch: async () => Response.json({ error: "Google hasn't returned any results for this query." }, { status: 500 }),
  });
  await assert.rejects(new SerpProvider().search(query), /500/);
});

const constants = load("src/lib/constants.ts");

function crawlHarness(failSearch) {
  const queries = [];
  const writes = [];
  const jobs = { status: "status", lastSeenAt: "lastSeenAt", missedCrawlCount: "missedCrawlCount" };
  const crawlLogs = { id: "id" };
  const db = {
    insert: () => ({ values: () => ({ returning: async () => [{ id: 1 }] }) }),
    update: (table) => ({ set: (values) => ({ where: () => {
      writes.push({ table, values });
      return { returning: async () => [] };
    } }) }),
  };
  const op = (...args) => args;
  const { runCrawl } = load("src/lib/ingestion/orchestrator.ts", {
    "drizzle-orm": { eq: op, and: op, lt: op, ilike: op, sql: op },
    "@/db": { db },
    "@/db/schema": { jobs, crawlLogs },
    "@/lib/constants": constants,
    "./serp-provider": { SerpProvider: class {
      async search(q) {
        queries.push(q);
        if (failSearch(queries.length)) throw new Error("SerpApi unavailable");
        return [];
      }
    } },
    "./transformer": {},
    "./brandfetch": { clearLogoCache() {} },
  });
  return { runCrawl, queries, writes, jobs };
}

test("fully and partially failed crawls never expire existing jobs", async () => {
  for (const fail of [() => true, (n) => n === 2]) {
    const h = crawlHarness(fail);
    const summary = await h.runCrawl();
    assert.ok(summary.totalErrors > 0);
    assert.equal(summary.totalDeactivated, 0);
    assert.equal(h.writes.filter((w) => w.table === h.jobs).length, 0);
    assert.equal(h.queries.length, 12);
  }
});

test("successful crawls run freshness updates and use remote search text", async () => {
  const h = crawlHarness(() => false);
  const summary = await h.runCrawl();
  assert.equal(summary.totalErrors, 0);
  assert.equal(h.writes.filter((w) => w.table === h.jobs).length, 2);
  assert.equal(h.queries[0].keyword, "SEO product manager remote");
  assert.equal(h.queries[1].keyword, "SEO product manager");
  assert.equal(h.queries[0].locationExtra, undefined);
});

test("cron reports partial failures as HTTP 502 and successful runs as 200", async () => {
  for (const totalErrors of [0, 1, 12]) {
    const { GET } = load("src/app/api/cron/crawl/route.ts", {
      "next/server": { NextResponse: Response },
      "@/lib/ingestion/orchestrator": { runCrawl: async () => ({ totalErrors }) },
    });
    const response = await GET(new Request("https://example.com/api/cron/crawl", {
      headers: { authorization: "Bearer test-secret" },
    }));
    assert.equal(response.status, totalErrors ? 502 : 200);
    assert.equal((await response.json()).success, totalErrors === 0);
  }
});

test("an unset cron secret cannot authorize Bearer undefined", async () => {
  const { GET } = load("src/app/api/cron/crawl/route.ts", {
    "next/server": { NextResponse: Response },
    "@/lib/ingestion/orchestrator": { runCrawl: () => assert.fail("must not crawl") },
  }, { process: { env: {} } });
  const response = await GET(new Request("https://example.com/api/cron/crawl", {
    headers: { authorization: "Bearer undefined" },
  }));
  assert.equal(response.status, 401);
});
