import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como funciona o programa de afiliados?",
    answer: "Você se cadastra gratuitamente, recebe um link exclusivo de indicação e compartilha com sua rede. Quando alguém contrata um plano ou seguro através do seu link, você recebe uma comissão.",
  },
  {
    question: "Quanto posso ganhar como afiliado?",
    answer: "As comissões variam de 15% a 30% dependendo do produto. Em média, nossos afiliados ganham de R$ 200 a R$ 500 por venda. Alguns afiliados top ganham mais de R$ 5.000 por mês.",
  },
  {
    question: "Preciso ter experiência com vendas?",
    answer: "Não! Qualquer pessoa pode ser afiliado. Oferecemos materiais de apoio e treinamento para ajudar você a ter sucesso mesmo sem experiência prévia.",
  },
  {
    question: "Como recebo minhas comissões?",
    answer: "As comissões são pagas via PIX assim que o contrato do cliente é efetivado. O prazo varia de 7 a 30 dias dependendo do produto.",
  },
  {
    question: "Existe alguma taxa para participar?",
    answer: "Não! O cadastro é 100% gratuito e não há nenhuma taxa de adesão ou mensalidade. Você só ganha, nunca paga.",
  },
  {
    question: "Posso indicar para qualquer lugar do Brasil?",
    answer: "Sim! Trabalhamos com operadoras que atendem todo o território nacional. Você pode indicar pessoas de qualquer estado.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-20 md:py-28 bg-muted/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Tire suas Dúvidas
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-muted-foreground text-lg">
            Respostas para as dúvidas mais comuns sobre o programa de afiliados
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card rounded-xl border border-border px-6 data-[state=open]:shadow-soft transition-all duration-300"
              >
                <AccordionTrigger className="text-left font-heading font-semibold text-foreground hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
