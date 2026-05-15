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
      background: '#f8f6f0',
      fontFamily: '"Georgia", serif',
      padding: '32px 20px',
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media (max-width: 600px) {
          .picks-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .standings-row { font-size: 13px !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ maxWidth: 800, margin: '0 auto 28px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          borderTop: '3px double #1a1a1a',
          borderBottom: '3px double #1a1a1a',
          padding: '10px 0',
          marginBottom: 8,
        }}>
          <div style={{ fontSize: 11, letterSpacing: '0.3em', color: '#555', marginBottom: 4 }}>
            2026 SEASON
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 6vw, 48px)',
            fontWeight: 'bold',
            letterSpacing: '0.1em',
            color: '#1a1a1a',
            textTransform: 'uppercase',
          }}>
            Hot Stove
          </h1>
          <div style={{ fontSize: 11, letterSpacing: '0.3em', color: '#555', marginTop: 4 }}>
            FANTASY BASEBALL LEAGUE
          </div>
        </div>
        <div style={{ fontSize: 11, color: '#888', letterSpacing: '0.1em' }}>
          STANDINGS UPDATED: {formatDate(lastUpdated)}
        </div>
      </div>

      {/* Standings */}
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Column headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '28px 1fr 60px 60px 60px',
          gap: 0,
          padding: '6px 12px',
          borderBottom: '2px solid #1a1a1a',
          fontSize: 10,
          fontFamily: '"Courier New", monospace',
          letterSpacing: '0.15em',
          color: '#555',
          fontWeight: 'bold',
          textTransform: 'uppercase',
        }}>
          <div></div>
          <div>Team</div>
          <div style={{ textAlign: 'center' }}>PTS</div>
          <div style={{ textAlign: 'center' }}>GB</div>
          <div style={{ textAlign: 'center' }}>W5</div>
        </div>

        {standings.map((team, index) => {
          const isExpanded = expandedTeam === team.id
          const isLeader = index === 0
          const gb = gamesBack(team.points)
          // Last 5 picks worth of points movement (simplified — show pick directions)
          const picks = team.team_picks ?? []

          return (
            <div key={team.id}>
              {/* Main standing row */}
              <div
                className="standings-row"
                onClick={() => setExpandedTeam(isExpanded ? null : team.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '28px 1fr 60px 60px 60px',
                  gap: 0,
                  padding: '12px 12px',
                  borderBottom: '1px solid #ddd',
                  cursor: 'pointer',
                  background: isLeader ? '#fffbf0' : 'transparent',
                  borderLeft: isLeader ? '3px solid #c8a84b' : '3px solid transparent',
                  transition: 'background 0.15s',
                  alignItems: 'center',
                  fontSize: 15,
                }}
              >
                {/* Rank */}
                <div style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: 12,
                  color: isLeader ? '#c8a84b' : '#888',
                  fontWeight: 'bold',
                }}>
                  {index + 1}
                </div>

                {/* Team name */}
                <div>
                  <span style={{
                    fontWeight: isLeader ? 'bold' : 'normal',
                    color: '#1a1a1a',
                    fontSize: isLeader ? 16 : 15,
                  }}>
                    {team.name}
                  </span>
                  {isLeader && (
                    <span style={{
                      marginLeft: 8, fontSize: 9, letterSpacing: '0.15em',
                      color: '#c8a84b', fontFamily: '"Courier New", monospace',
                      verticalAlign: 'middle',
                    }}>
                      ★ LEADER
                    </span>
                  )}
                </div>

                {/* Points */}
                <div style={{
                  textAlign: 'center',
                  fontFamily: '"Courier New", monospace',
                  fontWeight: 'bold',
                  fontSize: 16,
                  color: isLeader ? '#c8a84b' : '#1a1a1a',
                }}>
                  {team.points}
                </div>

                {/* Games back */}
                <div style={{
                  textAlign: 'center',
                  fontFamily: '"Courier New", monospace',
                  fontSize: 14,
                  color: '#555',
                }}>
                  {gb}
                </div>

                {/* Expand arrow */}
                <div style={{
                  textAlign: 'center',
                  fontSize: 10,
                  color: '#aaa',
                  fontFamily: '"Courier New", monospace',
                }}>
                  {isExpanded ? '▲' : '▼'}
                </div>
              </div>

              {/* Expanded picks */}
              {isExpanded && (
                <div style={{
                  background: '#fefefe',
                  borderBottom: '1px solid #ddd',
                  padding: '16px 12px 20px',
                  borderLeft: isLeader ? '3px solid #c8a84b' : '3px solid #e0e0e0',
                }}>
                  <div style={{
                    fontSize: 10, letterSpacing: '0.2em', color: '#888',
                    fontFamily: '"Courier New", monospace',
                    marginBottom: 14, textTransform: 'uppercase',
                  }}>
                    Draft Picks · {team.name}
                  </div>

                  {/* Grid matching draft sheet layout */}
                  <div
                    className="picks-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gap: 8,
                    }}
                  >
                    {ROUND_LABELS.map((label, ri) => {
                      const pick = picks.find(p => p.round === ri + 1)
                      if (!pick) return <div key={ri} />
                      const pts = pick.points
                      return (
                        <div key={ri} style={{
                          border: '1px solid #ddd',
                          borderRadius: 4,
                          padding: '8px 10px',
                          background: pick.direction === 'W' ? '#f0f8f0' : '#fff8f8',
                          position: 'relative',
                        }}>
                          <div style={{
                            fontSize: 8, color: '#aaa', letterSpacing: '0.15em',
                            fontFamily: '"Courier New", monospace',
                            marginBottom: 3,
                          }}>
                            RD {label} · #{pick.pick}
                          </div>
                          <div style={{
                            fontSize: 13, fontWeight: 'bold', color: '#1a1a1a',
                            marginBottom: 2,
                          }}>
                            {pick.abbr}
                          </div>
                          <div style={{ fontSize: 9, color: '#777', marginBottom: 5, lineHeight: 1.3 }}>
                            {pick.name}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                              fontSize: 10, fontWeight: 'bold',
                              color: pick.direction === 'W' ? '#2d7a2d' : '#b94040',
                              fontFamily: '"Courier New", monospace',
                            }}>
                              {pick.direction === 'W' ? `${pick.wins}W` : `${pick.losses}L`}
                            </span>
                            <span style={{
                              fontSize: 13, fontWeight: 'bold',
                              color: '#1a1a1a',
                              fontFamily: '"Courier New", monospace',
                            }}>
                              {pts}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Row total */}
                  <div style={{
                    marginTop: 12,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: 12,
                    fontSize: 11,
                    fontFamily: '"Courier New", monospace',
                    color: '#555',
                    borderTop: '1px solid #eee',
                    paddingTop: 10,
                  }}>
                    <span>TOTAL POINTS:</span>
                    <span style={{ fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' }}>
                      {team.points}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{
        maxWidth: 800, margin: '32px auto 0',
        textAlign: 'center',
        fontSize: 10, color: '#aaa',
        fontFamily: '"Courier New", monospace',
        letterSpacing: '0.1em',
        borderTop: '1px solid #ddd',
        paddingTop: 16,
      }}>
        <div>W picks earn points per win · L picks earn points per loss</div>
        <div style={{ marginTop: 4 }}>Updates nightly after games complete · MLB Stats API</div>
        <div style={{ marginTop: 4 }}>GB calculated as (Leader PTS − Team PTS) / 2</div>
      </div>
    </div>
  )
}
