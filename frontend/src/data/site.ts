/**
 * ─────────────────────────────────────────────────────────────
 *  CONTENIDO DEL SITIO — edita solo este archivo para actualizar
 *  textos, servicios, skills, proyectos y enlaces.
 *  Ningún componente necesita tocarse para cambiar el contenido.
 * ─────────────────────────────────────────────────────────────
 */

import type { IconName } from '../components/PixelIcon'

export const profile = {
  handle: 'recker',
  domain: 'reckernode.dev',
  role: 'DevOps & Full-Stack Developer',
  /* Frases que se escriben solas en el hero, una detrás de otra. */
  taglines: [
    'Levanto servidores y los mantengo vivos.',
    'Docker, Linux y despliegues que no dan miedo.',
    'React de día, homelab de noche.',
    'Arcade y pixel art, porque sí.',
  ],
  bio: [
    'Soy recker. Me dedico a montar, automatizar y mantener infraestructura: contenedores, CI/CD, servidores y todo lo que haga falta para que una app llegue a producción sin sustos.',
    'Fuera del trabajo mi homelab es mi patio de recreo: reckernode.dev hospeda mis propios servicios, desde mi biblioteca de música hasta el TeamSpeak donde juego con mis amigos.',
  ],
  location: 'Venezuela',
  email: 'contacto@reckernode.dev',
  availability: 'Abierto a proyectos y colaboraciones',
}

/* ── Servicios / dominios del homelab ──────────────────────── */

export type Service = {
  id: string
  name: string
  url: string
  /* Host que se intenta contactar para el chequeo de disponibilidad.
     Déjalo vacío ('') si el servicio no expone HTTP y no quieres el chequeo. */
  probeUrl: string
  icon: IconName
  tagline: string
  description: string
  stack: string[]
  accent: 'blue' | 'cyan' | 'gold' | 'green'
}

export const services: Service[] = [
  {
    id: 'music',
    name: 'music.reckernode.dev',
    url: 'https://music.reckernode.dev',
    probeUrl: 'https://music.reckernode.dev/favicon.ico',
    icon: 'music',
    tagline: 'Mi biblioteca musical, en streaming',
    description:
      'Servidor de música self-hosted. Toda mi colección accesible desde cualquier sitio, sin anuncios, sin algoritmos decidiendo por mí.',
    stack: ['Self-hosted', 'Docker', 'HTTPS'],
    accent: 'cyan',
  },
  {
    id: 'ts3',
    name: 'ts3.reckernode.dev',
    url: 'ts3server://ts3.reckernode.dev',
    /* TeamSpeak no habla HTTP: sin chequeo web. */
    probeUrl: '',
    icon: 'headset',
    tagline: 'Voz para las partidas',
    description:
      'Servidor TeamSpeak 3 donde nos juntamos para jugar. Baja latencia, canales propios y cero drama. Conecta desde tu cliente de TS3.',
    stack: ['TeamSpeak 3', 'VPS', 'UDP 9987'],
    accent: 'blue',
  },
]

/* ── Skills ────────────────────────────────────────────────── */

export type Skill = {
  name: string
  /* 1-100: se dibuja como barra de EXP pixelada */
  level: number
  category: SkillCategory
}

export type SkillCategory = 'DevOps' | 'Backend' | 'Frontend' | 'Extras'

export const skillCategories: SkillCategory[] = ['DevOps', 'Backend', 'Frontend', 'Extras']

export const skills: Skill[] = [
  { name: 'Docker / Compose', level: 92, category: 'DevOps' },
  { name: 'Linux (Debian/Ubuntu)', level: 88, category: 'DevOps' },
  { name: 'Nginx / Proxy inverso', level: 85, category: 'DevOps' },
  { name: 'CI/CD & Deploys', level: 82, category: 'DevOps' },
  { name: 'Administración de VPS', level: 86, category: 'DevOps' },

  { name: 'Node.js', level: 85, category: 'Backend' },
  { name: 'PHP / Laravel', level: 78, category: 'Backend' },
  { name: 'APIs REST', level: 88, category: 'Backend' },
  { name: 'MySQL / PostgreSQL', level: 76, category: 'Backend' },

  { name: 'React', level: 90, category: 'Frontend' },
  { name: 'TypeScript', level: 84, category: 'Frontend' },
  { name: 'Vite', level: 86, category: 'Frontend' },
  { name: 'CSS / Responsive', level: 88, category: 'Frontend' },

  { name: 'Git', level: 90, category: 'Extras' },
  { name: 'Pixel art', level: 70, category: 'Extras' },
  { name: 'Producción musical', level: 60, category: 'Extras' },
]

