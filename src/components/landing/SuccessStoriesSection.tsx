import { Star, Play, Quote, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar_initials: string | null;
  avatar_url: string | null;
  content: string;
  earnings: string;
  period: string;
  stars: number;
  video_url: string | null;
  display_order: number;
}

const SuccessStoriesSection = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const videoTestimonials = testimonials.filter(t => t.video_url);
  const featuredTestimonials = testimonials.slice(0, 3);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (isLoading) {
    return (
      <section className="py-20 md:py-28 bg-muted/50">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-28 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
            Casos de Sucesso
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Afiliados que Transformaram Indicações em{" "}
            <span className="text-gradient-gold bg-gradient-gold bg-clip-text text-transparent">
              Renda Real
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Conheça histórias reais de pessoas como você que já estão ganhando com nosso programa
          </p>
        </div>

        {/* Video Testimonials Row */}
        {videoTestimonials.length > 0 && (
          <div className="mb-16">
            <h3 className="font-heading text-xl font-semibold text-foreground mb-6 text-center">
              Depoimentos em Vídeo
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {videoTestimonials.map((testimonial) => (
                <div 
                  key={testimonial.id}
                  className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 border border-border group"
                >
                  {/* Video Thumbnail */}
                  <div 
                    className="relative aspect-video bg-muted cursor-pointer overflow-hidden"
                    onClick={() => setActiveVideo(testimonial.video_url)}
                  >
                    {activeVideo === testimonial.video_url ? (
                      <iframe
                        src={`${testimonial.video_url}?autoplay=1`}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                            <Play className="w-7 h-7 text-secondary-foreground ml-1" />
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-primary-foreground font-semibold">{testimonial.name}</p>
                          <p className="text-primary-foreground/70 text-sm">{testimonial.role}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(testimonial.stars)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                        ))}
                      </div>
                      <div className="text-right">
                        <p className="font-heading font-bold text-secondary">{testimonial.earnings}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.period}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Written Testimonials - Featured */}
        {featuredTestimonials.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {featuredTestimonials.map((testimonial) => (
              <div 
                key={testimonial.id}
                className="bg-card rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 border border-border relative group"
              >
                {/* Quote Icon */}
                <div className="absolute -top-4 right-8 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <Quote className="w-4 h-4 text-secondary-foreground" />
                </div>

                {/* Earnings Badge */}
                <div className="absolute top-4 right-4 bg-secondary/10 px-3 py-1 rounded-full">
                  <span className="text-sm font-bold text-secondary">{testimonial.earnings}</span>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  {testimonial.avatar_url ? (
                    <img 
                      src={testimonial.avatar_url} 
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold text-lg">
                      {testimonial.avatar_initials || testimonial.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-heading font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                    <p className="text-xs text-secondary font-medium">
                      {testimonial.earnings} {testimonial.period}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Carousel for More Testimonials */}
        {testimonials.length > 0 && (
          <div className="bg-card rounded-2xl p-8 shadow-soft border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-xl font-semibold text-foreground">
                Mais Depoimentos
              </h3>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={prevSlide}
                  className="rounded-full"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={nextSlide}
                  className="rounded-full"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {testimonials[currentIndex]?.avatar_url ? (
                <img 
                  src={testimonials[currentIndex].avatar_url} 
                  alt={testimonials[currentIndex].name}
                  className="w-16 h-16 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold text-xl shrink-0">
                  {testimonials[currentIndex]?.avatar_initials || testimonials[currentIndex]?.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-heading font-semibold text-foreground">
                    {testimonials[currentIndex]?.name}
                  </p>
                  <span className="text-muted-foreground">•</span>
                  <p className="text-sm text-muted-foreground">
                    {testimonials[currentIndex]?.role}
                  </p>
                </div>
                <p className="text-foreground leading-relaxed mb-2">
                  "{testimonials[currentIndex]?.content}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(testimonials[currentIndex]?.stars || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <span className="font-bold text-secondary">
                    {testimonials[currentIndex]?.earnings} {testimonials[currentIndex]?.period}
                  </span>
                </div>
              </div>
            </div>

            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? "w-6 bg-secondary" 
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SuccessStoriesSection;
