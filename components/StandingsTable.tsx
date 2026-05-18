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
  month_points: number
}

type TeamStanding = {
  id: number
  name: string
  draft_slot: number
  points: number
  month_points: number
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
    const gb = leader.points - teamPoints
    return gb.toString()
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
      position: 'relative',
      minHeight: '100vh',
      fontFamily: '"Georgia", serif',
    }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'url("/stadium.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        zIndex: 0,
      }} />
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 1,
      }} />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media (max-width: 600px) {
          .picks-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .standings-row { font-size: 13px !important; }
          h1 { font-size: 32px !important; }
        }
      `}</style>

      <div style={{ position: 'relative', zIndex: 2, padding: '32px 20px' }}>
        <div style={{
          maxWidth: 820,
          margin: '0 auto',
          background: 'transparent',
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
          gridTemplateColumns: '32px 1fr 60px 60px 60px',
          padding: '8px 24px',
          borderBottom: '2px solid rgba(255,255,255,0.25)',
          fontSize: 9,
          fontFamily: '"Courier New", monospace',
          letterSpacing: '0.15em',
          color: '#d0d0d0',
          fontWeight: 'bold',
          background: 'transparent',
        }}>
          <div></div>
          <div>TEAM</div>
          <div style={{ textAlign: 'center' }}>MONTH</div>
          <div style={{ textAlign: 'center' }}>SEASON</div>
          <div style={{ textAlign: 'center' }}>GB</div>
        </div>

        {standings.map((team, index) => {
          const isExpanded = expandedTeam === team.id
          const isLeader = index === 0
          const picks = team.team_picks ?? []

          const verifiedPoints = picks.reduce((sum, p) => {
            return sum + (p.direction === 'W' ? p.wins : p.losses)
          }, 0)

          const monthPoints = picks.reduce((sum, p) => sum + (p.month_points ?? 0), 0)

          const gb = gamesBack(verifiedPoints)

          return (
            <div key={team.id}>
              <div
                className="standings-row"
                onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr 60px 60px 60px',
                  padding: '14px 24px',
                  borderBottom: '1px solid rgba(255,255,255,0.12)',
                  cursor: 'pointer',
                  background: 'transparent',
                  borderLeft: isLeader ? '4px solid #22c55e' : '4px solid transparent',
                  alignItems: 'center',
                }}
              >
                <div style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: 13, fontWeight: 'bold',
                  color: isLeader ? '#22c55e' : '#d0d0d0',
                }}>
                  {index + 1}
                </div>

                <div>
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: isLeader ? 17 : 15,
                    color: isLeader ? '#22c55e' : '#ffffff',
                    display: 'flex', alignItems: 'center', gap: 8,
                    textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                  }}>
                    {team.name}
                    {isLeader && (
                      <span style={{
                        fontSize: 8, letterSpacing: '0.15em', color: '#22c55e',
                        fontFamily: '"Courier New", monospace',
                        border: '1px solid #22c55e', padding: '1px 5px', borderRadius: 2,
                        fontWeight: 'bold',
                      }}>★ LEADER</span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: '#c8c8c8', marginTop: 2, fontFamily: '"Courier New", monospace' }}>
                    {isExpanded ? '▲ hide picks' : '▼ show picks'}
                  </div>
                </div>

                <div style={{
                  textAlign: 'center', fontFamily: '"Courier New", monospace',
                  fontWeight: 'bold', fontSize: 18,
                  color: '#ffffff',
                  textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                }}>
                  {monthPoints}
                </div>

                <div style={{
                  textAlign: 'center', fontFamily: '"Courier New", monospace',
                  fontWeight: 'bold', fontSize: 18,
                  color: isLeader ? '#22c55e' : '#ffffff',
                  textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                }}>
                  {verifiedPoints}
                </div>

                <div style={{
                  textAlign: 'center', fontFamily: '"Courier New", monospace',
                  fontWeight: 'bold', fontSize: 15, color: '#facc15',
                  textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                }}>
                  {gb}
                </div>
              </div>

              {isExpanded && (
                <div style={{
                  background: 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  padding: '16px 24px 20px',
                  borderLeft: isLeader ? '4px solid #22c55e' : '4px solid transparent',
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
                      const isRightWay = pick.direction === 'W'
                        ? pick.wins > pick.losses
                        : pick.losses > pick.wins
                      return (
                        <div key={ri} style={{
                          position: 'relative',
                          border: '1px solid #e0e0e0', borderRadius: 4, padding: '10px',
                          background: '#ffffff',
                          borderTop: `3px solid ${pick.direction === 'W' ? '#2d7a2d' : '#b94040'}`,
                        }}>
                          {isRightWay && (
                            <span
                              aria-label="right-way pick"
                              style={{
                                position: 'absolute', top: 6, right: 6,
                                color: '#22c55e', fontSize: 14, fontWeight: 'bold',
                                lineHeight: 1,
                              }}
                            >✓</span>
                          )}
                          <div style={{
                            fontSize: 8, color: '#bbb', letterSpacing: '0.1em',
                            fontFamily: '"Courier New", monospace', marginBottom: 4,
                          }}>
                            RD {label} · #{pick.pick}
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#000000', marginBottom: 2 }}>
                            {pick.abbr}
                          </div>
                          <div style={{ fontSize: 9, color: '#000000', marginBottom: 6, lineHeight: 1.3 }}>
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
                            fontSize: 9, color: '#000000', fontWeight: 'bold',
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
          background: 'transparent', borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div>W PICKS SCORE WINS · L PICKS SCORE LOSSES · UPDATES NIGHTLY</div>
          <div style={{ marginTop: 3 }}>GB = LEADER PTS − TEAM PTS</div>
        </div>
        </div>
      </div>
    </div>
  )
}
