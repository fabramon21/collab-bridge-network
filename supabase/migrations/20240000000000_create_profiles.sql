
-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  email text,
  school text,
  linkedin text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create indexes
create index profiles_email_idx on profiles (email);
create index profiles_school_idx on profiles (school);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
