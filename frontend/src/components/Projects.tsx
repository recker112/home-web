import { projects, type Project } from '../data/site'
import { useInView } from '../hooks/useInView'
import { useArea, type Area } from '../state/areaContext'
import { projectsIn, skillsIn } from '../state/areaSelectors'
import { useSound } from '../audio/context'
import { AreaFilter } from './AreaFilter'
import { PixelIcon } from './PixelIcon'
import { SectionHead } from './SectionHead'
import './Projects.css'

const STATUS: Record<Project['status'], { label: string; className: string }> = {
  live: { label: 'EN LÍNEA', className: 'is-live' },
  wip: { label: 'EN OBRAS', className: 'is-wip' },
  lab: { label: 'LABORATORIO', className: 'is-lab' },
}

function ProjectCard({ project, index, area }: { project: Project; index: number; area: Area }) {
  const { ref, inView } = useInView()
  const sound = useSound()
  const status = STATUS[project.status]

  return (
    <article
      ref={ref}
      className={`project panel reveal${inView ? ' is-visible' : ''}`}
      style={{ transitionDelay: `${index * 80}ms` }}
      onPointerEnter={() => sound.play('hover')}
    >
      <div className="project__top">
        <span className="project__icon">
          <PixelIcon name={project.icon} size={32} />
        </span>
        <span className={`project__status ${status.className}`}>
          <span className="project__status-dot" />
          {status.label}
        </span>
      </div>

      <h3 className="project__title">{project.title}</h3>

      {/* Áreas del proyecto: la que coincide con el filtro va resaltada,
          para que se vea de un vistazo por qué esta tarjeta sigue aquí. */}
      <ul className="project__areas">
        {project.areas.map((a) => (
          <li key={a} className={`project__area${a === area ? ' is-match' : ''}`}>
            {a}
          </li>
        ))}
      </ul>

      <p className="project__blurb">{project.blurb}</p>

      <ul className="project__tags">
        {project.tags.map((t) => (
          <li key={t} className="tag">
            {t}
          </li>
        ))}
      </ul>

      {(project.live || project.repo) && (
        <div className="project__links">
          {project.live && (
            <a
              className="project__link"
              href={project.live}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => sound.play('click')}
            >
              <PixelIcon name="external" size={14} />
              VISITAR
            </a>
          )}
          {project.repo && (
            <a
              className="project__link"
              href={project.repo}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => sound.play('click')}
            >
              <PixelIcon name="code" size={14} />
              CÓDIGO
            </a>
          )}
        </div>
      )}
    </article>
  )
}

export function Projects() {
  const { area, setArea } = useArea()
  const sound = useSound()

  const visible = projectsIn(area)
  const areaSkills = skillsIn(area)

  const clear = () => {
    setArea('Todas')
    sound.play('click')
  }

  return (
    <section id="proyectos" className="section">
      <div className="wrap">
        <SectionHead
          index="03"
          title="PROYECTOS"
          subtitle={
            area === 'Todas'
              ? 'Cosas que he construido y que mantengo funcionando.'
              : `Proyectos donde he puesto en práctica mis skills de ${area}.`
          }
        />

        <AreaFilter from="proyectos" />

        {area !== 'Todas' && (
          <div className="projects__active">
            <span className="projects__active-label">
              <PixelIcon name="check" size={14} />
              FILTRADO POR {area.toUpperCase()}
            </span>
            <span className="projects__active-detail">
              {visible.length} de {projects.length} proyectos · {areaSkills.length} skills de esta
              área
            </span>
            <button className="projects__clear" onClick={clear}>
              <PixelIcon name="close" size={12} />
              QUITAR FILTRO
            </button>
          </div>
        )}

        {visible.length === 0 ? (
          <div className="projects__empty panel">
            <PixelIcon name="terminal" size={40} />
            <h3 className="projects__empty-title">SIN PROYECTOS EN {area.toUpperCase()}</h3>
            <p className="projects__empty-text">
              Tengo skills de {area}, pero todavía no he publicado ningún proyecto de esa área.
            </p>
            <button className="btn btn--sm btn--primary" onClick={clear}>
              <PixelIcon name="arrow" size={16} />
              VER TODOS
            </button>
          </div>
        ) : (
          <div className="projects__grid" key={area}>
            {visible.map((p, i) => (
              <ProjectCard key={p.title} project={p} index={i} area={area} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
