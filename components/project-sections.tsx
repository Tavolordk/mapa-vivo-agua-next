"use client";

import Image from "next/image";
import {
  ArrowRight,
  AudioLines,
  BookOpenCheck,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Clock3,
  Copy,
  Download,
  Droplets,
  Eye,
  FileDown,
  FileText,
  FlaskConical,
  FolderOpen,
  GraduationCap,
  HeartHandshake,
  ImageIcon,
  Leaf,
  Lightbulb,
  Link2,
  MapPinned,
  MessageCircle,
  Mic,
  Palette,
  PencilLine,
  Plus,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Sprout,
  Target,
  Trash2,
  Users,
  Volume2,
  Waves,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ChangeEvent, FormEvent, MouseEvent, useEffect, useMemo, useState } from "react";

type SectionId = "inicio" | "pregunta" | "exploramos" | "acciones" | "compartimos" | "recursos";
type Notify = (message: string) => void;
type TaskStatus = "por-hacer" | "en-curso" | "hecho";
type ResourceView = "todos" | "guardados" | "recientes";

type ProjectSectionsProps = {
  activeSection: SectionId;
  notify: Notify;
};

type Exploration = {
  id: string;
  field: string;
  title: string;
  description: string;
  image: string;
  color: string;
  icon: LucideIcon;
  duration: string;
  evidence: string;
  objective: string;
  steps: string[];
  questions: string[];
};

type ActionTask = {
  id: number;
  title: string;
  owner: string;
  date: string;
  status: TaskStatus;
};

type SharedPost = {
  id: number;
  author: string;
  title: string;
  body: string;
  image?: string;
  type: "foto" | "audio" | "texto";
  reactions: number;
};

type ResourceItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  format: string;
  meta: string;
  icon: LucideIcon;
  href: string;
  accent: string;
  audience: string;
  moment: string;
  steps: string[];
  contents: string[];
};

type Material = {
  id: string;
  label: string;
  ready: boolean;
};

const STORAGE_KEY = "mapa-vivo-project-sections-v2";

const explorations: Exploration[] = [
  {
    id: "observe",
    field: "Saberes y pensamiento científico",
    title: "Observar y medir el arroyo",
    description: "Compara transparencia, temperatura, profundidad y movimiento del agua.",
    image: "/images/measuring-stream.png",
    color: "#168148",
    icon: FlaskConical,
    duration: "35 min",
    evidence: "Tabla y fotografía",
    objective: "Reconocer cambios visibles y registrar datos comparables sin alterar el lugar.",
    steps: [
      "Elijan dos o tres puntos seguros desde la orilla.",
      "Registren clima, hora, profundidad y transparencia.",
      "Tomen una fotografía desde el mismo ángulo en cada punto.",
      "Comparen resultados y escriban una explicación posible.",
    ],
    questions: ["¿Dónde corre más rápido?", "¿Qué relación ven entre residuos y transparencia?", "¿Qué dato conviene repetir otro día?"],
  },
  {
    id: "listen",
    field: "Lenguajes",
    title: "Escuchar las memorias del agua",
    description: "Prepara preguntas y registra una conversación con una persona de la comunidad.",
    image: "/images/community-interview.png",
    color: "#a61556",
    icon: Mic,
    duration: "25 min",
    evidence: "Audio y notas",
    objective: "Recuperar relatos, palabras locales y cambios observados a través del tiempo.",
    steps: [
      "Elijan a una persona y expliquen el propósito de la entrevista.",
      "Pidan autorización para grabar o tomar notas.",
      "Formulen preguntas abiertas y escuchen sin interrumpir.",
      "Seleccionen una idea importante y una nueva pregunta.",
    ],
    questions: ["¿Cómo era el agua antes?", "¿Qué prácticas de cuidado recuerda?", "¿Con quién más deberíamos conversar?"],
  },
  {
    id: "map",
    field: "Ética, naturaleza y sociedades",
    title: "Trazar la ruta que sigue el agua",
    description: "Reconoce nacimientos, usos, riesgos y lugares donde podemos cuidarla.",
    image: "/images/territory-map.png",
    color: "#d7681e",
    icon: MapPinned,
    duration: "40 min",
    evidence: "Mapa colectivo",
    objective: "Comprender que el agua conecta lugares, personas, actividades y responsabilidades.",
    steps: [
      "Dibujen la escuela, el arroyo, viviendas y caminos principales.",
      "Marquen de dónde viene el agua y hacia dónde continúa.",
      "Agreguen usos, riesgos y puntos de cuidado.",
      "Incluyan voces de la comunidad y acuerden una leyenda.",
    ],
    questions: ["¿Quién usa el agua en cada punto?", "¿Dónde existe mayor riesgo?", "¿Qué lugar necesita atención primero?"],
  },
  {
    id: "organize",
    field: "De lo humano y lo comunitario",
    title: "Reconocer quiénes pueden ayudar",
    description: "Identifica personas, grupos y acuerdos necesarios para una acción comunitaria.",
    image: "/images/community-garden.png",
    color: "#0868aa",
    icon: Users,
    duration: "30 min",
    evidence: "Directorio de aliados",
    objective: "Organizar la participación y distribuir responsabilidades de manera justa y segura.",
    steps: [
      "Hagan una lista de personas, grupos e instituciones cercanas.",
      "Escriban qué puede aportar cada una.",
      "Definan cómo invitarles y quién realizará el contacto.",
      "Acuerden tareas accesibles para todas y todos.",
    ],
    questions: ["¿Quién conoce el territorio?", "¿Quién puede acompañar la salida?", "¿Cómo escucharemos todas las voces?"],
  },
];

const initialTasks: ActionTask[] = [
  { id: 1, title: "Solicitar permiso para visitar el arroyo", owner: "Elena", date: "28 jul", status: "hecho" },
  { id: 2, title: "Preparar frascos y hojas de registro", owner: "Luis", date: "29 jul", status: "en-curso" },
  { id: 3, title: "Entrevistar a una persona mayor", owner: "Mara", date: "30 jul", status: "por-hacer" },
  { id: 4, title: "Diseñar carteles para reducir desperdicios", owner: "Sofía", date: "01 ago", status: "por-hacer" },
  { id: 5, title: "Organizar la jornada comunitaria", owner: "Todo el equipo", date: "03 ago", status: "en-curso" },
];

