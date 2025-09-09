
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, feature } = await request.json()

    // Using Pollinations AI (free service) for image generation
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=300&seed=${Math.floor(Math.random() * 1000)}&model=flux&nologo=true`

    return NextResponse.json({ 
      imageUrl,
      feature,
      prompt 
    })
  } catch (error) {
    console.error('Error generating image:', error)
    
    // Return a fallback gradient image
    const fallbackSvg = `data:image/svg+xml;base64,${btoa(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad1)" rx="15"/>
        <circle cx="200" cy="120" r="30" fill="rgba(255,255,255,0.2)"/>
        <rect x="150" y="170" width="100" height="8" fill="rgba(255,255,255,0.3)" rx="4"/>
        <rect x="170" y="190" width="60" height="6" fill="rgba(255,255,255,0.2)" rx="3"/>
      </svg>
    `)}`

    return NextResponse.json({ 
      imageUrl: fallbackSvg,
      feature,
      prompt 
    })
  }
}
