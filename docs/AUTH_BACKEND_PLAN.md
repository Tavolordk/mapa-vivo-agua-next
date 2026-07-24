# Siguiente etapa: autenticación con backend

La versión actual implementa el flujo y los permisos en el cliente para validar la experiencia de usuario. No debe usarse como seguridad de producción porque `localStorage` puede ser modificado desde el navegador.

## Roles propuestos

- `SUPER_ADMIN`: registra y administra superadministradores, administradores/profesores y alumnos.
- `ADMIN_TEACHER`: administra proyectos, grupos y cuentas de alumnos.
- `STUDENT`: participa en proyectos, bitácoras y evidencias sin acceso a la gestión de usuarios.

## Endpoints recomendados

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/{id}`
- `PATCH /api/users/{id}/status`
- `POST /api/users/{id}/reset-password`

## Reglas de seguridad

- Contraseñas con Argon2id o BCrypt; nunca SHA-256 directo ni texto plano en base de datos.
- Access token de vida corta y refresh token rotatorio en cookie `HttpOnly`, `Secure` y `SameSite`.
- Autorización de cada endpoint en backend; ocultar botones en frontend no sustituye el control del servidor.
- Auditoría para altas, cambios de rol, bloqueos y restablecimientos de contraseña.
- Protección contra fuerza bruta, enumeración de usuarios, CSRF y sesiones robadas.
- El superadministrador no puede eliminar ni desactivar su propia última cuenta activa.
- Los administradores/profesores solo pueden operar alumnos dentro de sus escuelas y grupos asignados.
