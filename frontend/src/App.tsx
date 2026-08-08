import { SoundProvider } from './audio/SoundProvider'
import { About } from './components/About'
import { Arcade } from './components/Arcade'
import { Backdrop } from './components/Backdrop'
import { Cursor } from './components/Cursor'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Music } from './components/Music'
import { MusicDock } from './components/MusicDock'
import { Navbar } from './components/Navbar'
import { Nodes } from './components/Nodes'
import { Projects } from './components/Projects'
import { SecretEgg } from './components/SecretEgg'
import { Skills } from './components/Skills'
import { MusicProvider } from './music/MusicProvider'
import { AreaProvider } from './state/AreaProvider'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const { theme, toggle } = useTheme()

  return (
    <SoundProvider>
      {/* El reproductor envuelve toda la página: así el mando flotante y el
          de la sección de música comparten el mismo audio y la canción no
          se corta al pasar de uno a otro. */}
      <MusicProvider>
        <Backdrop />
        <Cursor />
        <Navbar theme={theme} onToggleTheme={toggle} />

        <main>
          <Hero />
          <Nodes />
          {/* Skills y Proyectos comparten un único filtro por área */}
          <AreaProvider>
            <Skills />
            <Projects />
          </AreaProvider>
          <Arcade />
          <Music />
          <About />
        </main>

        <Footer />
        <SecretEgg />
        <MusicDock />
      </MusicProvider>
    </SoundProvider>
  )
}
