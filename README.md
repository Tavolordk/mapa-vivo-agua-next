# Mapa Vivo del Agua

Plataforma educativa interactiva construida con Next.js, React y TypeScript. El proyecto está inspirado en los cuatro campos formativos y los ejes articuladores de la Nueva Escuela Mexicana.

## Funcionalidades

- Mapa principal con cuatro campos formativos y evidencias.
- Navegación lateral colapsable en escritorio y menú móvil.
- Pregunta local editable con enfoque y observaciones del territorio.
- Cuatro recorridos de exploración con instrucciones, preguntas y avance.
- Tablero de acciones con tareas editables, responsables, fechas y etapas.
- Lista interactiva de materiales y acuerdo de seguridad.
- Mural comunitario con publicaciones y reacciones.
- Presentación final descargable en PowerPoint.
- Biblioteca de recursos con búsqueda, categorías, colección y recientes.
- Vista previa de cada recurso, lectura por voz y descargas reales.
- Persistencia local del avance mediante `localStorage`.
- Diseño responsive para escritorio, tablet y móvil.
- Inicio de sesión con sesión local de ocho horas.
- Tres niveles de acceso: superadministrador, administrador/profesor y alumno.
- Gestión de usuarios con búsqueda, filtros, altas, edición, activación y restablecimiento de contraseña.
- Restricción de permisos: el administrador/profesor solo administra alumnos.

## Recursos incluidos

La carpeta `public/resources` contiene materiales utilizables:

- Guía de observación en PDF.
- Tarjetas de entrevista editables en DOCX.
- Ficha de medición con fórmulas y listas desplegables en XLSX.
- Tutorial de grabación respetuosa en PDF.
- Checklist de seguridad en PDF.
- Lienzo de presentación editable en PPTX.

## Ejecutar localmente

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Compilar para producción

```bash
npm run build
npm run start
```

## Docker

```bash
docker build -t mapa-vivo-agua .
docker run --rm -p 3000:3000 mapa-vivo-agua
```


## Accesos de demostración

| Rol | Usuario | Contraseña |
|---|---|---|
| Superadministrador | `superadmin` | `Super123!` |
| Administrador / profesor | `profesor` | `Profesor123!` |
| Alumno | `alumno` | `Alumno123!` |

También puede utilizarse el correo correspondiente: `superadmin@mapavivo.mx`, `profesor@mapavivo.mx` o `alumno@mapavivo.mx`.

## Alcance de esta primera etapa

La autenticación actual persiste usuarios, hashes y sesión en `localStorage` para probar la interfaz y las reglas de permisos sin depender todavía de un servidor. **No es seguridad de producción** porque el navegador puede modificar esa información.

El archivo `docs/AUTH_BACKEND_PLAN.md` contiene el contrato recomendado para migrar a un backend con contraseñas BCrypt/Argon2id, access token, refresh token en cookie segura, autorización por endpoint y auditoría.
