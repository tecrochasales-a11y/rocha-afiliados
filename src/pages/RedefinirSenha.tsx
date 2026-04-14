import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, ArrowLeft, Loader2, CheckCircle, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const passwordSchema = z.object({
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

const RedefinirSenha = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event, session);
      
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
        setError(null);
      } else if (event === "SIGNED_IN" && session) {
        // User is signed in, they can update password
        setIsValidSession(true);
        setError(null);
      }
    });

    // Check if we have a valid recovery session
    const checkSession = async () => {
      // Check URL for error parameters first
      const urlParams = new URLSearchParams(window.location.search);
      const errorCode = urlParams.get("error_code");
      const errorDescription = urlParams.get("error_description");
      
      if (errorCode || errorDescription) {
        setError(decodeURIComponent(errorDescription || "Link de recuperação inválido ou expirado."));
        setIsValidSession(false);
        return;
      }

      // Check URL for recovery token (Supabase adds #access_token=... to URL)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const type = hashParams.get("type");
      const refreshToken = hashParams.get("refresh_token");
      
      if (type === "recovery" && accessToken && refreshToken) {
        try {
          // Set the session with the recovery token
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (sessionError) {
            console.error("Session error:", sessionError);
            setError("Link de recuperação inválido ou expirado. Solicite um novo link.");
            setIsValidSession(false);
          } else {
            setIsValidSession(true);
          }
        } catch (err) {
          console.error("Error setting session:", err);
          setError("Link de recuperação inválido ou expirado. Solicite um novo link.");
          setIsValidSession(false);
        }
      } else {
        // Check if user already has a valid session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setIsValidSession(true);
        } else {
          // No session and no tokens - show error
          setError("Link de recuperação inválido ou expirado. Solicite um novo link.");
          setIsValidSession(false);
        }
      }
    };
    
    // Small delay to allow auth state to be processed
    const timer = setTimeout(checkSession, 100);
    
    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = passwordSchema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      toast({
        title: "Erro de validação",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast({
        title: "Senha redefinida!",
        description: "Sua senha foi alterada com sucesso.",
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast({
        title: "Erro ao redefinir senha",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 animate-gradient-shift" style={{ backgroundSize: "200% 200%" }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float-slow" style={{ animationDelay: "4s" }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <Link 
          to="/login" 
          className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar ao login</span>
        </Link>

        {/* Card */}
        <div className="bg-card rounded-3xl shadow-medium p-8 md:p-10 glass-card">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-hero rounded-2xl flex items-center justify-center shadow-soft mb-4">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Redefinir Senha
            </h1>
            <p className="text-muted-foreground text-sm mt-1 text-center">
              {isValidSession ? "Digite sua nova senha" : "Houve um problema"}
            </p>
          </div>

          {error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-2">
                Link inválido
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                {error}
              </p>
              <Link to="/esqueci-senha">
                <Button variant="default" className="w-full">
                  Solicitar novo link
                </Button>
              </Link>
            </div>
          ) : isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-secondary" />
              </div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-2">
                Senha redefinida!
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Você será redirecionado para a página de login.
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Ir para login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Nova Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-muted/50 border-border focus:border-primary"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-muted/50 border-border focus:border-primary"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Redefinindo...
                  </>
                ) : (
                  "Redefinir Senha"
                )}
              </Button>
            </form>
          )}

          {/* Login Link */}
          {!isSuccess && !error && (
            <p className="text-center text-sm text-muted-foreground mt-8">
              Lembrou a senha?{" "}
              <Link 
                to="/login" 
                className="text-secondary font-semibold hover:text-secondary/80 transition-colors"
              >
                Faça login
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RedefinirSenha;
