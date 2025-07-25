import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Download, Plus, Calendar, Camera } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { blink } from '../blink/client'

interface ResultsGalleryProps {
  user: any
  onBack: () => void
  onNewGeneration: () => void
}

interface HeadshotGeneration {
  id: string
  userId: string
  style: string
  background: string
  referenceImages: string[]
  generatedImages: string[]
  createdAt: string
}

export default function ResultsGallery({ user, onBack, onNewGeneration }: ResultsGalleryProps) {
  const [generations, setGenerations] = useState<HeadshotGeneration[]>([])
  const [loading, setLoading] = useState(true)

  const loadGenerations = useCallback(async () => {
    try {
      const results = await blink.db.headshot_generations.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      
      console.log('Raw database results:', results) // Debug log
      
      // Parse JSON fields from database - handle both field name formats and data formats
      const parsedResults = results.map(generation => {
        let parsedGeneratedImages = []
        let parsedReferenceImages = []
        
        // Handle generatedImages - prioritize snake_case since that's what's in the database
        const generatedImagesData = (generation as any).generated_images || generation.generatedImages
        console.log('Generated images data:', generatedImagesData) // Debug log
        if (generatedImagesData) {
          try {
            if (typeof generatedImagesData === 'string') {
              // Try parsing as JSON first
              try {
                parsedGeneratedImages = JSON.parse(generatedImagesData)
              } catch {
                // If JSON parse fails, try comma-separated string
                parsedGeneratedImages = generatedImagesData.split(',').map(url => url.trim()).filter(Boolean)
              }
            } else if (Array.isArray(generatedImagesData)) {
              parsedGeneratedImages = generatedImagesData
            }
          } catch (error) {
            console.error('Failed to parse generatedImages:', error, generatedImagesData)
            parsedGeneratedImages = []
          }
        }
        
        // Handle referenceImages - prioritize snake_case since that's what's in the database
        const referenceImagesData = (generation as any).reference_images || generation.referenceImages
        console.log('Reference images data:', referenceImagesData) // Debug log
        if (referenceImagesData) {
          try {
            if (typeof referenceImagesData === 'string') {
              // Try parsing as JSON first
              try {
                parsedReferenceImages = JSON.parse(referenceImagesData)
              } catch {
                // If JSON parse fails, try comma-separated string
                parsedReferenceImages = referenceImagesData.split(',').map(url => url.trim()).filter(Boolean)
              }
            } else if (Array.isArray(referenceImagesData)) {
              parsedReferenceImages = referenceImagesData
            }
          } catch (error) {
            console.error('Failed to parse referenceImages:', error, referenceImagesData)
            parsedReferenceImages = []
          }
        }
        
        const result = {
          ...generation,
          generatedImages: Array.isArray(parsedGeneratedImages) ? parsedGeneratedImages : [],
          referenceImages: Array.isArray(parsedReferenceImages) ? parsedReferenceImages : []
        }
        
        console.log('Parsed generation:', result) // Debug log
        return result
      })
      
      console.log('Final parsed results:', parsedResults) // Debug log
      setGenerations(parsedResults)
    } catch (error) {
      console.error('Failed to load generations:', error)
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    loadGenerations()
  }, [loadGenerations])

  const downloadImage = async (url: string, generationId: string, index: number) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `headshot-${generationId}-${index + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStyleDisplayName = (style: string) => {
    const styleMap: Record<string, string> = {
      business: 'Business Professional',
      casual: 'Casual Professional',
      creative: 'Creative Professional'
    }
    return styleMap[style] || style
  }

  const getBackgroundDisplayName = (background: string) => {
    const backgroundMap: Record<string, string> = {
      studio: 'Studio',
      office: 'Office',
      outdoor: 'Outdoor',
      custom: 'Custom'
    }
    return backgroundMap[background] || background
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FF6B35]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">My Headshots</h1>
            <Button onClick={onNewGeneration} className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Generate New
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {generations.length === 0 ? (
          <div className="text-center py-16">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No headshots yet</h2>
            <p className="text-gray-600 mb-8">Generate your first professional headshots to get started</p>
            <Button onClick={onNewGeneration} className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Generate Headshots
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {generations.map((generation) => (
              <Card key={generation.id} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{formatDate(generation.createdAt)}</span>
                    <Badge variant="outline">{getStyleDisplayName(generation.style)}</Badge>
                    <Badge variant="outline">{getBackgroundDisplayName(generation.background)}</Badge>
                  </div>
                  <span className="text-sm text-gray-500">
                    {Array.isArray(generation.generatedImages) ? generation.generatedImages.length : 0} images
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.isArray(generation.generatedImages) && generation.generatedImages.length > 0 ? (
                    generation.generatedImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Generated headshot ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <Button
                            onClick={() => downloadImage(imageUrl, generation.id, index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-900 hover:bg-gray-100"
                            size="sm"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-4">
                      <p className="text-gray-500">No images available</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}