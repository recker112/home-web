import { useInView } from '../hooks/useInView'

type Props = {
  index: string
  title: string
  subtitle?: string
}

export function SectionHead({ index, title, subtitle }: Props) {
  const { ref, inView } = useInView()

  return (
    <div ref={ref} className={`section-intro reveal${inView ? ' is-visible' : ''}`}>
      <div className="section-head">
        <span className="section-head__idx">[{index}]</span>
        <h2>{title}</h2>
        <span className="section-head__line" />
      </div>
      {subtitle ? <p className="section-sub">{subtitle}</p> : null}
    </div>
  )
}
