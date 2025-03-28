-- Function to append unique technologies to an organization
CREATE OR REPLACE FUNCTION append_unique_technologies(org_id TEXT, new_technologies TEXT[])
RETURNS VOID AS $$
BEGIN
  -- Update the organization record
  -- This uses the array_cat function to concatenate arrays and the DISTINCT keyword to remove duplicates
  UPDATE organizations
  SET technologies = ARRAY(
    SELECT DISTINCT unnest(
      CASE 
        WHEN technologies IS NULL THEN new_technologies
        ELSE array_cat(technologies, new_technologies)
      END
    )
  )
  WHERE id = org_id;
END;
$$ LANGUAGE plpgsql;
