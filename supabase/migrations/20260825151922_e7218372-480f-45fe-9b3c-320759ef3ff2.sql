CREATE TABLE public.rides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  company_name TEXT,
  company_cnpj TEXT,
  destination TEXT,
  route_name TEXT,
  vehicle_number INTEGER,
  scheduled_date TEXT,
  arrival_time TEXT,
  return_time TEXT,
  departure_time TEXT,
  estimated_travel_time TEXT,
  service_time TEXT,
  payment TEXT,
  reason TEXT,
  solicitante TEXT,
  phone TEXT,
  price NUMERIC(10,2),
  passengers JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rides TO authenticated;
GRANT ALL ON public.rides TO service_role;

ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view rides" ON public.rides FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create rides" ON public.rides FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update rides" ON public.rides FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete rides" ON public.rides FOR DELETE TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON public.rides
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();