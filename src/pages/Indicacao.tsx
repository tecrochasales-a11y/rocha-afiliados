import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FormProgressBar } from "@/components/lead-form/FormProgressBar";
import { DynamicFormStep, FormQuestion, FormOption } from "@/components/lead-form/DynamicFormStep";

const Indicacao = () => {
  const { trackingCode } = useParams<{ trackingCode: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [affiliateName, setAffiliateName] = useState<string | null>(null);
  const [affiliateId, setAffiliateId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!trackingCode) {
        navigate("/");
        return;
      }

      try {
        const [affiliateRes, questionsRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, full_name")
            .eq("tracking_code", trackingCode)
            .single(),
          supabase
            .from("lead_form_questions")
            .select("*")
            .eq("is_active", true)
            .order("display_order", { ascending: true }),
        ]);

        if (affiliateRes.error || !affiliateRes.data) {
          toast({
            title: "Link inválido",
            description: "Este link de indicação não é válido.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        setAffiliateName(affiliateRes.data.full_name);
        setAffiliateId(affiliateRes.data.id);
        
        const formattedQuestions = (questionsRes.data || []).map((q) => ({
          ...q,
          options: (q.options as unknown as FormOption[]) || [],
        })) as FormQuestion[];
        
        setQuestions(formattedQuestions);
      } catch (error) {
        console.error("Error fetching data:", error);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [trackingCode, navigate, toast]);

  const handleChange = (fieldKey: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [fieldKey]: value }));
  };

  const validateCurrentStep = (): boolean => {
    const currentQuestion = questions[currentStep - 1];
    if (!currentQuestion?.is_required) return true;

    const value = formValues[currentQuestion.field_key];
    
    if (currentQuestion.type === "contact") {
      const contact = value as Record<string, string> | undefined;
      if (!contact?.name || !contact?.email) {
        toast({ title: "Preencha nome e email", variant: "destructive" });
        return false;
      }
    } else if (currentQuestion.type === "confirmation") {
      const confirm = value as Record<string, string> | undefined;
      if (confirm?.terms !== "true") {
        toast({ title: "Aceite os termos para continuar", variant: "destructive" });
        return false;
      }
    } else if (currentQuestion.type === "multi_select") {
      if (!Array.isArray(value) || value.length === 0) {
        toast({ title: "Selecione ao menos uma opção", variant: "destructive" });
        return false;
      }
    } else if (!value) {
      toast({ title: "Selecione uma opção", variant: "destructive" });
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < questions.length) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep() || !affiliateId || !affiliateName) return;

    const contactInfo = formValues.contact_info as Record<string, string> | undefined;
    const confirmInfo = formValues.confirmation as Record<string, string> | undefined;

    if (!contactInfo?.name || !contactInfo?.email) {
      toast({ title: "Dados de contato incompletos", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        tracking_code: trackingCode,
        affiliate_id: affiliateId,
        affiliate_name: affiliateName,
        form_responses: formValues,
        contact: {
          name: contactInfo.name,
          email: contactInfo.email,
          phone: contactInfo.phone,
        },
        accepts_whatsapp: confirmInfo?.whatsapp === "true",
      };

      const { data, error } = await supabase.functions.invoke("submit-lead", {
        body: payload,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setIsSubmitted(true);
      toast({ title: "Sucesso!", description: "Seus dados foram enviados." });
    } catch (error: unknown) {
      console.error("Error submitting lead:", error);
      const message = error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Obrigado!</h2>
            <p className="text-muted-foreground mb-6">
              Recebemos seus dados com sucesso. Nossa equipe entrará em contato em breve.
            </p>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao site
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentStep - 1];
  const isLastStep = currentStep === questions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/einstein-background.png')] bg-cover bg-center opacity-10" />
      
      <Card className="w-full max-w-lg relative z-10">
        <CardHeader className="text-center pb-2">
          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="text-xl">Rocha Sales Seguros</CardTitle>
          <CardDescription>
            Indicado por <span className="font-semibold text-primary">{affiliateName}</span>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <FormProgressBar currentStep={currentStep} totalSteps={questions.length} />

          <div className="min-h-[280px]">
            {currentQuestion && (
              <DynamicFormStep
                question={currentQuestion}
                value={formValues[currentQuestion.field_key] as string | string[] | Record<string, string>}
                onChange={handleChange}
                allValues={formValues}
              />
            )}
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            
            {isLastStep ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-primary to-emerald-600"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar"
                )}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Indicacao;
