import { projects, type Project } from '../data/site'
import { useInView } from '../hooks/useInView'
import { useSound } from '../audio/context'
import { PixelIcon } from './PixelIcon'
import { SectionHead } from './SectionHead'
import './Projects.css'

const STATUS: Record<Project['status'], { label: string; className: string }> = {
  live: { label: 'EN LÍNEA', className: 'is-live' },
  wip: { label: 'EN OBRAS', className: 'is-wip' },
  lab: { label: 'LABORATORIO', className: 'is-lab' },
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
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
  return (
    <section id="proyectos" className="section">
      <div className="wrap">
        <SectionHead
          index="03"
          title="PROYECTOS"
          subtitle="Cosas que he construido y que mantengo funcionando."
        />

        <div className="projects__grid">
          {projects.map((p, i) => (
            <ProjectCard key={p.title} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
