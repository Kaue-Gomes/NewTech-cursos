import { initialCourses } from "../data/initialCourses.js";

const COURSES_KEY = "newtech_courses";
const ENROLLMENTS_KEY = "newtech_enrollments";

export function getCourses() {
  const saved = localStorage.getItem(COURSES_KEY);

  if (!saved) {
    localStorage.setItem(COURSES_KEY, JSON.stringify(initialCourses));
    return initialCourses;
  }

  return JSON.parse(saved);
}

export function saveCourses(courses) {
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
}

export function getCourseById(id) {
  return getCourses().find((course) => String(course.id) === String(id));
}

export function addCourse(course) {
  const courses = getCourses();
  const newCourse = {
    ...course,
    id: Date.now()
  };

  const updated = [...courses, newCourse];
  saveCourses(updated);
  return newCourse;
}

export function updateCourse(id, courseData) {
  const updated = getCourses().map((course) =>
    String(course.id) === String(id) ? { ...course, ...courseData } : course
  );

  saveCourses(updated);
  return updated;
}

export function deleteCourse(id) {
  const updated = getCourses().filter((course) => String(course.id) !== String(id));
  saveCourses(updated);
  return updated;
}

export function getEnrollments() {
  return JSON.parse(localStorage.getItem(ENROLLMENTS_KEY)) || [];
}

export function enrollStudent(email, courseId) {
  const enrollments = getEnrollments();
  const alreadyExists = enrollments.some(
    (item) => item.email === email && String(item.courseId) === String(courseId)
  );

  if (!alreadyExists) {
    const updated = [
      ...enrollments,
      {
        id: Date.now(),
        email,
        courseId,
        date: new Date().toISOString(),
        status: "Inscrito",
        paymentStatus: "Pendente",
        orderNumber: `NT-${Date.now()}`
      }
    ];
    localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(updated));
    return updated;
  }

  return enrollments;
}

export function getStudentCourses(email) {
  const courses = getCourses();
  const enrollments = getEnrollments();

  return courses.filter((course) =>
    enrollments.some(
      (item) => item.email === email && String(item.courseId) === String(course.id)
    )
  );
}


export function getStudentEnrollments(email) {
  const courses = getCourses();
  const enrollments = getEnrollments().filter((item) => item.email === email);

  return enrollments.map((enrollment) => {
    const course = courses.find((item) => String(item.id) === String(enrollment.courseId));
    return {
      ...enrollment,
      course
    };
  }).filter((item) => item.course);
}
