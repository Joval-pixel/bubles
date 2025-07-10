import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Zap, Palette, Smartphone, Settings, Rocket } from 'lucide-react'
import BubbleEffect from './components/BubbleEffect'
import './App.css'

function App() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Visual Impressionante",
      description: "Bolhas animadas com gradientes suaves, efeitos de brilho e animações fluidas que criam uma experiência visual única."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Performance Otimizada",
      description: "Renderização eficiente usando HTML5 Canvas com otimizações para dispositivos móveis e desktop."
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Interatividade",
      description: "Clique para criar novas bolhas, arraste para mover e observe as colisões físicas realistas entre os elementos."
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Responsivo",
      description: "Funciona perfeitamente em todos os dispositivos, desde smartphones até telas de alta resolução."
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Customizável",
      description: "Configure cores, tamanhos, velocidades e comportamentos para adequar ao seu projeto."
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Fácil Integração",
      description: "Apenas algumas linhas de código para adicionar o efeito ao seu site existente."
    }
  ]

  const bubbleOptions = {
    bubbleCount: 12,
    colors: ['#4af', '#f84', '#8f4', '#f48', '#84f', '#4f8', '#f8f', '#ff4', '#8ff', '#f88'],
    minSize: 40,
    maxSize: 100,
    speed: 0.8,
    interactive: true,
    showControls: false
  }

  return (
    <div className="min-h-screen bg-background text-foreground scroll-smooth">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden hero-gradient">
        {/* Bubble Effect Background */}
        <BubbleEffect 
          className="absolute inset-0 z-0" 
          options={bubbleOptions}
        />
        
        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-6 text-glow"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 50 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            BUBLES
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl mb-8 text-blue-200"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Experiência Visual Imersiva
          </motion.p>
          
          <motion.p 
            className="text-lg md:text-xl mb-12 text-blue-100 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            Descubra um novo mundo de interação digital com nosso sistema de bolhas animadas. 
            Inspirado nas melhores tecnologias de visualização, oferecemos uma experiência única e envolvente.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 1, delay: 1.1 }}
          >
            <button 
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-semibold transition-all duration-300 transform hover:scale-105 bubble-glow"
            >
              Explorar Recursos
            </button>
            <button 
              onClick={() => document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 glass-effect hover:bg-white/20 text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Ver Demonstração
            </button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 1, delay: 2 }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce"></div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              Recursos Principais
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tecnologia avançada para criar experiências visuais extraordinárias
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="p-6 rounded-2xl glass-effect hover:bg-white/15 transition-all duration-300 transform hover:scale-105"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-blue-200 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 px-6 bg-card/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              Demonstração Interativa
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              Clique na área abaixo para criar bolhas e experimente a interatividade
            </p>
          </motion.div>

          <motion.div
            className="relative h-96 rounded-2xl overflow-hidden glass-effect"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <BubbleEffect 
              className="w-full h-full" 
              options={{
                ...bubbleOptions,
                bubbleCount: 8,
                showControls: true
              }}
            />
            
            <div className="absolute top-4 left-4 glass-effect rounded-lg p-3">
              <p className="text-sm text-white/80">
                💡 Clique para criar bolhas
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
              Fácil Integração
            </h2>
            <p className="text-xl text-muted-foreground">
              Adicione o efeito ao seu site com apenas algumas linhas de código
            </p>
          </motion.div>

          <motion.div
            className="glass-effect rounded-2xl p-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold mb-6 text-white">
              Exemplo de Código
            </h3>
            <div className="bg-black/50 rounded-lg p-6 font-mono text-sm overflow-x-auto">
              <div className="text-green-400">// Integração simples</div>
              <div className="text-blue-300">import BubbleEffect from './BubbleEffect'</div>
              <br />
              <div className="text-yellow-300">function App() {`{`}</div>
              <div className="ml-4 text-white">return (</div>
              <div className="ml-8 text-purple-300">&lt;BubbleEffect</div>
              <div className="ml-12 text-orange-300">options={`{{`}</div>
              <div className="ml-16 text-white">bubbleCount: 10,</div>
              <div className="ml-16 text-white">interactive: true</div>
              <div className="ml-12 text-orange-300">{`}}`}</div>
              <div className="ml-8 text-purple-300">/&gt;</div>
              <div className="ml-4 text-white">)</div>
              <div className="text-yellow-300">{`}`}</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-4 text-primary">BUBLES</h3>
            <p className="text-muted-foreground mb-6">
              Sistema de bolhas animadas inspirado no CryptoBubbles.net
            </p>
            <p className="text-sm text-muted-foreground">
              Desenvolvido com React, Canvas HTML5 e muito amor ❤️
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}

export default App

