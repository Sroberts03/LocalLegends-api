do $$ begin
    create type public.profile_status as enum ('Good Standing', 'Warning', 'Suspended', 'Banned');
exception
    when duplicate_object then null;
end $$;

create table if not exists public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    display_name text,
    profile_url text,
    bio text,
    status profile_status default 'Good Standing'::profile_status,
    reliability_score int default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, profile_url)
  values (new.id, new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'profile_url');
  return new;
end;
$$ language plpgsql security definer;

create or replace function public.handle_profile_update()
returns trigger as $$
begin
  update auth.users
  set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || 
    jsonb_build_object(
      'display_name', new.display_name,
      'profile_url', new.profile_url
    )
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to link auth.users to public.profiles
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists on_profile_updated on public.profiles;
create trigger on_profile_updated
  after update on public.profiles
  for each row
  when (old.display_name is distinct from new.display_name or old.profile_url is distinct from new.profile_url)
  execute procedure public.handle_profile_update();

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone." 
  on public.profiles for select 
  using ( true );

create policy "Users can update own profile." 
  on public.profiles for update 
  using ( auth.uid() = id );

-- view
CREATE OR REPLACE VIEW profile_with_stats 
WITH (security_invoker = true)
AS
SELECT 
    p.id,
    p.display_name as "displayName",
    p.bio,
    p.status,
    p.profile_url as "profileImageUrl",
    p.reliability_score as "reliabilityScore",
    EXTRACT(YEAR FROM p.created_at)::int as "yearJoined",
    -- Favorite Sports
    (SELECT COALESCE(JSON_AGG(json_build_object(
        'id', s.id,
        'name', s.name,
        'category', s.category,
        'slug', s.slug,
        'iconUrl', s.icon_url,
        'status', s.status,
        'createdAt', s.created_at
    )), '[]')
     FROM user_favorite_sports ufs
     JOIN sports s ON ufs.sport_id = s.id
     WHERE ufs.user_id = p.id) as "favoriteSports",
    -- Last 5 Games
    (SELECT COALESCE(JSON_AGG(gwd.*), '[]')
     FROM (
         SELECT g.*
         FROM user_games ug
         JOIN games_with_details g ON ug.game_id = g.id
         WHERE ug.user_id = p.id
         ORDER BY g.start_time DESC
         LIMIT 5
     ) gwd) as "last5Games",
    -- Stats
    (SELECT COUNT(*) FROM games WHERE creator_id = p.id)::int as "totalGamesHosted",
    (SELECT COUNT(*) FROM user_games WHERE user_id = p.id)::int as "totalGamesJoined"
FROM profiles p;
