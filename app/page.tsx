// app/page.tsx
import { createClient } from '@supabase/supabase-js'
import StandingsTable from '@/components/StandingsTable'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: standings, error } = await supabase
    .from('standings')
    .select('*')

  if (error) console.error('Standings error:', error)

  const sorted = (standings ?? []).sort((a: any, b: any) => b.points - a.points)

  const { data: lastUpdate } = await supabase
    .from('mlb_records')
    .select('updated_at')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <main>
      <StandingsTable
        standings={sorted}
        lastUpdated={lastUpdate?.updated_at ?? null}
      />
    </main>
  )
}
