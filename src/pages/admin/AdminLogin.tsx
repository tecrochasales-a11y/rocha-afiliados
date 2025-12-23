import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Eye, EyeOff, Mail, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido").trim(),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, user, isAdmin, isLoading: authLoading } = useAuth();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate("/admin");
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate input
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        title: "Erro de validação",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const { error } = await signIn(email, password);

    if (error) {
      let errorMessage = "Erro ao fazer login. Tente novamente.";
      
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "E-mail ou senha incorretos.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Confirme seu e-mail antes de fazer login.";
      }
      
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Wait a moment for auth state to update, then check admin status
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  // Handle redirect after login when admin status is confirmed
  useEffect(() => {
    if (!authLoading && user) {
      if (isAdmin) {
        toast({
          title: "Bem-vindo, Administrador!",
          description: "Acesso à área administrativa concedido.",
        });
        navigate("/admin");
      } else if (!isLoading) {
        // User is logged in but not admin
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão de administrador.",
          variant: "destructive",
        });
      }
    }
  }, [user, isAdmin, authLoading, isLoading, navigate, toast]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-600 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar ao site</span>
        </Link>

        {/* Card */}
        <div className="bg-slate-800/80 backdrop-blur-lg border border-slate-700 rounded-3xl shadow-2xl p-8 md:p-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4">
              <ShieldCheck className="w-8 h-8 text-slate-900" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-white">
              Painel Administrativo
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Acesso restrito a administradores
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 font-medium">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500/20"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300 font-medium">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-amber-500 focus:ring-amber-500/20"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold shadow-lg shadow-amber-500/30"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Verificando...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Acessar Painel
                </>
              )}
            </Button>
          </form>

          {/* Info */}
          <div className="mt-8 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400 text-center">
              Esta área é restrita a administradores autorizados. 
              Tentativas de acesso não autorizado são registradas.
            </p>
          </div>

          {/* Affiliate Link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            É um afiliado?{" "}
            <Link 
              to="/login" 
              className="text-amber-500 font-semibold hover:text-amber-400 transition-colors"
            >
              Acesse a área de afiliados
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
