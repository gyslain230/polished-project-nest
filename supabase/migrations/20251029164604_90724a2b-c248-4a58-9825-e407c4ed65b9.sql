-- Fix overly permissive RLS policies that allow unrestricted data access

-- CERTIFICATES TABLE: Remove dangerous policies allowing anyone to modify data
DROP POLICY IF EXISTS "Allow deletes to certificates" ON certificates;
DROP POLICY IF EXISTS "Allow inserts to certificates" ON certificates;
DROP POLICY IF EXISTS "Allow updates to certificates" ON certificates;

-- PROJECTS TABLE: Remove dangerous policies allowing anyone to modify data
DROP POLICY IF EXISTS "Allow deletes to projects" ON projects;
DROP POLICY IF EXISTS "Allow inserts to projects" ON projects;
DROP POLICY IF EXISTS "Allow updates to projects" ON projects;

-- PROFILES TABLE: Remove dangerous policies allowing anyone to modify data
DROP POLICY IF EXISTS "Allow deletes to profiles" ON profiles;
DROP POLICY IF EXISTS "Allow inserts to profiles" ON profiles;
DROP POLICY IF EXISTS "Allow updates to profiles" ON profiles;

-- MESSAGES TABLE: Fix access control
-- Remove overly permissive policies
DROP POLICY IF EXISTS "Allow deletes to messages" ON messages;
DROP POLICY IF EXISTS "Allow updates to messages" ON messages;
DROP POLICY IF EXISTS "Service role can manage all messages" ON messages;

-- Keep only necessary policies for messages:
-- 1. Public can INSERT (contact form submissions) - already exists as "Allow anonymous inserts to messages" and "Anyone can send messages"
-- 2. Admin can SELECT (read messages) - already exists as "Admin can view all messages"
-- 3. Admin can UPDATE (mark as read) - already exists as "Admin can update messages"

-- Note: The existing "Admin full access" policies on certificates, projects, and profiles 
-- provide all necessary CRUD operations for authenticated admins using is_admin(auth.uid())
-- Public read access for certificates and projects is maintained through the existing 
-- "Public can view" policies which only allow SELECT operations