import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Lightbulb, BookOpen, Info } from "lucide-react";
import { icons } from "lucide-react";
import type { TutorialTopic } from "@/data/tutorialData";
import { tutorialCategories } from "@/data/tutorialData";
import { cn } from "@/lib/utils";

interface TutorialCardProps {
  topic: TutorialTopic;
  index: number;
}

const TutorialCard = ({ topic, index }: TutorialCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const IconComponent = (icons as Record<string, React.ComponentType<{ className?: string; size?: number }>>)[topic.icon] || icons.HelpCircle;
  const categoryLabel = tutorialCategories.find((c) => c.key === topic.category)?.label || topic.category;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-md border-border/50",
        "animate-fade-in",
        isOpen && "ring-1 ring-primary/20 shadow-md"
      )}
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <IconComponent size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold leading-tight">
                {topic.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {topic.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
              {categoryLabel}
            </Badge>
            <ChevronDown
              size={18}
              className={cn(
                "text-muted-foreground transition-transform duration-300",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </div>
      </CardHeader>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <CardContent className="pt-0 space-y-4">
          <div className="border-t pt-4">
            {/* Como usar */}
            <div className="flex items-start gap-2 mb-4">
              <BookOpen size={16} className="text-primary mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Como usar</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {topic.howToUse}
                </p>
              </div>
            </div>

            {/* Dicas */}
            {topic.tips.length > 0 && (
              <div className="flex items-start gap-2 mb-4">
                <Lightbulb size={16} className="text-yellow-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">Dicas</h4>
                  <ul className="space-y-1">
                    {topic.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-1.5">
                        <span className="text-primary mt-1">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Observações */}
            {topic.notes && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-0.5">Observação</h4>
                  <p className="text-sm text-muted-foreground">{topic.notes}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default TutorialCard;