const initialMaterials: Material[] = [
  { id: "jars", label: "Frascos transparentes", ready: true },
  { id: "gloves", label: "Guantes reutilizables", ready: true },
  { id: "tape", label: "Cinta para medir", ready: false },
  { id: "posters", label: "Cartulinas y plumones", ready: false },
];

const initialPosts: SharedPost[] = [
  {
    id: 1,
    author: "Elena",
    title: "Así medimos el agua",
    body: "El nivel cambió después de la lluvia. Registramos tres puntos para poder compararlos.",
    image: "/images/measuring-stream.png",
    type: "foto",
    reactions: 8,
  },
  {
    id: 2,
    author: "Luis",
    title: "La historia que nos contó doña Carmen",
    body: "Antes el agua llegaba limpia durante más meses. Su relato nos ayudó a formular otra pregunta.",
    type: "audio",
    reactions: 12,
  },
  {
    id: 3,
    author: "Mara",
    title: "Nuestro primer acuerdo",
    body: "Cada salón tendrá una persona responsable de revisar que las llaves queden cerradas.",
    image: "/images/hands-water-care.png",
    type: "foto",
    reactions: 15,
  },
];

const resources: ResourceItem[] = [
  {
    id: "guide",
    title: "Guía para observar un cuerpo de agua",
    description: "Preguntas, cuidados y una tabla sencilla para registrar hallazgos sin contaminar el lugar.",
    category: "Guías",
    format: "PDF",
    meta: "2 páginas",
    icon: FileText,
    href: "/resources/guia-observar-cuerpo-agua.pdf",
    accent: "#0a72aa",
    audience: "Estudiantes y docentes",
    moment: "Exploramos",
    steps: ["Preparar la salida", "Observar sin alterar", "Registrar datos", "Cerrar con una nueva pregunta"],
    contents: ["Lista de materiales", "Tabla de observación", "Preguntas para comparar", "Acuerdos de seguridad"],
  },
  {
    id: "interview",
    title: "Tarjetas para una entrevista comunitaria",
    description: "Preguntas abiertas para recuperar experiencias, palabras y cambios observados en el tiempo.",
    category: "Plantillas",
    format: "DOCX",
    meta: "Editable",
    icon: MessageCircle,
    href: "/resources/tarjetas-entrevista-comunitaria.docx",
    accent: "#a61556",
    audience: "Equipos de 3 a 5",
    moment: "Pregunta local",
    steps: ["Pedir autorización", "Elegir preguntas", "Escuchar y registrar", "Seleccionar un hallazgo"],
    contents: ["8 tarjetas de preguntas", "Notas de entrevista", "Autorización sencilla", "Espacio para preguntas nuevas"],
  },
  {
    id: "measurement",
    title: "Ficha de medición del arroyo",
    description: "Formato para anotar hora, clima, profundidad, transparencia y velocidad aproximada.",
    category: "Plantillas",
    format: "XLSX",
    meta: "2 hojas",
    icon: ClipboardCheck,
    href: "/resources/ficha-medicion-arroyo.xlsx",
    accent: "#168148",
    audience: "Equipos de exploración",
    moment: "Exploramos",
    steps: ["Completar datos generales", "Registrar hasta 12 puntos", "Usar listas desplegables", "Revisar resumen automático"],
    contents: ["Registro de campo", "Validaciones", "Promedios automáticos", "Hoja de instrucciones"],
  },
  {
    id: "audio",
    title: "Cómo grabar un audio claro y respetuoso",
    description: "Recomendaciones para pedir autorización, reducir ruido y nombrar correctamente el archivo.",
    category: "Tutoriales",
    format: "PDF + voz",
    meta: "Lectura 4 min",
    icon: AudioLines,
    href: "/resources/tutorial-audio-claro-respetuoso.pdf",
    accent: "#7c4bb3",
    audience: "Estudiantes",
    moment: "Compartimos",
    steps: ["Preparar el lugar", "Pedir autorización", "Grabar con claridad", "Revisar antes de compartir"],
    contents: ["Consejos de grabación", "Privacidad", "Nombre de archivos", "Lista de revisión"],
  },
  {
    id: "safety",
    title: "Acuerdos de seguridad para la salida",
    description: "Lista de verificación para recorrer el territorio con acompañamiento y responsabilidades claras.",
    category: "Seguridad",
    format: "PDF",
    meta: "Checklist",
    icon: ShieldCheck,
    href: "/resources/acuerdos-seguridad-salida.pdf",
    accent: "#d7681e",
    audience: "Docentes y familias",
    moment: "Antes de salir",
    steps: ["Definir ruta", "Revisar permisos", "Acordar parejas", "Cerrar y reportar"],
    contents: ["Datos de la salida", "Antes, durante y después", "Contacto responsable", "Acuerdo de emergencia"],
  },
  {
    id: "presentation",
    title: "Lienzo para compartir nuestro proyecto",
    description: "Estructura visual para explicar la pregunta, los hallazgos, la acción y el cambio conseguido.",
    category: "Presentación",
    format: "PPTX",
    meta: "8 diapositivas",
    icon: Palette,
    href: "/resources/lienzo-presentacion-proyecto.pptx",
    accent: "#087fa5",
    audience: "Equipo completo",
    moment: "Compartimos",
    steps: ["Completar pregunta", "Elegir evidencias", "Explicar la acción", "Cerrar con una invitación"],
    contents: ["Portada", "4 campos formativos", "Evidencias", "Resultados y compromisos"],
  },
];

