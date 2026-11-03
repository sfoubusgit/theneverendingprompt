-- Gallery: store the Cloudinary URL of each post's framed image.
-- Run once in the Supabase SQL editor, then run
--   python scripts/backfill_images.py --write
-- in mohsen_sina_insta_ai_channel/TNEP.XYZ to fill existing posts.
alter table materialized_posts add column if not exists image_url text;
