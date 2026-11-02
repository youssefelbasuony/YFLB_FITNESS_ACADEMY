-- Cover application foreign keys so deletes and joins stay efficient.
CREATE INDEX IF NOT EXISTS machine_muscles_muscle_idx ON machine_muscles(muscle_id);
CREATE INDEX IF NOT EXISTS user_machines_machine_idx ON user_machines(machine_id);
CREATE INDEX IF NOT EXISTS workout_completions_workout_idx ON workout_completions(workout_id);
CREATE INDEX IF NOT EXISTS workout_exercises_workout_idx ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS workout_exercises_machine_idx ON workout_exercises(machine_id);
CREATE INDEX IF NOT EXISTS video_uploads_machine_idx ON video_uploads(machine_id);
CREATE INDEX IF NOT EXISTS video_uploads_uploaded_by_idx ON video_uploads(uploaded_by);
CREATE INDEX IF NOT EXISTS member_planner_profiles_plan_idx ON member_planner_profiles(plan_id);
CREATE INDEX IF NOT EXISTS member_training_sessions_plan_idx ON member_training_sessions(plan_id);
INSERT INTO yflb_migration_runs(id) VALUES('001_foreign_key_indexes') ON CONFLICT(id) DO NOTHING;
