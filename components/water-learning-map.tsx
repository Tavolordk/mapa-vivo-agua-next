"use client";

import Image from "next/image";
import {
  Accessibility,
  ArrowRight,
  BookMarked,
  BookOpen,
  Brain,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Compass,
  Droplets,
  FlaskConical,
  Flower2,
  HeartHandshake,
  HeartPulse,
  Home,
  ImageIcon,
  Map as MapIcon,
  Maximize2,
  Menu,
  MessageCircle,
  Mic,
  NotebookText,
  Palette,
  Pause,
  PencilLine,
  Play,
  Plus,
  Search,
  Sprout,
  Trash2,
  Upload,
  Users,
  VenusAndMars,
  Waves,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type SectionId = "inicio" | "pregunta" | "exploramos" | "acciones" | "compartimos" | "recursos";
type EvidenceKind = "photo" | "drawing" | "audio";
type NodeId = "language" | "science" | "ethics" | "community";
type ViewMode = "map" | "log";

type LearningNode = {
  id: NodeId;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  color: string;
  softColor: string;
  icon: LucideIcon;
  detail: string;
  challenge: string;
  positionClass: string;
};

type Evidence = {
  id: string;
  kind: EvidenceKind;
  title: string;
  source?: string;
  duration?: string;
  isUserAdded?: boolean;
};

const navigation: Array<{ id: SectionId; label: string; icon: LucideIcon }> = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "pregunta", label: "Pregunta local", icon: CircleHelp },
  { id: "exploramos", label: "Exploramos", icon: Search },
  { id: "acciones", label: "Acciones", icon: Sprout },
  { id: "compartimos", label: "Compartimos", icon: Users },
  { id: "recursos", label: "Recursos", icon: BookMarked },
];

const nodes: LearningNode[] = [
  {
    id: "language",
    eyebrow: "Lenguajes",
    title: "Historia del río y la lluvia",
    description: "Escucha, pregunta y narra lo que la comunidad sabe del agua.",
    image: "/images/community-interview.png",
    color: "#a61556",
    softColor: "#fff0f6",
    icon: MessageCircle,
    detail:
      "Recupera relatos, palabras locales y memorias familiares para crear una historia sonora del agua en tu comunidad.",
    challenge: "Graba una entrevista de 30 segundos y escribe una idea que no conocías.",
    positionClass: "node-language",
  },
  {
    id: "science",
    eyebrow: "Saberes y pensamiento científico",
    title: "Medimos el caudal del arroyo",
    description: "Observa, mide y compara cómo cambia el agua.",
    image: "/images/measuring-stream.png",
    color: "#168148",
    softColor: "#eefaf2",
    icon: FlaskConical,
    detail:
      "Construye una medición sencilla del flujo, registra temperatura, transparencia y cambios visibles en distintos momentos.",
    challenge: "Haz tres mediciones y explica qué variable pudo provocar las diferencias.",
    positionClass: "node-science",
  },
  {
    id: "ethics",
    eyebrow: "Ética, naturaleza y sociedades",
    title: "Cuidar el agua, cuidar la vida",
    description: "Reconoce decisiones que protegen el territorio.",
    image: "/images/territory-map.png",
    color: "#d7681e",
    softColor: "#fff4eb",
    icon: HeartHandshake,
    detail:
      "Analiza quién usa el agua, qué problemas existen y qué acuerdos permitirían cuidarla de forma justa y sostenible.",
    challenge: "Propón un acuerdo comunitario y explica a quién beneficia.",
    positionClass: "node-ethics",
  },
  {
    id: "community",
    eyebrow: "De lo humano y lo comunitario",
    title: "Organizamos la jornada comunitaria",
    description: "Colabora, distribuye tareas y transforma una idea en acción.",
    image: "/images/community-garden.png",
    color: "#0868aa",
    softColor: "#edf7ff",
    icon: Users,
    detail:
      "Planea con tu equipo una acción pequeña y posible: recuperar un espacio, informar, sembrar o reducir desperdicios.",
    challenge: "Define responsables, materiales, fecha y una evidencia del resultado.",
    positionClass: "node-community",
  },
];

