"use client";

import Image from "next/image";
import {
  ArrowRight,
  AudioLines,
  BookOpenCheck,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Clock3,
  Download,
  Droplets,
  ExternalLink,
  FileText,
  FlaskConical,
  FolderOpen,
  HeartHandshake,
  ImageIcon,
  Leaf,
  Lightbulb,
  Link2,
  ListChecks,
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
  Users,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";

type SectionId = "inicio" | "pregunta" | "exploramos" | "acciones" | "compartimos" | "recursos";
type Notify = (message: string) => void;
type TaskStatus = "por-hacer" | "en-curso" | "hecho";

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
};

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
  },
];

const initialTasks: ActionTask[] = [
  { id: 1, title: "Solicitar permiso para visitar el arroyo", owner: "Elena", date: "28 jul", status: "hecho" },
  { id: 2, title: "Preparar frascos y hojas de registro", owner: "Luis", date: "29 jul", status: "en-curso" },
  { id: 3, title: "Entrevistar a una persona mayor", owner: "Mara", date: "30 jul", status: "por-hacer" },
  { id: 4, title: "Diseñar carteles para reducir desperdicios", owner: "Sofía", date: "01 ago", status: "por-hacer" },
  { id: 5, title: "Organizar la jornada comunitaria", owner: "Todo el equipo", date: "03 ago", status: "en-curso" },
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
    meta: "4 páginas",
    icon: FileText,
  },
  {
    id: "interview",
    title: "Tarjetas para una entrevista comunitaria",
    description: "Preguntas abiertas para recuperar experiencias, palabras y cambios observados en el tiempo.",
    category: "Plantillas",
    format: "DOCX",
    meta: "Editable",
    icon: MessageCircle,
  },
  {
    id: "measurement",
    title: "Ficha de medición del arroyo",
    description: "Formato para anotar hora, clima, profundidad, transparencia y velocidad aproximada.",
    category: "Plantillas",
    format: "XLSX",
    meta: "1 hoja",
    icon: ClipboardCheck,
  },
  {
    id: "audio",
    title: "Cómo grabar un audio claro y respetuoso",
    description: "Recomendaciones para pedir autorización, reducir ruido y nombrar correctamente el archivo.",
    category: "Tutoriales",
    format: "Audio",
    meta: "03:20 min",
    icon: AudioLines,
  },
  {
    id: "safety",
    title: "Acuerdos de seguridad para la salida",
    description: "Lista de verificación para recorrer el territorio con acompañamiento y responsabilidades claras.",
    category: "Seguridad",
    format: "PDF",
    meta: "Checklist",
    icon: ShieldCheck,
  },
  {
    id: "presentation",
    title: "Lienzo para compartir nuestro proyecto",
    description: "Estructura visual para explicar la pregunta, los hallazgos, la acción y el cambio conseguido.",
    category: "Presentación",
    format: "PPTX",
    meta: "8 diapositivas",
    icon: Palette,
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
    description: "Materiales de apoyo listos para acompañar cada momento del proyecto comunitario.",
    icon: FolderOpen,
  },
};

