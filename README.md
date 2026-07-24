# Mapa vivo: El agua que compartimos

Proyecto educativo interactivo construido con Next.js, React y TypeScript. La interfaz reproduce el concepto visual de un mapa de aprendizaje alineado con los cuatro campos formativos de la Nueva Escuela Mexicana y sus ejes articuladores.

## Requisitos

- Node.js 20.9 o superior
- npm 10 o superior

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

## Funcionalidades incluidas

- Mapa interactivo de cuatro campos formativos.
- Sección Pregunta local con editor, enfoques, sugerencias y contexto.
- Sección Exploramos con cuatro recorridos, progreso y ruta de campo.
- Sección Acciones con tablero de tareas, materiales y acuerdos de seguridad.
- Sección Compartimos con mural, publicaciones, reacciones y presentación final.
- Sección Recursos con buscador, filtros y tarjetas de materiales.
- Tarjetas con información y retos en modal.
- Vista de mapa y vista de bitácora.
- Evidencias por fotografía, dibujo y audio.
- Carga y eliminación local de evidencias.
- Vista ampliada de imágenes.
- Simulación de reproducción de audio.
- Navegación lateral y navegación móvil.
- Diseño responsive para escritorio, tableta y teléfono.
- Animaciones con soporte para `prefers-reduced-motion`.

## Estructura principal

```text
app/
  globals.css
  layout.tsx
  page.tsx
components/
  project-sections.tsx
  water-learning-map.tsx
public/images/
  ...recursos visuales
```

La aplicación utiliza datos simulados. Los puntos de integración con backend pueden conectarse posteriormente a servicios de proyectos, equipos, bitácoras, evidencias y avance.