const sectionMeta: Record<Exclude<SectionId, "inicio">, { overline: string; title: string; description: string; icon: LucideIcon }> = {
  pregunta: {
    overline: "Momento 1 · Nos preguntamos",
    title: "Una pregunta que nace de nuestro territorio",
    description: "Observamos una situación cercana y construimos una pregunta abierta que pueda investigarse en equipo.",
    icon: Lightbulb,
  },
  exploramos: {
    overline: "Momento 2 · Investigamos",
    title: "Exploramos con cuatro lentes conectadas",
    description: "Cada recorrido aporta una forma distinta de comprender el agua, sus historias y las decisiones de la comunidad.",
    icon: Search,
  },
  acciones: {
    overline: "Momento 3 · Transformamos",
    title: "Convertimos los hallazgos en una acción posible",
    description: "Organizamos tareas, responsables, tiempos y evidencias para realizar una mejora concreta y alcanzable.",
    icon: Sprout,
  },
  compartimos: {
    overline: "Momento 4 · Hacemos comunidad",
    title: "Compartimos lo que aprendimos y lo que cambió",
    description: "Narramos el proceso con evidencias, escuchamos otras voces y celebramos los acuerdos construidos.",
    icon: Share2,
  },
  recursos: {
    overline: "Caja de herramientas",
    title: "Recursos para investigar, crear y cuidar",
    description: "Materiales editables y descargables para acompañar cada momento del proyecto comunitario.",
    icon: FolderOpen,
  },
};

