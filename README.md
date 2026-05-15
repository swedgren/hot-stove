# Hot Stove · 2026 Fantasy Baseball League

Live standings site built with Next.js + Supabase + Vercel.

## Setup

### 1. Supabase

1. Go to your Supabase project → SQL Editor
2. Paste and run the contents of `supabase/migrations/001_initial.sql`
3. This creates all tables, the standings view, and seeds all 6 teams + 30 picks

### 2. Environment Variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase Settings > API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase Settings > API
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase Settings > API (keep secret)
- `CRON_SECRET` — any random string, e.g. `openssl rand -base64 32`

### 3. Deploy to Vercel

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel

# Add env vars in Vercel dashboard or via CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add CRON_SECRET
```

The `vercel.json` file configures a nightly cron at 4am ET (9am UTC) to
pull fresh MLB records from the MLB Stats API and update Supabase.

### 4. Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## How It Works

- **Supabase** stores fantasy teams, picks, and live MLB W/L records
- **MLB Stats API** (free, no key needed) provides current standings
- **Vercel Cron** hits `/api/update-records` nightly to refresh records
- **Next.js** page revalidates every hour; standings view calculates points on the fly
- **Points**: W picks = team wins, L picks = team losses

## Scoring

Each team has 5 picks. For each pick:
- **W (Long)** — earns points equal to that MLB team's current win total
- **L (Short)** — earns points equal to that MLB team's current loss total

**Games Back** = (Leader Points − Team Points) / 2

## Draft Picks

| Pick | Dennis & Bill | Ralph & Chris | Brad & Steve | Bob & Wallace | Frank & Bob | Barry & Jay |
|------|--------------|--------------|-------------|--------------|------------|------------|
| R1 | LAD W | COL L | WSH L | CWS L | LAA L | MIA L |
| R2 | TOR W | SDP W | STL L | NYY W | PHI W | MIN L |
| R3 | NYM W | CHC W | DET W | BOS W | MIL W | TBR L |
| R4 | SFG W | CLE L | ATL W | OAK L | HOU W | PIT W |
| R5 | BAL L | CIN L | TEX W | SFG W | ARI L | KC L |

> Note: Review round 4 picks 24 & 28 — both appear to be SF Giants on the draft sheet.
> Double-check with your league and update the SQL seed if needed.
