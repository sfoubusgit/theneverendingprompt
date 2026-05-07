-- Drop old table if exists
drop table if exists generations;

-- Rounds: one per day, each is a "generation" of the chain
create table rounds (
  id uuid default gen_random_uuid() primary key,
  prompt text not null,
  image_url text,
  winner_submission_id uuid,
  status text not null default 'open',  -- 'open' | 'closed'
  created_at timestamptz default now(),
  closed_at timestamptz
);

-- Submissions: proposed prompt changes for a round
create table submissions (
  id uuid default gen_random_uuid() primary key,
  round_id uuid references rounds(id) not null,
  prompt text not null,
  submitter_name text not null,
  created_at timestamptz default now()
);

-- Votes: one per voter per round (voter_id = localStorage UUID)
create table votes (
  id uuid default gen_random_uuid() primary key,
  round_id uuid references rounds(id) not null,
  submission_id uuid references submissions(id) not null,
  voter_id text not null,
  created_at timestamptz default now(),
  unique(round_id, voter_id)
);

-- RLS policies
alter table rounds enable row level security;
alter table submissions enable row level security;
alter table votes enable row level security;

create policy "Public read rounds" on rounds for select using (true);
create policy "Public read submissions" on submissions for select using (true);
create policy "Public read votes" on votes for select using (true);
create policy "Public insert submissions" on submissions for insert with check (true);
create policy "Public insert votes" on votes for insert with check (true);
create policy "Public update votes" on votes for update using (true);

-- Storage bucket for optional images
insert into storage.buckets (id, name, public) values ('images', 'images', true)
  on conflict do nothing;

create policy "Public image upload" on storage.objects
  for insert with check (bucket_id = 'images');

create policy "Public image read" on storage.objects
  for select using (bucket_id = 'images');
