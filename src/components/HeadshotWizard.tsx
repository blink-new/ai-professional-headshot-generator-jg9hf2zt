import { useState, useRef } from 'react'
import { ArrowLeft, ArrowRight, Upload, Camera, Sparkles, Download } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { blink } from '../blink/client'

interface HeadshotWizardProps {
  user: any
  onComplete: () => void
  onBack: () => void
}

type WizardStep = 'upload' | 'style' | 'background' | 'generate' | 'results'

const styles = [
  { id: 'business', name: 'Business Professional', description: 'Corporate and formal look' },
  { id: 'casual', name: 'Casual Professional', description: 'Relaxed but professional' },
  { id: 'creative', name: 'Creative Professional', description: 'Artistic and modern' },
]

const backgrounds = [
  { id: 'studio', name: 'Studio', description: 'Clean studio background' },
  { id: 'office', name: 'Office', description: 'Professional office setting' },
  { id: 'outdoor', name: 'Outdoor', description: 'Natural outdoor environment' },
  { id: 'custom', name: 'Custom', description: 'AI-generated background' },
]

export default function HeadshotWizard({ user, onComplete, onBack }: HeadshotWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [selectedStyle, setSelectedStyle] = useState('')
  const [selectedBackground, setSelectedBackground] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [generationProgress, setGenerationProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(prev => [...prev, ...files].slice(0, 10))
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)
    
    try {
      // Upload reference images to storage first
      const uploadedUrls: string[] = []
      for (const file of uploadedFiles) {
        const { publicUrl } = await blink.storage.upload(
          file,
          `headshots/${user.id}/${Date.now()}-${file.name}`,
          { upsert: true }
        )
        uploadedUrls.push(publicUrl)
        setGenerationProgress(prev => prev + (30 / uploadedFiles.length))
      }

      // Generate headshots using AI
      const prompt = `Generate a professional ${selectedStyle} headshot with ${selectedBackground} background. High quality, studio lighting, professional appearance.`
      
      const { data } = await blink.ai.modifyImage({
        images: uploadedUrls,
        prompt,
        quality: 'high',
        n: 4
      })

      setGenerationProgress(80)

      // Ensure data is an array and extract URLs safely
      const imageUrls = Array.isArray(data) ? data.map(img => img?.url).filter(Boolean) : []
      
      if (imageUrls.length === 0) {
        throw new Error('No images were generated')
      }

      // Save generation data to database
      console.log('Saving to database:', {
        userId: user.id,
        style: selectedStyle,
        background: selectedBackground,
        referenceImages: JSON.stringify(uploadedUrls),
        generatedImages: JSON.stringify(imageUrls)
      })
      
      const generationRecord = await blink.db.headshotGenerations.create({
        userId: user.id,
        style: selectedStyle,
        background: selectedBackground,
        referenceImages: JSON.stringify(uploadedUrls), // Store as JSON string
        generatedImages: JSON.stringify(imageUrls), // Store as JSON string
        createdAt: new Date().toISOString()
      })
      
      console.log('Database record created:', generationRecord)

      setGeneratedImages(imageUrls)
      setGenerationProgress(100)
      setCurrentStep('results')
    } catch (error) {
      console.error('Generation failed:', error)
      alert('Generation failed. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleNext = () => {
    switch (currentStep) {
      case 'upload':
        if (uploadedFiles.length >= 3) setCurrentStep('style')
        break
      case 'style':
        if (selectedStyle) setCurrentStep('background')
        break
      case 'background':
        if (selectedBackground) setCurrentStep('generate')
        break
      case 'generate':
        handleGenerate()
        break
    }
  }

  const downloadImage = async (url: string, index: number) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `headshot-${index + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'upload': return 'Upload Reference Photos'
      case 'style': return 'Choose Your Style'
      case 'background': return 'Select Background'
      case 'generate': return 'Generate Headshots'
      case 'results': return 'Your Professional Headshots'
      default: return ''
    }
  }

  const getStepNumber = () => {
    switch (currentStep) {
      case 'upload': return 1
      case 'style': return 2
      case 'background': return 3
      case 'generate': return 4
      case 'results': return 5
      default: return 1
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="text-center">
              <Badge variant="outline" className="mb-2">
                Step {getStepNumber()} of 5
              </Badge>
              <h1 className="text-2xl font-bold text-gray-900">{getStepTitle()}</h1>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Upload Step */}
        {currentStep === 'upload' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <p className="text-gray-600">Upload 3-10 clear photos of yourself from different angles</p>
            </div>

            <Card className="p-8">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-[#FF6B35] transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">Click to upload photos</p>
                <p className="text-gray-600">or drag and drop</p>
                <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 10MB each</p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </Card>

            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeFile(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-center">
              <Button 
                onClick={handleNext}
                disabled={uploadedFiles.length < 3}
                className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Style Step */}
        {currentStep === 'style' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <p className="text-gray-600">Choose the style that best fits your professional needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {styles.map((style) => (
                <Card 
                  key={style.id}
                  className={`p-6 cursor-pointer transition-all ${
                    selectedStyle === style.id 
                      ? 'ring-2 ring-[#FF6B35] bg-orange-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedStyle(style.id)}
                >
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-[#FF6B35] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{style.name}</h3>
                    <p className="text-gray-600">{style.description}</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={handleNext}
                disabled={!selectedStyle}
                className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Background Step */}
        {currentStep === 'background' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <p className="text-gray-600">Select the background setting for your headshots</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {backgrounds.map((background) => (
                <Card 
                  key={background.id}
                  className={`p-6 cursor-pointer transition-all ${
                    selectedBackground === background.id 
                      ? 'ring-2 ring-[#FF6B35] bg-orange-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedBackground(background.id)}
                >
                  <div className="text-center">
                    <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{background.name}</h3>
                    <p className="text-gray-600">{background.description}</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={handleNext}
                disabled={!selectedBackground}
                className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Generate Step */}
        {currentStep === 'generate' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Generate</h2>
              <p className="text-gray-600">Review your selections and generate your professional headshots</p>
            </div>

            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Photos</h3>
                  <p className="text-gray-600">{uploadedFiles.length} reference images</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Style</h3>
                  <p className="text-gray-600">{styles.find(s => s.id === selectedStyle)?.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Background</h3>
                  <p className="text-gray-600">{backgrounds.find(b => b.id === selectedBackground)?.name}</p>
                </div>
              </div>
            </Card>

            {isGenerating && (
              <Card className="p-6">
                <div className="text-center mb-4">
                  <Sparkles className="w-12 h-12 text-[#FF6B35] mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Your Headshots</h3>
                  <p className="text-gray-600">This may take a few minutes...</p>
                </div>
                <Progress value={generationProgress} className="w-full" />
                <p className="text-center text-sm text-gray-500 mt-2">{Math.round(generationProgress)}% complete</p>
              </Card>
            )}

            <div className="flex justify-center">
              <Button 
                onClick={handleNext}
                disabled={isGenerating}
                className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white"
              >
                {isGenerating ? 'Generating...' : 'Generate Headshots'}
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Results Step */}
        {currentStep === 'results' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Professional Headshots</h2>
              <p className="text-gray-600">Download your favorite headshots or generate new ones</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.isArray(generatedImages) && generatedImages.length > 0 ? (
                generatedImages.map((imageUrl, index) => (
                  <Card key={index} className="p-4">
                    <img
                      src={imageUrl}
                      alt={`Generated headshot ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg mb-4"
                    />
                    <Button 
                      onClick={() => downloadImage(imageUrl, index)}
                      className="w-full bg-[#FF6B35] hover:bg-[#e55a2b] text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No images generated yet</p>
                </div>
              )}
            </div>

            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => setCurrentStep('upload')}>
                Generate More
              </Button>
              <Button onClick={onComplete} className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white">
                View Gallery
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}