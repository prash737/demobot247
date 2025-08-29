import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface UsageMeterProps {
  plan: string | null
  currentUsage: number
}

export function UsageMeter({ plan, currentUsage }: UsageMeterProps) {
  // Define limits based on plan
  let limit = 0
  let isUnlimited = false

  switch (plan) {
    case "Basic":
      limit = 500
      break
    case "Pro":
      limit = 1000
      break
    case "Advanced":
      isUnlimited = true
      limit = 1000 // Just for display purposes
      break
    default:
      limit = 500 // Default to Basic plan limit
  }

  // Calculate percentage used
  const percentageUsed = isUnlimited ? Math.min((currentUsage / limit) * 100, 100) : (currentUsage / limit) * 100

  // Determine color based on usage
  let progressColor = "bg-green-500"
  let textColor = "text-green-700"

  if (percentageUsed >= 90) {
    progressColor = "bg-red-500"
    textColor = "text-red-700"
  } else if (percentageUsed >= 75) {
    progressColor = "bg-yellow-500"
    textColor = "text-yellow-700"
  } else if (percentageUsed >= 50) {
    progressColor = "bg-blue-500"
    textColor = "text-blue-700"
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Monthly Usage</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isUnlimited
                    ? "Your plan includes unlimited conversations"
                    : `Your ${plan} plan includes ${limit} conversations per month`}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={percentageUsed} className="h-2" indicatorClassName={progressColor} />
          <div className="flex justify-between text-sm">
            <span className={textColor}>
              {isUnlimited
                ? `${currentUsage} conversations this month`
                : `${currentUsage} of ${limit} conversations used`}
            </span>
            {!isUnlimited && <span className={textColor}>{Math.max(0, limit - currentUsage)} remaining</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
