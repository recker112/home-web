/**
 * ─────────────────────────────────────────────────────────────
 *  CONTENIDO DEL SITIO — edita solo este archivo para actualizar
 *  textos, servicios, skills, proyectos y enlaces.
 *  Ningún componente necesita tocarse para cambiar el contenido.
 * ─────────────────────────────────────────────────────────────
 */

import type { IconName } from '../components/PixelIcon'
import { runtimeText } from './runtime'

export const profile = {
  handle: 'recker',
  domain: 'reckernode.dev',
  role: 'DevOps & Full-Stack Developer',
  /* Frases que se escriben solas en el hero, una detrás de otra. */
  taglines: [
    'Levanto servidores y los mantengo vivos.',
    'Docker, Linux y despliegues que no dan miedo.',
    'React de día, Self-Hosting de noche.',
    'Arcade y pixel art, porque sí.',
  ],
  bio: [
    'Soy recker. Me dedico a montar, automatizar y mantener infraestructura: contenedores, CI/CD, servidores y todo lo que haga falta para que una app llegue a producción sin sustos. También hago desarrollo full-stack, sobre todo con React y Laravel, y me gusta aprender cosas nuevas.',
    'Fuera del trabajo me gusta auto-hostear distintos programas que me llamen la atención: reckernode.dev hospeda mis propios servicios, desde el TeamSpeak donde juego con mis amigos hasta el bot que le pone música.',
  ],
  location: 'Venezuela',
  email: 'contacto@reckernode.dev',
  /* La disponibilidad cambia más que el resto del texto, así que se puede
     fijar sin recompilar: la variable RN_AVAILABILITY del contenedor manda
     sobre lo que haya aquí. Ver `runtime.ts`. */
  availability: runtimeText(
    'availability',
    'Ocupado de momento, pero siempre abierto a charlar sobre DevOps, Linux y Self-Hosting.',
  ),
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
    id: 'sinusbot',
    name: 'sinusbot.reckernode.dev',
    url: 'https://sinusbot.reckernode.dev',
    probeUrl: 'https://sinusbot.reckernode.dev/favicon.ico',
    icon: 'bot',
    tagline: 'El bot que pincha música en el TS3',
    description:
      'SinusBot enganchado a mi servidor de TeamSpeak: entra en el canal y pone la música. Lo manejo desde Telegram con un script propio, sin abrir el panel.',
    stack: ['SinusBot', 'Telegram Bot API', 'Docker'],
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
  { name: 'Docker / Compose', level: 62, category: 'DevOps' },
  { name: 'Linux (Debian/Ubuntu)', level: 72, category: 'DevOps' },
  { name: 'Nginx / Proxy inverso', level: 60, category: 'DevOps' },
  { name: 'CI/CD & Deploys', level: 70, category: 'DevOps' },
  { name: 'Administración de VPS', level: 65, category: 'DevOps' },

  { name: 'Node.js', level: 30, category: 'Backend' },
  { name: 'PHP / Laravel', level: 78, category: 'Backend' },
  { name: 'APIs REST', level: 88, category: 'Backend' },
  { name: 'MySQL / PostgreSQL', level: 76, category: 'Backend' },

  { name: 'React', level: 70, category: 'Frontend' },
  { name: 'TypeScript', level: 40, category: 'Frontend' },
  { name: 'Vite', level: 86, category: 'Frontend' },
  { name: 'CSS / Responsive', level: 60, category: 'Frontend' },

  { name: 'Git', level: 90, category: 'Extras' },
  { name: 'Pixel art', level: 20, category: 'Extras' },
  { name: 'Composición musical', level: 30, category: 'Extras' },
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
      'Mi Self-Hosting: un VPS con todos mis servicios en contenedores, proxy inverso con TLS automático y backups programados.',
    tags: ['Docker', 'Nginx', 'Linux'],
    areas: ['DevOps'],
    icon: 'server',
    status: 'live',
  },
  {
    title: 'SinusBot',
    blurb:
      'Bot de música para el TeamSpeak, con un script propio de Telegram escribir desde el ts3 hacia telegram de manera bidireccional.',
    tags: ['SinusBot', 'Telegram', 'Docker'],
    areas: ['DevOps', 'Backend'],
    live: 'https://sinusbot.reckernode.dev',
    icon: 'bot',
    status: 'live',
  },
  {
    title: 'TeamSpeak 3',
    blurb:
      'Servidor de voz para las partidas: canales por juego, permisos y un bot que automatiza algunos procesos.',
    tags: ['TS3', 'VPS'],
    areas: ['DevOps', 'Extras'],
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
