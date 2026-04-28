const USER_KEY = "newtech_current_user";
const USERS_KEY = "newtech_users";

const defaultUsers = [
  {
    id: 1,
    name: "Administrador NewTech",
    email: "admin@newtech.com",
    password: "admin123",
    role: "admin",
    phone: "(85) 99999-0000",
    document: "000.000.000-00",
    birthdate: "",
    address: {
      cep: "60000-000",
      street: "Av. NewTech",
      number: "100",
      complement: "Sala administrativa",
      district: "Centro",
      city: "Fortaleza",
      state: "CE"
    }
  },
  {
    id: 2,
    name: "Aluno NewTech",
    email: "aluno@newtech.com",
    password: "aluno123",
    role: "student",
    phone: "(85) 98888-0000",
    document: "111.111.111-11",
    birthdate: "2000-01-01",
    address: {
      cep: "60000-000",
      street: "Rua do Aluno",
      number: "123",
      complement: "",
      district: "Centro",
      city: "Fortaleza",
      state: "CE"
    }
  }
];

export function getUsers() {
  const saved = localStorage.getItem(USERS_KEY);

  if (!saved) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }

  return JSON.parse(saved);
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getStudents() {
  return getUsers().filter((user) => user.role === "student");
}

export function registerStudent(data) {
  const users = getUsers();
  const exists = users.some((user) => user.email === data.email);

  if (exists) {
    return { ok: false, message: "Já existe um usuário cadastrado com esse e-mail." };
  }

  const newUser = {
    id: Date.now(),
    name: data.name,
    email: data.email,
    password: data.password,
    role: "student",
    phone: data.phone || "",
    document: data.document || "",
    birthdate: data.birthdate || "",
    address: {
      cep: data.cep || "",
      street: data.street || "",
      number: data.number || "",
      complement: data.complement || "",
      district: data.district || "",
      city: data.city || "",
      state: data.state || ""
    }
  };

  saveUsers([...users, newUser]);
  return { ok: true, user: newUser };
}

export function login(email, password) {
  const users = getUsers();

  const user = users.find(
    (item) => item.email === email.trim() && item.password === password.trim()
  );

  if (!user) {
    return null;
  }

  const loggedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  localStorage.setItem(USER_KEY, JSON.stringify(loggedUser));
  return loggedUser;
}

export function logout() {
  localStorage.removeItem(USER_KEY);
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem(USER_KEY));
}

export function getFullCurrentUser() {
  const current = getCurrentUser();
  if (!current) return null;
  return getUsers().find((user) => user.email === current.email) || current;
}

export function updateCurrentUser(data) {
  const current = getCurrentUser();
  if (!current) return null;

  const users = getUsers();
  const updatedUsers = users.map((user) => {
    if (user.email !== current.email) return user;

    return {
      ...user,
      ...data,
      address: {
        ...(user.address || {}),
        ...(data.address || {})
      }
    };
  });

  saveUsers(updatedUsers);

  const updated = updatedUsers.find((user) => user.email === current.email);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role
    })
  );

  return updated;
}
