import { callApi } from "./api.js";

export async function getCourseAdmin(courseId) {
  const result = await callApi("getCourseAdmin", { courseId: Number(courseId) });
  return result.data ?? null;
}

export async function getCourseBySlug(slug) {
  const result = await callApi("getCourseBySlug", { slug });
  return result.data ?? null;
}

export async function getModules(courseId) {
  const result = await callApi("getCourseModules", { courseId: Number(courseId) });
  return result.data ?? [];
}

export async function addModule(courseId, data) {
  const result = await callApi("addModule", { courseId: Number(courseId), ...data });
  return result.id;
}

export async function updateModule(id, data) {
  await callApi("updateModule", { id: Number(id), ...data });
}

export async function deleteModule(id) {
  await callApi("deleteModule", { id: Number(id) });
}

export async function reorderModules(courseId, moduleIds) {
  await callApi("reorderModules", { courseId: Number(courseId), moduleIds });
}

export async function getLessons(moduleId) {
  const result = await callApi("getLessons", { moduleId: Number(moduleId) });
  return result.data ?? [];
}

export async function getCourseLessonsTree(courseId) {
  const result = await callApi("getCourseLessonsTree", { courseId: Number(courseId) });
  return result.data ?? [];
}

export async function addLesson(moduleId, data) {
  const result = await callApi("addLesson", { moduleId: Number(moduleId), ...data });
  return result.id;
}

export async function updateLesson(id, data) {
  await callApi("updateLesson", { id: Number(id), ...data });
}

export async function deleteLesson(id) {
  await callApi("deleteLesson", { id: Number(id) });
}

export async function reorderLessons(moduleId, lessonIds) {
  await callApi("reorderLessons", { moduleId: Number(moduleId), lessonIds });
}

export async function getLessonMaterials(lessonId) {
  const result = await callApi("getLessonMaterials", { lessonId: Number(lessonId) });
  return result.data ?? [];
}

export async function addLessonMaterial(lessonId, data) {
  const result = await callApi("addLessonMaterial", { lessonId: Number(lessonId), ...data });
  return result.id;
}

export async function deleteLessonMaterial(id) {
  await callApi("deleteLessonMaterial", { id: Number(id) });
}

export async function getLessonBySlug(courseSlug, lessonSlug) {
  const result = await callApi("getLessonBySlug", { courseSlug, lessonSlug });
  return result.data ?? null;
}

export async function getUploadUrl({ bucket, filename, mimeType, fileSize, folder }) {
  const result = await callApi("getUploadUrl", { bucket, filename, mimeType, fileSize, folder });
  return result.data;
}

export async function deleteStorageFile(bucket, path) {
  await callApi("deleteStorageFile", { bucket, path });
}

export async function validateExternalUrl(url) {
  const result = await callApi("validateExternalUrl", { url });
  return result;
}

export async function uploadFile({ bucket, file, folder }) {
  const uploadMeta = await getUploadUrl({
    bucket,
    filename: file.name,
    mimeType: file.type,
    fileSize: file.size,
    folder,
  });

  const response = await fetch(uploadMeta.signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
      "x-upsert": "true",
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Falha ao enviar arquivo.");
  }

  return uploadMeta.path;
}
