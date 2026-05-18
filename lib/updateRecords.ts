// lib/updateRecords.ts
// Called by the nightly cron API route

const MLB_TEAM_MAP: Record<string, string> = {
  '108': 'LAA', '109': 'ARI', '110': 'BAL', '111': 'BOS',
  '112': 'CHC', '113': 'CIN', '114': 'CLE', '115': 'COL',
  '116': 'DET', '117': 'HOU', '118': 'KCR', '119': 'LAD',
  '120': 'WSH', '121': 'NYM', '133': 'OAK', '134': 'PIT',
  '135': 'SDP', '136': 'SEA', '137': 'SFG', '138': 'STL',
  '139': 'TBR', '140': 'TEX', '141': 'TOR', '142': 'MIN',
  '143': 'PHI', '144': 'ATL', '145': 'CWS', '146': 'MIA',
  '147': 'NYY', '158': 'MIL',
}

export async function fetchMLBRecords(
  asOfDate?: string
): Promise<Record<string, { wins: number; losses: number }>> {
  const url = new URL('https://statsapi.mlb.com/api/v1/standings')
  url.searchParams.set('leagueId', '103,104')
  url.searchParams.set('season', '2026')
  url.searchParams.set('standingsTypes', 'regularSeason')
  if (asOfDate) url.searchParams.set('date', asOfDate)

  const res = await fetch(url.toString(), { next: { revalidate: 0 } })
  const data = await res.json()

  const records: Record<string, { wins: number; losses: number }> = {}

  for (const record of data.records ?? []) {
    for (const teamRecord of record.teamRecords ?? []) {
      const id = String(teamRecord.team.id)
      const abbr = MLB_TEAM_MAP[id]
      if (abbr) {
        records[abbr] = {
          wins: teamRecord.wins,
          losses: teamRecord.losses,
        }
      }
    }
  }

  return records
}
