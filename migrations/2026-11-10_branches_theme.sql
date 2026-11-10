-- Themed branches: a permanent theme every mutation of the branch must stay within.
-- Null = classic lettered branch. Run once in the Supabase SQL editor.
alter table branches add column if not exists theme text;
