import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Carlos Silva",
    role: "Afiliado desde 2022",
    avatar: "CS",
    content: "Em 6 meses já fiz mais de R$ 15.000 em comissões. O sistema é simples e os pagamentos sempre em dia.",
    stars: 5,
  },
  {
    name: "Ana Rodrigues",
    role: "Afiliada desde 2021",
    avatar: "AR",
    content: "A melhor decisão que tomei foi me tornar afiliada. Consigo uma renda extra indicando para amigos e familiares.",
    stars: 5,
  },
  {
    name: "Pedro Santos",
    role: "Afiliado desde 2023",
    avatar: "PS",
    content: "Dashboard completo, rastreamento preciso e suporte excepcional. Recomendo para quem quer ganhar dinheiro extra.",
    stars: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 md:py-28 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
            Depoimentos
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            O que Nossos Afiliados Dizem
          </h2>
          <p className="text-muted-foreground text-lg">
            Histórias reais de quem já está ganhando com nosso programa
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-card rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 border border-border relative"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 right-8 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <Quote className="w-4 h-4 text-secondary-foreground" />
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
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-heading font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
