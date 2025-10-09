-- Create corrections table
CREATE TABLE IF NOT EXISTS corrections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mikvah_id UUID NOT NULL REFERENCES mikvahs(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('incorrect_info', 'missing_info', 'outdated_info', 'other')),
  field TEXT,
  current_value TEXT,
  suggested_value TEXT NOT NULL,
  description TEXT NOT NULL,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'resolved')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_corrections_mikvah_id ON corrections(mikvah_id);
CREATE INDEX IF NOT EXISTS idx_corrections_status ON corrections(status);
CREATE INDEX IF NOT EXISTS idx_corrections_created_at ON corrections(created_at);

-- Enable RLS
ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can create corrections
CREATE POLICY "Users can create corrections" ON corrections
  FOR INSERT WITH CHECK (true);

-- Users can view their own corrections (if we add user_id later)
-- For now, allow viewing all corrections (admin will filter)
CREATE POLICY "Users can view corrections" ON corrections
  FOR SELECT USING (true);

-- Only admins can update corrections
CREATE POLICY "Admins can update corrections" ON corrections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  );

-- Only admins can delete corrections
CREATE POLICY "Admins can delete corrections" ON corrections
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_corrections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_corrections_updated_at
  BEFORE UPDATE ON corrections
  FOR EACH ROW
  EXECUTE FUNCTION update_corrections_updated_at();

-- Create trigger for resolved_at
CREATE OR REPLACE FUNCTION update_corrections_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('approved', 'rejected', 'resolved') AND OLD.status = 'pending' THEN
    NEW.resolved_at = NOW();
    NEW.resolved_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_corrections_resolved_at
  BEFORE UPDATE ON corrections
  FOR EACH ROW
  EXECUTE FUNCTION update_corrections_resolved_at();
