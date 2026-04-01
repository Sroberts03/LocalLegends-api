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

-- Trigger to link auth.users to public.profiles
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone." 
  on public.profiles for select 
  using ( true );

create policy "Users can update own profile." 
  on public.profiles for update 
  using ( auth.uid() = id );