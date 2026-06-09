import { callApi } from "./api.js";

export async function getPlatformStats() {
  const result = await callApi("getPlatformStats");
  return result.data ?? { activeCourses: 0, totalStudents: 0, totalEnrollments: 0 };
}

export async function getCourseModules(courseId) {
  const result = await callApi("getCourseModules", { courseId: Number(courseId) });
  return result.data ?? [];
}

export async function getCourseProgress(email, courseId) {
  const result = await callApi("getCourseProgress", { email, courseId: Number(courseId) });
  return result.data ?? { modules: [], percent: 0 };
}

export async function completeModule(email, moduleId) {
  await callApi("completeModule", { email, moduleId: Number(moduleId) });
}

export async function completeLesson(email, lessonId) {
  await callApi("completeLesson", { email, lessonId: Number(lessonId) });
}

export async function getLessonProgress(email, courseId) {
  const result = await callApi("getLessonProgress", { email, courseId: Number(courseId) });
  return result.data ?? [];
}

export async function getCertificates(email) {
  const result = await callApi("getCertificates", { email });
  return result.data ?? [];
}

export async function getCertificateByCode(code) {
  const result = await callApi("getCertificateByCode", { code });
  return result.data ?? null;
}

export async function getNotifications(email) {
  const result = await callApi("getNotifications", { email });
  return result.data ?? [];
}

export async function markNotificationRead(email, notificationId) {
  await callApi("markNotificationRead", { email, notificationId: Number(notificationId) });
}

export async function globalSearch(query, email) {
  const result = await callApi("globalSearch", { query, email });
  return result.data ?? { courses: [], enrollments: [], certificates: [] };
}

export async function getStudentDashboard(email) {
  const result = await callApi("getStudentDashboard", { email });
  return result.data ?? null;
}

export async function bulkCompleteEnrollments(enrollmentIds) {
  await callApi("bulkCompleteEnrollments", { enrollmentIds });
}
