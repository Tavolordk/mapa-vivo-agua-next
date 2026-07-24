"use client";

import { FormEvent, useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Droplets,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  Waves,
} from "lucide-react";

type LoginScreenProps = {
  onLogin: (identifier: string, password: string) => Promise<string | null>;
};

const demoAccounts = [
  { label: "Superadministrador", user: "superadmin", password: "Super123!", icon: ShieldCheck },
  { label: "Administrador / profesor", user: "profesor", password: "Profesor123!", icon: GraduationCap },
  { label: "Alumno", user: "alumno", password: "Alumno123!", icon: BookOpenCheck },
];

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!identifier.trim() || !password) {
      setError("Escribe tu usuario o correo y tu contraseña.");
      return;
    }

    setIsSubmitting(true);
    const loginError = await onLogin(identifier, password);
    setIsSubmitting(false);
    setError(loginError);
  };

  const useDemoAccount = (user: string, demoPassword: string) => {
    setIdentifier(user);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <main className="login-page">
      <section className="login-story-panel">
        <div className="login-brand">
          <span className="login-brand-mark">
            <Droplets size={36} />
            <Waves size={34} />
          </span>
          <span>
            <strong>Mapa vivo</strong>
            <small>Aprendizaje conectado con la comunidad</small>
          </span>
        </div>

        <div className="login-story-copy">
          <span className="login-kicker">Plataforma educativa NEM</span>
          <h1>El agua que compartimos</h1>
          <p>
            Docentes, administradores y estudiantes colaboran en proyectos que conectan observación,
            ciencia, comunidad y cuidado del territorio.
          </p>
        </div>

        <div className="login-benefits">
          <span><CheckCircle2 size={18} /> Proyectos y evidencias por equipo</span>
          <span><CheckCircle2 size={18} /> Control de acceso según responsabilidades</span>
          <span><CheckCircle2 size={18} /> Recursos y bitácoras en un mismo lugar</span>
        </div>

        <div className="login-river-art" aria-hidden="true">
          <span className="login-hill login-hill-one" />
          <span className="login-hill login-hill-two" />
          <span className="login-river" />
          <span className="login-sun" />
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-card">
          <header>
            <span className="login-form-icon"><LockKeyhole size={24} /></span>
            <div>
              <small>Acceso seguro</small>
              <h2>Bienvenido de nuevo</h2>
              <p>Ingresa con tu usuario institucional o correo electrónico.</p>
            </div>
          </header>

          <form onSubmit={submit}>
            <label className="auth-field">
              <span>Usuario o correo</span>
              <div>
                <UserRound size={19} />
                <input
                  autoComplete="username"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="ejemplo@escuela.mx"
                />
              </div>
            </label>

            <label className="auth-field">
              <span>Contraseña</span>
              <div>
                <LockKeyhole size={19} />
                <input
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Escribe tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error && <div className="auth-error" role="alert">{error}</div>}

            <button className="login-submit" type="submit" disabled={isSubmitting}>
              <span>{isSubmitting ? "Validando acceso…" : "Ingresar a la plataforma"}</span>
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="demo-access">
            <div className="demo-access-title">
              <span />
              <strong>Accesos de demostración</strong>
              <span />
            </div>
            <div className="demo-account-grid">
              {demoAccounts.map((account) => {
                const Icon = account.icon;
                return (
                  <button key={account.user} type="button" onClick={() => useDemoAccount(account.user, account.password)}>
                    <Icon size={19} />
                    <span>
                      <strong>{account.label}</strong>
                      <small>{account.user}</small>
                    </span>
                    <ArrowRight size={16} />
                  </button>
                );
              })}
            </div>
          </div>

          <footer>
            <ShieldCheck size={16} />
            <span>Las credenciales demo son únicamente para desarrollo local.</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
