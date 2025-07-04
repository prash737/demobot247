import { Zap, Settings2, Scale, Gauge } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const steps = [
  {
    icon: Zap,
    title: "Quick Setup",
    description: "Get started in minutes with our guided setup process",
  },
  {
    icon: Settings2,
    title: "Customizable",
    description: "Easy integration with your institution's specific needs",
  },
  {
    icon: Scale,
    title: "Scalable",
    description: "Grows seamlessly with your institution's requirements",
  },
  {
    icon: Gauge,
    title: "Low Requirements",
    description: "Minimal hardware and software requirements for maximum efficiency",
  },
]

export function Implementation() {
  return (
    <section
      id="implementation"
      className="py-20 bg-gradient-to-br from-blue-500/5 via-green-500/5 to-blue-500/5 w-full"
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8 space-y-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white">
          Simple Implementation Process
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="border-none shadow-sm bg-white dark:bg-gray-800">
              <CardContent className="flex flex-col items-center text-center space-y-4 p-6">
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <step.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
