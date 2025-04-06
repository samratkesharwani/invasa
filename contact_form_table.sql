-- Create a table for contact form submissions
CREATE TABLE contact_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    phone TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'unread'
);

-- Create RLS (Row Level Security) policies for the contact_submissions table
-- This allows public insert but restricts read/update/delete to authenticated users

-- Enable RLS on the table
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (submit forms) - including unauthenticated users
CREATE POLICY "Allow public submissions" 
ON contact_submissions FOR INSERT 
TO PUBLIC
WITH CHECK (true);

-- Allow authenticated users to view all submissions
CREATE POLICY "Allow authenticated users to view submissions" 
ON contact_submissions FOR SELECT 
TO authenticated
USING (true);

-- Allow authenticated users with admin role to update submissions
CREATE POLICY "Allow admins to update submissions" 
ON contact_submissions FOR UPDATE 
TO authenticated
USING (auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
))
WITH CHECK (auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
));

-- Allow authenticated users with admin role to delete submissions
CREATE POLICY "Allow admins to delete submissions" 
ON contact_submissions FOR DELETE 
TO authenticated
USING (auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
));

-- Create an index on created_at for better query performance when sorting by date
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at);

-- Create an index on status for filtering by status
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status); 