export function ProjectSections({ activeSection, notify }: ProjectSectionsProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [question, setQuestion] = useState("¿Cómo ha cambiado el agua del arroyo y qué podemos hacer para cuidarla juntos?");
  const [questionFocus, setQuestionFocus] = useState("Cambios en el tiempo");
  const [observations, setObservations] = useState<string[]>(["El caudal disminuye durante la temporada seca."]);
  const [completedExplorations, setCompletedExplorations] = useState<string[]>(["listen"]);
  const [selectedExploration, setSelectedExploration] = useState<Exploration | null>(null);
  const [tasks, setTasks] = useState<ActionTask[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<ActionTask | null>(null);
  const [newTask, setNewTask] = useState("");
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [agreementConfirmed, setAgreementConfirmed] = useState(false);
  const [posts, setPosts] = useState<SharedPost[]>(initialPosts);
  const [newPost, setNewPost] = useState("");
  const [presentationOpen, setPresentationOpen] = useState(false);
  const [resourceQuery, setResourceQuery] = useState("");
  const [resourceCategory, setResourceCategory] = useState("Todos");
  const [resourceView, setResourceView] = useState<ResourceView>("todos");
  const [savedResources, setSavedResources] = useState<string[]>(["guide", "safety"]);
  const [recentResources, setRecentResources] = useState<string[]>([]);
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setIsHydrated(true);
      return;
    }
    try {
      const state = JSON.parse(stored) as {
        question?: string;
        questionFocus?: string;
        observations?: string[];
        completedExplorations?: string[];
        tasks?: ActionTask[];
        materials?: Material[];
        agreementConfirmed?: boolean;
        posts?: SharedPost[];
        savedResources?: string[];
        recentResources?: string[];
      };
      if (state.question) setQuestion(state.question);
      if (state.questionFocus) setQuestionFocus(state.questionFocus);
      if (state.observations) setObservations(state.observations);
      if (state.completedExplorations) setCompletedExplorations(state.completedExplorations);
      if (state.tasks) setTasks(state.tasks);
      if (state.materials) setMaterials(state.materials);
      if (typeof state.agreementConfirmed === "boolean") setAgreementConfirmed(state.agreementConfirmed);
      if (state.posts) setPosts(state.posts);
      if (state.savedResources) setSavedResources(state.savedResources);
      if (state.recentResources) setRecentResources(state.recentResources);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const state = {
      question,
      questionFocus,
      observations,
      completedExplorations,
      tasks,
      materials,
      agreementConfirmed,
      posts,
      savedResources,
      recentResources,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [agreementConfirmed, completedExplorations, isHydrated, materials, observations, posts, question, questionFocus, recentResources, savedResources, tasks]);

  const filteredResources = useMemo(() => {
    const query = resourceQuery.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesCategory = resourceCategory === "Todos" || resource.category === resourceCategory;
      const matchesQuery = !query || `${resource.title} ${resource.description} ${resource.format} ${resource.audience} ${resource.moment}`.toLowerCase().includes(query);
      const matchesView = resourceView === "todos"
        || (resourceView === "guardados" && savedResources.includes(resource.id))
        || (resourceView === "recientes" && recentResources.includes(resource.id));
      return matchesCategory && matchesQuery && matchesView;
    });
  }, [recentResources, resourceCategory, resourceQuery, resourceView, savedResources]);

  const openResource = (resource: ResourceItem) => {
    setSelectedResource(resource);
    setRecentResources((current) => [resource.id, ...current.filter((id) => id !== resource.id)].slice(0, 6));
  };

  const toggleResource = (id: string) => {
    setSavedResources((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  if (activeSection === "inicio") return null;

  const meta = sectionMeta[activeSection];
  const MetaIcon = meta.icon;
  const projectProgress = Math.round((
    (question.trim() ? 1 : 0)
    + completedExplorations.length / explorations.length
    + tasks.filter((task) => task.status === "hecho").length / Math.max(tasks.length, 1)
    + Math.min(posts.length / 4, 1)
  ) / 4 * 100);

  return (
    <section className="section-page" aria-labelledby={`section-${activeSection}`}>
      <header className="section-hero">
        <div className="section-hero-icon"><MetaIcon size={28} /></div>
        <div>
          <span>{meta.overline}</span>
          <h2 id={`section-${activeSection}`}>{meta.title}</h2>
          <p>{meta.description}</p>
        </div>
        <div className="section-progress-pill">
          <span>Proyecto</span>
          <strong>{projectProgress}%</strong>
          <div><i style={{ width: `${projectProgress}%` }} /></div>
        </div>
      </header>

      {activeSection === "pregunta" && (
        <QuestionSection
          focus={questionFocus}
          notify={notify}
          observations={observations}
          onAddObservation={() => {
            const observation = window.prompt("Escribe una observación breve del territorio:");
            if (!observation?.trim()) return;
            setObservations((current) => [...current, observation.trim()]);
            notify("La observación se agregó al contexto de la pregunta.");
          }}
          onFocusChange={setQuestionFocus}
          onQuestionChange={setQuestion}
          onRemoveObservation={(index) => setObservations((current) => current.filter((_, itemIndex) => itemIndex !== index))}
          question={question}
        />
      )}

      {activeSection === "exploramos" && (
        <ExploreSection
          completed={completedExplorations}
          onOpen={setSelectedExploration}
          onToggle={(id) => {
            setCompletedExplorations((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
          }}
        />
      )}

      {activeSection === "acciones" && (
        <ActionsSection
          agreementConfirmed={agreementConfirmed}
          materials={materials}
          newTask={newTask}
          onAddTask={(event) => {
            event.preventDefault();
            const title = newTask.trim();
            if (!title) return;
            setTasks((current) => [...current, { id: Date.now(), title, owner: "Sin asignar", date: "Por definir", status: "por-hacer" }]);
            setNewTask("");
            notify("La tarea se agregó al plan de acción.");
          }}
          onConfirmAgreement={() => {
            setAgreementConfirmed((current) => !current);
            notify(agreementConfirmed ? "El acuerdo quedó pendiente de confirmar." : "El acuerdo de cuidado quedó confirmado.");
          }}
          onMaterialToggle={(id) => setMaterials((current) => current.map((material) => material.id === id ? { ...material, ready: !material.ready } : material))}
          onMoveTask={(id) => {
            const nextStatus: Record<TaskStatus, TaskStatus> = { "por-hacer": "en-curso", "en-curso": "hecho", hecho: "por-hacer" };
            setTasks((current) => current.map((task) => task.id === id ? { ...task, status: nextStatus[task.status] } : task));
          }}
          onNewTaskChange={setNewTask}
          onOpenTask={setSelectedTask}
          tasks={tasks}
        />
      )}

      {activeSection === "compartimos" && (
        <ShareSection
          newPost={newPost}
          notify={notify}
          onAddPost={(event) => {
            event.preventDefault();
            const body = newPost.trim();
            if (!body) return;
            setPosts((current) => [{ id: Date.now(), author: "Equipo Agua Clara", title: "Nuevo aprendizaje", body, type: "texto", reactions: 0 }, ...current]);
            setNewPost("");
            notify("La aportación se publicó en el mural del proyecto.");
          }}
          onNewPostChange={setNewPost}
          onOpenPresentation={() => setPresentationOpen(true)}
          onReact={(id) => setPosts((current) => current.map((post) => post.id === id ? { ...post, reactions: post.reactions + 1 } : post))}
          posts={posts}
        />
      )}

      {activeSection === "recursos" && (
        <ResourcesSection
          category={resourceCategory}
          onCategoryChange={setResourceCategory}
          onOpen={openResource}
          onQueryChange={setResourceQuery}
          onToggleSave={toggleResource}
          onViewChange={setResourceView}
          query={resourceQuery}
          recentCount={recentResources.length}
          resources={filteredResources}
          savedIds={savedResources}
          view={resourceView}
        />
      )}

      {selectedExploration && (
        <ExplorationModal
          completed={completedExplorations.includes(selectedExploration.id)}
          exploration={selectedExploration}
          onClose={() => setSelectedExploration(null)}
          onToggle={() => {
            const id = selectedExploration.id;
            setCompletedExplorations((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
          }}
        />
      )}

      {selectedTask && (
        <TaskModal
          onClose={() => setSelectedTask(null)}
          onDelete={() => {
            setTasks((current) => current.filter((task) => task.id !== selectedTask.id));
            setSelectedTask(null);
            notify("La tarea se eliminó del plan.");
          }}
          onSave={(task) => {
            setTasks((current) => current.map((item) => item.id === task.id ? task : item));
            setSelectedTask(null);
            notify("Los cambios de la tarea quedaron guardados.");
          }}
          task={selectedTask}
        />
      )}

      {selectedResource && (
        <ResourceModal
          isSaved={savedResources.includes(selectedResource.id)}
          onClose={() => setSelectedResource(null)}
          onToggleSave={() => toggleResource(selectedResource.id)}
          resource={selectedResource}
        />
      )}

      {presentationOpen && <PresentationModal onClose={() => setPresentationOpen(false)} />}
    </section>
  );
}

function QuestionSection({
  focus,
  notify,
  observations,
  onAddObservation,
  onFocusChange,
  onQuestionChange,
  onRemoveObservation,
  question,
}: {
  focus: string;
  notify: Notify;
  observations: string[];
  onAddObservation: () => void;
  onFocusChange: (focus: string) => void;
  onQuestionChange: (question: string) => void;
  onRemoveObservation: (index: number) => void;
  question: string;
}) {
  const suggestions = [
    "¿Por qué algunas zonas del arroyo tienen menos agua?",
    "¿Qué historias recuerda la comunidad sobre la lluvia?",
    "¿Cómo podemos reducir el agua que se desperdicia en la escuela?",
  ];
  const focusOptions = ["Cambios en el tiempo", "Usos del agua", "Riesgos y cuidado", "Historias locales"];

  return (
    <div className="question-layout">
      <article className="question-builder section-surface">
        <div className="surface-heading">
          <div><PencilLine size={22} /></div>
          <span><small>Pregunta guía del equipo</small><strong>Escriban algo que no pueda responderse solamente con “sí” o “no”.</strong></span>
        </div>
        <div className="focus-options" aria-label="Enfoque de la pregunta">
          {focusOptions.map((option) => <button className={focus === option ? "is-active" : ""} key={option} type="button" onClick={() => onFocusChange(option)}>{option}</button>)}
        </div>
        <label className="question-input">
          <span>Nuestra pregunta local</span>
          <textarea maxLength={180} value={question} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onQuestionChange(event.target.value)} />
          <small>{question.length}/180 caracteres</small>
        </label>
        <div className="question-actions">
          <button className="primary-action" type="button" onClick={() => notify("La pregunta local quedó guardada en la bitácora.")}><CheckCircle2 size={18} /> Guardar pregunta</button>
          <button className="secondary-action" type="button" onClick={() => onQuestionChange("")}>Limpiar</button>
        </div>
      </article>

      <aside className="question-aside">
        <article className="section-surface prompt-card">
          <span className="card-overline">Ideas para inspirarse</span>
          <div className="suggestion-list">
            {suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => onQuestionChange(suggestion)}><Lightbulb size={17} /><span>{suggestion}</span><ChevronRight size={17} /></button>)}
          </div>
        </article>
        <article className="section-surface criteria-card">
          <span className="card-overline">Una buena pregunta…</span>
          {[["Se conecta con la comunidad", Users], ["Puede investigarse con evidencias", Search], ["Ayuda a imaginar una acción", Target]].map(([label, Icon]) => {
            const CriteriaIcon = Icon as LucideIcon;
            return <div key={label as string}><span><CriteriaIcon size={17} /></span><strong>{label as string}</strong><Check size={17} /></div>;
          })}
        </article>
      </aside>

      <article className="question-context-card section-surface">
        <div className="context-photo"><Image src="/images/hero-water-school.png" alt="Arroyo cercano a la escuela" fill sizes="420px" /></div>
        <div>
          <span className="card-overline">Lo que observamos</span>
          <h3>El arroyo atraviesa nuestra comunidad</h3>
          <p>Durante algunos meses corre con fuerza; en otros disminuye y aparecen residuos en sus orillas. Varias familias recuerdan cambios importantes.</p>
          <div className="observation-list">
            {observations.map((observation, index) => <span key={`${observation}-${index}`}><i>{index + 1}</i><strong>{observation}</strong><button type="button" onClick={() => onRemoveObservation(index)} aria-label="Eliminar observación"><X size={14} /></button></span>)}
          </div>
          <button type="button" onClick={onAddObservation}><Plus size={17} /> Agregar observación</button>
        </div>
      </article>
    </div>
  );
}

function ExploreSection({ completed, onOpen, onToggle }: { completed: string[]; onOpen: (exploration: Exploration) => void; onToggle: (id: string) => void }) {
  const progress = Math.round((completed.length / explorations.length) * 100);
  return (
    <div className="explore-layout">
      <div className="explore-summary section-surface">
        <div><span className="card-overline">Ruta de exploración</span><h3>{completed.length} de {explorations.length} recorridos completados</h3><p>Las evidencias de cada recorrido se integran automáticamente a la bitácora.</p></div>
        <div className="round-progress" style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}><span>{progress}%</span></div>
      </div>
      <div className="exploration-grid">
        {explorations.map((exploration, index) => {
          const Icon = exploration.icon;
          const isDone = completed.includes(exploration.id);
          return (
            <article className={`exploration-card ${isDone ? "is-complete" : ""}`} key={exploration.id} style={{ "--explore-color": exploration.color } as React.CSSProperties}>
              <div className="exploration-image"><Image src={exploration.image} alt="" fill sizes="360px" /><span className="exploration-number">0{index + 1}</span>{isDone && <span className="completion-badge"><CheckCircle2 size={16} /> Completada</span>}</div>
              <div className="exploration-content">
                <span className="exploration-field"><Icon size={16} /> {exploration.field}</span>
                <h3>{exploration.title}</h3><p>{exploration.description}</p>
                <div className="exploration-meta"><span><Clock3 size={14} /> {exploration.duration}</span><span><Camera size={14} /> {exploration.evidence}</span></div>
                <div className="exploration-actions">
                  <button type="button" onClick={() => onOpen(exploration)}>Ver instrucciones <ArrowRight size={16} /></button>
                  <button className="complete-button" type="button" onClick={() => onToggle(exploration.id)} aria-label={isDone ? "Marcar como pendiente" : "Marcar como completada"}>{isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <article className="field-route section-surface">
        <div className="surface-heading compact"><div><MapPinned size={21} /></div><span><small>Salida al territorio</small><strong>Ruta segura para observar el arroyo</strong></span></div>
        <div className="route-steps">
          {[["Punto de reunión", "Escuela", "08:30"], ["Primera observación", "Puente pequeño", "08:45"], ["Medición", "Zona de piedras", "09:05"], ["Cierre y limpieza", "Huerto escolar", "09:40"]].map(([title, place, time], index) => <div key={title}><span>{index + 1}</span><strong>{title}<small>{place}</small></strong><time>{time}</time></div>)}
        </div>
      </article>
    </div>
  );
}

function ActionsSection({
  agreementConfirmed,
  materials,
  newTask,
  onAddTask,
  onConfirmAgreement,
  onMaterialToggle,
  onMoveTask,
  onNewTaskChange,
  onOpenTask,
  tasks,
}: {
  agreementConfirmed: boolean;
  materials: Material[];
  newTask: string;
  onAddTask: (event: FormEvent<HTMLFormElement>) => void;
  onConfirmAgreement: () => void;
  onMaterialToggle: (id: string) => void;
  onMoveTask: (id: number) => void;
  onNewTaskChange: (value: string) => void;
  onOpenTask: (task: ActionTask) => void;
  tasks: ActionTask[];
}) {
  const columns: Array<{ id: TaskStatus; label: string; helper: string }> = [
    { id: "por-hacer", label: "Por hacer", helper: "Ideas y pendientes" },
    { id: "en-curso", label: "En proceso", helper: "Tareas activas" },
    { id: "hecho", label: "Realizado", helper: "Con evidencia" },
  ];
  return (
    <div className="actions-layout">
      <article className="action-highlight section-surface">
        <div className="action-highlight-copy"><span className="card-overline">Nuestra acción elegida</span><h3>Jornada escolar para conocer y cuidar el arroyo</h3><p>Mediremos un tramo, recogeremos residuos sin riesgo y compartiremos acuerdos para reducir el desperdicio de agua en la escuela.</p><div className="action-tags"><span><CalendarDays size={15} /> 3 de agosto</span><span><Users size={15} /> 5 integrantes</span><span><Leaf size={15} /> Acción ambiental</span></div></div>
        <div className="action-highlight-image"><Image src="/images/school-garden.png" alt="Actividad comunitaria en un huerto escolar" fill sizes="370px" /></div>
      </article>
      <form className="quick-task-form section-surface" onSubmit={onAddTask}><div><Plus size={21} /><span><small>Nueva tarea</small><strong>¿Qué hace falta organizar?</strong></span></div><input value={newTask} onChange={(event: ChangeEvent<HTMLInputElement>) => onNewTaskChange(event.target.value)} placeholder="Ej. Preparar etiquetas para las muestras" /><button type="submit">Agregar</button></form>
      <div className="task-board">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.id);
          return <section className={`task-column task-column-${column.id}`} key={column.id}><header><span><strong>{column.label}</strong><small>{column.helper}</small></span><b>{columnTasks.length}</b></header><div className="task-list">{columnTasks.map((task) => <article key={task.id}><button className="task-check" type="button" onClick={() => onMoveTask(task.id)} title="Mover a la siguiente etapa">{task.status === "hecho" ? <Check size={16} /> : <Circle size={16} />}</button><div><strong>{task.title}</strong><span><Users size={13} /> {task.owner}</span><span><CalendarDays size={13} /> {task.date}</span></div><button className="task-more" type="button" onClick={() => onOpenTask(task)}>•••</button></article>)}{!columnTasks.length && <div className="empty-column"><Sparkles size={20} /><span>No hay tareas aquí</span></div>}</div></section>;
        })}
      </div>
      <div className="action-bottom-grid">
        <article className="materials-card section-surface"><span className="card-overline">Materiales</span>{materials.map((material) => <button className="material-row" key={material.id} type="button" onClick={() => onMaterialToggle(material.id)}><span className={material.ready ? "is-ready" : ""}>{material.ready ? <Check size={14} /> : null}</span><strong>{material.label}</strong><small>{material.ready ? "Listo" : "Pendiente"}</small></button>)}</article>
        <article className={`agreement-card section-surface ${agreementConfirmed ? "is-confirmed" : ""}`}><HeartHandshake size={28} /><div><span className="card-overline">Acuerdo de cuidado</span><h3>Nadie entra al agua sin acompañamiento adulto.</h3><p>También evitaremos tocar residuos peligrosos y dejaremos el sitio mejor de como lo encontramos.</p></div><button type="button" onClick={onConfirmAgreement}>{agreementConfirmed ? <Check size={18} /> : <CheckCircle2 size={18} />} {agreementConfirmed ? "Confirmado" : "Confirmar"}</button></article>
      </div>
    </div>
  );
}

function ShareSection({ newPost, notify, onAddPost, onNewPostChange, onOpenPresentation, onReact, posts }: { newPost: string; notify: Notify; onAddPost: (event: FormEvent<HTMLFormElement>) => void; onNewPostChange: (value: string) => void; onOpenPresentation: () => void; onReact: (id: number) => void; posts: SharedPost[] }) {
  const copyInvitation = async () => {
    const text = "Te invitamos a conocer el proyecto El agua que compartimos. Viernes 12:30, patio de la escuela.";
    await navigator.clipboard?.writeText(text);
    notify("La invitación quedó copiada para compartirla.");
  };
  return (
    <div className="share-layout">
      <form className="share-composer section-surface" onSubmit={onAddPost}><div className="share-avatar">A</div><div className="share-input-wrap"><textarea value={newPost} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onNewPostChange(event.target.value)} placeholder="Comparte un hallazgo, un acuerdo o algo que cambió…" /><div><span><button type="button" onClick={() => notify("Las fotografías se agregan desde el panel de evidencias del proyecto.")}><ImageIcon size={17} /> Foto</button><button type="button" onClick={() => notify("Los audios se agregan desde el panel de evidencias del proyecto.")}><Mic size={17} /> Audio</button></span><button className="publish-button" type="submit"><Send size={17} /> Publicar</button></div></div></form>
      <div className="community-wall">
        <section className="post-feed">
          {posts.map((post) => <article className="community-post section-surface" key={post.id}><header><span className="post-avatar">{post.author.charAt(0)}</span><div><strong>{post.author}</strong><small>Equipo Agua Clara · hace poco</small></div><button type="button">•••</button></header><h3>{post.title}</h3><p>{post.body}</p>{post.image && <button className="post-image" type="button" onClick={() => notify("Abriste la evidencia del mural.")}><Image src={post.image} alt="" fill sizes="600px" /></button>}{post.type === "audio" && <button className="post-audio" type="button" onClick={() => notify("Reproduciendo relato de la comunidad.")}><span><AudioLines size={20} /></span><i /><strong>00:32</strong></button>}<footer><button type="button" onClick={() => onReact(post.id)}>💧 {post.reactions}</button><button type="button" onClick={() => notify("El espacio de comentarios quedó listo para la siguiente versión con backend.")}><MessageCircle size={16} /> Comentar</button><button type="button" onClick={() => navigator.clipboard?.writeText(post.body).then(() => notify("El texto de la publicación se copió."))}><Link2 size={16} /> Compartir</button></footer></article>)}
        </section>
        <aside className="presentation-panel">
          <article className="section-surface presentation-card"><span className="card-overline">Presentación final</span><h3>Contemos nuestra historia completa</h3><p>El equipo tiene casi todo listo para compartir el proyecto con la comunidad.</p><div className="presentation-progress"><span><i style={{ width: "75%" }} /></span><strong>75%</strong></div>{[["La pregunta local", true], ["Hallazgos con evidencias", true], ["La acción realizada", true], ["Lo que cambió", false]].map(([label, done]) => <div className="presentation-check" key={label as string}><span className={done ? "is-done" : ""}>{done ? <Check size={14} /> : null}</span><strong>{label as string}</strong></div>)}<button type="button" onClick={onOpenPresentation}><Sparkles size={17} /> Preparar presentación</button></article>
          <article className="section-surface invitation-card"><Users size={26} /><div><span className="card-overline">Invitar a la comunidad</span><h3>Viernes · 12:30</h3><p>Patio de la escuela</p></div><button type="button" onClick={copyInvitation}><Copy size={17} /></button></article>
        </aside>
      </div>
    </div>
  );
}

function ResourcesSection({ category, onCategoryChange, onOpen, onQueryChange, onToggleSave, onViewChange, query, recentCount, resources: visibleResources, savedIds, view }: { category: string; onCategoryChange: (category: string) => void; onOpen: (resource: ResourceItem) => void; onQueryChange: (query: string) => void; onToggleSave: (id: string) => void; onViewChange: (view: ResourceView) => void; query: string; recentCount: number; resources: ResourceItem[]; savedIds: string[]; view: ResourceView }) {
  const categories = ["Todos", "Guías", "Plantillas", "Tutoriales", "Seguridad", "Presentación"];
  return (
    <div className="resources-layout">
      <div className="resource-dashboard">
        <article className="resource-stat section-surface"><span><FolderOpen size={22} /></span><div><strong>{resources.length}</strong><small>Materiales disponibles</small></div></article>
        <article className="resource-stat section-surface"><span><BookmarkCheck size={22} /></span><div><strong>{savedIds.length}</strong><small>Guardados por el equipo</small></div></article>
        <article className="resource-stat section-surface"><span><Clock3 size={22} /></span><div><strong>{recentCount}</strong><small>Consultados recientemente</small></div></article>
        <article className="resource-stat section-surface"><span><FileDown size={22} /></span><div><strong>5</strong><small>Formatos editables</small></div></article>
      </div>

      <div className="resource-toolbar section-surface">
        <div className="resource-view-tabs">
          <button className={view === "todos" ? "is-active" : ""} type="button" onClick={() => onViewChange("todos")}><FolderOpen size={16} /> Todos</button>
          <button className={view === "guardados" ? "is-active" : ""} type="button" onClick={() => onViewChange("guardados")}><Bookmark size={16} /> Mi colección</button>
          <button className={view === "recientes" ? "is-active" : ""} type="button" onClick={() => onViewChange("recientes")}><Clock3 size={16} /> Recientes</button>
        </div>
        <label><Search size={18} /><input value={query} onChange={(event: ChangeEvent<HTMLInputElement>) => onQueryChange(event.target.value)} placeholder="Buscar por título, formato, momento o audiencia…" /></label>
        <div className="resource-category-chips">{categories.map((item) => <button className={category === item ? "is-active" : ""} key={item} type="button" onClick={() => onCategoryChange(item)}>{item}</button>)}</div>
      </div>

      <div className="resource-grid">
        {visibleResources.map((resource) => {
          const Icon = resource.icon;
          const saved = savedIds.includes(resource.id);
          return <article className="resource-card section-surface" key={resource.id} style={{ "--resource-accent": resource.accent } as React.CSSProperties}><div className="resource-card-top"><div className="resource-icon"><Icon size={25} /></div><button className={`resource-save ${saved ? "is-saved" : ""}`} type="button" onClick={() => onToggleSave(resource.id)} aria-label={saved ? "Quitar de la colección" : "Guardar en la colección"}>{saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}</button></div><span className="resource-format">{resource.format}</span><h3>{resource.title}</h3><p>{resource.description}</p><div className="resource-audience"><span><GraduationCap size={14} /> {resource.audience}</span><span><Sparkles size={14} /> {resource.moment}</span></div><div className="resource-meta"><span><Clock3 size={14} /> {resource.meta}</span><span><BookOpenCheck size={14} /> {resource.category}</span></div><footer><button type="button" onClick={() => onOpen(resource)}><Eye size={16} /> Ver recurso</button><a href={resource.href} download><Download size={17} /><span>Descargar</span></a></footer></article>;
        })}
        {!visibleResources.length && <div className="resources-empty section-surface"><FolderOpen size={35} /><h3>No encontramos recursos</h3><p>Cambia la búsqueda, selecciona otra categoría o guarda materiales en tu colección.</p><button type="button" onClick={() => { onViewChange("todos"); onCategoryChange("Todos"); onQueryChange(""); }}>Mostrar todos</button></div>}
      </div>

      <div className="resource-bottom-grid">
        <article className="resource-feature section-surface"><div><span className="card-overline">Secuencia recomendada</span><h3>Antes de salir: observamos sin dejar huella</h3><p>Combina la guía de observación, los acuerdos de seguridad y la ficha de medición en una ruta de preparación de 20 minutos.</p><div className="feature-resource-list"><span><Check size={14} /> Guía de observación</span><span><Check size={14} /> Acuerdos de seguridad</span><span><Check size={14} /> Ficha de medición</span></div><button type="button" onClick={() => onOpen(resources[0])}>Comenzar secuencia <ArrowRight size={17} /></button></div><div className="feature-illustration"><Droplets size={55} /><Waves size={95} /><Sprout size={54} /></div></article>
        <article className="teacher-kit section-surface"><span className="teacher-kit-icon"><GraduationCap size={28} /></span><span className="card-overline">Kit para acompañamiento</span><h3>Planeación rápida para docente</h3><p>Una sugerencia de orden para usar los materiales durante el proyecto.</p><ol><li><strong>Pregunta local</strong><span>Tarjetas de entrevista</span></li><li><strong>Exploración</strong><span>Guía, seguridad y medición</span></li><li><strong>Comunicación</strong><span>Lienzo de presentación</span></li></ol><a href="/resources/lienzo-presentacion-proyecto.pptx" download><FileDown size={16} /> Descargar lienzo</a></article>
      </div>
    </div>
  );
}

function ExplorationModal({ completed, exploration, onClose, onToggle }: { completed: boolean; exploration: Exploration; onClose: () => void; onToggle: () => void }) {
  const Icon = exploration.icon;
  return <ModalShell onClose={onClose}><div className="detail-modal exploration-detail"><header style={{ "--detail-accent": exploration.color } as React.CSSProperties}><span><Icon size={26} /></span><div><small>{exploration.field}</small><h3>{exploration.title}</h3><p>{exploration.objective}</p></div></header><div className="exploration-detail-grid"><section><span className="card-overline">Paso a paso</span>{exploration.steps.map((step, index) => <div className="modal-step" key={step}><span>{index + 1}</span><p>{step}</p></div>)}</section><aside><span className="card-overline">Preguntas para pensar</span>{exploration.questions.map((question) => <p className="modal-question" key={question}><Lightbulb size={16} /> {question}</p>)}<div className="modal-evidence"><Camera size={21} /><span><small>Evidencia esperada</small><strong>{exploration.evidence}</strong></span></div></aside></div><footer><button className="secondary-action" type="button" onClick={onClose}>Cerrar</button><button className="primary-action" type="button" onClick={onToggle}>{completed ? <Circle size={18} /> : <CheckCircle2 size={18} />}{completed ? "Marcar pendiente" : "Marcar completada"}</button></footer></div></ModalShell>;
}

function TaskModal({ onClose, onDelete, onSave, task }: { onClose: () => void; onDelete: () => void; onSave: (task: ActionTask) => void; task: ActionTask }) {
  const [draft, setDraft] = useState(task);
  return <ModalShell onClose={onClose}><form className="detail-modal task-detail" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onSave(draft); }}><header><span><ClipboardCheck size={25} /></span><div><small>Detalle de la tarea</small><h3>Editar organización</h3><p>Actualiza responsable, fecha o etapa sin perder el plan del equipo.</p></div></header><label><span>Tarea</span><input value={draft.title} onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, title: event.target.value })} required /></label><div className="modal-form-grid"><label><span>Responsable</span><input value={draft.owner} onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, owner: event.target.value })} /></label><label><span>Fecha</span><input value={draft.date} onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, date: event.target.value })} /></label></div><label><span>Etapa</span><select value={draft.status} onChange={(event: ChangeEvent<HTMLSelectElement>) => setDraft({ ...draft, status: event.target.value as TaskStatus })}><option value="por-hacer">Por hacer</option><option value="en-curso">En proceso</option><option value="hecho">Realizado</option></select></label><footer><button className="danger-action" type="button" onClick={onDelete}><Trash2 size={17} /> Eliminar</button><span /><button className="secondary-action" type="button" onClick={onClose}>Cancelar</button><button className="primary-action" type="submit"><Check size={17} /> Guardar</button></footer></form></ModalShell>;
}

