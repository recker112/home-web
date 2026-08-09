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
      'SinusBot enganchado a mi servidor de TeamSpeak: entra en el canal y pone la música. Comunicación bidireccional entre Ts3 y Telegram.',
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
  { name: 'Pixel art', level: 5, category: 'Extras' },
  { name: 'Composición musical', level: 20, category: 'Extras' },
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
    title: 'Reckernode',
    blurb:
      'Mi Self-Hosting: un VPS con todos mis servicios en contenedores, proxy inverso con TLS automático y backups programados.',
    tags: ['Docker', 'Nginx', 'Linux'],
    areas: ['DevOps'],
    icon: 'server',
    status: 'live',
  },
  {
    title: 'Gedure',
    blurb:
      'App web de gestión educativa enfocado en los grados de primaria y bachillerato. Fue mi primer proyecto en React.',
    tags: ['React', 'Vite', 'TypeScript'],
    areas: ['Frontend', 'Backend'],
    repo: 'https://github.com/recker112/gedure',
    icon: 'gedure',
    status: 'wip',
  },
  {
    title: 'SinusBot',
    blurb:
      'Bot de música para el TeamSpeak, con un script propio de Telegram escribir entre ts3 y telegram de manera bidireccional.',
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
    title: 'Home-web',
    blurb:
      'Este mismo sitio: hub y portfolio en React + Vite, con un arcade jugable dentro.',
    tags: ['React', 'Vite', 'TypeScript'],
    areas: ['Frontend', 'Extras'],
    repo: 'https://github.com/recker112/home-web',
    icon: 'terminal',
    status: 'live',
  },
  {
    title: 'Ts3-web',
    blurb:
      'Sitio web para el TeamSpeak: muestra usuarios conectados, canales y un formulario de contacto que envía mensajes al TS3.',
    tags: ['React', 'Vite', 'TypeScript'],
    areas: ['Frontend', 'Backend', 'Extras'],
    icon: 'sun',
    status: 'lab',
  },
]

/* ── Intereses (sección "sobre mí") ────────────────────────── */

/* Se apilan en una sola columna al lado de la bio, así que conviene que
   los textos quepan en dos líneas: con cuatro puntos largos, la columna
   crece bastante más que la bio de al lado. */
export const interests = [
  {
    icon: 'server' as IconName,
    title: 'Self-hosting',
    text: 'Levanto un servicio nuevo cada vez que algo me pica la curiosidad. Se aprende más rompiendo cosas propias que leyendo documentación.',
  },
  {
    icon: 'code' as IconName,
    title: 'React',
    text: 'La parte del desarrollo que más disfruto: montar una interfaz y ver el cambio al instante. Esta web es React de arriba abajo.',
  },
  {
    icon: 'music' as IconName,
    title: 'Música',
    text: 'De fondo mientras trabajo, y de vez en cuando componiendo. El secuenciador del arcade salió de ahí.',
  },
  {
    icon: 'spark' as IconName,
    title: 'Claude y agentes',
    text: 'Uso Claude a diario para lo repetitivo y para explorar ideas rápido. Lo difícil no es pedirlo: es revisar bien lo que vuelve.',
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
