import { useNavigate } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const HelpButton = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => navigate("/ajuda")}
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 bg-primary text-primary-foreground"
          >
            <HelpCircle size={24} />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Central de Ajuda</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default HelpButton;
