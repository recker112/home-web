import { skillCategories } from '../data/site'
import { useArea, type Area } from '../state/areaContext'
import { countsFor } from '../state/areaSelectors'
import { useSound } from '../audio/context'
import { PixelIcon } from './PixelIcon'
import './AreaFilter.css'

const AREAS: Area[] = ['Todas', ...skillCategories]

/**
 * El mismo control aparece en Skills y en Proyectos, sobre el mismo estado.
 * Verlo repetido y sincronizado es la pista más clara de que un solo filtro
 * gobierna las dos secciones.
 */
export function AreaFilter({ from }: { from: 'skills' | 'proyectos' }) {
  const { area, setArea } = useArea()
  const sound = useSound()

  return (
    <div className="areafilter">
      <div className="areafilter__head">
        <span className="areafilter__title">
          <PixelIcon name="cpu" size={14} />
          FILTRAR POR ÁREA
        </span>
        <span className="areafilter__scope">
          afecta a <strong>skills</strong> y <strong>proyectos</strong>
        </span>
      </div>

      <div className="areafilter__row" role="tablist" aria-label="Filtrar skills y proyectos por área">
        {AREAS.map((option) => {
          const counts = countsFor(option)
          return (
            <button
              key={option}
              role="tab"
              aria-selected={area === option}
              className={`areafilter__btn${area === option ? ' is-active' : ''}`}
              onClick={() => {
                setArea(option)
                sound.play('click')
              }}
              onPointerEnter={() => sound.play('hover')}
              title={`${counts.skills} skills · ${counts.projects} proyectos`}
            >
              <span className="areafilter__btn-label">{option.toUpperCase()}</span>
              <span className="areafilter__btn-count">
                {counts.skills}/{counts.projects}
              </span>
            </button>
          )
        })}
      </div>

      <p className="areafilter__legend">
        Cada botón muestra <span className="text-blue">skills</span>
        <span className="areafilter__sep">/</span>
        <span className="text-gold">proyectos</span> de esa área.
        {from === 'skills'
          ? ' Los proyectos de abajo se filtran contigo.'
          : ' Estos proyectos salen del área elegida arriba.'}
      </p>
    </div>
  )
}
