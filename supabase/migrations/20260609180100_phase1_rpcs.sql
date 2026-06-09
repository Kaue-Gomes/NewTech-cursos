-- Phase 1 RPCs: courses, modules, lessons, materials, progress

BEGIN;

-- fn_get_courses (published only, extended fields)
CREATE OR REPLACE FUNCTION fn_get_courses()
RETURNS TABLE (
  id BIGINT,
  slug VARCHAR,
  title VARCHAR,
  workload VARCHAR,
  lessons VARCHAR,
  level VARCHAR,
  level_enum course_level_enum,
  instructor VARCHAR,
  image TEXT,
  cover_type media_source_type,
  cover_url TEXT,
  banner_type media_source_type,
  banner_url TEXT,
  category VARCHAR,
  short_description TEXT,
  description TEXT,
  full_description TEXT,
  content TEXT,
  price NUMERIC,
  status course_status_enum
)
LANGUAGE sql STABLE
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
  SELECT
    c.id,
    c.slug,
    c.title,
    c.workload,
    coalesce((SELECT count(*)::TEXT || ' aulas' FROM lessons l WHERE l.course_id = c.id AND l.is_published), c.lessons),
    c.level,
    c.level_enum,
    c.instructor,
    coalesce(c.cover_url, c.image_url),
    c.cover_type,
    c.cover_url,
    c.banner_type,
    c.banner_url,
    c.category,
    c.short_description,
    c.description,
    c.full_description,
    c.content,
    c.price,
    c.status
  FROM courses c
  WHERE c.status = 'published'
  ORDER BY c.id;
$$;

CREATE OR REPLACE FUNCTION fn_get_course_by_id(p_course_id BIGINT)
RETURNS TABLE (
  id BIGINT,
  slug VARCHAR,
  title VARCHAR,
  workload VARCHAR,
  lessons VARCHAR,
  level VARCHAR,
  level_enum course_level_enum,
  instructor VARCHAR,
  image TEXT,
  cover_type media_source_type,
  cover_url TEXT,
  banner_type media_source_type,
  banner_url TEXT,
  category VARCHAR,
  short_description TEXT,
  description TEXT,
  full_description TEXT,
  content TEXT,
  price NUMERIC,
  status course_status_enum
)
LANGUAGE sql STABLE
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
  SELECT
    c.id, c.slug, c.title, c.workload,
    coalesce((SELECT count(*)::TEXT || ' aulas' FROM lessons l WHERE l.course_id = c.id AND l.is_published), c.lessons),
    c.level, c.level_enum, c.instructor,
    coalesce(c.cover_url, c.image_url),
    c.cover_type, c.cover_url, c.banner_type, c.banner_url,
    c.category, c.short_description, c.description, c.full_description, c.content,
    c.price, c.status
  FROM courses c
  WHERE c.id = p_course_id AND c.status = 'published';
$$;

CREATE OR REPLACE FUNCTION fn_get_course_by_slug(p_slug TEXT)
RETURNS TABLE (
  id BIGINT,
  slug VARCHAR,
  title VARCHAR,
  workload VARCHAR,
  lessons VARCHAR,
  level VARCHAR,
  level_enum course_level_enum,
  instructor VARCHAR,
  image TEXT,
  cover_type media_source_type,
  cover_url TEXT,
  banner_type media_source_type,
  banner_url TEXT,
  category VARCHAR,
  short_description TEXT,
  description TEXT,
  full_description TEXT,
  content TEXT,
  price NUMERIC,
  status course_status_enum
)
LANGUAGE plpgsql STABLE
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_course_id BIGINT;
BEGIN
  SELECT c.id INTO v_course_id FROM courses c WHERE c.slug = p_slug AND c.status = 'published' LIMIT 1;
  IF v_course_id IS NULL THEN RETURN; END IF;
  RETURN QUERY SELECT * FROM fn_get_course_by_id(v_course_id);
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_course_admin(p_course_id BIGINT)
RETURNS TABLE (
  id BIGINT,
  slug VARCHAR,
  title VARCHAR,
  workload VARCHAR,
  lessons VARCHAR,
  level VARCHAR,
  level_enum course_level_enum,
  instructor VARCHAR,
  image TEXT,
  cover_type media_source_type,
  cover_url TEXT,
  banner_type media_source_type,
  banner_url TEXT,
  category VARCHAR,
  short_description TEXT,
  description TEXT,
  full_description TEXT,
  content TEXT,
  price NUMERIC,
  status course_status_enum
)
LANGUAGE sql STABLE
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
  SELECT
    c.id, c.slug, c.title, c.workload,
    coalesce((SELECT count(*)::TEXT || ' aulas' FROM lessons l WHERE l.course_id = c.id), c.lessons),
    c.level, c.level_enum, c.instructor,
    coalesce(c.cover_url, c.image_url),
    c.cover_type, c.cover_url, c.banner_type, c.banner_url,
    c.category, c.short_description, c.description, c.full_description, c.content,
    c.price, c.status
  FROM courses c
  WHERE c.id = p_course_id;
