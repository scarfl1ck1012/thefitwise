CREATE OR REPLACE FUNCTION get_unique_meal_dates(uid UUID)
RETURNS TABLE (logged_at DATE) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT meal_logs.logged_at
  FROM meal_logs
  WHERE user_id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
