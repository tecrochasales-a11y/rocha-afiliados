-- Migração 1: Adicionar 'gestor' ao enum (deve ser commitado separadamente)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'gestor';