import { callApi } from "./api.js";
import { getCurrentUser } from "./auth.js";

export async function getCourses() {
  const result = await callApi("getCourses");
  return result.data ?? [];
}

export async function getCourseById(id) {
  const result = await callApi("getCourseById", { courseId: Number(id) });
  return result.data ?? null;
}

export async function getCourseBySlug(slug) {
  const result = await callApi("getCourseBySlug", { slug });
  return result.data ?? null;
}

export async function addCourse(course) {
  const result = await callApi("addCourse", course);
  return result.data;
}

export async function updateCourse(id, courseData) {
  const result = await callApi("updateCourse", { id: Number(id), ...courseData });
  return result.data;
}

export async function deleteCourse(id) {
  await callApi("deleteCourse", { id: Number(id) });
  return getCourses();
}

export async function enrollStudent(email, courseId) {
  await callApi("enrollStudent", { email, courseId: Number(courseId) });
}

export async function getStudentCourses(email) {
  const result = await callApi("getStudentCourses", { email });
  return result.data ?? [];
}

export async function getStudentEnrollments(email) {
  const targetEmail = email || getCurrentUser()?.email;
  const result = await callApi("getStudentEnrollments", { email: targetEmail });
  return result.data ?? [];
}
