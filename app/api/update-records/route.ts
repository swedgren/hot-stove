// app/api/update-records/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchMLBRecords } from '@/lib/updateRecords'

export async function GET(request: Request) {
  // Protect with a secret so only Vercel cron can call this
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // service role for writes
  )

  try {
    const records = await fetchMLBRecords()

    const upserts = Object.entries(records).map(([abbr, rec]) => ({
      mlb_team_abbr: abbr,
      wins: rec.wins,
      losses: rec.losses,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from('mlb_records')
      .upsert(upserts, { onConflict: 'mlb_team_abbr' })

    if (error) throw error

    return NextResponse.json({
      success: true,
      updated: upserts.length,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Update failed:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