export function ProjectSections({ activeSection, notify }: ProjectSectionsProps) {
  const [question, setQuestion] = useState("¿Cómo ha cambiado el agua del arroyo y qué podemos hacer para cuidarla juntos?");
  const [questionFocus, setQuestionFocus] = useState("Cambios en el tiempo");
  const [completedExplorations, setCompletedExplorations] = useState<string[]>(["listen"]);
  const [tasks, setTasks] = useState<ActionTask[]>(initialTasks);
  const [newTask, setNewTask] = useState("");
  const [posts, setPosts] = useState<SharedPost[]>(initialPosts);
  const [newPost, setNewPost] = useState("");
  const [resourceQuery, setResourceQuery] = useState("");
  const [resourceCategory, setResourceCategory] = useState("Todos");

  const filteredResources = useMemo(() => {
    const query = resourceQuery.trim().toLowerCase();
    return resources.filter((resource) => {
      const matchesCategory = resourceCategory === "Todos" || resource.category === resourceCategory;
      const matchesQuery = !query || `${resource.title} ${resource.description} ${resource.format}`.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [resourceCategory, resourceQuery]);

  if (activeSection === "inicio") return null;

  const meta = sectionMeta[activeSection];
  const MetaIcon = meta.icon;

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
          <strong>62%</strong>
          <div><i style={{ width: "62%" }} /></div>
        </div>
      </header>

      {activeSection === "pregunta" && (
        <QuestionSection
          focus={questionFocus}
          notify={notify}
          onFocusChange={setQuestionFocus}
          onQuestionChange={setQuestion}
          question={question}
        />
      )}

      {activeSection === "exploramos" && (
        <ExploreSection
          completed={completedExplorations}
          notify={notify}
          onToggle={(id) => {
            setCompletedExplorations((current) =>
              current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
            );
          }}
        />
      )}

      {activeSection === "acciones" && (
        <ActionsSection
          newTask={newTask}
          notify={notify}
          onAddTask={(event) => {
            event.preventDefault();
            const title = newTask.trim();
            if (!title) return;
            setTasks((current) => [
              ...current,
              { id: Date.now(), title, owner: "Sin asignar", date: "Por definir", status: "por-hacer" },
            ]);
            setNewTask("");
            notify("La tarea se agregó al plan de acción.");
          }}
          onMoveTask={(id) => {
            const nextStatus: Record<TaskStatus, TaskStatus> = {
              "por-hacer": "en-curso",
              "en-curso": "hecho",
              hecho: "por-hacer",
            };
            setTasks((current) => current.map((task) => task.id === id ? { ...task, status: nextStatus[task.status] } : task));
          }}
          onNewTaskChange={setNewTask}
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
            setPosts((current) => [
              { id: Date.now(), author: "Equipo Agua Clara", title: "Nuevo aprendizaje", body, type: "texto", reactions: 0 },
              ...current,
            ]);
            setNewPost("");
            notify("La aportación se publicó en el mural del proyecto.");
          }}
          onNewPostChange={setNewPost}
          onReact={(id) => setPosts((current) => current.map((post) => post.id === id ? { ...post, reactions: post.reactions + 1 } : post))}
          posts={posts}
        />
      )}

      {activeSection === "recursos" && (
        <ResourcesSection
          category={resourceCategory}
          notify={notify}
          onCategoryChange={setResourceCategory}
          onQueryChange={setResourceQuery}
          query={resourceQuery}
          resources={filteredResources}
        />
      )}
    </section>
  );
}

function QuestionSection({
  focus,
  notify,
  onFocusChange,
  onQuestionChange,
  question,
}: {
  focus: string;
  notify: Notify;
  onFocusChange: (focus: string) => void;
  onQuestionChange: (question: string) => void;
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
          <span>
            <small>Pregunta guía del equipo</small>
            <strong>Escriban algo que no pueda responderse solamente con “sí” o “no”.</strong>
          </span>
        </div>

        <div className="focus-options" aria-label="Enfoque de la pregunta">
          {focusOptions.map((option) => (
            <button className={focus === option ? "is-active" : ""} key={option} type="button" onClick={() => onFocusChange(option)}>
              {option}
            </button>
          ))}
        </div>

        <label className="question-input">
          <span>Nuestra pregunta local</span>
          <textarea maxLength={180} value={question} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onQuestionChange(event.target.value)} />
          <small>{question.length}/180 caracteres</small>
        </label>

        <div className="question-actions">
          <button className="primary-action" type="button" onClick={() => notify("La pregunta local quedó guardada en la bitácora.")}>
            <CheckCircle2 size={18} /> Guardar pregunta
          </button>
          <button className="secondary-action" type="button" onClick={() => onQuestionChange("")}>
            Limpiar
          </button>
        </div>
      </article>

      <aside className="question-aside">
        <article className="section-surface prompt-card">
          <span className="card-overline">Ideas para inspirarse</span>
          <div className="suggestion-list">
            {suggestions.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => onQuestionChange(suggestion)}>
                <Lightbulb size={17} />
                <span>{suggestion}</span>
                <ChevronRight size={17} />
              </button>
            ))}
          </div>
        </article>

        <article className="section-surface criteria-card">
          <span className="card-overline">Una buena pregunta…</span>
          {[
            ["Se conecta con la comunidad", Users],
            ["Puede investigarse con evidencias", Search],
            ["Ayuda a imaginar una acción", Target],
          ].map(([label, Icon]) => {
            const CriteriaIcon = Icon as LucideIcon;
            return <div key={label as string}><span><CriteriaIcon size={17} /></span><strong>{label as string}</strong><Check size={17} /></div>;
          })}
        </article>
      </aside>

      <article className="question-context-card section-surface">
        <div className="context-photo">
          <Image src="/images/hero-water-school.png" alt="Arroyo cercano a la escuela" fill sizes="420px" />
        </div>
        <div>
          <span className="card-overline">Lo que observamos</span>
          <h3>El arroyo atraviesa nuestra comunidad</h3>
          <p>Durante algunos meses corre con fuerza; en otros disminuye y aparecen residuos en sus orillas. Varias familias recuerdan cambios importantes.</p>
          <button type="button" onClick={() => notify("La observación se agregó como contexto de la pregunta.")}>
            <Plus size={17} /> Agregar observación
          </button>
        </div>
      </article>
    </div>
  );
}

