import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PlanCardProps {
  plan: {
    title: string
    price: string
    features: string[]
  }
  isSelected: boolean
}

export function PlanCard({ plan, isSelected }: PlanCardProps) {
  return (
    <Card className={`${isSelected ? "border-blue-500 dark:border-blue-400" : ""} transition-all hover:shadow-md`}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {plan.title}
          {isSelected && <Badge>Selected</Badge>}
        </CardTitle>
        <p className="text-2xl font-bold">
          {plan.price}
          <span className="text-sm font-normal">/month</span>
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
