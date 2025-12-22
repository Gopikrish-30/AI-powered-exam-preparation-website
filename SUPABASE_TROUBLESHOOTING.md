# Supabase Troubleshooting Guide

## Issue: Study plans not saving to Supabase table

### Step 1: Check if you're logged in
Plans are only saved to Supabase when a user is authenticated. Check the browser console for this message:
```
User not logged in, plan saved locally only. Sign in to sync to cloud.
```

If you see this, you need to:
1. Go to `/login`
2. Sign up or sign in
3. Then create a study plan

### Step 2: Test Supabase connection
Visit: http://localhost:3000/test-supabase

This page will:
- Check if Supabase is configured
- Show your login status
- Test database insert/fetch operations
- Display any errors

### Step 3: Check Row Level Security (RLS) policies

Your `study_plans` table needs proper RLS policies. Run these in Supabase SQL Editor:

```sql
-- Enable RLS on the table
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own plans
CREATE POLICY "Users can insert their own plans"
ON public.study_plans
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to read their own plans
CREATE POLICY "Users can read their own plans"
ON public.study_plans
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to update their own plans
CREATE POLICY "Users can update their own plans"
ON public.study_plans
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to delete their own plans
CREATE POLICY "Users can delete their own plans"
ON public.study_plans
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### Step 4: Check table schema

Ensure your `study_plans` table has these columns:
```sql
CREATE TABLE IF NOT EXISTS public.study_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  exam_date date NOT NULL,
  files text[] DEFAULT '{}',
  plan jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

### Step 5: Restart dev server

After making changes to `.env.local`, always restart:
```powershell
# Kill the running server (Ctrl+C), then:
pnpm dev
```

### Step 6: Check browser console

Look for errors in the browser console when creating a plan. Common issues:
- "Supabase is not configured" → Check env variables
- "Failed to sync plan to Supabase" → Check RLS policies
- "User not logged in" → Sign in first

### Step 7: Check server logs

Look at your Next.js terminal for server-side errors like:
- "Supabase insert error" → RLS or permission issue
- "Error saving plan" → Check request payload

## Quick Checklist

- [ ] `.env.local` has all three Supabase keys
- [ ] Dev server restarted after adding keys
- [ ] User is signed in (not just visiting homepage)
- [ ] `study_plans` table exists in Supabase
- [ ] RLS policies are set up
- [ ] Check `/test-supabase` page for connection status
- [ ] Browser console shows no errors
- [ ] Server terminal shows no errors
