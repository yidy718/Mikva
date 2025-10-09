-- Add enhanced mikvah details fields

-- Add amenities column (JSONB for flexible amenity storage)
ALTER TABLE mikvahs ADD COLUMN amenities JSONB DEFAULT '{}';

-- Add pricing details
ALTER TABLE mikvahs ADD COLUMN pricing_type TEXT CHECK (pricing_type IN ('free', 'donation', 'fixed', 'sliding_scale'));
ALTER TABLE mikvahs ADD COLUMN price_amount DECIMAL(10, 2);
ALTER TABLE mikvahs ADD COLUMN price_currency TEXT DEFAULT 'USD';
ALTER TABLE mikvahs ADD COLUMN price_notes TEXT;

-- Add contact details
ALTER TABLE mikvahs ADD COLUMN contact_person TEXT;
ALTER TABLE mikvahs ADD COLUMN contact_organization TEXT;
ALTER TABLE mikvahs ADD COLUMN website TEXT;
ALTER TABLE mikvahs ADD COLUMN email TEXT;

-- Add operational details
ALTER TABLE mikvahs ADD COLUMN is_operational BOOLEAN DEFAULT true;
ALTER TABLE mikvahs ADD COLUMN last_verified_at TIMESTAMPTZ;
ALTER TABLE mikvahs ADD COLUMN verification_count INTEGER DEFAULT 0;

-- Add social media links
ALTER TABLE mikvahs ADD COLUMN social_media JSONB DEFAULT '{}';

-- Create amenities lookup (for consistent amenity names)
CREATE TABLE IF NOT EXISTS amenity_types (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_he TEXT,
  category TEXT NOT NULL, -- 'accessibility', 'facilities', 'services', 'comfort'
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert common mikvah amenities
INSERT INTO amenity_types (id, name_en, name_he, category, icon) VALUES
  -- Accessibility
  ('wheelchair_accessible', 'Wheelchair Accessible', 'נגיש לכיסאות גלגלים', 'accessibility', 'wheelchair'),
  ('elevator', 'Elevator', 'מעלית', 'accessibility', 'arrow-up'),
  ('ramp', 'Wheelchair Ramp', 'רמפה', 'accessibility', 'trending-up'),
  ('accessible_parking', 'Accessible Parking', 'חניה נגישה', 'accessibility', 'parking-circle'),

  -- Facilities
  ('parking', 'Parking Available', 'חניה זמינה', 'facilities', 'car'),
  ('changing_room', 'Private Changing Room', 'חדר הלבשה פרטי', 'facilities', 'door-closed'),
  ('shower', 'Shower', 'מקלחת', 'facilities', 'droplet'),
  ('hot_water', 'Hot Water', 'מים חמים', 'facilities', 'flame'),
  ('lockers', 'Lockers Available', 'ארונות זמינים', 'facilities', 'lock'),
  ('waiting_area', 'Waiting Area', 'אזור המתנה', 'facilities', 'armchair'),
  ('towels_provided', 'Towels Provided', 'מגבות מסופקות', 'facilities', 'sheet'),

  -- Services
  ('appointment_required', 'Appointment Required', 'נדרש תיאום מראש', 'services', 'calendar-clock'),
  ('attendant_available', 'Attendant Available', 'מלווה זמינה', 'services', 'user-check'),
  ('mikvah_lady', 'Mikvah Lady Present', 'בלנית נוכחת', 'services', 'user-round'),
  ('preparation_room', 'Preparation Room', 'חדר הכנה', 'services', 'bath'),
  ('kosher_supervision', 'Kosher Supervision', 'השגחה כשרות', 'services', 'shield-check'),

  -- Comfort & Convenience
  ('air_conditioning', 'Air Conditioning', 'מיזוג אוויר', 'comfort', 'air-vent'),
  ('heating', 'Heating', 'חימום', 'comfort', 'thermometer'),
  ('hair_dryer', 'Hair Dryer', 'מייבש שיער', 'comfort', 'wind'),
  ('toiletries', 'Toiletries Provided', 'מוצרי טיפוח', 'comfort', 'sparkles'),
  ('baby_changing', 'Baby Changing Station', 'החלפת תינוקות', 'comfort', 'baby'),
  ('nursing_room', 'Nursing Room', 'חדר הנקה', 'comfort', 'heart'),
  ('kosher_products', 'Kosher Products Only', 'מוצרים כשרים בלבד', 'comfort', 'check-circle'),

  -- Special Features
  ('separate_entrance', 'Separate Entrance', 'כניסה נפרדת', 'facilities', 'door-open'),
  ('private_mikvah', 'Private Mikvah', 'מקווה פרטית', 'facilities', 'user'),
  ('family_room', 'Family Room', 'חדר משפחתי', 'facilities', 'users'),
  ('beautiful_decor', 'Beautiful Decor', 'עיצוב יפה', 'comfort', 'star'),
  ('natural_water', 'Natural Water Source', 'מקור מים טבעי', 'facilities', 'waves'),
  ('rainwater', 'Rainwater Mikvah', 'מקווה מי גשמים', 'facilities', 'cloud-rain')
ON CONFLICT (id) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mikvahs_amenities ON mikvahs USING GIN (amenities);
CREATE INDEX IF NOT EXISTS idx_mikvahs_pricing_type ON mikvahs(pricing_type);
CREATE INDEX IF NOT EXISTS idx_mikvahs_is_operational ON mikvahs(is_operational);
CREATE INDEX IF NOT EXISTS idx_amenity_types_category ON amenity_types(category);

-- Add comment
COMMENT ON COLUMN mikvahs.amenities IS 'JSONB object with amenity IDs as keys and boolean values';
COMMENT ON COLUMN mikvahs.pricing_type IS 'Type of pricing: free, donation, fixed, sliding_scale';
COMMENT ON COLUMN mikvahs.verification_count IS 'Number of times users verified this information is accurate';
