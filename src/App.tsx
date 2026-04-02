import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import EsqueciSenha from "./pages/EsqueciSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import Perfil from "./pages/Perfil";
import Financeiro from "./pages/Financeiro";
import Notificacoes from "./pages/Notificacoes";
import Termos from "./pages/Termos";
import Privacidade from "./pages/Privacidade";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAfiliados from "./pages/admin/AdminAfiliados";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminComissoes from "./pages/admin/AdminComissoes";
import AdminSaques from "./pages/admin/AdminSaques";
import AdminPDV from "./pages/admin/AdminPDV";
import AdminCampanhas from "./pages/admin/AdminCampanhas";
import AdminAssets from "./pages/admin/AdminAssets";
import AdminRelatorios from "./pages/admin/AdminRelatorios";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminConteudo from "./pages/admin/AdminConteudo";
import AdminFormulario from "./pages/admin/AdminFormulario";
import AdminIntegracoes from "./pages/admin/AdminIntegracoes";
import AdminStatusPagamento from "./pages/admin/AdminStatusPagamento";
import GestorDashboard from "./pages/gestor/GestorDashboard";
import GestorAfiliados from "./pages/gestor/GestorAfiliados";
import GestorLeads from "./pages/gestor/GestorLeads";
import Indicacao from "./pages/Indicacao";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/esqueci-senha" element={<EsqueciSenha />} />
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />
            <Route path="/termos" element={<Termos />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/ref/:trackingCode" element={<Indicacao />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/perfil" 
              element={
                <ProtectedRoute>
                  <Perfil />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/financeiro" 
              element={
                <ProtectedRoute>
                  <Financeiro />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notificacoes" 
              element={
                <ProtectedRoute>
                  <Notificacoes />
                </ProtectedRoute>
              } 
            />
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/afiliados" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminAfiliados />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/leads" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLeads />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/formulario" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminFormulario />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/comissoes" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminComissoes />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/saques" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminSaques />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/pdv" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminPDV />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/campanhas" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminCampanhas />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/assets" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminAssets />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/relatorios" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminRelatorios />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/usuarios" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminUsuarios />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/depoimentos" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminTestimonials />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/conteudo" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminConteudo />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/integracoes" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminIntegracoes />
                </ProtectedRoute>
              } 
            />
            {/* Gestor Routes */}
            <Route 
              path="/gestor" 
              element={
                <ProtectedRoute requireGestor>
                  <GestorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gestor/afiliados" 
              element={
                <ProtectedRoute requireGestor>
                  <GestorAfiliados />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/gestor/leads" 
              element={
                <ProtectedRoute requireGestor>
                  <GestorLeads />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
