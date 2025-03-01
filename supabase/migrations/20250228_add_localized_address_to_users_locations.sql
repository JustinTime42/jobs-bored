-- Add localized_formatted_address column to users_locations table
ALTER TABLE users_locations ADD COLUMN localized_formatted_address TEXT;

-- Update the RLS policies if needed
ALTER POLICY "Enable read access for all users" ON "public"."users_locations"
    USING (true);

ALTER POLICY "Enable insert for authenticated users only" ON "public"."users_locations"
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

ALTER POLICY "Enable update for users based on user_id" ON "public"."users_locations"
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

ALTER POLICY "Enable delete for users based on user_id" ON "public"."users_locations"
    USING (auth.uid() = user_id);
