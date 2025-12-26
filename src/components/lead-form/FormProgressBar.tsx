import { cn } from "@/lib/utils";

interface FormProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const FormProgressBar = ({ currentStep, totalSteps }: FormProgressBarProps) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-muted-foreground mb-2">
        <span>Etapa {currentStep} de {totalSteps}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