const initialEvidence: Evidence[] = [
  {
    id: "notebook",
    kind: "drawing",
    title: "La ruta del agua en nuestro cuaderno",
    source: "/images/water-route-notebook.png",
  },
  {
    id: "experiment",
    kind: "photo",
    title: "Observación de muestras y plantas",
    source: "/images/water-experiment.png",
  },
  {
    id: "territory",
    kind: "photo",
    title: "Mapa del territorio que compartimos",
    source: "/images/territory-map.png",
  },
  {
    id: "audio-river",
    kind: "audio",
    title: "Sonidos y voces del arroyo",
    duration: "00:18",
  },
];

const axes: Array<{ label: string; icon: LucideIcon; color: string }> = [
  { label: "Inclusión", icon: Accessibility, color: "#1268ba" },
  { label: "Pensamiento crítico", icon: Brain, color: "#178052" },
  { label: "Interculturalidad crítica", icon: Flower2, color: "#dc7a2f" },
  { label: "Igualdad de género", icon: VenusAndMars, color: "#7a36b5" },
  { label: "Vida saludable", icon: HeartPulse, color: "#07818c" },
  { label: "Culturas de lectura y escritura", icon: BookOpen, color: "#d79a13" },
  { label: "Artes y experiencias estéticas", icon: Palette, color: "#c22d74" },
];

const nextSteps = ["Investigar", "Observar", "Proponer", "Actuar", "Compartir"];

