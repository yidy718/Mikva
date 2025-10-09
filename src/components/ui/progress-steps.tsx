import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface Step {
  label: string
  icon?: React.ReactNode
  description?: string
}

interface ProgressStepsProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function ProgressSteps({ steps, currentStep, className }: ProgressStepsProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isUpcoming = stepNumber > currentStep

          return (
            <div key={index} className="flex-1 flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
                    {
                      'border-primary bg-primary text-primary-foreground': isCompleted,
                      'border-primary bg-background text-primary ring-4 ring-primary/20': isCurrent,
                      'border-muted-foreground/30 bg-muted/30 text-muted-foreground': isUpcoming,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : step.icon ? (
                    <div className="h-5 w-5">{step.icon}</div>
                  ) : (
                    <span className="text-sm font-semibold">{stepNumber}</span>
                  )}
                </div>

                {/* Step Label - Hidden on mobile */}
                <div className="mt-2 text-center hidden sm:block">
                  <p
                    className={cn('text-xs font-medium transition-colors', {
                      'text-primary': isCompleted || isCurrent,
                      'text-muted-foreground': isUpcoming,
                    })}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 transition-all duration-300',
                    {
                      'bg-primary': stepNumber < currentStep,
                      'bg-muted-foreground/30': stepNumber >= currentStep,
                    }
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile Step Label */}
      <div className="mt-4 text-center sm:hidden">
        <p className="text-sm font-medium text-primary">{steps[currentStep - 1]?.label}</p>
        {steps[currentStep - 1]?.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {steps[currentStep - 1].description}
          </p>
        )}
      </div>
    </div>
  )
}
