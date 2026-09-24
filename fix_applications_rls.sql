-- Fix RLS so candidates can apply for jobs
CREATE POLICY "Candidates can insert applications" 
ON "public"."applications" 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Candidates can update their own applications"
ON "public"."applications"
FOR UPDATE
USING (auth.uid() = user_id);
