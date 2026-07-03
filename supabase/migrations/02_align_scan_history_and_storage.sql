-- ============================================================
-- THREADCOUNTY ALIGNMENT MIGRATION
-- Makes the checked-in schema match the frontend upload/history flow
-- ============================================================

-- 1. Ensure the storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('fabric-uploads', 'fabric-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Make legacy scan_history columns optional so the current app can insert
ALTER TABLE public.scan_history
  ALTER COLUMN upload_id DROP NOT NULL,
  ALTER COLUMN scan_type DROP NOT NULL;

-- 3. Add the current application columns when missing
ALTER TABLE public.scan_history
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS detections JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS total_defects INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS processing_time DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS confidence DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS ai_summary TEXT;

-- 4. Allow users to delete their own scan history rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'scan_history'
      AND policyname = 'Users can delete their own scan history'
  ) THEN
    CREATE POLICY "Users can delete their own scan history"
      ON public.scan_history FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;
