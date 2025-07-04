"use client"

import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

interface PlotGalleryProps {
  plots: string[]
}

export function PlotGallery({ plots }: PlotGalleryProps) {
  if (plots.length === 0) return null

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {plots.map((plot, index) => (
        <Card key={index} className="overflow-hidden flex flex-col">
          <CardContent className="p-4 flex-grow flex flex-col justify-between">
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative aspect-[16/9] cursor-pointer hover:opacity-90 transition-opacity mb-4">
                  <Image src={plot || "/placeholder.svg"} alt={`Plot ${index + 1}`} fill className="object-contain" />
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-full p-0">
                <div className="relative aspect-[16/9]">
                  <Image src={plot || "/placeholder.svg"} alt={`Plot ${index + 1}`} fill className="object-contain" />
                </div>
              </DialogContent>
            </Dialog>
            <div className="text-sm text-gray-500 dark:text-gray-400">Plot {index + 1}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
