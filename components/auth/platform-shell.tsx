"use client";

import { useEffect, useMemo, useState } from "react";
import { WaterLearningMap } from "@/components/water-learning-map";
import { LoginScreen } from "@/components/auth/login-screen";
import { buildSeedUsers, hashPassword } from "@/lib/auth";
import type { PlatformUser, UserDraft } from "@/lib/auth";

const USERS_STORAGE_KEY = "mapa-vivo-users-v1";
const SESSION_STORAGE_KEY = "mapa-vivo-session-v1";
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

type SessionRecord = {
  userId: string;
  startedAt: string;
};

export function PlatformShell() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      const storedUsers = window.localStorage.getItem(USERS_STORAGE_KEY);
      let nextUsers: PlatformUser[];

      if (storedUsers) {
        try {
          nextUsers = JSON.parse(storedUsers) as PlatformUser[];
        } catch {
          nextUsers = await buildSeedUsers();
          window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
        }
      } else {
        nextUsers = await buildSeedUsers();
        window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
      }

      const storedSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
      let nextSession: SessionRecord | null = null;
      if (storedSession) {
        try {
          const parsed = JSON.parse(storedSession) as SessionRecord;
          const sessionUser = nextUsers.find((user) => user.id === parsed.userId && user.status === "active");
          const sessionAge = Date.now() - new Date(parsed.startedAt).getTime();
          if (sessionUser && Number.isFinite(sessionAge) && sessionAge < SESSION_MAX_AGE_MS) {
            nextSession = parsed;
          } else {
            window.localStorage.removeItem(SESSION_STORAGE_KEY);
          }
        } catch {
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }

      if (!active) return;
      setUsers(nextUsers);
      setSession(nextSession);
      setIsReady(true);
    };

    void hydrate();
    return () => {
      active = false;
    };
  }, []);

  const currentUser = useMemo(
    () => users.find((user) => user.id === session?.userId) ?? null,
    [session?.userId, users],
  );

  const persistUsers = (nextUsers: PlatformUser[]) => {
    setUsers(nextUsers);
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
  };

  const login = async (identifier: string, password: string): Promise<string | null> => {
    const normalizedIdentifier = identifier.trim().toLowerCase();
    const passwordHash = await hashPassword(password);
    const user = users.find(
      (candidate) =>
        (candidate.email.toLowerCase() === normalizedIdentifier ||
          candidate.username.toLowerCase() === normalizedIdentifier) &&
        candidate.passwordHash === passwordHash,
    );

    if (!user) return "El usuario, correo o contraseña no coinciden.";
    if (user.status !== "active") return "Esta cuenta está desactivada. Contacta a un administrador.";

    const now = new Date().toISOString();
    const nextUsers = users.map((candidate) =>
      candidate.id === user.id ? { ...candidate, lastAccess: now } : candidate,
    );
    persistUsers(nextUsers);

    const nextSession = { userId: user.id, startedAt: now };
    setSession(nextSession);
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    return null;
  };

  const logout = () => {
    setSession(null);
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const createUser = async (draft: UserDraft): Promise<string | null> => {
    const email = draft.email.trim().toLowerCase();
    const username = draft.username.trim().toLowerCase();
    if (users.some((user) => user.email.toLowerCase() === email)) return "Ya existe una cuenta con ese correo.";
    if (users.some((user) => user.username.toLowerCase() === username)) return "Ese nombre de usuario ya está registrado.";
    if (!draft.password || draft.password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";

    const nextUser: PlatformUser = {
      id: crypto.randomUUID(),
      name: draft.name.trim(),
      email,
      username,
      passwordHash: await hashPassword(draft.password),
      role: draft.role,
      status: draft.status,
      createdAt: new Date().toISOString(),
      school: draft.school?.trim() || undefined,
      grade: draft.grade?.trim() || undefined,
      group: draft.group?.trim() || undefined,
    };
    persistUsers([nextUser, ...users]);
    return null;
  };

  const updateUser = async (id: string, draft: UserDraft): Promise<string | null> => {
    const email = draft.email.trim().toLowerCase();
    const username = draft.username.trim().toLowerCase();
    if (users.some((user) => user.id !== id && user.email.toLowerCase() === email)) {
      return "Ya existe otra cuenta con ese correo.";
    }
    if (users.some((user) => user.id !== id && user.username.toLowerCase() === username)) {
      return "Ese nombre de usuario pertenece a otra cuenta.";
    }

    const passwordHash = draft.password ? await hashPassword(draft.password) : undefined;
    const nextUsers = users.map((user) =>
      user.id === id
        ? {
            ...user,
            name: draft.name.trim(),
            email,
            username,
            role: user.id === currentUser?.id ? user.role : draft.role,
            status: user.id === currentUser?.id ? user.status : draft.status,
            school: draft.school?.trim() || undefined,
            grade: draft.grade?.trim() || undefined,
            group: draft.group?.trim() || undefined,
            ...(passwordHash ? { passwordHash } : {}),
          }
        : user,
    );
    persistUsers(nextUsers);
    return null;
  };

  const toggleUserStatus = (id: string): string | null => {
    if (id === currentUser?.id) return "No puedes desactivar tu propia cuenta mientras tienes una sesión abierta.";
    persistUsers(
      users.map((user) =>
        user.id === id ? { ...user, status: user.status === "active" ? "inactive" : "active" } : user,
      ),
    );
    return null;
  };

  const resetUserPassword = async (id: string, temporaryPassword: string): Promise<string | null> => {
    if (temporaryPassword.length < 8) return "La contraseña temporal debe tener al menos 8 caracteres.";
    const passwordHash = await hashPassword(temporaryPassword);
    persistUsers(users.map((user) => (user.id === id ? { ...user, passwordHash } : user)));
    return null;
  };

  if (!isReady) {
    return (
      <main className="auth-loading-screen" aria-live="polite">
        <span className="auth-loading-drop" />
        <strong>Preparando el mapa vivo…</strong>
      </main>
    );
  }

  if (!currentUser) return <LoginScreen onLogin={login} />;

  return (
    <WaterLearningMap
      currentUser={currentUser}
      users={users}
      onLogout={logout}
      onCreateUser={createUser}
      onUpdateUser={updateUser}
      onToggleUserStatus={toggleUserStatus}
      onResetUserPassword={resetUserPassword}
    />
  );
}
