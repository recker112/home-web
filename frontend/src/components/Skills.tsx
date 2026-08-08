import { useInView } from '../hooks/useInView'
import { useArea } from '../state/areaContext'
import { projectsIn, skillsIn } from '../state/areaSelectors'
import { useSound } from '../audio/context'
import { AreaFilter } from './AreaFilter'
import { PixelIcon } from './PixelIcon'
import { SectionHead } from './SectionHead'
import './Skills.css'

/** Barra de experiencia: se rellena la primera vez que entra en pantalla. */
function SkillBar({ name, level, delay }: { name: string; level: number; delay: number }) {
  const { ref, inView } = useInView<HTMLLIElement>('-40px')

  return (
    <li
      ref={ref}
      className={`skill reveal${inView ? ' is-visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="skill__head">
        <span className="skill__name">{name}</span>
        <span className="skill__lv">LV {level}</span>
      </div>
      <div
        className="skill__bar"
        role="meter"
        aria-valuenow={level}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={name}
      >
        <div
          className="skill__fill"
          style={{ width: inView ? `${level}%` : '0%', transitionDelay: `${delay + 120}ms` }}
        />
        <div className="skill__ticks" />
      </div>
    </li>
  )
}

export function Skills() {
  const { area } = useArea()
  const sound = useSound()

  const visible = skillsIn(area)
  const related = projectsIn(area)

  const goToProjects = () => {
    sound.play('click')
    document.getElementById('proyectos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="skills" className="section">
      <div className="wrap">
        <SectionHead
          index="02"
          title="SKILLS"
          subtitle="Lo que uso a diario, con el nivel al que realmente lo manejo."
        />

        <AreaFilter from="skills" />

        {/* La key fuerza a repetir la animación de entrada al cambiar de área */}
        <ul className="skills__grid" key={area}>
          {visible.map((skill, i) => (
            <SkillBar key={skill.name} name={skill.name} level={skill.level} delay={i * 55} />
          ))}
        </ul>

        {/* Cierra el círculo: de las skills del área a los proyectos donde se usan */}
        <div className="skills__bridge">
          {related.length > 0 ? (
            <button className="skills__jump" onClick={goToProjects}>
              <PixelIcon name="arrow" size={14} />
              {area === 'Todas'
                ? `VER LOS ${related.length} PROYECTOS`
                : `VER LOS ${related.length} PROYECTOS DE ${area.toUpperCase()}`}
            </button>
          ) : (
            <p className="skills__none">
              Todavía no hay ningún proyecto publicado de {area}.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
