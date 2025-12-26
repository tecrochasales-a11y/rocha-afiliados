import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <Button
      onClick={scrollToTop}
      variant="secondary"
      size="icon"
      className="fixed bottom-6 right-6 z-50 rounded-full shadow-medium hover:shadow-glow transition-all duration-300 animate-fade-in"
      aria-label="Voltar ao topo"
    >
      <ChevronUp className="h-5 w-5" />
    </Button>
  );
};

export default BackToTop;