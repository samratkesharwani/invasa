-- SQL script to create a delete policy for the inventory table
-- This enables row-level security (RLS) and ensures users can only delete their own inventory items

-- Enable Row Level Security
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Create delete policy for inventory table
CREATE POLICY "Users can delete their own inventory items" 
ON inventory
FOR DELETE 
USING (brand_id = auth.uid());

-- Note: If the policy needs to be updated later, you can use:
-- DROP POLICY IF EXISTS "Users can delete their own inventory items" ON inventory;
-- And then recreate it with the CREATE POLICY statement above 