/* ── Proyectos ─────────────────────────────────────────────── */

export type Project = {
  title: string
  blurb: string
  tags: string[]
  /* Áreas a las que pertenece: son las mismas categorías que las skills.
     El filtro de la web es único, así que al elegir un área se muestran a
     la vez las skills de esa área y los proyectos donde las has usado.
     Un proyecto puede estar en varias; si dejas una categoría sin ningún
     proyecto, al filtrarla se verá el aviso de "sin proyectos". */
  areas: SkillCategory[]
  /* Enlaces opcionales: si los dejas vacíos, el botón no aparece. */
  live?: string
  repo?: string
  icon: IconName
  /* 'live' | 'wip' | 'lab' — se pinta como etiqueta de estado */
  status: 'live' | 'wip' | 'lab'
}

export const projects: Project[] = [
  {
    title: 'reckernode',
    blurb:
      'Mi homelab: un VPS con todos mis servicios en contenedores, proxy inverso con TLS automático y backups programados.',
    tags: ['Docker', 'Nginx', 'Linux'],
    areas: ['DevOps'],
    icon: 'server',
    status: 'live',
  },
  {
    title: 'Music Server',
    blurb:
      'Streaming de mi propia colección musical, con transcodificación bajo demanda y acceso desde móvil.',
    tags: ['Self-hosted', 'Docker'],
    areas: ['DevOps', 'Extras'],
    live: 'https://music.reckernode.dev',
    icon: 'music',
    status: 'live',
  },
  {
    title: 'TeamSpeak 3',
    blurb:
      'Servidor de voz para las partidas: canales por juego, permisos y un bot que avisa cuando alguien entra.',
    tags: ['TS3', 'VPS'],
    areas: ['DevOps', 'Backend'], // el bot de avisos es lo que aporta el backend
    icon: 'headset',
    status: 'live',
  },
  {
    title: 'home-web',
    blurb:
      'Este mismo sitio: hub y portfolio en React + Vite, con un arcade jugable dentro.',
    tags: ['React', 'Vite', 'TypeScript'],
    areas: ['Frontend', 'Extras'],
    repo: 'https://github.com/recker112/home-web',
    icon: 'terminal',
    status: 'wip',
  },
]

/* ── Intereses (sección "sobre mí") ────────────────────────── */

export const interests = [
  {
    icon: 'crosshair' as IconName,
    title: 'Counter-Strike',
    text: 'Horas de práctica de puntería y utility. Si abres el arcade, verás a qué me refiero.',
  },
  {
    icon: 'palette' as IconName,
    title: 'Pixel art',
    text: 'Cada icono de esta web está dibujado píxel a píxel. Sin librerías de iconos.',
  },
]

/* ── Enlaces de contacto ───────────────────────────────────── */

export const socials: { label: string; url: string; icon: IconName }[] = [
  { label: 'GitHub', url: 'https://github.com/recker112', icon: 'code' },
  { label: 'Email', url: 'mailto:contacto@reckernode.dev', icon: 'mail' },
]

/* ── Navegación ────────────────────────────────────────────── */

export const navItems = [
  { id: 'inicio', label: 'INICIO' },
  { id: 'nodos', label: 'NODOS' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'proyectos', label: 'PROYECTOS' },
  { id: 'arcade', label: 'ARCADE' },
  { id: 'musica', label: 'MÚSICA' },
  { id: 'sobre-mi', label: 'SOBRE MÍ' },
  { id: 'contacto', label: 'CONTACTO' },
]
