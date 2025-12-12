-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'affiliate');

-- Create enum for lead status
CREATE TYPE public.lead_status AS ENUM ('pending', 'contacted', 'qualified', 'converted', 'lost');

-- Create enum for withdrawal status
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'approved', 'rejected', 'paid');

-- Create enum for transaction type
CREATE TYPE public.transaction_type AS ENUM ('commission', 'withdrawal', 'bonus', 'adjustment');

-- =============================================
-- 1. PROFILES TABLE (affiliate data)
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cpf TEXT,
  pix_key TEXT,
  avatar_url TEXT,
  tracking_code TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- =============================================
-- 2. USER_ROLES TABLE (role management)
-- =============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- User roles RLS policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 3. PRODUCTS TABLE
-- =============================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  commission_percentage DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products RLS policies (public read, admin write)
CREATE POLICY "Anyone can view active products"
ON public.products FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage products"
ON public.products FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 4. LEADS TABLE (affiliate referrals)
-- =============================================
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  status lead_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  tracking_code TEXT,
  converted_at TIMESTAMP WITH TIME ZONE,
  sale_value DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Leads RLS policies
CREATE POLICY "Affiliates can view their own leads"
ON public.leads FOR SELECT
USING (affiliate_id = auth.uid());

CREATE POLICY "Admins can view all leads"
ON public.leads FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage leads"
ON public.leads FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert leads"
ON public.leads FOR INSERT
WITH CHECK (true);

-- =============================================
-- 5. COMMISSIONS TABLE
-- =============================================
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Commissions RLS policies
CREATE POLICY "Affiliates can view their own commissions"
ON public.commissions FOR SELECT
USING (affiliate_id = auth.uid());

CREATE POLICY "Admins can manage commissions"
ON public.commissions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 6. WITHDRAWALS TABLE
-- =============================================
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  pix_key TEXT NOT NULL,
  status withdrawal_status NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES public.profiles(id),
  notes TEXT
);

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Withdrawals RLS policies
CREATE POLICY "Affiliates can view their own withdrawals"
ON public.withdrawals FOR SELECT
USING (affiliate_id = auth.uid());

CREATE POLICY "Affiliates can request withdrawals"
ON public.withdrawals FOR INSERT
WITH CHECK (affiliate_id = auth.uid());

CREATE POLICY "Admins can manage withdrawals"
ON public.withdrawals FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 7. TRANSACTIONS TABLE (financial history)
-- =============================================
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Transactions RLS policies
CREATE POLICY "Affiliates can view their own transactions"
ON public.transactions FOR SELECT
USING (affiliate_id = auth.uid());

CREATE POLICY "Admins can manage transactions"
ON public.transactions FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique tracking code
CREATE OR REPLACE FUNCTION public.generate_tracking_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Function to handle new user signup (creates profile automatically)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, tracking_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email,
    public.generate_tracking_code()
  );
  
  -- Assign default 'affiliate' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'affiliate');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate affiliate balance
CREATE OR REPLACE FUNCTION public.get_affiliate_balance(_affiliate_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_earned DECIMAL;
  total_withdrawn DECIMAL;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total_earned
  FROM public.commissions
  WHERE affiliate_id = _affiliate_id AND status = 'paid';
  
  SELECT COALESCE(SUM(amount), 0) INTO total_withdrawn
  FROM public.withdrawals
  WHERE affiliate_id = _affiliate_id AND status = 'paid';
  
  RETURN total_earned - total_withdrawn;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;