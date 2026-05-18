-- Monthly snapshots: baseline wins/losses captured at the start of each calendar month
-- so we can compute month-to-date points = current - snapshot.
create table if not exists mlb_month_snapshots (
  mlb_team_abbr text not null,
  snapshot_date date not null,            -- always the 1st of a month
  wins integer not null,
  losses integer not null,
  primary key (mlb_team_abbr, snapshot_date)
);

-- Rebuild standings view with a month_points aggregate and per-pick month_points.
drop view if exists standings;

create view standings as
with month_snap as (
  select
    s.mlb_team_abbr,
    s.wins   as base_wins,
    s.losses as base_losses
  from mlb_month_snapshots s
  where s.snapshot_date = date_trunc('month', current_date)::date
)
select
  ft.id,
  ft.name,
  ft.draft_slot,
  sum(
    case
      when p.direction = 'W' then coalesce(r.wins, 0)
      when p.direction = 'L' then coalesce(r.losses, 0)
      else 0
    end
  )::integer as points,
  sum(
    case
      when p.direction = 'W' then coalesce(r.wins, 0)   - coalesce(ms.base_wins, 0)
      when p.direction = 'L' then coalesce(r.losses, 0) - coalesce(ms.base_losses, 0)
      else 0
    end
  )::integer as month_points,
  json_agg(
    json_build_object(
      'abbr', p.mlb_team_abbr,
      'name', p.mlb_team_name,
      'direction', p.direction,
      'round', p.round,
      'pick', p.draft_pick,
      'wins', coalesce(r.wins, 0),
      'losses', coalesce(r.losses, 0),
      'points',
        case
          when p.direction = 'W' then coalesce(r.wins, 0)
          when p.direction = 'L' then coalesce(r.losses, 0)
          else 0
        end,
      'month_points',
        case
          when p.direction = 'W' then coalesce(r.wins, 0)   - coalesce(ms.base_wins, 0)
          when p.direction = 'L' then coalesce(r.losses, 0) - coalesce(ms.base_losses, 0)
          else 0
        end
    ) order by p.round
  ) as team_picks
from fantasy_teams ft
join picks p on p.fantasy_team_id = ft.id
left join mlb_records r  on r.mlb_team_abbr  = p.mlb_team_abbr
left join month_snap ms  on ms.mlb_team_abbr = p.mlb_team_abbr
group by ft.id, ft.name, ft.draft_slot
order by points desc;
