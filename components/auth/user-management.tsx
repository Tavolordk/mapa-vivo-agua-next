"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleUserRound,
  Edit3,
  GraduationCap,
  KeyRound,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  UserRoundCog,
  Users,
  X,
} from "lucide-react";
import {
  canCreateRole,
  roleDescriptions,
  roleLabels,
} from "@/lib/auth";
import type { PlatformUser, UserDraft, UserRole } from "@/lib/auth";

type UserManagementProps = {
  currentUser: PlatformUser;
  users: PlatformUser[];
  notify: (message: string) => void;
  onCreateUser: (draft: UserDraft) => Promise<string | null>;
  onUpdateUser: (id: string, draft: UserDraft) => Promise<string | null>;
  onToggleUserStatus: (id: string) => string | null;
  onResetUserPassword: (id: string, temporaryPassword: string) => Promise<string | null>;
};

type ModalMode = "create" | "edit" | "password";

type ModalState = {
  mode: ModalMode;
  user?: PlatformUser;
} | null;

const emptyDraft: UserDraft = {
  name: "",
  email: "",
  username: "",
  password: "",
  role: "student",
  status: "active",
  school: "Primaria Comunitaria Río San Pedro",
  grade: "",
  group: "",
};

export function UserManagement({
  currentUser,
  users,
  notify,
  onCreateUser,
  onUpdateUser,
  onToggleUserStatus,
  onResetUserPassword,
}: UserManagementProps) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [modal, setModal] = useState<ModalState>(null);
  const [draft, setDraft] = useState<UserDraft>(emptyDraft);
  const [temporaryPassword, setTemporaryPassword] = useState("Agua2026!");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const manageableUsers = useMemo(
    () => currentUser.role === "super_admin" ? users : users.filter((user) => user.role === "student"),
    [currentUser.role, users],
  );

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return manageableUsers.filter((user) => {
      const matchesQuery = !normalizedQuery || [user.name, user.email, user.username, user.school, user.grade, user.group]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery));
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [manageableUsers, query, roleFilter]);

  const counts = useMemo(() => ({
    total: manageableUsers.length,
    active: manageableUsers.filter((user) => user.status === "active").length,
    teachers: manageableUsers.filter((user) => user.role === "admin_teacher").length,
    students: manageableUsers.filter((user) => user.role === "student").length,
  }), [manageableUsers]);

  const openCreate = () => {
    setDraft({ ...emptyDraft, role: currentUser.role === "super_admin" ? "admin_teacher" : "student" });
    setFormError(null);
    setModal({ mode: "create" });
  };

  const openEdit = (user: PlatformUser) => {
    setDraft({
      name: user.name,
      email: user.email,
      username: user.username,
      password: "",
      role: user.role,
      status: user.status,
      school: user.school ?? "",
      grade: user.grade ?? "",
      group: user.group ?? "",
    });
    setFormError(null);
    setModal({ mode: "edit", user });
  };

  const submitUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!modal || modal.mode === "password") return;
    setFormError(null);

    if (!draft.name.trim() || !draft.email.trim() || !draft.username.trim()) {
      setFormError("Nombre, correo y usuario son obligatorios.");
      return;
    }
    if (!canCreateRole(currentUser.role, draft.role)) {
      setFormError("Tu rol no permite registrar ese tipo de cuenta.");
      return;
    }

    setSaving(true);
    const error = modal.mode === "create"
      ? await onCreateUser(draft)
      : await onUpdateUser(modal.user!.id, draft);
    setSaving(false);

    if (error) {
      setFormError(error);
      return;
    }

    notify(modal.mode === "create" ? "Usuario registrado correctamente." : "Información del usuario actualizada.");
    setModal(null);
  };

  const submitPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!modal?.user || modal.mode !== "password") return;
    setSaving(true);
    const error = await onResetUserPassword(modal.user.id, temporaryPassword);
    setSaving(false);
    if (error) {
      setFormError(error);
      return;
    }
    notify(`Contraseña temporal actualizada para ${modal.user.name}.`);
    setModal(null);
  };

  const toggleStatus = (user: PlatformUser) => {
    const error = onToggleUserStatus(user.id);
    if (error) {
      notify(error);
      return;
    }
    notify(user.status === "active" ? "Cuenta desactivada." : "Cuenta activada.");
  };

  const roleIcon = (role: UserRole) => {
    if (role === "super_admin") return ShieldCheck;
    if (role === "admin_teacher") return GraduationCap;
    return CircleUserRound;
  };

  return (
    <section className="users-admin-page">
      <header className="users-admin-hero">
        <div>
          <span className="section-kicker"><UserRoundCog size={16} /> Gestión de accesos</span>
          <h2>{currentUser.role === "super_admin" ? "Usuarios de la plataforma" : "Alumnos de mis grupos"}</h2>
          <p>
            {currentUser.role === "super_admin"
              ? "Registra administradores, profesores y alumnos; controla permisos y estado de las cuentas."
              : "Registra y administra únicamente las cuentas de estudiantes vinculadas a tus actividades."}
          </p>
        </div>
        <button className="users-primary-action" type="button" onClick={openCreate}>
          <Plus size={19} />
          {currentUser.role === "super_admin" ? "Registrar usuario" : "Registrar alumno"}
        </button>
      </header>

      <div className="users-stat-grid">
        <article><span><Users size={21} /></span><div><small>Cuentas visibles</small><strong>{counts.total}</strong></div></article>
        <article><span><UserCheck size={21} /></span><div><small>Activas</small><strong>{counts.active}</strong></div></article>
        <article><span><GraduationCap size={21} /></span><div><small>Administradores / profesores</small><strong>{counts.teachers}</strong></div></article>
        <article><span><CircleUserRound size={21} /></span><div><small>Alumnos</small><strong>{counts.students}</strong></div></article>
      </div>

      <div className="users-toolbar">
        <label className="users-search-box">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, correo, usuario o grupo" />
        </label>
        <label className="users-role-filter">
          <SlidersHorizontal size={17} />
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as "all" | UserRole)}>
            <option value="all">Todos los roles</option>
            {currentUser.role === "super_admin" && <option value="super_admin">Superadministradores</option>}
            {currentUser.role === "super_admin" && <option value="admin_teacher">Administradores / profesores</option>}
            <option value="student">Alumnos</option>
          </select>
        </label>
      </div>

      <div className="users-table-card">
        <div className="users-table-scroll">
          <table className="platform-users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol y alcance</th>
                <th>Escuela / grupo</th>
                <th>Estado</th>
                <th>Último acceso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const RoleIcon = roleIcon(user.role);
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="user-identity-cell">
                        <span>{user.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
                        <div><strong>{user.name}</strong><small>{user.email}</small><em>@{user.username}</em></div>
                      </div>
                    </td>
                    <td><div className={`role-pill role-${user.role}`}><RoleIcon size={15} /><span><strong>{roleLabels[user.role]}</strong><small>{roleDescriptions[user.role]}</small></span></div></td>
                    <td><div className="school-cell"><strong>{user.school || "Sin institución"}</strong><small>{user.role === "student" ? [user.grade, user.group && `Grupo ${user.group}`].filter(Boolean).join(" · ") || "Grupo sin asignar" : "Cobertura institucional"}</small></div></td>
                    <td><span className={`status-pill ${user.status === "active" ? "is-active" : "is-inactive"}`}><i />{user.status === "active" ? "Activo" : "Inactivo"}</span></td>
                    <td><span className="last-access">{user.lastAccess ? new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(user.lastAccess)) : "Sin ingreso"}</span></td>
                    <td>
                      <div className="user-row-actions">
                        <button type="button" title="Editar usuario" onClick={() => openEdit(user)}><Edit3 size={16} /></button>
                        <button type="button" title="Restablecer contraseña" onClick={() => { setTemporaryPassword("Agua2026!"); setFormError(null); setModal({ mode: "password", user }); }}><KeyRound size={16} /></button>
                        <button type="button" title={user.status === "active" ? "Desactivar cuenta" : "Activar cuenta"} onClick={() => toggleStatus(user)} disabled={user.id === currentUser.id}>
                          {user.status === "active" ? <ToggleRight size={19} /> : <ToggleLeft size={19} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!filteredUsers.length && <div className="users-empty-state"><Search size={28} /><strong>No encontramos cuentas con esos filtros.</strong><span>Prueba otra búsqueda o cambia el rol seleccionado.</span></div>}
      </div>

      <aside className="permissions-summary">
        <ShieldCheck size={23} />
        <div>
          <strong>Permisos aplicados</strong>
          <p>{currentUser.role === "super_admin" ? "Puedes crear y administrar todos los roles. Tu propia cuenta no puede desactivarse durante una sesión activa." : "Puedes crear, editar, activar y desactivar alumnos. Las cuentas administrativas solo las gestiona el superadministrador."}</p>
        </div>
      </aside>

      {modal && (
        <div className="user-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}>
          <section className="user-modal" role="dialog" aria-modal="true" aria-label="Gestión de usuario">
            <button className="user-modal-close" type="button" onClick={() => setModal(null)} aria-label="Cerrar"><X size={20} /></button>
            {modal.mode === "password" ? (
              <form onSubmit={submitPassword}>
                <header><span><KeyRound size={22} /></span><div><small>Seguridad de cuenta</small><h3>Restablecer contraseña</h3><p>Define una contraseña temporal para {modal.user?.name}.</p></div></header>
                <label className="user-form-field"><span>Contraseña temporal</span><input value={temporaryPassword} onChange={(event) => setTemporaryPassword(event.target.value)} minLength={8} /></label>
                <div className="password-guidance"><CheckCircle2 size={17} /><span>Debe contener al menos 8 caracteres. Comunícala por un canal seguro.</span></div>
                {formError && <div className="auth-error">{formError}</div>}
                <footer><button type="button" className="user-secondary-action" onClick={() => setModal(null)}>Cancelar</button><button className="users-primary-action" disabled={saving}>{saving ? "Guardando…" : "Actualizar contraseña"}</button></footer>
              </form>
            ) : (
              <form onSubmit={submitUser}>
                <header><span><UserRoundCog size={22} /></span><div><small>{modal.mode === "create" ? "Nueva cuenta" : "Edición de cuenta"}</small><h3>{modal.mode === "create" ? "Registrar usuario" : "Actualizar usuario"}</h3><p>Completa los datos y asigna el nivel de acceso correcto.</p></div></header>
                <div className="user-form-grid">
                  <label className="user-form-field user-form-wide"><span>Nombre completo</span><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
                  <label className="user-form-field"><span>Correo</span><input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label>
                  <label className="user-form-field"><span>Nombre de usuario</span><input value={draft.username} onChange={(event) => setDraft({ ...draft, username: event.target.value })} /></label>
                  <label className="user-form-field"><span>Rol</span><select disabled={modal.user?.id === currentUser.id} value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value as UserRole })}>{currentUser.role === "super_admin" && <option value="super_admin">Superadministrador</option>}{currentUser.role === "super_admin" && <option value="admin_teacher">Administrador / profesor</option>}<option value="student">Alumno</option></select></label>
                  <label className="user-form-field"><span>Estado</span><select disabled={modal.user?.id === currentUser.id} value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as "active" | "inactive" })}><option value="active">Activo</option><option value="inactive">Inactivo</option></select></label>
                  <label className="user-form-field user-form-wide"><span>Institución</span><input value={draft.school ?? ""} onChange={(event) => setDraft({ ...draft, school: event.target.value })} /></label>
                  {draft.role === "student" && <label className="user-form-field"><span>Grado</span><input value={draft.grade ?? ""} onChange={(event) => setDraft({ ...draft, grade: event.target.value })} placeholder="5.º" /></label>}
                  {draft.role === "student" && <label className="user-form-field"><span>Grupo</span><input value={draft.group ?? ""} onChange={(event) => setDraft({ ...draft, group: event.target.value })} placeholder="A" /></label>}
                  <label className="user-form-field user-form-wide"><span>{modal.mode === "create" ? "Contraseña inicial" : "Nueva contraseña (opcional)"}</span><input type="password" value={draft.password ?? ""} onChange={(event) => setDraft({ ...draft, password: event.target.value })} placeholder={modal.mode === "create" ? "Mínimo 8 caracteres" : "Déjala vacía para conservar la actual"} /></label>
                </div>
                {formError && <div className="auth-error">{formError}</div>}
                <footer><button type="button" className="user-secondary-action" onClick={() => setModal(null)}>Cancelar</button><button className="users-primary-action" disabled={saving}>{saving ? "Guardando…" : modal.mode === "create" ? "Registrar cuenta" : "Guardar cambios"}</button></footer>
              </form>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
