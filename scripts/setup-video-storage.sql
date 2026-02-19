-- Create a new storage bucket for videos
insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do nothing;

-- Allow public access to videos
create policy "Public Access Videos"
  on storage.objects for select
  using ( bucket_id = 'videos' );

-- Allow authenticated users to upload videos
create policy "Authenticated users can upload videos"
  on storage.objects for insert
  with check ( bucket_id = 'videos' AND auth.role() = 'authenticated' );

-- Allow users to update their own videos (optional, for safety)
create policy "Users can update their own videos"
  on storage.objects for update
  using ( bucket_id = 'videos' AND auth.uid() = owner );
