import { SoundProvider } from './audio/SoundProvider'
import { About } from './components/About'
import { Arcade } from './components/Arcade'
import { Backdrop } from './components/Backdrop'
import { Cursor } from './components/Cursor'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Navbar } from './components/Navbar'
import { Nodes } from './components/Nodes'
import { Projects } from './components/Projects'
import { SecretEgg } from './components/SecretEgg'
import { Skills } from './components/Skills'
import { AreaProvider } from './state/AreaProvider'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const { theme, toggle } = useTheme()

  return (
    <SoundProvider>
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
        <About />
      </main>

      <Footer />
      <SecretEgg />
    </SoundProvider>
  )
}
