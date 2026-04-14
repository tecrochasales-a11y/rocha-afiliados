import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import localLogo from "@/assets/rocha-sales-logo.png";
import { useState, useEffect } from "react";

// Scroll detection hook
const useScrollDetection = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return isScrolled;
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isScrolled = useScrollDetection();
  const location = useLocation();
  const navigate = useNavigate();

  const isLandingPage = location.pathname === "/";

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false);
    
    if (!isLandingPage) {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const scrollToTop = () => {
    setIsMenuOpen(false);
    if (!isLandingPage) {
      navigate("/");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-black/60 before:to-transparent before:pointer-events-none ${
      isScrolled 
        ? "bg-black/50 backdrop-blur-xl" 
        : ""
    }`}>
      <div className="container mx-auto px-4 relative z-10">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          isScrolled ? "h-16 md:h-18" : "h-20 md:h-24"
        }`}>
          {/* Logo */}
          <button onClick={scrollToTop} className="flex items-center group cursor-pointer">
            <img 
              src={localLogo} 
              alt="Rocha Sales Seguros" 
              className={`w-auto object-contain transition-all duration-300 ${isScrolled ? "h-10 md:h-12" : "h-14 md:h-16"}`}
            />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection("como-funciona")}
              className="text-sm font-medium text-white/90 hover:text-white transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              Como Funciona
            </button>
            <button 
              onClick={() => scrollToSection("beneficios")}
              className="text-sm font-medium text-white/90 hover:text-white transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              Benefícios
            </button>
            <button 
              onClick={() => scrollToSection("produtos")}
              className="text-sm font-medium text-white/90 hover:text-white transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              Produtos
            </button>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-white hover:text-white hover:bg-white/10">
                Entrar
              </Button>
            </Link>
            <Link to="/cadastro">
              <Button variant="hero" size="sm">
                Quero ser Afiliado
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/90 backdrop-blur-xl border-b border-white/10 animate-slide-up">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <button 
              onClick={() => scrollToSection("como-funciona")}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors py-2 text-left"
            >
              Como Funciona
            </button>
            <button 
              onClick={() => scrollToSection("beneficios")}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors py-2 text-left"
            >
              Benefícios
            </button>
            <button 
              onClick={() => scrollToSection("produtos")}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors py-2 text-left"
            >
              Produtos
            </button>
            <hr className="border-white/10" />
            <div className="flex flex-col gap-3">
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10">
                  Entrar
                </Button>
              </Link>
              <Link to="/cadastro" onClick={() => setIsMenuOpen(false)}>
                <Button variant="hero" className="w-full">
                  Quero ser Afiliado
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
