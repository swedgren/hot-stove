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
    // Ensure a snapshot exists for the current calendar month (UTC).
    // The snapshot captures the wins/losses going INTO the month, so
    // month_points = current - snapshot.
    const now = new Date()
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const monthStartISO = monthStart.toISOString().slice(0, 10)

    const { data: existingSnap, error: snapCheckErr } = await supabase
      .from('mlb_month_snapshots')
      .select('mlb_team_abbr')
      .eq('snapshot_date', monthStartISO)
      .limit(1)
    if (snapCheckErr) throw snapCheckErr

    let snapshotCreated = false
    if (!existingSnap || existingSnap.length === 0) {
      const dayBefore = new Date(monthStart.getTime() - 86_400_000)
      const dayBeforeISO = dayBefore.toISOString().slice(0, 10)
      const snapRecords = await fetchMLBRecords(dayBeforeISO)

      const snapRows = Object.entries(snapRecords).map(([abbr, rec]) => ({
        mlb_team_abbr: abbr,
        snapshot_date: monthStartISO,
        wins: rec.wins,
        losses: rec.losses,
      }))

      if (snapRows.length > 0) {
        const { error: snapInsErr } = await supabase
          .from('mlb_month_snapshots')
          .insert(snapRows)
        if (snapInsErr) throw snapInsErr
        snapshotCreated = true
      }
    }

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

    // On the 1st of each month, snapshot current records as next month's baseline
    if (now.getUTCDate() === 1) {
      const snapshotDate = now.toISOString().slice(0, 10) // e.g. "2026-06-01"
      const snapshots = upserts.map(r => ({
        mlb_team_abbr: r.mlb_team_abbr,
        snapshot_date: snapshotDate,
        wins: r.wins,
        losses: r.losses,
      }))
      await supabase
        .from('mlb_month_snapshots')
        .upsert(snapshots, { onConflict: 'mlb_team_abbr,snapshot_date' })
    }

    return NextResponse.json({
      success: true,
      updated: upserts.length,
      snapshotCreated,
      snapshotMonth: monthStartISO,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Update failed:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
