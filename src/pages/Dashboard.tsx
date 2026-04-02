import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  LogOut, 
  Copy, 
  Users, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  Wallet,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import NotificationBell from "@/components/NotificationBell";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  payment_status: string | null;
  sale_value: number | null;
  created_at: string;
  product_id: string | null;
}

interface Stats {
  totalLeads: number;
  convertedLeads: number;
  pendingLeads: number;
  totalEarned: number;
  pendingEarnings: number;
}

const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    convertedLeads: 0,
    pendingLeads: 0,
    totalEarned: 0,
    pendingEarnings: 0,
  });
  const [balance, setBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [commissionPct, setCommissionPct] = useState(30);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile, signOut, isLoading } = useAuth();

  const referralLink = profile?.tracking_code 
    ? `${window.location.origin}/ref/${profile.tracking_code}`
    : "";

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user, isLoading, navigate]);

  const fetchDashboardData = async () => {
    if (!user) return;

    setIsLoadingData(true);

    try {
      // Fetch commission percentage
      const { data: settingsData } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "commission_percentage")
        .maybeSingle();
      if (settingsData?.value) setCommissionPct(Number(settingsData.value));
      // Fetch leads
      const { data: leadsData, error: leadsError } = await supabase
        .from("leads")
        .select("*")
        .eq("affiliate_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (leadsError) {
        console.error("Error fetching leads:", leadsError);
      } else {
        setLeads(leadsData || []);
      }

      // Calculate stats
      const { data: allLeads } = await supabase
        .from("leads")
        .select("status, sale_value")
        .eq("affiliate_id", user.id);

      if (allLeads) {
        const totalLeads = allLeads.length;
        const convertedLeads = allLeads.filter(l => l.status === "converted").length;
        const pendingLeads = allLeads.filter(l => l.status === "pending").length;

        setStats({
          totalLeads,
          convertedLeads,
          pendingLeads,
          totalEarned: 0,
          pendingEarnings: 0,
        });
      }

      // Fetch commissions
      const { data: commissionsData } = await supabase
        .from("commissions")
        .select("amount, status")
        .eq("affiliate_id", user.id);

      if (commissionsData) {
        const paidCommissions = commissionsData
          .filter(c => c.status === "paid")
          .reduce((sum, c) => sum + Number(c.amount), 0);
        
        const pendingCommissions = commissionsData
          .filter(c => c.status === "pending")
          .reduce((sum, c) => sum + Number(c.amount), 0);

        setStats(prev => ({
          ...prev,
          totalEarned: paidCommissions,
          pendingEarnings: pendingCommissions,
        }));
      }

      // Fetch balance (paid commissions - paid withdrawals)
      const { data: withdrawalsData } = await supabase
        .from("withdrawals")
        .select("amount, status")
        .eq("affiliate_id", user.id);

      if (commissionsData && withdrawalsData) {
        const totalPaidCommissions = commissionsData
          .filter(c => c.status === "paid")
          .reduce((sum, c) => sum + Number(c.amount), 0);
        
        const totalPaidWithdrawals = withdrawalsData
          .filter(w => w.status === "paid")
          .reduce((sum, w) => sum + Number(w.amount), 0);

        const pendingWithdrawals = withdrawalsData
          .filter(w => w.status === "pending")
          .reduce((sum, w) => sum + Number(w.amount), 0);

        setBalance(totalPaidCommissions - totalPaidWithdrawals - pendingWithdrawals);
        
        const pendingCommissions = commissionsData
          .filter(c => c.status === "pending")
          .reduce((sum, c) => sum + Number(c.amount), 0);
        setPendingBalance(pendingCommissions);
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const copyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast({
        title: "Link copiado!",
        description: "Seu link de indicação foi copiado para a área de transferência.",
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "converted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
            <CheckCircle className="w-3 h-3" />
            Convertido
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
            <Clock className="w-3 h-3" />
            Pendente
          </span>
        );
      case "contacted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            <Clock className="w-3 h-3" />
            Contatado
          </span>
        );
      case "qualified":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
            <CheckCircle className="w-3 h-3" />
            Qualificado
          </span>
        );
      case "lost":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
            <XCircle className="w-3 h-3" />
            Não convertido
          </span>
        );
      default:
        return null;
    }
  };

  const getProjectedCommissionDisplay = (lead: Lead) => {
    if (!lead.sale_value) {
      return <span className="text-muted-foreground">-</span>;
    }

    if (lead.status === "lost" || lead.payment_status === "cancelled") {
      return <span className="text-destructive">Cancelada</span>;
    }

    if (lead.status !== "converted") {
      return <span className="text-muted-foreground">-</span>;
    }

    return `R$ ${(Number(lead.sale_value) * commissionPct / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const displayName = profile?.full_name || user?.email || "Afiliado";
  const firstName = displayName.split(" ")[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-lg text-foreground hidden sm:block">
                Rocha Sales
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-4">
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {firstName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{displayName}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Link to="/perfil" className="flex items-center gap-2 w-full">
                      Meu Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/financeiro" className="flex items-center gap-2 w-full">
                      Financeiro
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-foreground"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-card border-b border-border animate-slide-up">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {firstName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-foreground">{displayName}</p>
                  <p className="text-sm text-muted-foreground">{profile?.email || user?.email}</p>
                </div>
              </div>
              <Link to="/perfil" className="text-sm font-medium text-foreground py-2" onClick={() => setIsMobileMenuOpen(false)}>
                Meu Perfil
              </Link>
              <Link to="/financeiro" className="text-sm font-medium text-foreground py-2" onClick={() => setIsMobileMenuOpen(false)}>
                Financeiro
              </Link>
              <button onClick={handleLogout} className="text-sm font-medium text-destructive py-2 text-left">
                Sair
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
              Olá, {firstName}! 👋
            </h1>
            <p className="text-muted-foreground">
              Acompanhe suas indicações e ganhos em tempo real
            </p>
          </div>

          {/* Referral Link Card */}
          <div className="bg-gradient-hero rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="font-heading text-lg font-semibold text-primary-foreground mb-2">
                Seu Link de Indicação
              </h2>
              <p className="text-primary-foreground/70 text-sm mb-4">
                Compartilhe este link para ganhar comissões por cada venda
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 bg-primary-foreground/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3">
                  <ExternalLink className="w-5 h-5 text-primary-foreground/70 flex-shrink-0" />
                  <span className="text-primary-foreground text-sm truncate">
                    {referralLink || "Gerando link..."}
                  </span>
                </div>
                <Button onClick={copyReferralLink} variant="hero" className="flex-shrink-0" disabled={!referralLink}>
                  <Copy className="w-4 h-4" />
                  Copiar Link
                </Button>
                {referralLink && (
                  <QRCodeGenerator referralLink={referralLink} affiliateName={profile?.full_name} />
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total de Leads</p>
              <p className="text-2xl font-heading font-bold text-foreground">{stats.totalLeads}</p>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Convertidos</p>
              <p className="text-2xl font-heading font-bold text-foreground">{stats.convertedLeads}</p>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Recebido</p>
              <p className="text-2xl font-heading font-bold text-foreground">
                R$ {stats.totalEarned.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">A Receber</p>
              <p className="text-2xl font-heading font-bold text-foreground">
                R$ {stats.pendingEarnings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Balance Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-foreground">Total Recebido</h3>
                <Wallet className="w-5 h-5 text-secondary" />
              </div>
              <p className="text-3xl font-heading font-bold text-foreground mb-4">
                R$ {stats.totalEarned.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">
                Comissões já pagas
              </p>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-foreground">A Receber</h3>
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <p className="text-3xl font-heading font-bold text-foreground mb-4">
                R$ {pendingBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">
                O pagamento é feito automaticamente via PIX
              </p>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="font-heading font-semibold text-lg text-foreground">
                Últimas Indicações
              </h3>
            </div>
            <div className="overflow-x-auto">
              {leads.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Você ainda não tem indicações.</p>
                  <p className="text-sm mt-2">Compartilhe seu link para começar a ganhar!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead className="text-right">Comissão Prevista</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell className="text-muted-foreground">{lead.email}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>{getStatusBadge(lead.status)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {getProjectedCommissionDisplay(lead)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