export function WaterLearningMap() {
  const [activeSection, setActiveSection] = useState<SectionId>("inicio");
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [selectedNode, setSelectedNode] = useState<LearningNode | null>(null);
  const [activeEvidenceKind, setActiveEvidenceKind] = useState<EvidenceKind>("photo");
  const [evidence, setEvidence] = useState<Evidence[]>(initialEvidence);
  const [previewEvidence, setPreviewEvidence] = useState<Evidence | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [nextStepIndex, setNextStepIndex] = useState(0);
  const [teamOpen, setTeamOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timeout = toast ? window.setTimeout(() => setToast(null), 2600) : undefined;
    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, [toast]);


  const visibleEvidence = useMemo(
    () => evidence.filter((item) => item.kind === activeEvidenceKind),
    [activeEvidenceKind, evidence],
  );

  const selectSection = (section: SectionId) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    const label = navigation.find((item) => item.id === section)?.label;
    if (section !== "inicio") setToast(`${label}: sección preparada para integrar contenido real.`);
  };

  const handleEvidenceUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const kind: EvidenceKind = file.type.startsWith("audio/") ? "audio" : activeEvidenceKind;
    const newEvidence: Evidence = {
      id: `${Date.now()}-${file.name}`,
      kind,
      title: file.name.replace(/\.[^/.]+$/, ""),
      source: kind === "audio" ? undefined : URL.createObjectURL(file),
      duration: kind === "audio" ? "Nueva" : undefined,
      isUserAdded: true,
    };

    setEvidence((current) => [newEvidence, ...current]);
    setActiveEvidenceKind(kind);
    setToast("Evidencia agregada a la bitácora.");
    event.target.value = "";
  };

  const removeEvidence = (item: Evidence) => {
    if (item.isUserAdded && item.source?.startsWith("blob:")) URL.revokeObjectURL(item.source);
    setEvidence((current) => current.filter((evidenceItem) => evidenceItem.id !== item.id));
    setToast("Evidencia eliminada.");
  };

  const advanceStep = () => {
    setNextStepIndex((current) => (current + 1) % nextSteps.length);
    setToast("Avanzaste al siguiente momento del proyecto.");
  };

  return (
    <main className="learning-app">
      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="brand-mark" aria-label="Mapa vivo del agua">
          <Droplets size={34} strokeWidth={1.8} />
          <Waves size={31} strokeWidth={1.6} />
        </div>

        <nav className="side-navigation" aria-label="Navegación del proyecto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                className={`side-navigation-item ${isActive ? "is-active" : ""}`}
                key={item.id}
                onClick={() => selectSection(item.id)}
                type="button"
              >
                <Icon size={22} strokeWidth={1.9} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="basin-card">
          <div className="basin-illustration" aria-hidden="true">
            <span className="basin-mountain basin-mountain-a" />
            <span className="basin-mountain basin-mountain-b" />
            <span className="basin-river" />
          </div>
          <small>Nuestra cuenca</small>
          <strong>Río San Pedro</strong>
          <button type="button" onClick={() => setToast("Vista de cuenca seleccionada.")}>
            Ver cuenca <ArrowRight size={15} />
          </button>
        </div>

        <button className="team-chip" type="button" onClick={() => setTeamOpen((open) => !open)}>
          <span className="team-avatar">E</span>
          <span>
            <small>Equipo</small>
            <strong>Agua Clara</strong>
          </span>
          <ChevronDown size={17} />
        </button>
      </aside>

      {mobileMenuOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Cerrar menú"
          type="button"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <section className="project-shell">
        <header className="project-header">
          <button
            className="mobile-menu-button"
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>

          <div className="project-heading">
            <span>Proyecto comunitario</span>
            <h1>El agua que compartimos</h1>
            <p>Exploramos una pregunta local desde cuatro lentes conectadas.</p>
            <Waves size={66} strokeWidth={1.5} />
          </div>

          <div className="header-actions">
            <div className="view-switch" role="tablist" aria-label="Vista del proyecto">
              <button
                className={viewMode === "map" ? "is-active" : ""}
                onClick={() => setViewMode("map")}
                role="tab"
                type="button"
              >
                <MapIcon size={20} /> Mapa del proyecto
              </button>
              <button
                className={viewMode === "log" ? "is-active" : ""}
                onClick={() => setViewMode("log")}
                role="tab"
                type="button"
              >
                <ClipboardList size={20} /> Bitácora del equipo
              </button>
            </div>

            <div className="team-selector-wrap">
              <button className="team-selector" type="button" onClick={() => setTeamOpen((open) => !open)}>
                <Users size={20} />
                <span>
                  <small>Equipo</small>
                  <strong>5</strong>
                </span>
                <ChevronDown size={17} />
              </button>
              {teamOpen && (
                <div className="team-popover">
                  <strong>Equipo Agua Clara</strong>
                  <span>5 integrantes</span>
                  <div className="member-stack" aria-label="Integrantes">
                    {["E", "L", "M", "A", "S"].map((letter) => (
                      <span key={letter}>{letter}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="workspace">
          <section className="map-column">
            {viewMode === "map" ? (
              <ProjectMap nodes={nodes} onNodeClick={setSelectedNode} />
            ) : (
              <TeamLog evidence={evidence} onPreview={setPreviewEvidence} />
            )}
            <AxesStrip />
          </section>

          <aside className="evidence-column">
            <EvidencePanel
              activeKind={activeEvidenceKind}
              evidence={visibleEvidence}
              fileInputRef={fileInputRef}
              isAudioPlaying={isAudioPlaying}
              onKindChange={setActiveEvidenceKind}
              onPlayAudio={() => setIsAudioPlaying((playing) => !playing)}
              onPreview={setPreviewEvidence}
              onRemove={removeEvidence}
              onUpload={() => fileInputRef.current?.click()}
            />

            <button className="next-step-card" type="button" onClick={advanceStep}>
              <span>
                <small>Siguiente paso</small>
                <strong>{nextSteps[nextStepIndex]}</strong>
              </span>
              <span className="next-step-icon">
                <Search size={35} />
              </span>
            </button>
          </aside>
        </div>
      </section>

      <input
        ref={fileInputRef}
        className="visually-hidden"
        type="file"
        accept={activeEvidenceKind === "audio" ? "audio/*" : "image/*"}
        onChange={handleEvidenceUpload}
      />

      <div className="mobile-bottom-nav" aria-label="Navegación móvil">
        {navigation.slice(0, 4).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={activeSection === item.id ? "is-active" : ""}
              type="button"
              onClick={() => selectSection(item.id)}
            >
              <Icon size={21} />
              <span>{item.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      {selectedNode && <NodeDialog node={selectedNode} onClose={() => setSelectedNode(null)} />}
      {previewEvidence && <EvidencePreview evidence={previewEvidence} onClose={() => setPreviewEvidence(null)} />}
      {toast && (
        <div className="toast-message" role="status">
          <CheckCircle2 size={19} /> {toast}
        </div>
      )}
    </main>
  );
}

function ProjectMap({ nodes, onNodeClick }: { nodes: LearningNode[]; onNodeClick: (node: LearningNode) => void }) {
  return (
    <div className="project-map">
      <Image
        src="/images/hero-water-school.png"
        alt="Arroyo junto a una escuela y vegetación"
        fill
        priority
        sizes="(max-width: 900px) 100vw, 70vw"
        className="project-map-background"
      />
      <div className="map-wash" />
      <div className="map-topography map-topography-a" />
      <div className="map-topography map-topography-b" />

      <svg className="connection-layer" viewBox="0 0 1000 680" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path className="connection connection-language" d="M490 105 C430 160 450 240 510 320" />
        <path className="connection connection-science" d="M230 270 C350 290 400 350 510 375" />
        <path className="connection connection-ethics" d="M780 270 C675 300 620 345 510 375" />
        <path className="connection connection-community" d="M515 565 C540 500 545 440 510 375" />
        <path className="water-ribbon" d="M0 475 C180 420 310 500 490 455 C690 405 800 470 1000 400" />
        {[0, 1, 2, 3, 4, 5].map((dot) => (
          <circle key={dot} className="flow-dot" r="5" cx={130 + dot * 145} cy={456 - (dot % 2) * 20} />
        ))}
      </svg>

      <div className="axis-badge">EJE ARTICULADOR</div>
      <div className="map-question-card">
        <Droplets size={22} />
        <span>
          <small>Pregunta guía</small>
          <strong>¿Cómo cambia el agua y cómo podemos cuidarla juntos?</strong>
        </span>
      </div>

      {nodes.map((node) => {
        const Icon = node.icon;
        return (
          <button
            key={node.id}
            className={`learning-node ${node.positionClass}`}
            style={{ "--node-color": node.color, "--node-soft": node.softColor } as React.CSSProperties}
            type="button"
            onClick={() => onNodeClick(node)}
          >
            <span className="node-label">
              <span className="node-icon"><Icon size={22} /></span>
              {node.eyebrow}
            </span>
            <span className="node-body">
              <span className="node-image-wrap">
                <Image src={node.image} alt="" fill sizes="250px" className="node-image" />
              </span>
              <span className="node-copy">
                <strong>{node.title}</strong>
                <small>{node.description}</small>
              </span>
              <ChevronRight size={20} className="node-chevron" />
            </span>
          </button>
        );
      })}

      <div className="map-location map-location-one"><span /> Escuela</div>
      <div className="map-location map-location-two"><span /> Arroyo</div>
      <div className="map-location map-location-three"><span /> Huerto</div>
    </div>
  );
}

function AxesStrip() {
  return (
    <section className="axes-strip" aria-labelledby="axes-heading">
      <div className="axes-heading-row">
        <span id="axes-heading">Ejes transversales</span>
        <div />
      </div>
      <div className="axes-list">
        {axes.map((axis) => {
          const Icon = axis.icon;
          return (
            <button
              key={axis.label}
              type="button"
              className="axis-item"
              style={{ "--axis-color": axis.color } as React.CSSProperties}
              title={axis.label}
            >
              <span><Icon size={24} /></span>
              <strong>{axis.label}</strong>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function EvidencePanel({
  activeKind,
  evidence,
  fileInputRef,
  isAudioPlaying,
  onKindChange,
  onPlayAudio,
  onPreview,
  onRemove,
  onUpload,
}: {
  activeKind: EvidenceKind;
  evidence: Evidence[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isAudioPlaying: boolean;
  onKindChange: (kind: EvidenceKind) => void;
  onPlayAudio: () => void;
  onPreview: (item: Evidence) => void;
  onRemove: (item: Evidence) => void;
  onUpload: () => void;
}) {
  const evidenceTabs: Array<{ kind: EvidenceKind; label: string; icon: LucideIcon }> = [
    { kind: "photo", label: "Fotografías", icon: ImageIcon },
    { kind: "drawing", label: "Dibujos", icon: PencilLine },
    { kind: "audio", label: "Audio", icon: Mic },
  ];

  return (
    <section className="evidence-panel">
      <header className="evidence-header">
        <div>
          <h2>Mi evidencia</h2>
          <p>Registra lo que descubriste</p>
        </div>
        <NotebookText size={21} />
      </header>

      <div className="evidence-tabs" role="tablist" aria-label="Tipo de evidencia">
        {evidenceTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.kind}
              className={activeKind === tab.kind ? "is-active" : ""}
              type="button"
              role="tab"
              aria-label={tab.label}
              title={tab.label}
              onClick={() => onKindChange(tab.kind)}
            >
              <Icon size={21} />
            </button>
          );
        })}
      </div>

      <div className="evidence-list">
        {evidence.length === 0 && (
          <div className="evidence-empty">
            <Upload size={25} />
            <strong>Aún no hay evidencias</strong>
            <span>Agrega la primera para comenzar tu bitácora.</span>
          </div>
        )}

        {evidence.map((item) =>
          item.kind === "audio" ? (
            <article className="audio-evidence" key={item.id}>
              <button type="button" className="audio-play" onClick={onPlayAudio}>
                {isAudioPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>
              <div className={`waveform ${isAudioPlaying ? "is-playing" : ""}`} aria-hidden="true">
                {Array.from({ length: 24 }, (_, index) => (
                  <span key={index} style={{ height: `${8 + ((index * 17) % 26)}px` }} />
                ))}
              </div>
              <small>{item.duration}</small>
              <button className="remove-evidence" type="button" onClick={() => onRemove(item)} aria-label="Eliminar audio">
                <X size={16} />
              </button>
            </article>
          ) : (
            <article className="image-evidence" key={item.id}>
              <button type="button" className="image-evidence-preview" onClick={() => onPreview(item)}>
                {item.source && <Image src={item.source} alt={item.title} fill sizes="320px" className="evidence-image" unoptimized={item.source.startsWith("blob:")} />}
                <span className="expand-evidence"><Maximize2 size={17} /></span>
              </button>
              <div className="evidence-caption">
                <strong>{item.title}</strong>
                <button type="button" onClick={() => onRemove(item)} aria-label="Eliminar evidencia">
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ),
        )}
      </div>

      <button className="add-evidence" type="button" onClick={onUpload}>
        <Plus size={22} />
        <span>Agregar evidencia</span>
      </button>
      <span className="input-helper" onClick={() => fileInputRef.current?.click()}>
        Puedes seleccionar un archivo de tu dispositivo
      </span>
    </section>
  );
}

function TeamLog({ evidence, onPreview }: { evidence: Evidence[]; onPreview: (item: Evidence) => void }) {
  return (
    <section className="team-log-view">
      <div className="log-hero">
        <div>
          <span>Bitácora del equipo</span>
          <h2>Lo que hemos observado, pensado y construido</h2>
          <p>Cada evidencia se convierte en una pista para comprender mejor nuestra cuenca.</p>
        </div>
        <div className="log-progress">
          <strong>68%</strong>
          <span>Proyecto completado</span>
          <div><i /></div>
        </div>
      </div>

      <div className="log-grid">
        {evidence.map((item, index) => (
          <article className="log-entry" key={item.id}>
            <span className="log-index">{String(index + 1).padStart(2, "0")}</span>
            {item.source ? (
              <button type="button" onClick={() => onPreview(item)} className="log-entry-image">
                <Image src={item.source} alt={item.title} fill sizes="280px" unoptimized={item.source.startsWith("blob:")} />
              </button>
            ) : (
              <div className="log-entry-audio"><Mic size={30} /></div>
            )}
            <div>
              <small>{item.kind === "photo" ? "Fotografía" : item.kind === "drawing" ? "Dibujo" : "Audio"}</small>
              <h3>{item.title}</h3>
              <p>Agregada como evidencia para conversar y tomar decisiones con el equipo.</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function NodeDialog({ node, onClose }: { node: LearningNode; onClose: () => void }) {
  const Icon = node.icon;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <article
        className="node-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="node-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
        style={{ "--node-color": node.color, "--node-soft": node.softColor } as React.CSSProperties}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar">
          <X size={21} />
        </button>
        <div className="dialog-image">
          <Image src={node.image} alt="" fill sizes="620px" />
          <span><Icon size={25} /> {node.eyebrow}</span>
        </div>
        <div className="dialog-content">
          <small>Actividad conectada</small>
          <h2 id="node-dialog-title">{node.title}</h2>
          <p>{node.detail}</p>
          <div className="challenge-card">
            <Compass size={25} />
            <span>
              <small>Tu reto</small>
              <strong>{node.challenge}</strong>
            </span>
          </div>
          <button type="button" className="dialog-primary" onClick={onClose}>
            Comenzar actividad <ArrowRight size={18} />
          </button>
        </div>
      </article>
    </div>
  );
}

function EvidencePreview({ evidence, onClose }: { evidence: Evidence; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <article className="evidence-preview-dialog" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar">
          <X size={21} />
        </button>
        {evidence.source && (
          <div className="preview-image-wrap">
            <Image src={evidence.source} alt={evidence.title} fill sizes="90vw" unoptimized={evidence.source.startsWith("blob:")} />
          </div>
        )}
        <div className="preview-caption">
          <span><Camera size={18} /> Evidencia del equipo</span>
          <h2>{evidence.title}</h2>
        </div>
      </article>
    </div>
  );
}
