-- Phase 1: Course content management (courses, modules, lessons, materials)

BEGIN;

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_level_enum') THEN
    CREATE TYPE course_level_enum AS ENUM ('beginner', 'intermediate', 'advanced');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_source_type') THEN
    CREATE TYPE media_source_type AS ENUM ('upload', 'url');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'course_status_enum') THEN
    CREATE TYPE course_status_enum AS ENUM ('draft', 'published', 'archived');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'video_provider_enum') THEN
    CREATE TYPE video_provider_enum AS ENUM ('upload', 'youtube', 'vimeo', 'bunny', 'cloudflare', 'external');
  END IF;
END $$;

-- Slug helper (base)
CREATE OR REPLACE FUNCTION fn_slugify(p_text TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT NULLIF(
    trim(both '-' from lower(regexp_replace(
      regexp_replace(coalesce(trim(p_text), ''), '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ))),
    ''
  );
$$;

-- Expand courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS full_description TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS level_enum course_level_enum;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS cover_type media_source_type DEFAULT 'url';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS banner_type media_source_type DEFAULT 'url';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status course_status_enum DEFAULT 'draft';

-- Rename course_modules -> modules
ALTER TABLE IF EXISTS course_modules RENAME TO modules;

ALTER TABLE modules ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
ALTER TABLE modules ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE OR REPLACE FUNCTION fn_unique_course_slug(p_title TEXT, p_course_id BIGINT DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_base TEXT;
  v_slug TEXT;
  v_counter INT := 0;
BEGIN
  v_base := coalesce(fn_slugify(p_title), 'curso');
  v_slug := v_base;
  WHILE EXISTS (
    SELECT 1 FROM courses c
    WHERE c.slug = v_slug AND (p_course_id IS NULL OR c.id <> p_course_id)
  ) LOOP
    v_counter := v_counter + 1;
    v_slug := v_base || '-' || v_counter;
  END LOOP;
  RETURN v_slug;
END;
$$;

CREATE OR REPLACE FUNCTION fn_unique_module_slug(p_course_id BIGINT, p_title TEXT, p_module_id BIGINT DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_base TEXT;
  v_slug TEXT;
  v_counter INT := 0;
BEGIN
  v_base := coalesce(fn_slugify(p_title), 'modulo');
  v_slug := v_base;
  WHILE EXISTS (
    SELECT 1 FROM modules m
    WHERE m.course_id = p_course_id AND m.slug = v_slug
      AND (p_module_id IS NULL OR m.id <> p_module_id)
  ) LOOP
    v_counter := v_counter + 1;
    v_slug := v_base || '-' || v_counter;
  END LOOP;
  RETURN v_slug;
END;
$$;

UPDATE courses
SET
  slug = fn_unique_course_slug(title, id),
  short_description = coalesce(short_description, description),
  full_description = coalesce(full_description, content),
  cover_url = coalesce(cover_url, image_url),
  cover_type = CASE WHEN image_url IS NOT NULL THEN 'url'::media_source_type ELSE 'url'::media_source_type END,
  status = CASE WHEN is_active THEN 'published'::course_status_enum ELSE 'draft'::course_status_enum END
WHERE slug IS NULL;

ALTER TABLE courses ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_courses_slug ON courses (slug);

UPDATE modules m
SET slug = fn_unique_module_slug(m.course_id, m.title, m.id)
WHERE m.slug IS NULL;

DROP TRIGGER IF EXISTS trg_modules_updated_at ON modules;
CREATE TRIGGER trg_modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Lessons
CREATE TABLE IF NOT EXISTS lessons (
  id BIGSERIAL PRIMARY KEY,
  course_id BIGINT NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  module_id BIGINT NOT NULL REFERENCES modules (id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT,
  video_provider video_provider_enum DEFAULT 'external',
  duration_minutes INT NOT NULL DEFAULT 0,
  order_number INT NOT NULL DEFAULT 1,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT lessons_course_slug_unique UNIQUE (course_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons (module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons (course_id);

DROP TRIGGER IF EXISTS trg_lessons_updated_at ON lessons;
CREATE TRIGGER trg_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE OR REPLACE FUNCTION fn_unique_lesson_slug(p_course_id BIGINT, p_title TEXT, p_lesson_id BIGINT DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_base TEXT;
  v_slug TEXT;
  v_counter INT := 0;
BEGIN
  v_base := coalesce(fn_slugify(p_title), 'aula');
  v_slug := v_base;
  WHILE EXISTS (
    SELECT 1 FROM lessons l
    WHERE l.course_id = p_course_id AND l.slug = v_slug
      AND (p_lesson_id IS NULL OR l.id <> p_lesson_id)
  ) LOOP
    v_counter := v_counter + 1;
    v_slug := v_base || '-' || v_counter;
  END LOOP;
  RETURN v_slug;
END;
$$;

-- Seed one lesson per existing module
INSERT INTO lessons (course_id, module_id, title, slug, description, order_number, duration_minutes, is_published)
SELECT
  m.course_id,
  m.id,
  m.title,
  fn_unique_lesson_slug(m.course_id, m.title),
  coalesce(m.description, 'Conteúdo da aula.'),
  m.order_index,
  m.duration_minutes,
  TRUE
FROM modules m
WHERE NOT EXISTS (SELECT 1 FROM lessons l WHERE l.module_id = m.id);

-- Lesson materials
CREATE TABLE IF NOT EXISTS lesson_materials (
  id BIGSERIAL PRIMARY KEY,
  lesson_id BIGINT NOT NULL REFERENCES lessons (id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100),
  file_size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_materials_lesson_id ON lesson_materials (lesson_id);

-- Refactor lesson_progress: module_id -> lesson_id
CREATE TABLE IF NOT EXISTS lesson_progress_new (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  lesson_id BIGINT NOT NULL REFERENCES lessons (id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT lesson_progress_new_user_lesson_unique UNIQUE (user_id, lesson_id)
);

INSERT INTO lesson_progress_new (user_id, lesson_id, completed_at)
SELECT lp.user_id, l.id, lp.completed_at
FROM lesson_progress lp
INNER JOIN lessons l ON l.module_id = lp.module_id
ON CONFLICT (user_id, lesson_id) DO NOTHING;

DROP TABLE IF EXISTS lesson_progress;
ALTER TABLE lesson_progress_new RENAME TO lesson_progress;

-- Update courses.lessons label from real count
UPDATE courses c
SET lessons = (
  SELECT count(*)::TEXT || ' aulas'
  FROM lessons l
  WHERE l.course_id = c.id AND l.is_published = TRUE
);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('course-images', 'course-images', FALSE, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('lesson-videos', 'lesson-videos', FALSE, 524288000, ARRAY['video/mp4', 'video/webm', 'video/quicktime']),
  ('lesson-materials', 'lesson-materials', FALSE, 52428800, ARRAY[
    'application/pdf', 'application/zip', 'application/x-zip-compressed',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ])
ON CONFLICT (id) DO NOTHING;

COMMIT;
