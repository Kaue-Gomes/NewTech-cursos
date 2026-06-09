const SESSION_KEY = "newtech_session_token";

const PUBLIC_ACTIONS = new Set([
  "login",
  "registerStudent",
  "getCourses",
  "getCourseById",
  "getPlatformStats",
  "getCertificateByCode",
]);

function getConfig() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error(
      "Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env",
    );
  }

  return { supabaseUrl, anonKey };
}

export function getSessionToken() {
  return localStorage.getItem(SESSION_KEY);
}

export function setSessionToken(token) {
  if (token) {
    localStorage.setItem(SESSION_KEY, token);
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export async function callApi(action, payload = {}) {
  const { supabaseUrl, anonKey } = getConfig();
  const sessionToken = getSessionToken();
  const headers = {
    "Content-Type": "application/json",
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
  };

  if (sessionToken && !PUBLIC_ACTIONS.has(action)) {
    headers["x-session-token"] = sessionToken;
  }

  if (sessionToken && PUBLIC_ACTIONS.has(action)) {
    headers["x-session-token"] = sessionToken;
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/newtech-api`, {
    method: "POST",
    headers,
    body: JSON.stringify({ action, payload }),
  });

  const result = await response.json();

  if (!response.ok || result.ok === false) {
    throw new Error(result.message || "Falha ao comunicar com a API.");
  }

  return result;
}
