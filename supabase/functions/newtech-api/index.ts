import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-session-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Session = {
  id: number;
  email: string;
  role: "admin" | "student";
};

type ApiRequest = {
  action: string;
  payload?: Record<string, unknown>;
};

const SESSION_HEADER = "x-session-token";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

async function getSessionSecret() {
  const secret =
    Deno.env.get("NEWTECH_SESSION_SECRET") ??
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!secret) {
    throw new Error("Session secret not configured");
  }

  return new TextEncoder().encode(secret);
}

function base64UrlEncode(data: Uint8Array | string) {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string) {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function getHmacKey(secret: Uint8Array) {
  return crypto.subtle.importKey(
    "raw",
    secret,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signSession(session: Session) {
  const secret = await getSessionSecret();
  const key = await getHmacKey(secret);
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(JSON.stringify({
    id: session.id,
    email: session.email,
    role: session.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  }));
  const data = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data),
  );
  return `${data}.${base64UrlEncode(new Uint8Array(signature))}`;
}

async function verifySession(token: string | null): Promise<Session | null> {
  if (!token) return null;

  try {
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) return null;

    const secret = await getSessionSecret();
    const key = await getHmacKey(secret);
    const data = `${header}.${payload}`;
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(signature),
      new TextEncoder().encode(data),
    );

    if (!valid) return null;

    const decoded = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload))) as {
      id: number;
      email: string;
      role: string;
      exp?: number;
    };

    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) return null;

    const id = Number(decoded.id);
    const email = String(decoded.email ?? "");
    const role = decoded.role === "admin" ? "admin" : "student";

    if (!email || !Number.isFinite(id)) return null;
    return { id, email, role };
  } catch {
    return null;
  }
}

function mapCourse(row: Record<string, unknown>) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    workload: row.workload,
    lessons: row.lessons,
    level: row.level,
    levelEnum: row.level_enum,
    instructor: row.instructor,
    image: row.image ?? row.image_url ?? row.cover_url,
    coverType: row.cover_type,
    coverUrl: row.cover_url ?? row.image_url,
    bannerType: row.banner_type,
    bannerUrl: row.banner_url,
    category: row.category,
    shortDescription: row.short_description,
    description: row.description,
    fullDescription: row.full_description,
    content: row.content,
    price: row.price,
    status: row.status,
  };
}

const STORAGE_BUCKETS = {
  "course-images": {
    maxBytes: 5 * 1024 * 1024,
    mimes: ["image/jpeg", "image/png", "image/webp"],
  },
  "lesson-videos": {
    maxBytes: 500 * 1024 * 1024,
    mimes: ["video/mp4", "video/webm", "video/quicktime"],
  },
  "lesson-materials": {
    maxBytes: 50 * 1024 * 1024,
    mimes: [
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
  },
} as const;

type StorageBucket = keyof typeof STORAGE_BUCKETS;

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

function inferBucketFromPath(path: string): StorageBucket {
  if (path.startsWith("courses/")) return "course-images";
  if (path.startsWith("videos/")) return "lesson-videos";
  return "lesson-materials";
}

function detectVideoProvider(url: string): string {
  const value = url.toLowerCase();
  if (value.includes("youtube.com") || value.includes("youtu.be")) return "youtube";
  if (value.includes("vimeo.com")) return "vimeo";
  if (value.includes("bunny")) return "bunny";
  if (value.includes("cloudflare")) return "cloudflare";
  if (value.startsWith("videos/")) return "upload";
  return "external";
}

async function resolveStorageUrl(
  supabase: ReturnType<typeof getServiceClient>,
  value: string | null | undefined,
) {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const bucket = inferBucketFromPath(value);
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(value, 3600);
  if (error) return value;
  return data.signedUrl;
}

function mapModule(row: Record<string, unknown>) {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    orderIndex: row.order_index,
    durationMinutes: row.duration_minutes,
  };
}

function mapLesson(row: Record<string, unknown>) {
  return {
    id: row.id,
    courseId: row.course_id,
    moduleId: row.module_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    videoUrl: row.video_url,
    videoProvider: row.video_provider,
    durationMinutes: row.duration_minutes,
    orderNumber: row.order_number,
    isPublished: row.is_published,
  };
}

function mapMaterial(row: Record<string, unknown>) {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    name: row.name,
    fileUrl: row.file_url,
    fileType: row.file_type,
    fileSizeBytes: row.file_size_bytes,
    createdAt: row.created_at,
  };
}