function ResourceModal({ isSaved, onClose, onToggleSave, resource }: { isSaved: boolean; onClose: () => void; onToggleSave: () => void; resource: ResourceItem }) {
  const Icon = resource.icon;
  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${resource.title}. ${resource.description}. ${resource.steps.join(". ")}`);
    utterance.lang = "es-MX";
    window.speechSynthesis.speak(utterance);
  };
  return <ModalShell onClose={onClose}><div className="detail-modal resource-detail" style={{ "--detail-accent": resource.accent } as React.CSSProperties}><header><span><Icon size={27} /></span><div><small>{resource.category} · {resource.format}</small><h3>{resource.title}</h3><p>{resource.description}</p></div></header><div className="resource-detail-meta"><span><GraduationCap size={16} /><small>Dirigido a</small><strong>{resource.audience}</strong></span><span><Sparkles size={16} /><small>Momento</small><strong>{resource.moment}</strong></span><span><Clock3 size={16} /><small>Extensión</small><strong>{resource.meta}</strong></span></div><div className="resource-detail-grid"><section><span className="card-overline">Cómo utilizarlo</span>{resource.steps.map((step, index) => <div className="modal-step" key={step}><span>{index + 1}</span><p>{step}</p></div>)}</section><aside><span className="card-overline">Incluye</span>{resource.contents.map((content) => <p key={content}><Check size={15} /> {content}</p>)}<button className="listen-resource" type="button" onClick={speak}><Volume2 size={17} /> Escuchar descripción</button></aside></div><footer><button className={`secondary-action ${isSaved ? "is-saved" : ""}`} type="button" onClick={onToggleSave}>{isSaved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}{isSaved ? "Guardado" : "Guardar"}</button><a className="primary-action" href={resource.href} download><Download size={17} /> Descargar {resource.format}</a></footer></div></ModalShell>;
}

function PresentationModal({ onClose }: { onClose: () => void }) {
  const slides = ["Portada del proyecto", "Pregunta local", "Cuatro campos formativos", "Evidencias", "Hallazgos", "Acción", "Resultados", "Invitación comunitaria"];
  return <ModalShell onClose={onClose}><div className="detail-modal presentation-detail"><header><span><Palette size={27} /></span><div><small>Presentación final</small><h3>Lienzo del proyecto comunitario</h3><p>Completa ocho diapositivas para contar el proceso con claridad y evidencias.</p></div></header><div className="presentation-slide-list">{slides.map((slide, index) => <div key={slide}><span>{index + 1}</span><strong>{slide}</strong><i className={index < 6 ? "is-ready" : ""}>{index < 6 ? <Check size={14} /> : null}</i></div>)}</div><div className="presentation-tip"><Sparkles size={21} /><p><strong>Consejo:</strong> una evidencia bien explicada vale más que muchas imágenes sin contexto.</p></div><footer><button className="secondary-action" type="button" onClick={onClose}>Cerrar</button><a className="primary-action" href="/resources/lienzo-presentacion-proyecto.pptx" download><FileDown size={17} /> Descargar PPTX editable</a></footer></div></ModalShell>;
}

function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return <div className="project-modal-backdrop" role="presentation" onMouseDown={(event: MouseEvent<HTMLDivElement>) => { if (event.target === event.currentTarget) onClose(); }}><div className="project-modal-shell" role="dialog" aria-modal="true"><button className="project-modal-close" type="button" onClick={onClose} aria-label="Cerrar"><X size={21} /></button>{children}</div></div>;
}
