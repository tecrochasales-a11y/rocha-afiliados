import { useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

const HelpButton = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={() => navigate("/ajuda")}
        className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-primary text-primary-foreground gap-2 px-5 h-12"
      >
        <GraduationCap size={20} />
        <span className="font-medium text-sm">Tutorial</span>
      </Button>
    </div>
  );
};

export default HelpButton;