async function userHasEnrollment(
  supabase: ReturnType<typeof getServiceClient>,
  email: string,
  courseId: number,
) {
  const { data } = await supabase.rpc("fn_get_student_enrollments", { p_email: email });
  return (data ?? []).some((row: Record<string, unknown>) => Number(row.course_id) === courseId);
}

function mapStudent(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    phone: row.phone ?? "",
    document: row.document ?? "",
    birthdate: row.birthdate ?? "",
    address: row.address ?? {},
  };
}

function mapEnrollment(row: Record<string, unknown>) {
  return {
    id: row.id,
    email: row.email,
    courseId: row.course_id,
    date: row.date,
    status: row.status,
    paymentStatus: row.paymentStatus,
    orderNumber: row.orderNumber,
    course: mapCourse({
      id: row.course_id,
      title: row.course_title,
      workload: row.workload,
      lessons: row.lessons,
      level: row.level,
      instructor: row.instructor,
      image: row.image,
      description: row.description,
      content: row.content,
    }),
  };
}

function requireSession(session: Session | null) {
  if (!session) {
    throw new Error("Sessão inválida ou expirada.");
  }
  return session;
}

function requireAdmin(session: Session) {
  if (session.role !== "admin") {
    throw new Error("Acesso restrito ao administrador.");
  }
}

function requireSelfOrAdmin(session: Session, email: string) {
  if (session.role === "admin") return;
  if (session.email.toLowerCase() !== email.toLowerCase()) {
    throw new Error("Você não tem permissão para acessar estes dados.");
  }
}

