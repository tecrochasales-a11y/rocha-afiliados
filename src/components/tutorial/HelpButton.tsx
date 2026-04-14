import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import TutorialModal from "./TutorialModal";

const HelpButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setOpen(true)}
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-primary text-primary-foreground gap-2 px-5 h-12"
        >
          <GraduationCap size={20} />
          <span className="font-medium text-sm">Tutorial</span>
        </Button>
      </div>
      <TutorialModal open={open} onOpenChange={setOpen} />
    </>
  );
};

export default HelpButton;
