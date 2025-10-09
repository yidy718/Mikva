-- Community Features: Q&A, Reports, and Verification

-- Questions and Answers table
CREATE TABLE IF NOT EXISTS mikvah_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mikvah_id UUID NOT NULL REFERENCES mikvahs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  is_answered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mikvah_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES mikvah_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  is_helpful_count INTEGER DEFAULT 0,
  is_from_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answer votes (helpful/not helpful)
CREATE TABLE IF NOT EXISTS answer_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  answer_id UUID NOT NULL REFERENCES mikvah_answers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(answer_id, user_id)
);

-- Reports table (for closed/outdated mikvahs)
CREATE TYPE report_type AS ENUM ('closed_permanently', 'closed_temporarily', 'incorrect_hours', 'incorrect_location', 'other');
CREATE TYPE report_status AS ENUM ('pending', 'investigating', 'resolved', 'dismissed');

CREATE TABLE IF NOT EXISTS mikvah_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mikvah_id UUID NOT NULL REFERENCES mikvahs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  report_type report_type NOT NULL,
  description TEXT NOT NULL,
  status report_status DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification table (community verification of mikvah info)
CREATE TABLE IF NOT EXISTS mikvah_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mikvah_id UUID NOT NULL REFERENCES mikvahs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  verification_notes TEXT,
  UNIQUE(mikvah_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_questions_mikvah_id ON mikvah_questions(mikvah_id);
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON mikvah_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_is_answered ON mikvah_questions(is_answered);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON mikvah_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_user_id ON mikvah_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_answer_votes_answer_id ON answer_votes(answer_id);
CREATE INDEX IF NOT EXISTS idx_reports_mikvah_id ON mikvah_reports(mikvah_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON mikvah_reports(status);
CREATE INDEX IF NOT EXISTS idx_verifications_mikvah_id ON mikvah_verifications(mikvah_id);

-- Enable RLS
ALTER TABLE mikvah_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mikvah_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mikvah_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE mikvah_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Questions
CREATE POLICY "Anyone can view questions" ON mikvah_questions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create questions" ON mikvah_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own questions" ON mikvah_questions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own questions" ON mikvah_questions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Answers
CREATE POLICY "Anyone can view answers" ON mikvah_answers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create answers" ON mikvah_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own answers" ON mikvah_answers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own answers" ON mikvah_answers FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Answer Votes
CREATE POLICY "Anyone can view answer votes" ON answer_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON answer_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own votes" ON answer_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own votes" ON answer_votes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Reports
CREATE POLICY "Anyone can view reports" ON mikvah_reports FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reports" ON mikvah_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update reports" ON mikvah_reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for Verifications
CREATE POLICY "Anyone can view verifications" ON mikvah_verifications FOR SELECT USING (true);
CREATE POLICY "Authenticated users can verify" ON mikvah_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own verifications" ON mikvah_verifications FOR DELETE USING (auth.uid() = user_id);

-- Triggers for helpful count
CREATE OR REPLACE FUNCTION update_answer_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE mikvah_answers
    SET is_helpful_count = is_helpful_count + CASE WHEN NEW.is_helpful THEN 1 ELSE -1 END
    WHERE id = NEW.answer_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE mikvah_answers
    SET is_helpful_count = is_helpful_count + CASE WHEN NEW.is_helpful THEN 1 ELSE -1 END - CASE WHEN OLD.is_helpful THEN 1 ELSE -1 END
    WHERE id = NEW.answer_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE mikvah_answers
    SET is_helpful_count = is_helpful_count - CASE WHEN OLD.is_helpful THEN 1 ELSE -1 END
    WHERE id = OLD.answer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER answer_votes_helpful_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON answer_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_answer_helpful_count();

-- Trigger to mark question as answered when first answer is added
CREATE OR REPLACE FUNCTION mark_question_answered()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE mikvah_questions
    SET is_answered = true
    WHERE id = NEW.question_id AND is_answered = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mark_question_answered_trigger
  AFTER INSERT ON mikvah_answers
  FOR EACH ROW
  EXECUTE FUNCTION mark_question_answered();

-- Trigger to update verification count
CREATE OR REPLACE FUNCTION update_verification_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE mikvahs
    SET verification_count = verification_count + 1, last_verified_at = NEW.verified_at
    WHERE id = NEW.mikvah_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE mikvahs
    SET verification_count = GREATEST(verification_count - 1, 0)
    WHERE id = OLD.mikvah_id;
  END IF
;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER verification_count_trigger
  AFTER INSERT OR DELETE ON mikvah_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_verification_count();
