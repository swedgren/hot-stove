-- Hot Stove League 2026
-- Run this in your Supabase SQL editor

-- Fantasy teams
create table if not exists fantasy_teams (
  id serial primary key,
  name text not null,
  draft_slot integer not null unique
);

-- MLB team picks per fantasy team
create table if not exists picks (
  id serial primary key,
  fantasy_team_id integer references fantasy_teams(id),
  mlb_team_abbr text not null,       -- e.g. 'LAD', 'COL'
  mlb_team_name text not null,
  direction text not null check (direction in ('W','L')),  -- W=Long, L=Short
  draft_pick integer not null,       -- overall pick number 1-30
  round integer not null
);

-- Daily win/loss records per MLB team (updated nightly)
create table if not exists mlb_records (
  id serial primary key,
  mlb_team_abbr text not null,
  wins integer not null default 0,
  losses integer not null default 0,
  updated_at timestamptz default now(),
  unique(mlb_team_abbr)
);

-- Materialized standings view (recalculated on each fetch)
-- Points: if direction=W, points = team wins; if direction=L, points = team losses
create or replace view standings as
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
  ) as points,
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
        end
    ) order by p.round
  ) as team_picks
from fantasy_teams ft
join picks p on p.fantasy_team_id = ft.id
left join mlb_records r on r.mlb_team_abbr = p.mlb_team_abbr
group by ft.id, ft.name, ft.draft_slot
order by points desc;

-- Seed fantasy teams
insert into fantasy_teams (name, draft_slot) values
  ('Dennis & Bill',  1),
  ('Ralph & Chris',  2),
  ('Brad & Steve',   3),
  ('Bob & Wallace',  4),
  ('Frank & Bob',    5),
  ('Barry & Jay',    6)
on conflict do nothing;

-- Seed picks (from draft sheet)
-- First get team IDs then insert picks
do $$
declare
  t1 integer; t2 integer; t3 integer; t4 integer; t5 integer; t6 integer;
begin
  select id into t1 from fantasy_teams where name = 'Dennis & Bill';
  select id into t2 from fantasy_teams where name = 'Ralph & Chris';
  select id into t3 from fantasy_teams where name = 'Brad & Steve';
  select id into t4 from fantasy_teams where name = 'Bob & Wallace';
  select id into t5 from fantasy_teams where name = 'Frank & Bob';
  select id into t6 from fantasy_teams where name = 'Barry & Jay';

  insert into picks (fantasy_team_id, mlb_team_abbr, mlb_team_name, direction, draft_pick, round) values
    -- Round 1
    (t1, 'LAD', 'Los Angeles Dodgers',   'W',  1, 1),
    (t2, 'COL', 'Colorado Rockies',      'L',  2, 1),
    (t3, 'WSH', 'Washington Nationals',  'L',  3, 1),
    (t4, 'CWS', 'Chicago White Sox',     'L',  4, 1),
    (t5, 'LAA', 'Los Angeles Angels',    'L',  5, 1),
    (t6, 'MIA', 'Miami Marlins',         'L',  6, 1),
    -- Round 2 (snake)
    (t6, 'MIN', 'Minnesota Twins',       'L',  7, 2),
    (t5, 'PHI', 'Philadelphia Phillies', 'W',  8, 2),
    (t4, 'NYY', 'New York Yankees',      'W',  9, 2),
    (t3, 'STL', 'St. Louis Cardinals',   'L', 10, 2),
    (t2, 'SDP', 'San Diego Padres',      'W', 11, 2),
    (t1, 'TOR', 'Toronto Blue Jays',     'W', 12, 2),
    -- Round 3
    (t1, 'NYM', 'New York Mets',         'W', 13, 3),
    (t2, 'CHC', 'Chicago Cubs',          'W', 14, 3),
    (t3, 'DET', 'Detroit Tigers',        'W', 15, 3),
    (t4, 'BOS', 'Boston Red Sox',        'W', 16, 3),
    (t5, 'MIL', 'Milwaukee Brewers',     'W', 17, 3),
    (t6, 'TBR', 'Tampa Bay Rays',        'L', 18, 3),
    -- Round 4 (snake)
    (t6, 'PIT', 'Pittsburgh Pirates',    'W', 19, 4),
    (t5, 'HOU', 'Houston Astros',        'W', 20, 4),
    (t4, 'OAK', 'Oakland Athletics',     'L', 21, 4),
    (t3, 'ATL', 'Atlanta Braves',        'W', 22, 4),
    (t2, 'CLE', 'Cleveland Guardians',   'L', 23, 4),
    (t1, 'SFG', 'San Francisco Giants',  'W', 24, 4),  -- listed as SD but pick 24 = SF based on our board; using image
    -- Round 5
    (t1, 'BAL', 'Baltimore Orioles',     'L', 29, 5),
    (t2, 'CIN', 'Cincinnati Reds',       'L', 26, 5),
    (t3, 'TEX', 'Texas Rangers',         'W', 27, 5),
    (t4, 'SFG', 'San Francisco Giants',  'W', 28, 5),
    (t5, 'ARI', 'Arizona Diamondbacks',  'L', 25, 5),
    (t6, 'KCR', 'Kansas City Royals',    'L', 30, 5)
  on conflict do nothing;
end $$;

-- Seed MLB records (start at 0-0, will be updated by cron)
insert into mlb_records (mlb_team_abbr, wins, losses) values
  ('LAD',0,0),('COL',0,0),('WSH',0,0),('CWS',0,0),('LAA',0,0),('MIA',0,0),
  ('MIN',0,0),('PHI',0,0),('NYY',0,0),('STL',0,0),('SDP',0,0),('TOR',0,0),
  ('NYM',0,0),('CHC',0,0),('DET',0,0),('BOS',0,0),('MIL',0,0),('TBR',0,0),
  ('PIT',0,0),('HOU',0,0),('OAK',0,0),('ATL',0,0),('CLE',0,0),('SFG',0,0),
  ('BAL',0,0),('CIN',0,0),('TEX',0,0),('ARI',0,0),('KCR',0,0)
on conflict (mlb_team_abbr) do nothing;
