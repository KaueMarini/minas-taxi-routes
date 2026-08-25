CREATE INDEX IF NOT EXISTS rides_created_at_idx ON public.rides (created_at DESC);

CREATE OR REPLACE FUNCTION public.rides_summary(_from timestamptz DEFAULT NULL, _to timestamptz DEFAULT NULL)
RETURNS TABLE (total_count bigint, total_price numeric)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT count(*)::bigint, COALESCE(sum(price), 0)::numeric
  FROM public.rides
  WHERE (_from IS NULL OR created_at >= _from)
    AND (_to IS NULL OR created_at < _to);
$$;

GRANT EXECUTE ON FUNCTION public.rides_summary(timestamptz, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rides_summary(timestamptz, timestamptz) TO service_role;