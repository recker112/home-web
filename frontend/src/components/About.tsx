import { interests, profile } from '../data/site'
import { useInView } from '../hooks/useInView'
import { PixelIcon } from './PixelIcon'
import { SectionHead } from './SectionHead'
import './About.css'

export function About() {
  const { ref, inView } = useInView()

  return (
    <section id="sobre-mi" className="section">
      <div className="wrap">
        <SectionHead index="06" title="SOBRE MÍ" />

        <div ref={ref} className={`about reveal${inView ? ' is-visible' : ''}`}>
          <div className="about__bio panel">
            <div className="about__bio-head">
              <PixelIcon name="terminal" size={20} />
              <span>cat /home/recker/about.txt</span>
            </div>
            <div className="about__bio-body">
              {profile.bio.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
              <p className="about__meta">
                <span className="text-gold">ubicación:</span> {profile.location}
              </p>
            </div>
          </div>

          <ul className="about__interests">
            {interests.map((item) => (
              <li key={item.title} className="interest panel">
                <span className="interest__icon">
                  <PixelIcon name={item.icon} size={28} />
                </span>
                <div>
                  <h3 className="interest__title">{item.title}</h3>
                  <p className="interest__text">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
