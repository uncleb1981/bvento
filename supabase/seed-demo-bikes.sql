-- One-time: add the is_demo column (safe to re-run, no-ops if it already exists)
alter table bikes add column if not exists is_demo boolean not null default false;

-- Seed 10 demo listings under Ben's account, tagged is_demo = true so they're
-- easy to find and bulk-delete later:
--   delete from bikes where is_demo = true;
insert into bikes (owner_id, title, type, condition, estimated_value, description, city, photo_url, is_demo)
values
  ('2f683183-e8af-42a2-96c1-113fa3f4fc9e', 'Specialized Allez', 'Road', 'Like New', 900,
   'Aluminum road frame, Shimano 105 groupset, ridden less than 500 miles.', 'Rogers, AR',
   'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1200&q=80', true),

  ('2f683183-e8af-42a2-96c1-113fa3f4fc9e', 'Cannondale CAAD13', 'Road', 'Good', 1050,
   'Aluminum race frame, carbon fork, recently tuned.', 'Fayetteville, AR',
   'https://images.unsplash.com/photo-1601625193660-86f2807b024b?auto=format&fit=crop&w=1200&q=80', true),

  ('2f683183-e8af-42a2-96c1-113fa3f4fc9e', 'Santa Cruz Chameleon', 'Mountain', 'Like New', 1850,
   'Steel hardtail, dropper post, upgraded fork. Ready to ride.', 'Springdale, AR',
   'https://images.unsplash.com/photo-1534146789009-76ed5060ec70?auto=format&fit=crop&w=1200&q=80', true),

  ('2f683183-e8af-42a2-96c1-113fa3f4fc9e', 'Trek Marlin 7', 'Mountain', 'Good', 550,
   '2022 hardtail, upgraded tires, minor scratches on the frame.', 'Bentonville, AR',
   'https://images.unsplash.com/photo-1506316940527-4d1c138978a0?auto=format&fit=crop&w=1200&q=80', true),

  ('2f683183-e8af-42a2-96c1-113fa3f4fc9e', 'Salsa Journeyman', 'Gravel', 'Like New', 1250,
   'Steel gravel frame, tubeless-ready wheels, bar bag included.', 'Bentonville, AR',
   'https://images.unsplash.com/photo-1599912925091-0929608dc5b0?auto=format&fit=crop&w=1200&q=80', true),

  ('2f683183-e8af-42a2-96c1-113fa3f4fc9e', 'Priority Continuum', 'Commuter', 'New', 1600,
   'Belt drive, internal gear hub, zero maintenance commuter. Barely used.', 'Fayetteville, AR',
   'https://images.unsplash.com/photo-1613773038029-2dd0cdb924aa?auto=format&fit=crop&w=1200&q=80', true),

  ('2f683183-e8af-42a2-96c1-113fa3f4fc9e', 'Mongoose Legion L60', 'BMX', 'Fair', 180,
   'Freestyle BMX, some scuffs, pegs included. Great for beginners.', 'Springdale, AR',
   'https://images.unsplash.com/photo-1601332053592-13e8ce5ea88a?auto=format&fit=crop&w=1200&q=80', true),

  ('2f683183-e8af-42a2-96c1-113fa3f4fc9e', 'Rad Power RadRunner', 'E-Bike', 'Good', 1100,
   '750W motor, extended battery, rear rack included. Great commuter.', 'Fayetteville, AR',
   'https://images.unsplash.com/photo-1558978806-73073843b15e?auto=format&fit=crop&w=1200&q=80', true),

  ('2f683183-e8af-42a2-96c1-113fa3f4fc9e', 'Woom 4', 'Kids', 'Good', 260,
   'Lightweight kids bike, ages 6-8, hand brakes, well maintained.', 'Bentonville, AR',
   'https://images.unsplash.com/photo-1583124688426-3128aec007f8?auto=format&fit=crop&w=1200&q=80', true),

  ('2f683183-e8af-42a2-96c1-113fa3f4fc9e', 'Electra Cruiser 7D', 'Cruiser', 'Good', 420,
   'Classic beach cruiser, 7-speed, comfy saddle, basket included.', 'Rogers, AR',
   'https://images.unsplash.com/photo-1774722396639-a0a6fed00deb?auto=format&fit=crop&w=1200&q=80', true);
