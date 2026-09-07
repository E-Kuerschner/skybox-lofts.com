-- Custom SQL migration file, put your code below! --

-- Seed the starting catalog of contractor services. Admins can add more from
-- the contractor form; these are the common jobs residents ask about today.
-- `created_at` is a millisecond timestamp to match the Drizzle timestamp_ms mode.
INSERT OR IGNORE INTO contractor_services (name, slug, created_at) VALUES
  ('AC Repair', 'ac-repair', CAST(strftime('%s', 'now') AS INTEGER) * 1000),
  ('Air Duct Cleaning', 'air-duct-cleaning', CAST(strftime('%s', 'now') AS INTEGER) * 1000),
  ('Appliance Repair', 'appliance-repair', CAST(strftime('%s', 'now') AS INTEGER) * 1000),
  ('Balcony Painting', 'balcony-painting', CAST(strftime('%s', 'now') AS INTEGER) * 1000),
  ('Carpentry', 'carpentry', CAST(strftime('%s', 'now') AS INTEGER) * 1000),
  ('Cleaning', 'cleaning', CAST(strftime('%s', 'now') AS INTEGER) * 1000),
  ('Drywall', 'drywall', CAST(strftime('%s', 'now') AS INTEGER) * 1000),
  ('Electrical', 'electrical', CAST(strftime('%s', 'now') AS INTEGER) * 1000),
  ('Flooring', 'flooring', CAST(strftime('%s', 'now') AS INTEGER) * 1000),
  ('Furnace / Heating', 'furnace-heating', CAST(strftime('%s', 'now') AS INTEGER) * 1000),
  ('General Handyman', 'general-handyman', CAST(strftime('%s', 'now') AS INTEGER) * 1000),
  ('Interior Painting', 'interior-painting', CAST(strftime('%s', 'now') AS INTEGER) * 1000),
  ('Locksmith', 'locksmith', CAST(strftime('%s', 'now') AS INTEGER) * 1000),
  ('Movers', 'movers', CAST(strftime('%s', 'now') AS INTEGER) * 1000),
  ('Pest Control', 'pest-control', CAST(strftime('%s', 'now') AS INTEGER) * 1000),
  ('Plumbing', 'plumbing', CAST(strftime('%s', 'now') AS INTEGER) * 1000),
  ('Roofing', 'roofing', CAST(strftime('%s', 'now') AS INTEGER) * 1000),
  ('Water Damage Restoration', 'water-damage-restoration', CAST(strftime('%s', 'now') AS INTEGER) * 1000),
  ('Window Treatments', 'window-treatments', CAST(strftime('%s', 'now') AS INTEGER) * 1000);