async function handleAction(
  action: string,
  payload: Record<string, unknown>,
  session: Session | null,
) {
  const supabase = getServiceClient();

  switch (action) {
    case "login": {
      const email = String(payload.email ?? "");
      const password = String(payload.password ?? "");
      const { data, error } = await supabase.rpc("fn_login", {
        p_email: email,
        p_password: password,
      });

      if (error) throw error;
      if (!data?.length) return { ok: false, message: "Credenciais inválidas." };

      const user = data[0] as Session;
      const sessionToken = await signSession(user);
      return { ok: true, user, sessionToken };
    }

    case "registerStudent": {
      const { data, error } = await supabase.rpc("fn_register_student", {
        p_name: payload.name,
        p_email: payload.email,
        p_password: payload.password,
        p_phone: payload.phone ?? null,
        p_document: payload.document ?? null,
        p_birthdate: payload.birthdate || null,
        p_cep: payload.cep ?? null,
        p_street: payload.street ?? null,
        p_number: payload.number ?? null,
        p_complement: payload.complement ?? null,
        p_district: payload.district ?? null,
        p_city: payload.city ?? null,
        p_state: payload.state ?? null,
      });

      if (error) {
        if (error.message.includes("Já existe")) {
          return { ok: false, message: error.message };
        }
        throw error;
      }

      return { ok: true, userId: data };
    }

    case "getCourses": {
      const { data, error } = await supabase.rpc("fn_get_courses");
      if (error) throw error;
      return { ok: true, data: (data ?? []).map(mapCourse) };
    }

    case "getCourseById": {
      const courseId = Number(payload.courseId);
      const { data, error } = await supabase.rpc("fn_get_course_by_id", {
        p_course_id: courseId,
      });
      if (error) throw error;
      return { ok: true, data: data?.[0] ? mapCourse(data[0]) : null };
    }

    case "getStudents": {
      const current = requireSession(session);
      requireAdmin(current);
      const { data, error } = await supabase.rpc("fn_get_students");
      if (error) throw error;
      return { ok: true, data: (data ?? []).map(mapStudent) };
    }

    case "enrollStudent": {
      const current = requireSession(session);
      const email = String(payload.email ?? current.email);
      requireSelfOrAdmin(current, email);
      const courseId = Number(payload.courseId);

      const { data, error } = await supabase.rpc("fn_enroll_student", {
        p_email: email,
        p_course_id: courseId,
      });
      if (error) throw error;
      return { ok: true, enrollmentId: data };
    }

    case "getStudentEnrollments": {
      const current = requireSession(session);
      const email = String(payload.email ?? current.email);
      requireSelfOrAdmin(current, email);

      const { data, error } = await supabase.rpc("fn_get_student_enrollments", {
        p_email: email,
      });
      if (error) throw error;
      return { ok: true, data: (data ?? []).map(mapEnrollment) };
    }

    case "getStudentCourses": {
      const current = requireSession(session);
      const email = String(payload.email ?? current.email);
      requireSelfOrAdmin(current, email);

      const { data, error } = await supabase.rpc("fn_get_student_enrollments", {
        p_email: email,
      });
      if (error) throw error;
      return {
        ok: true,
        data: (data ?? []).map((row: Record<string, unknown>) =>
          mapCourse({
            id: row.course_id,
            title: row.course_title,
            workload: row.workload,
            lessons: row.lessons,
            level: row.level,
            instructor: row.instructor,
            image: row.image,
            description: row.description,
            content: row.content,
          })
        ),
      };
    }

    case "getUserProfile": {
      const current = requireSession(session);
      const email = String(payload.email ?? current.email);
      requireSelfOrAdmin(current, email);

      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select(
          "id, name, email, role, phone, document, birthdate, address_cep, address_street, address_number, address_complement, address_district, address_city, address_state",
        )
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (userError) throw userError;

      return {
        ok: true,
        data: userRow
          ? mapStudent({
            ...userRow,
            address: {
              cep: userRow.address_cep,
              street: userRow.address_street,
              number: userRow.address_number,
              complement: userRow.address_complement,
              district: userRow.address_district,
              city: userRow.address_city,
              state: userRow.address_state,
            },
          })
          : null,
      };
    }

    case "updateUser": {
      const current = requireSession(session);
      const email = String(payload.email ?? current.email);
      requireSelfOrAdmin(current, email);
      const address = (payload.address ?? {}) as Record<string, string>;

      const { error } = await supabase.rpc("fn_update_user_profile", {
        p_email: email,
        p_name: payload.name ?? null,
        p_phone: payload.phone ?? null,
        p_document: payload.document ?? null,
        p_birthdate: payload.birthdate || null,
        p_cep: address.cep ?? null,
        p_street: address.street ?? null,
        p_number: address.number ?? null,
        p_complement: address.complement ?? null,
        p_district: address.district ?? null,
        p_city: address.city ?? null,
        p_state: address.state ?? null,
      });
      if (error) throw error;

      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select(
          "id, name, email, role, phone, document, birthdate, address_cep, address_street, address_number, address_complement, address_district, address_city, address_state",
        )
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (userError) throw userError;
      if (!userRow) return { ok: true, data: null };

      return {
        ok: true,
        data: mapStudent({
          ...userRow,
          address: {
            cep: userRow.address_cep,
            street: userRow.address_street,
            number: userRow.address_number,
            complement: userRow.address_complement,
            district: userRow.address_district,
            city: userRow.address_city,
            state: userRow.address_state,
          },
        }),
      };
    }

    case "addCourse": {
      const current = requireSession(session);
      requireAdmin(current);

      const { data, error } = await supabase.rpc("fn_add_course", {
        p_title: payload.title,
        p_slug: payload.slug ?? null,
        p_workload: payload.workload ?? null,
        p_lessons: payload.lessons ?? null,
        p_level: payload.level ?? null,
        p_level_enum: payload.levelEnum ?? null,
        p_instructor: payload.instructor ?? null,
        p_image_url: payload.image ?? payload.coverUrl ?? null,
        p_cover_type: payload.coverType ?? "url",
        p_cover_url: payload.coverUrl ?? payload.image ?? null,
        p_banner_type: payload.bannerType ?? "url",
        p_banner_url: payload.bannerUrl ?? null,
        p_category: payload.category ?? null,
        p_short_description: payload.shortDescription ?? null,
        p_description: payload.description ?? null,
        p_full_description: payload.fullDescription ?? null,
        p_content: payload.content ?? null,
        p_price: payload.price ?? null,
        p_status: payload.status ?? "draft",
      });
      if (error) throw error;

      const { data: course, error: courseError } = await supabase.rpc(
        "fn_get_course_admin",
        { p_course_id: data },
      );
      if (courseError) throw courseError;

      return { ok: true, data: course?.[0] ? mapCourse(course[0]) : { id: data } };
    }

    case "updateCourse": {
      const current = requireSession(session);
      requireAdmin(current);

      const { error } = await supabase.rpc("fn_update_course", {
        p_course_id: Number(payload.id),
        p_title: payload.title ?? null,
        p_slug: payload.slug ?? null,
        p_workload: payload.workload ?? null,
        p_lessons: payload.lessons ?? null,
        p_level: payload.level ?? null,
        p_level_enum: payload.levelEnum ?? null,
        p_instructor: payload.instructor ?? null,
        p_image_url: payload.image ?? payload.coverUrl ?? null,
        p_cover_type: payload.coverType ?? null,
        p_cover_url: payload.coverUrl ?? payload.image ?? null,
        p_banner_type: payload.bannerType ?? null,
        p_banner_url: payload.bannerUrl ?? null,
        p_category: payload.category ?? null,
        p_short_description: payload.shortDescription ?? null,
        p_description: payload.description ?? null,
        p_full_description: payload.fullDescription ?? null,
        p_content: payload.content ?? null,
        p_price: payload.price ?? null,
        p_status: payload.status ?? null,
      });
      if (error) throw error;

      const { data, error: courseError } = await supabase.rpc(
        "fn_get_course_admin",
        { p_course_id: Number(payload.id) },
      );
      if (courseError) throw courseError;

      return { ok: true, data: data?.[0] ? mapCourse(data[0]) : null };
    }

    case "deleteCourse": {
      const current = requireSession(session);
      requireAdmin(current);

      const { error } = await supabase.rpc("fn_delete_course", {
        p_course_id: Number(payload.id),
      });
      if (error) throw error;
      return { ok: true };
    }

    case "getPlatformStats": {
      const { data, error } = await supabase.rpc("fn_get_platform_stats");
      if (error) throw error;
      const row = data?.[0] ?? {};
      return {
        ok: true,
        data: {
          activeCourses: row.active_courses ?? 0,
          totalStudents: row.total_students ?? 0,
          totalEnrollments: row.total_enrollments ?? 0,
        },
      };
    }

    case "getCourseModules": {
      const { data, error } = await supabase.rpc("fn_get_course_modules", {
        p_course_id: Number(payload.courseId),
      });
      if (error) throw error;
      return { ok: true, data: (data ?? []).map(mapModule) };
    }

    case "getCourseAdmin": {
      const current = requireSession(session);
      requireAdmin(current);
      const { data, error } = await supabase.rpc("fn_get_course_admin", {
        p_course_id: Number(payload.courseId),
      });
      if (error) throw error;
      return { ok: true, data: data?.[0] ? mapCourse(data[0]) : null };
    }

    case "getCourseBySlug": {
      const { data, error } = await supabase.rpc("fn_get_course_by_slug", {
        p_slug: String(payload.slug ?? ""),
      });
      if (error) throw error;
      return { ok: true, data: data?.[0] ? mapCourse(data[0]) : null };
    }

    case "addModule": {
      const current = requireSession(session);
      requireAdmin(current);
      const { data, error } = await supabase.rpc("fn_add_module", {
        p_course_id: Number(payload.courseId),
        p_title: payload.title,
        p_description: payload.description ?? null,
        p_duration_minutes: payload.durationMinutes ?? 0,
        p_order_index: payload.orderIndex ?? null,
      });
      if (error) throw error;
      return { ok: true, id: data };
    }

    case "updateModule": {
      const current = requireSession(session);
      requireAdmin(current);
      const { error } = await supabase.rpc("fn_update_module", {
        p_module_id: Number(payload.id),
        p_title: payload.title ?? null,
        p_description: payload.description ?? null,
        p_duration_minutes: payload.durationMinutes ?? null,
        p_order_index: payload.orderIndex ?? null,
        p_slug: payload.slug ?? null,
      });
      if (error) throw error;
      return { ok: true };
    }

    case "deleteModule": {
      const current = requireSession(session);
      requireAdmin(current);
      const { error } = await supabase.rpc("fn_delete_module", {
        p_module_id: Number(payload.id),
      });
      if (error) throw error;
      return { ok: true };
    }

    case "reorderModules": {
      const current = requireSession(session);
      requireAdmin(current);
      const { error } = await supabase.rpc("fn_reorder_modules", {
        p_course_id: Number(payload.courseId),
        p_module_ids: (payload.moduleIds as number[]) ?? [],
      });
      if (error) throw error;
      return { ok: true };
    }

    case "getLessons": {
      const current = requireSession(session);
      requireAdmin(current);
      const { data, error } = await supabase.rpc("fn_get_lessons", {
        p_module_id: Number(payload.moduleId),
      });
      if (error) throw error;
      return { ok: true, data: (data ?? []).map(mapLesson) };
    }

    case "getCourseLessonsTree": {
      const { data, error } = await supabase.rpc("fn_get_course_lessons_tree", {
        p_course_id: Number(payload.courseId),
      });
      if (error) throw error;
      return { ok: true, data: data ?? [] };
    }

    case "addLesson": {
      const current = requireSession(session);
      requireAdmin(current);
      const videoUrl = payload.videoUrl ? String(payload.videoUrl) : null;
      const { data, error } = await supabase.rpc("fn_add_lesson", {
        p_module_id: Number(payload.moduleId),
        p_title: payload.title,
        p_description: payload.description ?? null,
        p_video_url: videoUrl,
        p_video_provider: payload.videoProvider ?? (videoUrl ? detectVideoProvider(videoUrl) : "external"),
        p_duration_minutes: payload.durationMinutes ?? 0,
        p_order_number: payload.orderNumber ?? null,
        p_is_published: payload.isPublished ?? true,
      });
      if (error) throw error;
      return { ok: true, id: data };
    }

    case "updateLesson": {
      const current = requireSession(session);
      requireAdmin(current);
      const videoUrl = payload.videoUrl !== undefined ? String(payload.videoUrl ?? "") : null;
      const { error } = await supabase.rpc("fn_update_lesson", {
        p_lesson_id: Number(payload.id),
        p_title: payload.title ?? null,
        p_slug: payload.slug ?? null,
        p_description: payload.description ?? null,
        p_video_url: videoUrl,
        p_video_provider: payload.videoProvider ?? (videoUrl ? detectVideoProvider(videoUrl) : null),
        p_duration_minutes: payload.durationMinutes ?? null,
        p_order_number: payload.orderNumber ?? null,
        p_is_published: payload.isPublished ?? null,
      });
      if (error) throw error;
      return { ok: true };
    }

    case "deleteLesson": {
      const current = requireSession(session);
      requireAdmin(current);
      const { error } = await supabase.rpc("fn_delete_lesson", {
        p_lesson_id: Number(payload.id),
      });
      if (error) throw error;
      return { ok: true };
    }

    case "reorderLessons": {
      const current = requireSession(session);
      requireAdmin(current);
      const { error } = await supabase.rpc("fn_reorder_lessons", {
        p_module_id: Number(payload.moduleId),
        p_lesson_ids: (payload.lessonIds as number[]) ?? [],
      });
      if (error) throw error;
      return { ok: true };
    }

    case "getLessonMaterials": {
      const { data, error } = await supabase.rpc("fn_get_lesson_materials", {
        p_lesson_id: Number(payload.lessonId),
      });
      if (error) throw error;
      const materials = await Promise.all(
        (data ?? []).map(async (row: Record<string, unknown>) => ({
          ...mapMaterial(row),
          downloadUrl: await resolveStorageUrl(supabase, String(row.file_url ?? "")),
        })),
      );
      return { ok: true, data: materials };
    }

    case "addLessonMaterial": {
      const current = requireSession(session);
      requireAdmin(current);
      const { data, error } = await supabase.rpc("fn_add_lesson_material", {
        p_lesson_id: Number(payload.lessonId),
        p_name: payload.name,
        p_file_url: payload.fileUrl,
        p_file_type: payload.fileType ?? null,
        p_file_size_bytes: payload.fileSizeBytes ?? null,
      });
      if (error) throw error;
      return { ok: true, id: data };
    }

    case "deleteLessonMaterial": {
      const current = requireSession(session);
      requireAdmin(current);
      const { error } = await supabase.rpc("fn_delete_lesson_material", {
        p_material_id: Number(payload.id),
      });
      if (error) throw error;
      return { ok: true };
    }

    case "getLessonBySlug": {
      const current = requireSession(session);
      const courseSlug = String(payload.courseSlug ?? "");
      const lessonSlug = String(payload.lessonSlug ?? "");
      const { data, error } = await supabase.rpc("fn_get_lesson_by_slug", {
        p_course_slug: courseSlug,
        p_lesson_slug: lessonSlug,
      });
      if (error) throw error;
      const row = data?.[0];
      if (!row) return { ok: true, data: null };

      const courseId = Number(row.course_id);
      const email = current?.email ?? "";
      const isAdmin = current?.role === "admin";
      if (!isAdmin && (!current || !(await userHasEnrollment(supabase, email, courseId)))) {
        throw new Error("Você precisa estar inscrito no curso para acessar esta aula.");
      }

      const videoUrl = await resolveStorageUrl(supabase, String(row.video_url ?? ""));
      const { data: nav } = await supabase.rpc("fn_get_lesson_navigation", {
        p_course_id: courseId,
        p_lesson_id: Number(row.id),
      });
      const navigation = nav?.[0] ?? {};

      return {
        ok: true,
        data: {
          id: row.id,
          courseId,
          courseSlug: row.course_slug,
          courseTitle: row.course_title,
          moduleId: row.module_id,
          moduleTitle: row.module_title,
          title: row.title,
          slug: row.slug,
          description: row.description,
          videoUrl,
          videoProvider: row.video_provider,
          durationMinutes: row.duration_minutes,
          orderNumber: row.order_number,
          navigation: {
            prev: navigation.prev_lesson_id
              ? { id: navigation.prev_lesson_id, slug: navigation.prev_lesson_slug, title: navigation.prev_lesson_title }
              : null,
            next: navigation.next_lesson_id
              ? { id: navigation.next_lesson_id, slug: navigation.next_lesson_slug, title: navigation.next_lesson_title }
              : null,
          },
        },
      };
    }

    case "getLessonNavigation": {
      const { data, error } = await supabase.rpc("fn_get_lesson_navigation", {
        p_course_id: Number(payload.courseId),
        p_lesson_id: Number(payload.lessonId),
      });
      if (error) throw error;
      const row = data?.[0] ?? {};
      return {
        ok: true,
        data: {
          prev: row.prev_lesson_id
            ? { id: row.prev_lesson_id, slug: row.prev_lesson_slug, title: row.prev_lesson_title }
            : null,
          next: row.next_lesson_id
            ? { id: row.next_lesson_id, slug: row.next_lesson_slug, title: row.next_lesson_title }
            : null,
        },
      };
    }

    case "completeLesson": {
      const current = requireSession(session);
      const email = String(payload.email ?? current.email);
      requireSelfOrAdmin(current, email);
      const { data, error } = await supabase.rpc("fn_complete_lesson", {
        p_email: email,
        p_lesson_id: Number(payload.lessonId),
      });
      if (error) throw error;
      return { ok: true, completed: data };
    }

    case "getLessonProgress": {
      const current = requireSession(session);
      const email = String(payload.email ?? current?.email ?? "");
      requireSelfOrAdmin(current!, email);
      const { data, error } = await supabase.rpc("fn_get_lesson_progress", {
        p_email: email,
        p_course_id: Number(payload.courseId),
      });
      if (error) throw error;
      return {
        ok: true,
        data: (data ?? []).map((row: Record<string, unknown>) => ({
          lessonId: row.lesson_id,
          completed: row.completed,
        })),
      };
    }

    case "getUploadUrl": {
      const current = requireSession(session);
      requireAdmin(current);
      const bucket = String(payload.bucket ?? "") as StorageBucket;
      const config = STORAGE_BUCKETS[bucket];
      if (!config) throw new Error("Bucket inválido.");

      const mime = String(payload.mimeType ?? "");
      if (!config.mimes.includes(mime)) {
        throw new Error("Tipo de arquivo não permitido.");
      }

      const maxSize = Number(payload.fileSize ?? 0);
      if (maxSize <= 0 || maxSize > config.maxBytes) {
        throw new Error("Tamanho de arquivo inválido.");
      }

      const folder = String(payload.folder ?? "uploads");
      const filename = sanitizeFilename(String(payload.filename ?? "file"));
      const path = `${folder}/${Date.now()}-${filename}`;

      const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
      if (error) throw error;

      return {
        ok: true,
        data: {
          bucket,
          path,
          signedUrl: data.signedUrl,
          token: data.token,
        },
      };
    }

    case "deleteStorageFile": {
      const current = requireSession(session);
      requireAdmin(current);
      const bucket = String(payload.bucket ?? "") as StorageBucket;
      const path = String(payload.path ?? "");
      if (!STORAGE_BUCKETS[bucket] || !path) throw new Error("Arquivo inválido.");
      const { error } = await supabase.storage.from(bucket).remove([path]);
      if (error) throw error;
      return { ok: true };
    }

    case "getSignedMediaUrl": {
      const current = requireSession(session);
      if (!current) throw new Error("Sessão inválida ou expirada.");
      const path = String(payload.path ?? "");
      const bucket = String(payload.bucket ?? inferBucketFromPath(path)) as StorageBucket;
      const signedUrl = await resolveStorageUrl(supabase, path);
      return { ok: true, data: { url: signedUrl, bucket } };
    }

    case "validateExternalUrl": {
      const current = requireSession(session);
      requireAdmin(current);
      const url = String(payload.url ?? "");
      if (!/^https?:\/\/.+/i.test(url)) throw new Error("URL inválida.");
      try {
        const response = await fetch(url, { method: "HEAD" });
        return { ok: true, accessible: response.ok, status: response.status };
      } catch {
        return { ok: true, accessible: false, status: 0 };
      }
    }

    case "getCourseProgress": {
      const current = requireSession(session);
      const email = String(payload.email ?? current?.email ?? "");
      requireSelfOrAdmin(current!, email);
      const { data, error } = await supabase.rpc("fn_get_course_progress", {
        p_email: email,
        p_course_id: Number(payload.courseId),
      });
      if (error) throw error;

      const rows = data ?? [];
      const firstIncomplete = rows.findIndex((r: Record<string, unknown>) => !r.completed);
      const modules = rows.map((row: Record<string, unknown>, index: number) => {
        const completed = Boolean(row.completed);
        let moduleStatus = "pending";
        if (completed) moduleStatus = "completed";
        else if (index === firstIncomplete) moduleStatus = "current";

        return {
          id: row.module_id,
          title: row.title,
          orderIndex: row.order_index,
          durationMinutes: row.duration_minutes,
          completed,
          status: moduleStatus,
          totalLessons: row.total_lessons,
          completedLessons: row.completed_lessons,
        };
      });

      const total = modules.length;
      const done = modules.filter((m: { completed: boolean }) => m.completed).length;
      return { ok: true, data: { modules, percent: total ? Math.round((done / total) * 100) : 0 } };
    }

    case "completeModule": {
      const current = requireSession(session);
      const email = String(payload.email ?? current.email);
      requireSelfOrAdmin(current, email);
      const { data, error } = await supabase.rpc("fn_complete_module", {
        p_email: email,
        p_module_id: Number(payload.moduleId),
      });
      if (error) throw error;
      return { ok: true, completed: data };
    }

    case "getCertificates": {
      const current = requireSession(session);
      const email = String(payload.email ?? current.email);
      requireSelfOrAdmin(current, email);
      const { data, error } = await supabase.rpc("fn_get_certificates", { p_email: email });
      if (error) throw error;
      return { ok: true, data: data ?? [] };
    }

    case "getCertificateByCode": {
      const { data, error } = await supabase.rpc("fn_get_certificate_by_code", {
        p_code: String(payload.code ?? ""),
      });
      if (error) throw error;
      const row = data?.[0];
      return {
        ok: true,
        data: row
          ? {
            code: row.code,
            issuedAt: row.issued_at,
            studentName: row.student_name,
            courseTitle: row.course_title,
            qrPayload: row.qr_payload,
          }
          : null,
      };
    }

    case "getNotifications": {
      const current = requireSession(session);
      const email = String(payload.email ?? current.email);
      requireSelfOrAdmin(current, email);
      const { data, error } = await supabase.rpc("fn_get_notifications", { p_email: email });
      if (error) throw error;
      return { ok: true, data: data ?? [] };
    }

    case "markNotificationRead": {
      const current = requireSession(session);
      const email = String(payload.email ?? current.email);
      const { error } = await supabase.rpc("fn_mark_notification_read", {
        p_email: email,
        p_notification_id: Number(payload.notificationId),
      });
      if (error) throw error;
      return { ok: true };
    }

    case "globalSearch": {
      const current = requireSession(session);
      const email = String(payload.email ?? current?.email ?? "");
      const query = String(payload.query ?? "").toLowerCase().trim();
      if (!query) return { ok: true, data: { courses: [], enrollments: [], certificates: [] } };

      const { data: courses } = await supabase.rpc("fn_get_courses");
      const matchedCourses = (courses ?? [])
        .filter((c: Record<string, unknown>) =>
          String(c.title).toLowerCase().includes(query) ||
          String(c.description ?? "").toLowerCase().includes(query)
        )
        .slice(0, 5)
        .map(mapCourse);

      let enrollments: unknown[] = [];
      let certificates: unknown[] = [];
      if (email) {
        const { data: enr } = await supabase.rpc("fn_get_student_enrollments", { p_email: email });
        enrollments = (enr ?? [])
          .filter((e: Record<string, unknown>) => String(e.course_title).toLowerCase().includes(query))
          .slice(0, 5)
          .map(mapEnrollment);
        const { data: certs } = await supabase.rpc("fn_get_certificates", { p_email: email });
        certificates = (certs ?? [])
          .filter((c: Record<string, unknown>) =>
            String(c.course_title).toLowerCase().includes(query) ||
            String(c.code).toLowerCase().includes(query)
          )
          .slice(0, 5);
      }

      return { ok: true, data: { courses: matchedCourses, enrollments, certificates } };
    }

    case "getStudentDashboard": {
      const current = requireSession(session);
      const email = String(payload.email ?? current.email);
      requireSelfOrAdmin(current, email);

      const { data: enrollments } = await supabase.rpc("fn_get_student_enrollments", { p_email: email });
      const { data: certificates } = await supabase.rpc("fn_get_certificates", { p_email: email });

      let studiedMinutes = 0;
      let continueCourse = null;
      let maxProgress = -1;

      for (const enr of enrollments ?? []) {
        const { data: progress } = await supabase.rpc("fn_get_course_progress", {
          p_email: email,
          p_course_id: enr.course_id,
        });
        const modules = progress ?? [];
        const done = modules.filter((m: Record<string, unknown>) => m.completed).length;
        const total = modules.length;
        studiedMinutes += modules
          .filter((m: Record<string, unknown>) => m.completed)
          .reduce((acc: number, m: Record<string, unknown>) => acc + Number(m.duration_minutes ?? 0), 0);
        const percent = total ? Math.round((done / total) * 100) : 0;
        if (enr.status !== "Concluido" && percent > maxProgress) {
          maxProgress = percent;
          continueCourse = {
            ...mapCourse({
              id: enr.course_id,
              title: enr.course_title,
              workload: enr.workload,
              lessons: enr.lessons,
              level: enr.level,
              instructor: enr.instructor,
              image: enr.image,
              description: enr.description,
              content: enr.content,
            }),
            percent,
          };
        }
      }

      const completedCount = (enrollments ?? []).filter((e: Record<string, unknown>) => e.status === "Concluido").length;

      return {
        ok: true,
        data: {
          studiedHours: Math.round(studiedMinutes / 60),
          certificatesCount: (certificates ?? []).length,
          completedCourses: completedCount,
          expiringSoon: completedCount,
          continueCourse,
          certificates: certificates ?? [],
          enrollments: (enrollments ?? []).map(mapEnrollment),
        },
      };
    }

    case "bulkCompleteEnrollments": {
      const current = requireSession(session);
      requireAdmin(current);
      const ids = (payload.enrollmentIds as number[]) ?? [];
      for (const id of ids) {
        await supabase.from("enrollments").update({ status: "Concluido", updated_at: new Date().toISOString() }).eq("id", id);
        await supabase.rpc("fn_issue_certificate", { p_enrollment_id: id });
      }
      return { ok: true };
    }

    default:
      throw new Error(`Ação não suportada: ${action}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, message: "Método não permitido." }, 405);
  }

  try {
    const body = (await req.json()) as ApiRequest;
    const action = body.action;
    const payload = body.payload ?? {};
    const publicActions = new Set([
      "login",
      "registerStudent",
      "getCourses",
      "getCourseById",
      "getCourseBySlug",
      "getPlatformStats",
      "getCertificateByCode",
      "getCourseModules",
      "getCourseLessonsTree",
    ]);

    if (!action) {
      return jsonResponse({ ok: false, message: "Ação obrigatória." }, 400);
    }

    const sessionToken = req.headers.get(SESSION_HEADER);
    const session = publicActions.has(action)
      ? await verifySession(sessionToken)
      : requireSession(await verifySession(sessionToken));

    const result = await handleAction(action, payload, session);
    return jsonResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno.";
    const status = message.includes("Sessão") || message.includes("permissão") ||
        message.includes("administrador")
      ? 401
      : 400;
    return jsonResponse({ ok: false, message }, status);
  }
});