function ExploreSection({ completed, notify, onToggle }: { completed: string[]; notify: Notify; onToggle: (id: string) => void }) {
  const progress = Math.round((completed.length / explorations.length) * 100);

  return (
    <div className="explore-layout">
      <div className="explore-summary section-surface">
        <div>
          <span className="card-overline">Ruta de exploración</span>
          <h3>{completed.length} de {explorations.length} recorridos completados</h3>
          <p>Las evidencias de cada recorrido se integran automáticamente a la bitácora.</p>
        </div>
        <div className="round-progress" style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}>
          <span>{progress}%</span>
        </div>
      </div>

      <div className="exploration-grid">
        {explorations.map((exploration, index) => {
          const Icon = exploration.icon;
          const isDone = completed.includes(exploration.id);
          return (
            <article className={`exploration-card ${isDone ? "is-complete" : ""}`} key={exploration.id} style={{ "--explore-color": exploration.color } as React.CSSProperties}>
              <div className="exploration-image">
                <Image src={exploration.image} alt="" fill sizes="360px" />
                <span className="exploration-number">0{index + 1}</span>
                {isDone && <span className="completion-badge"><CheckCircle2 size={16} /> Completada</span>}
              </div>
              <div className="exploration-content">
                <span className="exploration-field"><Icon size={16} /> {exploration.field}</span>
                <h3>{exploration.title}</h3>
                <p>{exploration.description}</p>
                <div className="exploration-meta">
                  <span><Clock3 size={14} /> {exploration.duration}</span>
                  <span><Camera size={14} /> {exploration.evidence}</span>
                </div>
                <div className="exploration-actions">
                  <button type="button" onClick={() => notify(`Abriste las instrucciones: ${exploration.title}.`)}>Ver instrucciones <ArrowRight size={16} /></button>
                  <button className="complete-button" type="button" onClick={() => onToggle(exploration.id)} aria-label={isDone ? "Marcar como pendiente" : "Marcar como completada"}>
                    {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <article className="field-route section-surface">
        <div className="surface-heading compact">
          <div><MapPinned size={21} /></div>
          <span><small>Salida al territorio</small><strong>Ruta segura para observar el arroyo</strong></span>
        </div>
        <div className="route-steps">
          {[
            ["Punto de reunión", "Escuela", "08:30"],
            ["Primera observación", "Puente pequeño", "08:45"],
            ["Medición", "Zona de piedras", "09:05"],
            ["Cierre y limpieza", "Huerto escolar", "09:40"],
          ].map(([title, place, time], index) => (
            <div key={title}>
              <span>{index + 1}</span>
              <strong>{title}<small>{place}</small></strong>
              <time>{time}</time>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function ActionsSection({
  newTask,
  notify,
  onAddTask,
  onMoveTask,
  onNewTaskChange,
  tasks,
}: {
  newTask: string;
  notify: Notify;
  onAddTask: (event: FormEvent<HTMLFormElement>) => void;
  onMoveTask: (id: number) => void;
  onNewTaskChange: (value: string) => void;
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
        <div className="action-highlight-copy">
          <span className="card-overline">Nuestra acción elegida</span>
          <h3>Jornada escolar para conocer y cuidar el arroyo</h3>
          <p>Mediremos un tramo, recogeremos residuos sin riesgo y compartiremos acuerdos para reducir el desperdicio de agua en la escuela.</p>
          <div className="action-tags"><span><CalendarDays size={15} /> 3 de agosto</span><span><Users size={15} /> 5 integrantes</span><span><Leaf size={15} /> Acción ambiental</span></div>
        </div>
        <div className="action-highlight-image">
          <Image src="/images/school-garden.png" alt="Actividad comunitaria en un huerto escolar" fill sizes="370px" />
        </div>
      </article>

      <form className="quick-task-form section-surface" onSubmit={onAddTask}>
        <div><Plus size={21} /><span><small>Nueva tarea</small><strong>¿Qué hace falta organizar?</strong></span></div>
        <input value={newTask} onChange={(event: ChangeEvent<HTMLInputElement>) => onNewTaskChange(event.target.value)} placeholder="Ej. Preparar etiquetas para las muestras" />
        <button type="submit">Agregar</button>
      </form>

      <div className="task-board">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.id);
          return (
            <section className={`task-column task-column-${column.id}`} key={column.id}>
              <header><span><strong>{column.label}</strong><small>{column.helper}</small></span><b>{columnTasks.length}</b></header>
              <div className="task-list">
                {columnTasks.map((task) => (
                  <article key={task.id}>
                    <button className="task-check" type="button" onClick={() => onMoveTask(task.id)} title="Mover a la siguiente etapa">
                      {task.status === "hecho" ? <Check size={16} /> : <Circle size={16} />}
                    </button>
                    <div><strong>{task.title}</strong><span><Users size={13} /> {task.owner}</span><span><CalendarDays size={13} /> {task.date}</span></div>
                    <button className="task-more" type="button" onClick={() => notify("Abriste el detalle de la tarea.")}>•••</button>
                  </article>
                ))}
                {!columnTasks.length && <div className="empty-column"><Sparkles size={20} /><span>No hay tareas aquí</span></div>}
              </div>
            </section>
          );
        })}
      </div>

      <div className="action-bottom-grid">
        <article className="materials-card section-surface">
          <span className="card-overline">Materiales</span>
          {[
            ["Frascos transparentes", true],
            ["Guantes reutilizables", true],
            ["Cinta para medir", false],
            ["Cartulinas y plumones", false],
          ].map(([label, ready]) => <div key={label as string}><span className={ready ? "is-ready" : ""}>{ready ? <Check size={14} /> : null}</span><strong>{label as string}</strong><small>{ready ? "Listo" : "Pendiente"}</small></div>)}
        </article>
        <article className="agreement-card section-surface">
          <HeartHandshake size={28} />
          <div><span className="card-overline">Acuerdo de cuidado</span><h3>Nadie entra al agua sin acompañamiento adulto.</h3><p>También evitaremos tocar residuos peligrosos y dejaremos el sitio mejor de como lo encontramos.</p></div>
          <button type="button" onClick={() => notify("El acuerdo se marcó como leído por el equipo.")}><CheckCircle2 size={18} /> Confirmar</button>
        </article>
      </div>
    </div>
  );
}

function ShareSection({
  newPost,
  notify,
  onAddPost,
  onNewPostChange,
  onReact,
  posts,
}: {
  newPost: string;
  notify: Notify;
  onAddPost: (event: FormEvent<HTMLFormElement>) => void;
  onNewPostChange: (value: string) => void;
  onReact: (id: number) => void;
  posts: SharedPost[];
}) {
  return (
    <div className="share-layout">
      <form className="share-composer section-surface" onSubmit={onAddPost}>
        <div className="share-avatar">A</div>
        <div className="share-input-wrap">
          <textarea value={newPost} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onNewPostChange(event.target.value)} placeholder="Comparte un hallazgo, un acuerdo o algo que cambió…" />
          <div>
            <span><button type="button" onClick={() => notify("Puedes agregar una fotografía desde el panel de evidencias.")}><ImageIcon size={17} /> Foto</button><button type="button" onClick={() => notify("Puedes agregar un audio desde el panel de evidencias.")}><Mic size={17} /> Audio</button></span>
            <button className="publish-button" type="submit"><Send size={17} /> Publicar</button>
          </div>
        </div>
      </form>

      <div className="community-wall">
        <section className="post-feed">
          {posts.map((post) => (
            <article className="community-post section-surface" key={post.id}>
              <header><span className="post-avatar">{post.author.charAt(0)}</span><div><strong>{post.author}</strong><small>Equipo Agua Clara · hace poco</small></div><button type="button">•••</button></header>
              <h3>{post.title}</h3>
              <p>{post.body}</p>
              {post.image && <button className="post-image" type="button" onClick={() => notify("Abriste la evidencia del mural.")}><Image src={post.image} alt="" fill sizes="600px" /></button>}
              {post.type === "audio" && <button className="post-audio" type="button" onClick={() => notify("Reproduciendo relato de la comunidad.")}><span><AudioLines size={20} /></span><i /><strong>00:32</strong></button>}
              <footer><button type="button" onClick={() => onReact(post.id)}>💧 {post.reactions}</button><button type="button" onClick={() => notify("Comentario preparado.")}><MessageCircle size={16} /> Comentar</button><button type="button" onClick={() => notify("Enlace de la publicación copiado.")}><Link2 size={16} /> Compartir</button></footer>
            </article>
          ))}
        </section>

        <aside className="presentation-panel">
          <article className="section-surface presentation-card">
            <span className="card-overline">Presentación final</span>
            <h3>Contemos nuestra historia completa</h3>
            <p>El equipo tiene casi todo listo para compartir el proyecto con la comunidad.</p>
            <div className="presentation-progress"><span><i style={{ width: "75%" }} /></span><strong>75%</strong></div>
            {[
              ["La pregunta local", true],
              ["Hallazgos con evidencias", true],
              ["La acción realizada", true],
              ["Lo que cambió", false],
            ].map(([label, done]) => <div className="presentation-check" key={label as string}><span className={done ? "is-done" : ""}>{done ? <Check size={14} /> : null}</span><strong>{label as string}</strong></div>)}
            <button type="button" onClick={() => notify("Se abrió el modo de presentación.")}><Sparkles size={17} /> Preparar presentación</button>
          </article>

          <article className="section-surface invitation-card">
            <Users size={26} />
            <div><span className="card-overline">Invitar a la comunidad</span><h3>Viernes · 12:30</h3><p>Patio de la escuela</p></div>
            <button type="button" onClick={() => notify("La invitación se copió para compartirla.")}><Share2 size={17} /></button>
          </article>
        </aside>
      </div>
    </div>
  );
}

function ResourcesSection({
  category,
  notify,
  onCategoryChange,
  onQueryChange,
  query,
  resources,
}: {
  category: string;
  notify: Notify;
  onCategoryChange: (category: string) => void;
  onQueryChange: (query: string) => void;
  query: string;
  resources: ResourceItem[];
}) {
  const categories = ["Todos", "Guías", "Plantillas", "Tutoriales", "Seguridad", "Presentación"];

  return (
    <div className="resources-layout">
      <div className="resource-toolbar section-surface">
        <label><Search size={18} /><input value={query} onChange={(event: ChangeEvent<HTMLInputElement>) => onQueryChange(event.target.value)} placeholder="Buscar recurso…" /></label>
        <div>{categories.map((item) => <button className={category === item ? "is-active" : ""} key={item} type="button" onClick={() => onCategoryChange(item)}>{item}</button>)}</div>
      </div>

      <div className="resource-grid">
        {resources.map((resource) => {
          const Icon = resource.icon;
          return (
            <article className="resource-card section-surface" key={resource.id}>
              <div className="resource-icon"><Icon size={25} /></div>
              <span className="resource-format">{resource.format}</span>
              <h3>{resource.title}</h3>
              <p>{resource.description}</p>
              <div className="resource-meta"><span><Clock3 size={14} /> {resource.meta}</span><span><BookOpenCheck size={14} /> {resource.category}</span></div>
              <footer><button type="button" onClick={() => notify(`Abriste el recurso: ${resource.title}.`)}>Abrir recurso <ExternalLink size={16} /></button><button type="button" onClick={() => notify("El recurso se agregó a la colección del equipo.")} aria-label="Guardar recurso"><Download size={17} /></button></footer>
            </article>
          );
        })}
        {!resources.length && <div className="resources-empty section-surface"><FolderOpen size={35} /><h3>No encontramos recursos</h3><p>Prueba con otra palabra o selecciona una categoría diferente.</p></div>}
      </div>

      <article className="resource-feature section-surface">
        <div>
          <span className="card-overline">Recurso recomendado</span>
          <h3>Antes de salir: observamos sin dejar huella</h3>
          <p>Una secuencia breve para conversar sobre seguridad, respeto a los seres vivos y manejo responsable de evidencias.</p>
          <button type="button" onClick={() => notify("Iniciaste la secuencia recomendada.")}>Comenzar secuencia <ArrowRight size={17} /></button>
        </div>
        <div className="feature-illustration"><Droplets size={55} /><Waves size={95} /><Sprout size={54} /></div>
      </article>
    </div>
  );
}
