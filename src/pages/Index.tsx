import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import ValuePropositionSection from "@/components/landing/ValuePropositionSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import StatsSection from "@/components/landing/StatsSection";
import ProductsSection from "@/components/landing/ProductsSection";
import ResultsSection from "@/components/landing/ResultsSection";
import SuccessStoriesSection from "@/components/landing/SuccessStoriesSection";
import TrustSection from "@/components/landing/TrustSection";
import CTASection from "@/components/landing/CTASection";
import FAQSection from "@/components/landing/FAQSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ValuePropositionSection />
        <HowItWorksSection />
        <BenefitsSection />
        <StatsSection />
        <ProductsSection />
        <ResultsSection />
        <SuccessStoriesSection />
        <TrustSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
