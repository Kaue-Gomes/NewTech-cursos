import { callApi, getSessionToken, setSessionToken } from "./api.js";

const USER_KEY = "newtech_current_user";

export async function getStudents() {
  const result = await callApi("getStudents");
  return result.data ?? [];
}

export async function registerStudent(data) {
  try {
    await callApi("registerStudent", data);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

export async function login(email, password) {
  const result = await callApi("login", { email, password });

  if (!result.user) {
    return null;
  }

  setSessionToken(result.sessionToken);
  localStorage.setItem(USER_KEY, JSON.stringify(result.user));
  return result.user;
}

export function logout() {
  setSessionToken(null);
  localStorage.removeItem(USER_KEY);
}

export function getCurrentUser() {
  const saved = localStorage.getItem(USER_KEY);
  return saved ? JSON.parse(saved) : null;
}

export async function getFullCurrentUser() {
  const current = getCurrentUser();
  if (!current) return null;

  if (!getSessionToken()) {
    return current;
  }

  const result = await callApi("getUserProfile", { email: current.email });
  return result.data ?? current;
}

export async function updateCurrentUser(data) {
  const current = getCurrentUser();
  if (!current) return null;

  const result = await callApi("updateUser", {
    email: current.email,
    ...data,
  });

  if (result.data) {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        id: result.data.id,
        name: result.data.name,
        email: result.data.email,
        role: result.data.role,
      }),
    );
  }

  return result.data;
}
