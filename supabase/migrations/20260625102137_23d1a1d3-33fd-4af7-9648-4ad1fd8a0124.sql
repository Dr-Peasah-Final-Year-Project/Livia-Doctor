
-- Account status enum
CREATE TYPE public.account_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

ALTER TABLE public.doctor_profiles
  ADD COLUMN account_status public.account_status NOT NULL DEFAULT 'pending',
  ADD COLUMN status_reason text,
  ADD COLUMN reviewed_at timestamptz,
  ADD COLUMN reviewed_by uuid;

-- Approve existing doctors so the change isn't destructive
UPDATE public.doctor_profiles SET account_status = 'approved' WHERE account_status = 'pending';

-- Update signup trigger to capture license_number from metadata
CREATE OR REPLACE FUNCTION public.handle_new_doctor()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.doctor_profiles (id, full_name, email, license_number, account_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'license_number', ''),
    'pending'
  )
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'doctor')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Admin policies on doctor_profiles
CREATE POLICY "Admins can view all doctor profiles"
  ON public.doctor_profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update doctor profiles"
  ON public.doctor_profiles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin policy on user_roles so admins can see roles
CREATE POLICY "Admins can view all user roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
