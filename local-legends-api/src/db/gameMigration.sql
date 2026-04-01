-- Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enum Types
do $$ begin
    create type public.sport_status as enum ('active', 'unsupported');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type public.game_status as enum ('draft', 'active', 'finished', 'coordination', 'cancelled');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type public.skill_level as enum ('beginner', 'intermediate', 'advanced', 'all');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type public.gender_preference as enum ('all male', 'all female', 'coed', 'no preference');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type public.access_type as enum ('public', 'private');
exception
    when duplicate_object then null;
end $$;

-- 1. Sports Table
create table if not exists public.sports (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    category text,
    slug text unique not null,
    icon_url text,
    status public.sport_status default 'active',
    created_at timestamptz default now()
);

-- 2. Locations Table
create table if not exists public.locations (
    id uuid primary key default gen_random_uuid(),
    google_place_id text,
    name text not null,
    description text,
    street_address text,
    city text,
    state text,
    zip text,
    latitude float8 not null,
    longitude float8 not null,
    created_at timestamptz default now()
);

-- 3. Games Table
create table if not exists public.games (
    id uuid primary key default gen_random_uuid(),
    sport_id uuid references public.sports not null,
    creator_id uuid references auth.users not null,
    location_id uuid references public.locations not null,
    name text not null,
    description text,
    max_players int not null,
    min_players int default 2,
    status public.game_status default 'active',
    start_time timestamptz not null,
    end_time timestamptz not null,
    is_recurring boolean default false,
    skill_level public.skill_level default 'all',
    gender_preference public.gender_preference default 'no preference',
    access_type public.access_type default 'public',
    current_player_count int default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 4. User Games (Junction Table)
create table if not exists public.user_games (
    user_id uuid references auth.users not null,
    game_id uuid references public.games on delete cascade not null,
    showed_up boolean default false,
    joined_at timestamptz default now(),
    primary key (user_id, game_id)
);

-- 5. User Favorite Sports (Junction Table)
create table if not exists public.user_favorite_sports (
    user_id uuid references auth.users on delete cascade not null,
    sport_id uuid references public.sports on delete cascade not null,
    primary key (user_id, sport_id)
);

-- Enable RLS
alter table public.sports enable row level security;
alter table public.locations enable row level security;
alter table public.games enable row level security;
alter table public.user_games enable row level security;
alter table public.user_favorite_sports enable row level security;

-- Policies for Sports
create policy "Sports are viewable by everyone." on public.sports for select using (true);

-- Policies for Locations
create policy "Locations are viewable by everyone." on public.locations for select using (true);
create policy "Users can insert new locations." on public.locations for insert with check (auth.role() = 'authenticated');

-- Policies for Games
create policy "Public games are viewable by everyone." on public.games for select using (access_type = 'public');
create policy "Authenticated users can create games." on public.games for insert with check (auth.uid() = creator_id);
create policy "Creators can update their own games." on public.games for update using (auth.uid() = creator_id);

-- Policies for User Games
create policy "Users can see participants for joined games." on public.user_games for select using (true);
create policy "Users can join games." on public.user_games for insert with check (auth.uid() = user_id);
create policy "Users can leave games." on public.user_games for delete using (auth.uid() = user_id);

-- Policies for Favorite Sports
create policy "Users can see any user's favorite sports." on public.user_favorite_sports for select using (true);
create policy "Users can manage their own favorite sports." on public.user_favorite_sports 
    for all using (auth.uid() = user_id);

-- Automatic Updated At for Games
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger on_game_updated
    before update on public.games
    for each row execute procedure public.handle_updated_at();

-- Function to update player count on join/leave
create or replace function public.update_game_player_count()
returns trigger as $$
begin
    if (tg_op = 'INSERT') then
        update public.games set current_player_count = current_player_count + 1 where id = new.game_id;
    elsif (tg_op = 'DELETE') then
        update public.games set current_player_count = current_player_count - 1 where id = old.game_id;
    end if;
    return null;
end;
$$ language plpgsql;

create trigger on_user_game_change
    after insert or delete on public.user_games
    for each row execute procedure public.update_game_player_count();

-- Views
CREATE VIEW games_with_details 
WITH (security_invoker = true)
AS
SELECT 
    g.*,
    s.name as sport_name,
    l.name as location_name,
    l.latitude as location_latitude,
    l.longitude as location_longitude,
    p.display_name as creator_name,
    (SELECT COALESCE(JSON_AGG(json_build_object(
        'id', pr.id,
        'displayName', pr.display_name,
        'bio', pr.bio,
        'profileImageUrl', pr.profile_url,
        'status', pr.status,
        'reliabilityScore', pr.reliability_score,
        'createdAt', pr.created_at
    )), '[]')
     FROM user_games ug
     JOIN profiles pr ON ug.user_id = pr.id
     WHERE ug.game_id = g.id) as participant_profiles,
    (g.current_player_count < g.max_players) as has_space
FROM games g
JOIN sports s ON g.sport_id = s.id
JOIN locations l ON g.location_id = l.id
JOIN profiles p ON g.creator_id = p.id;

-- 6. Geospatial Filtering Function
CREATE OR REPLACE FUNCTION public.get_nearby_games(
    lat float8,
    lng float8,
    max_dist_meters float8
)
RETURNS SETOF public.games_with_details
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT *
    FROM public.games_with_details
    WHERE ST_DWithin(
        ST_SetSRID(ST_MakePoint(location_longitude, location_latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
        max_dist_meters
    );
$$;

