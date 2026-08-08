import { projects, skills } from '../data/site'
import type { Area } from './areaContext'

/**
 * Qué se ve con cada área. Vive aquí y no en cada sección para que el
 * filtro no pueda interpretarse de dos maneras distintas: si un proyecto
 * sale en Proyectos, sus skills salen en Skills.
 */

export const skillsIn = (area: Area) =>
  area === 'Todas' ? skills : skills.filter((s) => s.category === area)

export const projectsIn = (area: Area) =>
  area === 'Todas' ? projects : projects.filter((p) => p.areas.includes(area))

export const countsFor = (area: Area) => ({
  skills: skillsIn(area).length,
  projects: projectsIn(area).length,
})
