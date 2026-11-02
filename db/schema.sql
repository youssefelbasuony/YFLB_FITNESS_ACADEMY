CREATE TABLE IF NOT EXISTS machines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'Start here',
  description TEXT NOT NULL,
  description_ar TEXT NOT NULL DEFAULT '',
  setup TEXT NOT NULL,
  setup_ar TEXT NOT NULL DEFAULT '',
  steps_json TEXT NOT NULL,
  steps_ar_json TEXT NOT NULL DEFAULT '[]',
  feel TEXT NOT NULL,
  feel_ar TEXT NOT NULL DEFAULT '',
  common_cue TEXT NOT NULL,
  common_cue_ar TEXT NOT NULL DEFAULT '',
  translations_json TEXT NOT NULL DEFAULT '{}',
  localized_media_json TEXT NOT NULL DEFAULT '{}',
  video_url TEXT,
  video_mime TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS muscles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL,
  region_ar TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  description_ar TEXT NOT NULL DEFAULT '',
  beginner_tip TEXT NOT NULL,
  beginner_tip_ar TEXT NOT NULL DEFAULT '',
  translations_json TEXT NOT NULL DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS machine_muscles (
  machine_id TEXT NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  muscle_id TEXT NOT NULL REFERENCES muscles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('primary','secondary')),
  PRIMARY KEY (machine_id, muscle_id)
);
CREATE TABLE IF NOT EXISTS user_machines (
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  machine_id TEXT NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, machine_id)
);
CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  description_ar TEXT NOT NULL DEFAULT '',
  day_label TEXT NOT NULL,
  day_label_ar TEXT NOT NULL DEFAULT '',
  translations_json TEXT NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS workout_exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  machine_id TEXT REFERENCES machines(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL DEFAULT '',
  translations_json TEXT NOT NULL DEFAULT '{}',
  sets INTEGER,
  reps TEXT,
  sort_order INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS workout_completions (
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  workout_id TEXT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, workout_id)
);
CREATE TABLE IF NOT EXISTS video_uploads (
  id TEXT PRIMARY KEY,
  machine_id TEXT NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
  uploaded_by TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  bytes INTEGER NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS training_plans (
  id TEXT PRIMARY KEY,
  goal TEXT NOT NULL CHECK (goal IN ('muscle_building','weight_loss','general_fitness')),
  experience_level TEXT NOT NULL CHECK (experience_level IN ('beginner','intermediate','advanced')),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes BETWEEN 15 AND 180),
  days_per_week INTEGER NOT NULL CHECK (days_per_week BETWEEN 1 AND 7),
  published INTEGER NOT NULL DEFAULT 0 CHECK (published IN (0,1)),
  plan_json TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS member_planner_profiles (
  user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  profile_json TEXT NOT NULL,
  plan_id TEXT REFERENCES training_plans(id) ON DELETE SET NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS member_training_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
  plan_day_id TEXT NOT NULL,
  scheduled_date TEXT NOT NULL,
  original_date TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','completed','skipped')),
  snapshot_json TEXT NOT NULL,
  progress_json TEXT NOT NULL DEFAULT '{}',
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id,plan_id,plan_day_id,scheduled_date)
);
CREATE INDEX IF NOT EXISTS member_sessions_user_date_idx ON member_training_sessions(user_id,scheduled_date);
CREATE INDEX IF NOT EXISTS machine_category_idx ON machines(category);
CREATE INDEX IF NOT EXISTS user_machines_user_idx ON user_machines(user_id);
CREATE INDEX IF NOT EXISTS workout_completions_user_idx ON workout_completions(user_id);
