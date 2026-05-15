// app/page.tsx
import { supabase } from '@/lib/supabase'
import StandingsTable from '@/components/StandingsTable'

export const revalidate = 3600 // revalidate every hour

export default async function Home() {
  const { data: standings, error } = await supabase
    .from('standings')
    .select('*')

  if (error) {
    console.error(error)
  }

  // Sort by points desc (view already orders but just in case)
  const sorted = (standings ?? []).sort((a: any, b: any) => b.points - a.points)

  // Get last updated time from mlb_records
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
