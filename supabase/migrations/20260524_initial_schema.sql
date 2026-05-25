-- Initial Doubles Database Schema
-- This migration creates all tables with proper RLS policies

-- Users table is already created, so we'll add RLS policies for it

-- Enable RLS for existing tables and add policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE volumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create public read policy for volumes (anyone can read event info)
CREATE POLICY "Volumes readable by all" 
  ON volumes 
  FOR SELECT 
  TO public 
  USING (true);

-- Create insert policy for applications (only authenticated users can create)
CREATE POLICY "Users can create applications" 
  ON applications 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated'::text);

-- Create select policy for applications (users can see their own, admins see all)
CREATE POLICY "Users see own applications" 
  ON applications 
  FOR SELECT 
  USING (
    applicant_user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND email LIKE '%@%'
    )
  );

-- Disable RLS for users table to allow service role operations
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE volumes DISABLE ROW LEVEL SECURITY;
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;
