# SEO Product Managers

A job board and AI-powered resume builder for SEO and product management roles. Built with Next.js, Neon Postgres, and Claude.

## Tech Stack

- **Framework:** Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Database:** Neon Postgres + Drizzle ORM
- **AI:** Anthropic Claude (resume parsing, fit assessment, chat)
- **Jobs:** SerpApi (Google Jobs engine), daily cron crawl
- **Payments:** Stripe ($12/mo subscription)
- **Auth:** Clerk
- **Email:** Resend (job alerts)
- **Logos:** Brandfetch
- **Hosting:** Vercel

## Getting Started

```bash
npm install
cp .env.local.example .env.local  # then fill in your keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file with the following:

```env
# Database (Neon Postgres)
DATABASE_URL=postgresql://...

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Job crawling
SERPAPI_API_KEY=...

# Company logos
BRANDFETCH_CLIENT_ID=...

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Resend)
RESEND_API_KEY=re_...
FROM_EMAIL=notifications@yourdomain.com

# App URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron auth
CRON_SECRET=any-secret-string
```

### Where to get each key

| Variable | Source |
|---|---|
| `DATABASE_URL` | [Neon console](https://console.neon.tech) — connection string from your project |
| `ANTHROPIC_API_KEY` | [Anthropic console](https://console.anthropic.com) |
| `SERPAPI_API_KEY` | [SerpApi dashboard](https://serpapi.com/dashboard) |
| `BRANDFETCH_CLIENT_ID` | [Brandfetch developers](https://developers.brandfetch.com) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | [Clerk dashboard](https://dashboard.clerk.com) |
| `STRIPE_SECRET_KEY` / `STRIPE_PRICE_ID` / `STRIPE_WEBHOOK_SECRET` | [Stripe dashboard](https://dashboard.stripe.com/apikeys) |
| `RESEND_API_KEY` | [Resend dashboard](https://resend.com) |

## Database

Drizzle ORM manages the schema. To push schema changes:

```bash
npx drizzle-kit push
```

To generate migrations:

```bash
npx drizzle-kit generate
```

## Cron

A daily crawl runs at 8:00 AM UTC via Vercel Cron (`/api/cron/crawl`), configured in `vercel.json`. The endpoint is protected by `CRON_SECRET`.
