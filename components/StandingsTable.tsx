'use client'

import { useState } from 'react'

type Pick = {
  abbr: string
  name: string
  direction: 'W' | 'L'
  round: number
  pick: number
  wins: number
  losses: number
  points: number
}

type TeamStanding = {
  id: number
  name: string
  draft_slot: number
  points: number
  team_picks: Pick[]
}

type Props = {
  standings: TeamStanding[]
  lastUpdated: string | null
}

const ROUND_LABELS = ['I', 'II', 'III', 'IV', 'V']

export default function StandingsTable({ standings, lastUpdated }: Props) {
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null)

  const leader = standings[0]

  function gamesBack(teamPoints: number): string {
    if (!leader || teamPoints === leader.points) return '—'
    const gb = (leader.points - teamPoints) / 2
    return gb % 1 === 0 ? gb.toFixed(0) : gb.toFixed(1)
  }

  function formatDate(iso: string | null): string {
    if (!iso) return 'Not yet updated'
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
    })
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url("https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=1600&q=80")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      fontFamily: '"Georgia", serif',
      padding: '32px 20px',
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media (max-width: 600px) {
          .picks-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .standings-row { font-size: 13px !important; }
          h1 { font-size: 32px !important; }
        }
      `}</style>

      <div style={{
        maxWidth: 820,
        margin: '0 auto',
        background: 'rgba(255,255,255,0.93)',
        borderRadius: 4,
        boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
        overflow: 'hidden',
      }}>

        <div style={{
          background: '#1a1a2e',
          padding: '28px 32px 24px',
          textAlign: 'center',
          borderBottom: '4px solid #c8a84b',
        }}>
          <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#c8a84b', marginBottom: 6 }}>
            2026 SEASON
          </div>
          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 52px)',
            fontWeight: 'bold',
            letterSpacing: '0.12em',
            color: '#ffffff',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}>
            Hot Stove
          </h1>
          <div style={{ fontSize: 10, letterSpacing: '0.35em', color: '#c8a84b' }}>
            FANTASY BASEBALL LEAGUE
          </div>
          <div style={{
            marginTop: 12, fontSize: 10, color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.1em', fontFamily: '"Courier New", monospace'
          }}>
            STANDINGS AS OF {formatDate(lastUpdated)}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '32px 1fr 70px 70px',
          padding: '8px 24px',
          borderBottom: '2px solid #1a1a2e',
          fontSize: 9,
          fontFamily: '"Courier New", monospace',
          letterSpacing: '0.15em',
          color: '#888',
          fontWeight: 'bold',
          background: '#fafafa',
        }}>
          <div></div>
          <div>TEAM</div>
          <div style={{ textAlign: 'center' }}>PTS</div>
          <div style={{ textAlign: 'center' }}>GB</div>
        </div>

        {standings.map((team, index) => {
          const isExpanded = expandedTeam === team.id
          const isLeader = index === 0
          const picks = team.team_picks ?? []

          const verifiedPoints = picks.reduce((sum, p) => {
            return sum + (p.direction === 'W' ? p.wins : p.losses)
          }, 0)

          const gb = gamesBack(verifiedPoints)

          return (
            <div key={team.id}>
              <div
                className="standings-row"
                onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr 70px 70px',
                  padding: '14px 24px',
                  borderBottom: '1px solid #e8e8e8',
                  cursor: 'pointer',
                  background: isLeader ? '#fffbee' : index % 2 === 0 ? '#ffffff' : '#fafafa',
                  borderLeft: isLeader ? '4px solid #c8a84b' : '4px solid transparent',
                  alignItems: 'center',
                }}
              >
                <div style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: 13, fontWeight: 'bold',
                  color: isLeader ? '#c8a84b' : '#bbb',
                }}>
                  {index + 1}
                </div>

                <div>
                  <div style={{
                    fontWeight: isLeader ? 'bold' : 'normal',
                    fontSize: isLeader ? 17 : 15,
                    color: '#1a1a1a',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    {team.name}
                    {isLeader && (
                      <span style={{
                        fontSize: 8, letterSpacing: '0.15em', color: '#c8a84b',
                        fontFamily: '"Courier New", monospace',
                        border: '1px solid #c8a84b', padding: '1px 5px', borderRadius: 2,
                      }}>★ LEADER</span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: '#aaa', marginTop: 2, fontFamily: '"Courier New", monospace' }}>
                    {isExpanded ? '▲ hide picks' : '▼ show picks'}
                  </div>
                </div>

                <div style={{
                  textAlign: 'center', fontFamily: '"Courier New", monospace',
                  fontWeight: 'bold', fontSize: 18,
                  color: isLeader ? '#c8a84b' : '#1a1a1a',
                }}>
                  {verifiedPoints}
                </div>

                <div style={{
                  textAlign: 'center', fontFamily: '"Courier New", monospace',
                  fontSize: 15, color: '#666',
                }}>
                  {gb}
                </div>
              </div>

              {isExpanded && (
                <div style={{
                  background: '#f9f7f2',
                  borderBottom: '1px solid #e8e8e8',
                  padding: '16px 24px 20px',
                  borderLeft: isLeader ? '4px solid #c8a84b' : '4px solid #e0e0e0',
                }}>
                  <div style={{
                    fontSize: 9, letterSpacing: '0.2em', color: '#999',
                    fontFamily: '"Courier New", monospace', marginBottom: 12,
                  }}>
                    DRAFT PICKS — {team.name.toUpperCase()}
                  </div>

                  <div className="picks-grid" style={{
                    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8,
                  }}>
                    {ROUND_LABELS.map((label, ri) => {
                      const pick = picks.find(p => p.round === ri + 1)
                      if (!pick) return <div key={ri} />
                      const pickPts = pick.direction === 'W' ? pick.wins : pick.losses
                      return (
                        <div key={ri} style={{
                          border: '1px solid #e0e0e0', borderRadius: 4, padding: '10px',
                          background: '#ffffff',
                          borderTop: `3px solid ${pick.direction === 'W' ? '#2d7a2d' : '#b94040'}`,
                        }}>
                          <div style={{
                            fontSize: 8, color: '#bbb', letterSpacing: '0.1em',
                            fontFamily: '"Courier New", monospace', marginBottom: 4,
                          }}>
                            RD {label} · #{pick.pick}
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 2 }}>
                            {pick.abbr}
                          </div>
                          <div style={{ fontSize: 9, color: '#999', marginBottom: 6, lineHeight: 1.3 }}>
                            {pick.name}
                          </div>
                          <div style={{
                            fontSize: 9, fontWeight: 'bold', letterSpacing: '0.1em',
                            color: pick.direction === 'W' ? '#2d7a2d' : '#b94040',
                            fontFamily: '"Courier New", monospace', marginBottom: 4,
                          }}>
                            {pick.direction === 'W' ? 'LONG (W)' : 'SHORT (L)'}
                          </div>
                          <div style={{
                            fontSize: 9, color: '#888',
                            fontFamily: '"Courier New", monospace', marginBottom: 4,
                          }}>
                            {pick.wins}W – {pick.losses}L
                          </div>
                          <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            borderTop: '1px solid #f0f0f0', paddingTop: 4, marginTop: 2,
                          }}>
                            <span style={{ fontSize: 8, color: '#bbb', fontFamily: '"Courier New", monospace' }}>
                              {pick.direction === 'W' ? 'WINS' : 'LOSSES'}
                            </span>
                            <span style={{
                              fontSize: 16, fontWeight: 'bold', color: '#1a1a1a',
                              fontFamily: '"Courier New", monospace',
                            }}>
                              {pickPts}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div style={{
                    marginTop: 14, display: 'flex', justifyContent: 'flex-end',
                    alignItems: 'center', gap: 12,
                    borderTop: '1px solid #e0e0e0', paddingTop: 12,
                    fontFamily: '"Courier New", monospace',
                  }}>
                    <span style={{ fontSize: 10, color: '#888', letterSpacing: '0.1em' }}>TOTAL POINTS:</span>
                    <span style={{ fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' }}>{verifiedPoints}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        <div style={{
          padding: '16px 24px', textAlign: 'center', fontSize: 9, color: '#bbb',
          fontFamily: '"Courier New", monospace', letterSpacing: '0.1em',
          background: '#fafafa', borderTop: '1px solid #e8e8e8',
        }}>
          <div>W PICKS SCORE WINS · L PICKS SCORE LOSSES · UPDATES NIGHTLY</div>
          <div style={{ marginTop: 3 }}>GB = (LEADER PTS − TEAM PTS) ÷ 2</div>
        </div>
      </div>
    </div>
  )
}
