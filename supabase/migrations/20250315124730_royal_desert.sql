/*
  # Add Storage Bucket and Description Column

  1. Changes
    - Add description column to attendance_records table
    - Create screenshots storage bucket
    - Update status check constraint to include work_update

  2. Security
    - Enable RLS policies for storage bucket
    - Allow authenticated users to upload and read screenshots
*/

-- Add description column to attendance_records
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'attendance_records' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE attendance_records ADD COLUMN description text;
  END IF;
END $$;

-- Update status check constraint to include work_update
ALTER TABLE attendance_records DROP CONSTRAINT IF EXISTS attendance_records_status_check;
ALTER TABLE attendance_records ADD CONSTRAINT attendance_records_status_check 
  CHECK (status IN ('check_in', 'check_out', 'work_update'));

-- Create storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Allow authenticated users to upload screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'screenshots');

CREATE POLICY "Allow authenticated users to read screenshots"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'screenshots');