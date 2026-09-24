-- Create a new bucket for media (logos, images, etc.)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read access
CREATE POLICY "Public Access Media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'media');

-- Allow authenticated users to upload files
CREATE POLICY "Auth Upload Media" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'media' 
    AND auth.role() = 'authenticated'
);

-- Allow users to update their own uploads
CREATE POLICY "Auth Update Media" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'media' 
    AND auth.role() = 'authenticated'
);
