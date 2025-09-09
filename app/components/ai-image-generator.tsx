
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface AIImageGeneratorProps {
  prompt: string
  featureTitle: string
  className?: string
}

export function AIImageGenerator({ prompt, featureTitle, className = "" }: AIImageGeneratorProps) {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Feature-specific prompts for better AI image generation
  const getEnhancedPrompt = (title: string) => {
    const prompts: { [key: string]: string } = {
      "24/7 Customer Support": "modern customer support center with AI chatbot interface, digital screens showing 24/7 availability, blue and green color scheme, professional tech environment",
      "Instant Responses": "lightning fast digital communication, instant messaging bubbles, speed lines, modern UI elements, tech-focused design",
      "Multilingual Support": "global communication concept, world map with language symbols, diverse cultural elements, international connectivity",
      "Advanced Analytics": "data visualization dashboard, charts and graphs, analytics interface, business intelligence, modern data center",
      "Personalized Interaction": "AI personalization concept, user profiles, customized interfaces, individual user experience elements",
      "Lead Generation & Qualification": "sales funnel visualization, lead conversion process, business growth graphics, professional sales environment",
      "No-Code/Low-Code Interface": "drag and drop interface, visual programming, code blocks, user-friendly design tools, modern development environment",
      "Full Customization": "customization tools, design elements, color palettes, brand personalization, flexible interface design",
      "Dynamic Knowledge Base": "digital library, knowledge management system, document processing, AI learning concepts, organized information",
      "Seamless Embedding": "website integration, embed code visualization, seamless connectivity, web development tools",
      "Usage Tracking & Billing": "dashboard analytics, usage metrics, billing interface, financial tracking, business management tools",
      "Secure Authentication": "cybersecurity elements, lock icons, secure login interface, data protection, privacy shields"
    }
    
    return prompts[title] || prompt
  }

  useEffect(() => {
    const generateImage = async () => {
      try {
        setLoading(true)
        const enhancedPrompt = getEnhancedPrompt(featureTitle)
        
        // Using a free AI image generation service
        const response = await fetch('/api/generate-feature-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: enhancedPrompt,
            feature: featureTitle
          })
        })

        if (response.ok) {
          const data = await response.json()
          setImageUrl(data.imageUrl)
        } else {
          // Fallback to placeholder with themed background
          setImageUrl(getPlaceholderImage(featureTitle))
        }
      } catch (err) {
        console.error('Error generating image:', err)
        setImageUrl(getPlaceholderImage(featureTitle))
      } finally {
        setLoading(false)
      }
    }

    generateImage()
  }, [featureTitle, prompt])

  // Generate themed placeholder images as fallback
  const getPlaceholderImage = (title: string) => {
    const colors = {
      "24/7 Customer Support": "bg-blue-500",
      "Instant Responses": "bg-green-500", 
      "Multilingual Support": "bg-purple-500",
      "Advanced Analytics": "bg-indigo-500",
      "Personalized Interaction": "bg-pink-500",
      "Lead Generation & Qualification": "bg-orange-500",
      "No-Code/Low-Code Interface": "bg-teal-500",
      "Full Customization": "bg-red-500",
      "Dynamic Knowledge Base": "bg-yellow-500",
      "Seamless Embedding": "bg-cyan-500",
      "Usage Tracking & Billing": "bg-violet-500",
      "Secure Authentication": "bg-emerald-500"
    }
    
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad1)" rx="20"/>
        <text x="200" y="150" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">
          ${title}
        </text>
      </svg>
    `)}`
  }

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Generating image...</div>
        </div>
      </div>
    )
  }

  if (error || !imageUrl) {
    return (
      <div className={`bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-white text-sm font-medium text-center px-4">
          {featureTitle}
        </span>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <Image
        src={imageUrl}
        alt={`${featureTitle} illustration`}
        fill
        className="object-cover transition-transform duration-300 hover:scale-105"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  )
}
