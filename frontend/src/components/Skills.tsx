import { useState } from 'react'
import { skillCategories, skills, type SkillCategory } from '../data/site'
import { useInView } from '../hooks/useInView'
import { useSound } from '../audio/context'
import { PixelIcon } from './PixelIcon'
import { SectionHead } from './SectionHead'
import './Skills.css'

type Filter = SkillCategory | 'Todas'

const FILTERS: Filter[] = ['Todas', ...skillCategories]

/** Barra de experiencia: se rellena la primera vez que entra en pantalla. */
function SkillBar({ name, level, delay }: { name: string; level: number; delay: number }) {
  const { ref, inView } = useInView<HTMLLIElement>('-40px')

  return (
    <li ref={ref} className={`skill reveal${inView ? ' is-visible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
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
  const [filter, setFilter] = useState<Filter>('Todas')
  const sound = useSound()

  const visible = filter === 'Todas' ? skills : skills.filter((s) => s.category === filter)

  return (
    <section id="skills" className="section">
      <div className="wrap">
        <SectionHead
          index="02"
          title="SKILLS"
          subtitle="Lo que uso a diario, con el nivel al que realmente lo manejo."
        />

        <div className="skills__filters" role="tablist" aria-label="Filtrar skills">
          {FILTERS.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              className={`skills__filter${filter === f ? ' is-active' : ''}`}
              onClick={() => {
                setFilter(f)
                sound.play('click')
              }}
              onPointerEnter={() => sound.play('hover')}
            >
              {f === 'Todas' ? <PixelIcon name="cpu" size={12} /> : null}
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        <ul className="skills__grid" key={filter}>
          {visible.map((skill, i) => (
            <SkillBar key={skill.name} name={skill.name} level={skill.level} delay={i * 55} />
          ))}
        </ul>
      </div>
    </section>
  )
}
