import { Star, ArrowRight, Users, Camera, Sparkles } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { blink } from '../blink/client'

interface LandingPageProps {
  isAuthenticated?: boolean
  onStartWizard?: () => void
  onViewGallery?: () => void
}

export default function LandingPage({ isAuthenticated, onStartWizard, onViewGallery }: LandingPageProps) {
  const handleGetStarted = () => {
    if (isAuthenticated) {
      onStartWizard?.()
    } else {
      blink.auth.login()
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B35] to-[#FFA726] rounded-lg flex items-center justify-center">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">HeadshotAI</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" onClick={onViewGallery}>
                My Gallery
              </Button>
              <Button onClick={onStartWizard} className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white">
                Generate New
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost">
                Sign In
              </Button>
              <Button onClick={handleGetStarted} className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white">
                Get Started
              </Button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-orange-50 text-[#FF6B35] border-orange-200 hover:bg-orange-50">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Professional Headshots
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Professional headshots
            <br />
            <span className="gradient-text">in minutes, not hours</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload your photos and get studio-quality professional headshots powered by AI. 
            Perfect for LinkedIn, resumes, and professional profiles.
          </p>
          
          <Button 
            onClick={handleGetStarted}
            size="lg" 
            className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white px-8 py-4 text-lg font-semibold rounded-xl"
          >
            {isAuthenticated ? 'Create Headshots' : 'Get Started'}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          {/* Reviews */}
          <div className="flex items-center justify-center space-x-8 mt-8">
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-gray-600">4.9/5 on Google</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-green-500 text-green-500" />
                ))}
              </div>
              <span className="text-sm text-gray-600">4.8/5 on Trustpilot</span>
            </div>
          </div>
        </div>

        {/* Sample Headshots Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-16">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="w-full h-full bg-gradient-to-br from-[#FF6B35]/10 to-[#FFA726]/10 flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Trust Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-2">50,000+</div>
            <div className="text-gray-600">Professional headshots generated</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-2">98%</div>
            <div className="text-gray-600">Customer satisfaction rate</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-gray-900 mb-2">2 min</div>
            <div className="text-gray-600">Average generation time</div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How it works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Photos</h3>
              <p className="text-gray-600">Upload 5-10 photos of yourself from different angles</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose Style</h3>
              <p className="text-gray-600">Select your preferred style and background setting</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Results</h3>
              <p className="text-gray-600">Download your professional headshots in minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to get your professional headshots?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of professionals who trust our AI technology
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg" 
            className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white px-8 py-4 text-lg font-semibold rounded-xl"
          >
            {isAuthenticated ? 'Create Headshots' : 'Get Started Now'}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}