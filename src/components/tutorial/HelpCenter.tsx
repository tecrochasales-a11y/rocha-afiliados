import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, GraduationCap } from "lucide-react";
import TutorialExplorer from "./TutorialExplorer";

const HelpCenter = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <GraduationCap size={22} className="text-primary" />
              <h1 className="text-xl font-bold text-foreground">Tutorial — Central de Ajuda</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-8">Aprenda a usar cada funcionalidade da plataforma</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        {/* Search */}
        <div className="relative animate-fade-in">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por palavra-chave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {/* Content */}
        <TutorialExplorer searchQuery={searchQuery} />
      </main>
    </div>
  );
};

export default HelpCenter;
