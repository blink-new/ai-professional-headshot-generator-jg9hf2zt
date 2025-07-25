import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import LandingPage from './components/LandingPage'
import HeadshotWizard from './components/HeadshotWizard'
import ResultsGallery from './components/ResultsGallery'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<'landing' | 'wizard' | 'gallery'>('landing')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FF6B35]"></div>
      </div>
    )
  }

  if (!user) {
    return <LandingPage />
  }

  return (
    <div className="min-h-screen bg-white">
      {currentView === 'landing' && (
        <LandingPage 
          isAuthenticated={true} 
          onStartWizard={() => setCurrentView('wizard')}
          onViewGallery={() => setCurrentView('gallery')}
        />
      )}
      {currentView === 'wizard' && (
        <HeadshotWizard 
          user={user}
          onComplete={() => setCurrentView('gallery')}
          onBack={() => setCurrentView('landing')}
        />
      )}
      {currentView === 'gallery' && (
        <ResultsGallery 
          user={user}
          onBack={() => setCurrentView('landing')}
          onNewGeneration={() => setCurrentView('wizard')}
        />
      )}
    </div>
  )
}

export default App