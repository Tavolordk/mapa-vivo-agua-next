export type UserRole = "super_admin" | "admin_teacher" | "student";
export type UserStatus = "active" | "inactive";

export type PlatformUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastAccess?: string;
  school?: string;
  grade?: string;
  group?: string;
};

export type UserDraft = {
  name: string;
  email: string;
  username: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  school?: string;
  grade?: string;
  group?: string;
};

export const roleLabels: Record<UserRole, string> = {
  super_admin: "Superadministrador",
  admin_teacher: "Administrador / profesor",
  student: "Alumno",
};

export const roleDescriptions: Record<UserRole, string> = {
  super_admin: "Administra toda la plataforma y registra administradores, profesores y alumnos.",
  admin_teacher: "Gestiona grupos, proyectos y cuentas de alumnos.",
  student: "Participa en actividades, evidencias y bitácoras de aprendizaje.",
};

export const canManageUsers = (role: UserRole) => role === "super_admin" || role === "admin_teacher";
export const canCreateRole = (actorRole: UserRole, targetRole: UserRole) =>
  actorRole === "super_admin" || (actorRole === "admin_teacher" && targetRole === "student");

export async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function buildSeedUsers(): Promise<PlatformUser[]> {
  const createdAt = "2026-07-24T12:00:00.000Z";
  return [
    {
      id: "user-super-admin",
      name: "Mariana Hernández",
      email: "superadmin@mapavivo.mx",
      username: "superadmin",
      passwordHash: await hashPassword("Super123!"),
      role: "super_admin",
      status: "active",
      createdAt,
      school: "Coordinación general",
    },
    {
      id: "user-professor",
      name: "Elena Ruiz",
      email: "profesor@mapavivo.mx",
      username: "profesor",
      passwordHash: await hashPassword("Profesor123!"),
      role: "admin_teacher",
      status: "active",
      createdAt,
      school: "Primaria Comunitaria Río San Pedro",
    },
    {
      id: "user-student",
      name: "Diego Martínez",
      email: "alumno@mapavivo.mx",
      username: "alumno",
      passwordHash: await hashPassword("Alumno123!"),
      role: "student",
      status: "active",
      createdAt,
      school: "Primaria Comunitaria Río San Pedro",
      grade: "5.º",
      group: "A",
    },
    {
      id: "user-student-2",
      name: "Sofía López",
      email: "sofia@mapavivo.mx",
      username: "sofia.lopez",
      passwordHash: await hashPassword("Alumno123!"),
      role: "student",
      status: "active",
      createdAt,
      school: "Primaria Comunitaria Río San Pedro",
      grade: "5.º",
      group: "A",
    },
  ];
}
