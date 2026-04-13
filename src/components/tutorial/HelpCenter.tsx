import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, BookOpen, LayoutGrid, Columns } from "lucide-react";
import { tutorialTopics, tutorialCategories } from "@/data/tutorialData";
import TutorialCard from "./TutorialCard";
import TutorialExplorer from "./TutorialExplorer";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const HelpCenter = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"explore" | "cards">("explore");

  const filteredTopics = useMemo(() => {
    return tutorialTopics.filter((topic) => {
      const matchesCategory = activeCategory === "all" || topic.category === activeCategory;
      if (!searchQuery.trim()) return matchesCategory;

      const query = searchQuery.toLowerCase();
      const matchesSearch =
        topic.title.toLowerCase().includes(query) ||
        topic.description.toLowerCase().includes(query) ||
        topic.howToUse.toLowerCase().includes(query) ||
        topic.tips.some((t) => t.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <BookOpen size={22} className="text-primary" />
            <h1 className="text-xl font-bold text-foreground">Central de Ajuda</h1>
          </div>
          {/* View mode toggle */}
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("explore")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === "explore" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              title="Modo explorar"
            >
              <Columns size={18} />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === "cards" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              title="Modo cards"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
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

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 animate-fade-in" style={{ animationDelay: "80ms", animationFillMode: "both" }}>
          {tutorialCategories.map((cat) => (
            <Badge
              key={cat.key}
              variant={activeCategory === cat.key ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-all duration-200 px-3 py-1.5 text-sm",
                activeCategory === cat.key
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
              onClick={() => setActiveCategory(cat.key)}
            >
              {cat.label}
            </Badge>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          {filteredTopics.length} {filteredTopics.length === 1 ? "tópico encontrado" : "tópicos encontrados"}
        </p>

        {/* Content */}
        {viewMode === "explore" ? (
          <TutorialExplorer activeCategory={activeCategory} searchQuery={searchQuery} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {filteredTopics.map((topic, index) => (
              <TutorialCard key={topic.id} topic={topic} index={index} />
            ))}
          </div>
        )}

        {filteredTopics.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <Search size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Nenhum tópico encontrado para sua busca.</p>
            <Button
              variant="link"
              onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
              className="mt-2"
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default HelpCenter;