$$;

CREATE OR REPLACE FUNCTION fn_add_course(
  p_title TEXT,
  p_slug TEXT DEFAULT NULL,
  p_workload TEXT DEFAULT NULL,
  p_lessons TEXT DEFAULT NULL,
  p_level TEXT DEFAULT NULL,
  p_level_enum course_level_enum DEFAULT NULL,
  p_instructor TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_cover_type media_source_type DEFAULT 'url',
  p_cover_url TEXT DEFAULT NULL,
  p_banner_type media_source_type DEFAULT 'url',
  p_banner_url TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_short_description TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_full_description TEXT DEFAULT NULL,
  p_content TEXT DEFAULT NULL,
  p_price NUMERIC DEFAULT NULL,
  p_status course_status_enum DEFAULT 'draft'
)
RETURNS BIGINT
LANGUAGE plpgsql
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_course_id BIGINT;
  v_slug TEXT;
  v_cover TEXT;
BEGIN
  v_slug := coalesce(NULLIF(trim(p_slug), ''), fn_unique_course_slug(p_title));
  v_cover := coalesce(p_cover_url, p_image_url);

  INSERT INTO courses (
    title, slug, workload, lessons, level, level_enum, instructor,
    image_url, cover_type, cover_url, banner_type, banner_url,
    category, short_description, description, full_description, content,
    price, status, is_active
  ) VALUES (
    trim(p_title), v_slug, p_workload, p_lessons, p_level, p_level_enum, p_instructor,
    v_cover, coalesce(p_cover_type, 'url'), v_cover,
    coalesce(p_banner_type, 'url'), p_banner_url,
    p_category, p_short_description, p_description, p_full_description, p_content,
    p_price, coalesce(p_status, 'draft'),
    coalesce(p_status, 'draft') = 'published'
  )
  RETURNING id INTO v_course_id;

  RETURN v_course_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_update_course(
  p_course_id BIGINT,
  p_title TEXT DEFAULT NULL,
  p_slug TEXT DEFAULT NULL,
  p_workload TEXT DEFAULT NULL,
  p_lessons TEXT DEFAULT NULL,
  p_level TEXT DEFAULT NULL,
  p_level_enum course_level_enum DEFAULT NULL,
  p_instructor TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_cover_type media_source_type DEFAULT NULL,
  p_cover_url TEXT DEFAULT NULL,
  p_banner_type media_source_type DEFAULT NULL,
  p_banner_url TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_short_description TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_full_description TEXT DEFAULT NULL,
  p_content TEXT DEFAULT NULL,
  p_price NUMERIC DEFAULT NULL,
  p_status course_status_enum DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_cover TEXT;
BEGIN
  v_cover := coalesce(p_cover_url, p_image_url);

  UPDATE courses
  SET
    title = coalesce(NULLIF(trim(p_title), ''), title),
    slug = coalesce(NULLIF(trim(p_slug), ''), slug),
    workload = coalesce(p_workload, workload),
    lessons = coalesce(p_lessons, lessons),
    level = coalesce(p_level, level),
    level_enum = coalesce(p_level_enum, level_enum),
    instructor = coalesce(p_instructor, instructor),
    image_url = coalesce(v_cover, image_url),
    cover_type = coalesce(p_cover_type, cover_type),
    cover_url = coalesce(v_cover, cover_url),
    banner_type = coalesce(p_banner_type, banner_type),
    banner_url = coalesce(p_banner_url, banner_url),
    category = coalesce(p_category, category),
    short_description = coalesce(p_short_description, short_description),
    description = coalesce(p_description, description),
    full_description = coalesce(p_full_description, full_description),
    content = coalesce(p_content, content),
    price = coalesce(p_price, price),
    status = coalesce(p_status, status),
    is_active = coalesce(p_status, status) = 'published',
    updated_at = NOW()
  WHERE id = p_course_id;

  RETURN FOUND;
END;
$$;

-- Modules CRUD
CREATE OR REPLACE FUNCTION fn_get_course_modules(p_course_id BIGINT)
RETURNS TABLE (
  id BIGINT,
  course_id BIGINT,
  title VARCHAR,
  slug VARCHAR,
  description TEXT,
  order_index INT,
  duration_minutes INT
)
LANGUAGE sql STABLE
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
  SELECT m.id, m.course_id, m.title, m.slug, m.description, m.order_index, m.duration_minutes
  FROM modules m
  WHERE m.course_id = p_course_id
  ORDER BY m.order_index;
$$;

CREATE OR REPLACE FUNCTION fn_add_module(
  p_course_id BIGINT,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_duration_minutes INT DEFAULT 0,
  p_order_index INT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_id BIGINT;
  v_order INT;
BEGIN
  v_order := coalesce(p_order_index, (SELECT coalesce(max(order_index), 0) + 1 FROM modules WHERE course_id = p_course_id));

  INSERT INTO modules (course_id, title, slug, description, order_index, duration_minutes)
  VALUES (
    p_course_id,
    trim(p_title),
    fn_unique_module_slug(p_course_id, p_title),
    p_description,
    v_order,
    coalesce(p_duration_minutes, 0)
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_update_module(
  p_module_id BIGINT,
  p_title TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_duration_minutes INT DEFAULT NULL,
  p_order_index INT DEFAULT NULL,
  p_slug TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_course_id BIGINT;
BEGIN
  SELECT course_id INTO v_course_id FROM modules WHERE id = p_module_id;

  UPDATE modules
  SET
    title = coalesce(NULLIF(trim(p_title), ''), title),
    slug = coalesce(NULLIF(trim(p_slug), ''), slug),
    description = coalesce(p_description, description),
    duration_minutes = coalesce(p_duration_minutes, duration_minutes),
    order_index = coalesce(p_order_index, order_index),
    updated_at = NOW()
  WHERE id = p_module_id;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION fn_delete_module(p_module_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
BEGIN
  DELETE FROM modules WHERE id = p_module_id;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION fn_reorder_modules(p_course_id BIGINT, p_module_ids BIGINT[])
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_id BIGINT;
  v_idx INT := 1;
BEGIN
  FOREACH v_id IN ARRAY p_module_ids LOOP
    UPDATE modules SET order_index = v_idx, updated_at = NOW()
    WHERE id = v_id AND course_id = p_course_id;
    v_idx := v_idx + 1;
  END LOOP;
  RETURN TRUE;
END;
$$;

-- Lessons CRUD
CREATE OR REPLACE FUNCTION fn_get_lessons(p_module_id BIGINT)
RETURNS TABLE (
  id BIGINT,
  course_id BIGINT,
  module_id BIGINT,
  title VARCHAR,
  slug VARCHAR,
  description TEXT,
  video_url TEXT,
  video_provider video_provider_enum,
  duration_minutes INT,
  order_number INT,
  is_published BOOLEAN
)
LANGUAGE sql STABLE
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
  SELECT l.id, l.course_id, l.module_id, l.title, l.slug, l.description,
    l.video_url, l.video_provider, l.duration_minutes, l.order_number, l.is_published
  FROM lessons l
  WHERE l.module_id = p_module_id
  ORDER BY l.order_number;
$$;

CREATE OR REPLACE FUNCTION fn_get_course_lessons_tree(p_course_id BIGINT)
RETURNS TABLE (
  module_id BIGINT,
  module_title VARCHAR,
  module_slug VARCHAR,
  module_order INT,
  lesson_id BIGINT,
  lesson_title VARCHAR,
  lesson_slug VARCHAR,
  lesson_order INT,
  duration_minutes INT,
  is_published BOOLEAN
)
LANGUAGE sql STABLE
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
  SELECT
    m.id, m.title, m.slug, m.order_index,
    l.id, l.title, l.slug, l.order_number, l.duration_minutes, l.is_published
  FROM modules m
  LEFT JOIN lessons l ON l.module_id = m.id
  WHERE m.course_id = p_course_id
  ORDER BY m.order_index, l.order_number;
$$;

CREATE OR REPLACE FUNCTION fn_add_lesson(
  p_module_id BIGINT,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_video_url TEXT DEFAULT NULL,
  p_video_provider video_provider_enum DEFAULT 'external',
  p_duration_minutes INT DEFAULT 0,
  p_order_number INT DEFAULT NULL,
  p_is_published BOOLEAN DEFAULT TRUE
)
RETURNS BIGINT
LANGUAGE plpgsql
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_id BIGINT;
  v_course_id BIGINT;
  v_order INT;
BEGIN
  SELECT course_id INTO v_course_id FROM modules WHERE id = p_module_id;
  v_order := coalesce(p_order_number, (SELECT coalesce(max(order_number), 0) + 1 FROM lessons WHERE module_id = p_module_id));

  INSERT INTO lessons (
    course_id, module_id, title, slug, description,
    video_url, video_provider, duration_minutes, order_number, is_published
  ) VALUES (
    v_course_id, p_module_id, trim(p_title),
    fn_unique_lesson_slug(v_course_id, p_title),
    p_description, p_video_url, coalesce(p_video_provider, 'external'),
    coalesce(p_duration_minutes, 0), v_order, coalesce(p_is_published, TRUE)
  )
  RETURNING id INTO v_id;

  UPDATE courses SET lessons = (SELECT count(*)::TEXT || ' aulas' FROM lessons WHERE course_id = v_course_id), updated_at = NOW()
  WHERE id = v_course_id;

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_update_lesson(
  p_lesson_id BIGINT,
  p_title TEXT DEFAULT NULL,
  p_slug TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_video_url TEXT DEFAULT NULL,
  p_video_provider video_provider_enum DEFAULT NULL,
  p_duration_minutes INT DEFAULT NULL,
  p_order_number INT DEFAULT NULL,
  p_is_published BOOLEAN DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_course_id BIGINT;
BEGIN
  SELECT course_id INTO v_course_id FROM lessons WHERE id = p_lesson_id;

  UPDATE lessons
  SET
    title = coalesce(NULLIF(trim(p_title), ''), title),
    slug = coalesce(NULLIF(trim(p_slug), ''), slug),
    description = coalesce(p_description, description),
    video_url = coalesce(p_video_url, video_url),
    video_provider = coalesce(p_video_provider, video_provider),
    duration_minutes = coalesce(p_duration_minutes, duration_minutes),
    order_number = coalesce(p_order_number, order_number),
    is_published = coalesce(p_is_published, is_published),
    updated_at = NOW()
  WHERE id = p_lesson_id;

  UPDATE courses SET lessons = (SELECT count(*)::TEXT || ' aulas' FROM lessons WHERE course_id = v_course_id), updated_at = NOW()
  WHERE id = v_course_id;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION fn_delete_lesson(p_lesson_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_course_id BIGINT;
BEGIN
  SELECT course_id INTO v_course_id FROM lessons WHERE id = p_lesson_id;
  DELETE FROM lessons WHERE id = p_lesson_id;
  UPDATE courses SET lessons = (SELECT count(*)::TEXT || ' aulas' FROM lessons WHERE course_id = v_course_id), updated_at = NOW()
  WHERE id = v_course_id;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION fn_reorder_lessons(p_module_id BIGINT, p_lesson_ids BIGINT[])
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_id BIGINT;
  v_idx INT := 1;
BEGIN
  FOREACH v_id IN ARRAY p_lesson_ids LOOP
    UPDATE lessons SET order_number = v_idx, updated_at = NOW()
    WHERE id = v_id AND module_id = p_module_id;
    v_idx := v_idx + 1;
  END LOOP;
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_lesson_by_slug(p_course_slug TEXT, p_lesson_slug TEXT)
RETURNS TABLE (
  id BIGINT,
  course_id BIGINT,
  course_slug VARCHAR,
  course_title VARCHAR,
  module_id BIGINT,
  module_title VARCHAR,
  title VARCHAR,
  slug VARCHAR,
  description TEXT,
  video_url TEXT,
  video_provider video_provider_enum,
  duration_minutes INT,
  order_number INT
)
LANGUAGE sql STABLE
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
  SELECT
    l.id, c.id, c.slug, c.title,
    m.id, m.title,
    l.title, l.slug, l.description,
    l.video_url, l.video_provider, l.duration_minutes, l.order_number
  FROM lessons l
  INNER JOIN courses c ON c.id = l.course_id
  INNER JOIN modules m ON m.id = l.module_id
  WHERE c.slug = p_course_slug
    AND l.slug = p_lesson_slug
    AND l.is_published = TRUE
    AND c.status = 'published';
$$;

CREATE OR REPLACE FUNCTION fn_get_lesson_navigation(p_course_id BIGINT, p_lesson_id BIGINT)
RETURNS TABLE (
  prev_lesson_id BIGINT,
  prev_lesson_slug VARCHAR,
  prev_lesson_title VARCHAR,
  next_lesson_id BIGINT,
  next_lesson_slug VARCHAR,
  next_lesson_title VARCHAR
)
LANGUAGE plpgsql STABLE
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_ordered BIGINT[];
  v_idx INT;
BEGIN
  SELECT array_agg(l.id ORDER BY m.order_index, l.order_number)
  INTO v_ordered
  FROM lessons l
  INNER JOIN modules m ON m.id = l.module_id
  WHERE l.course_id = p_course_id AND l.is_published = TRUE;

  v_idx := array_position(v_ordered, p_lesson_id);

  RETURN QUERY
  SELECT
    CASE WHEN v_idx > 1 THEN v_ordered[v_idx - 1] END,
    (SELECT slug FROM lessons WHERE id = v_ordered[v_idx - 1]),
    (SELECT title FROM lessons WHERE id = v_ordered[v_idx - 1]),
    CASE WHEN v_idx < array_length(v_ordered, 1) THEN v_ordered[v_idx + 1] END,
    (SELECT slug FROM lessons WHERE id = v_ordered[v_idx + 1]),
    (SELECT title FROM lessons WHERE id = v_ordered[v_idx + 1]);
END;
$$;

-- Materials
CREATE OR REPLACE FUNCTION fn_get_lesson_materials(p_lesson_id BIGINT)
RETURNS TABLE (
  id BIGINT,
  lesson_id BIGINT,
  name VARCHAR,
  file_url TEXT,
  file_type VARCHAR,
  file_size_bytes BIGINT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql STABLE
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
  SELECT lm.id, lm.lesson_id, lm.name, lm.file_url, lm.file_type, lm.file_size_bytes, lm.created_at
  FROM lesson_materials lm
  WHERE lm.lesson_id = p_lesson_id
  ORDER BY lm.created_at;
$$;

CREATE OR REPLACE FUNCTION fn_add_lesson_material(
  p_lesson_id BIGINT,
  p_name TEXT,
  p_file_url TEXT,
  p_file_type TEXT DEFAULT NULL,
  p_file_size_bytes BIGINT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_id BIGINT;
BEGIN
  INSERT INTO lesson_materials (lesson_id, name, file_url, file_type, file_size_bytes)
  VALUES (p_lesson_id, trim(p_name), p_file_url, p_file_type, p_file_size_bytes)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_delete_lesson_material(p_material_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
BEGIN
  DELETE FROM lesson_materials WHERE id = p_material_id;
  RETURN FOUND;
END;
$$;

-- Progress by lesson
CREATE OR REPLACE FUNCTION fn_get_course_progress(p_email TEXT, p_course_id BIGINT)
RETURNS TABLE (
  module_id BIGINT,
  title VARCHAR,
  order_index INT,
  duration_minutes INT,
  completed BOOLEAN,
  total_lessons INT,
  completed_lessons INT
)
LANGUAGE plpgsql STABLE
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_user_id BIGINT;
BEGIN
  SELECT u.id INTO v_user_id FROM users u
  WHERE lower(u.email) = lower(trim(p_email)) AND u.is_active = TRUE;

  IF v_user_id IS NULL THEN RETURN; END IF;

  RETURN QUERY
  SELECT
    m.id,
    m.title,
    m.order_index,
    m.duration_minutes,
    (
      SELECT total.c > 0 AND total.c = done.c
      FROM
        (SELECT count(*)::INT AS c FROM lessons l3 WHERE l3.module_id = m.id AND l3.is_published = TRUE) total,
        (
          SELECT count(*)::INT AS c
          FROM lessons l4
          INNER JOIN lesson_progress lp ON lp.lesson_id = l4.id AND lp.user_id = v_user_id
          WHERE l4.module_id = m.id AND l4.is_published = TRUE
        ) done
    ),
    (SELECT count(*)::INT FROM lessons l3 WHERE l3.module_id = m.id AND l3.is_published = TRUE),
    (
      SELECT count(*)::INT FROM lessons l4
      INNER JOIN lesson_progress lp ON lp.lesson_id = l4.id AND lp.user_id = v_user_id
      WHERE l4.module_id = m.id AND l4.is_published = TRUE
    )
  FROM modules m
  WHERE m.course_id = p_course_id
  ORDER BY m.order_index;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_lesson_progress(p_email TEXT, p_course_id BIGINT)
RETURNS TABLE (lesson_id BIGINT, completed BOOLEAN)
LANGUAGE plpgsql STABLE
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_user_id BIGINT;
BEGIN
  SELECT u.id INTO v_user_id FROM users u
  WHERE lower(u.email) = lower(trim(p_email)) AND u.is_active = TRUE;
  IF v_user_id IS NULL THEN RETURN; END IF;

  RETURN QUERY
  SELECT l.id, EXISTS (
    SELECT 1 FROM lesson_progress lp WHERE lp.user_id = v_user_id AND lp.lesson_id = l.id
  )
  FROM lessons l
  WHERE l.course_id = p_course_id AND l.is_published = TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION fn_complete_lesson(p_email TEXT, p_lesson_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_user_id BIGINT;
  v_course_id BIGINT;
  v_total INT;
  v_done INT;
  v_enrollment_id BIGINT;
BEGIN
  SELECT u.id INTO v_user_id FROM users u
  WHERE lower(u.email) = lower(trim(p_email)) AND u.is_active = TRUE;
  IF v_user_id IS NULL THEN RETURN FALSE; END IF;

  SELECT l.course_id INTO v_course_id FROM lessons l WHERE l.id = p_lesson_id;
  IF v_course_id IS NULL THEN RETURN FALSE; END IF;

  INSERT INTO lesson_progress (user_id, lesson_id) VALUES (v_user_id, p_lesson_id)
  ON CONFLICT (user_id, lesson_id) DO NOTHING;

  SELECT count(*) INTO v_total FROM lessons WHERE course_id = v_course_id AND is_published = TRUE;
  SELECT count(*) INTO v_done
  FROM lesson_progress lp
  INNER JOIN lessons l ON l.id = lp.lesson_id
  WHERE lp.user_id = v_user_id AND l.course_id = v_course_id AND l.is_published = TRUE;

  IF v_total > 0 AND v_done >= v_total THEN
    UPDATE enrollments e SET status = 'Concluido', updated_at = NOW()
    WHERE e.user_id = v_user_id AND e.course_id = v_course_id
    RETURNING e.id INTO v_enrollment_id;

    IF v_enrollment_id IS NOT NULL THEN
      PERFORM fn_issue_certificate(v_enrollment_id);
    END IF;
  END IF;

  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION fn_complete_module(p_email TEXT, p_module_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_lesson_id BIGINT;
BEGIN
  FOR v_lesson_id IN
    SELECT l.id FROM lessons l WHERE l.module_id = p_module_id AND l.is_published = TRUE
  LOOP
    PERFORM fn_complete_lesson(p_email, v_lesson_id);
  END LOOP;
  RETURN TRUE;
END;
$$;

COMMIT;
