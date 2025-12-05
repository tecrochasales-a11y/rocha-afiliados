import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  LogOut, 
  Copy, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  Bell,
  Wallet,
  Menu,
  X,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

// Mock data
const mockAffiliate = {
  name: "João Silva",
  email: "joao@email.com",
  balance: 2850.00,
  pendingBalance: 1200.00,
  referralCode: "JOAO2024",
};

const mockStats = {
  totalLeads: 127,
  convertedLeads: 45,
  pendingLeads: 82,
  totalEarned: 15750.00,
  pendingEarnings: 3200.00,
};

const mockLeads = [
  { id: 1, name: "Maria Santos", product: "Plano de Saúde - Unimed", date: "2024-01-15", status: "converted", value: 350.00 },
  { id: 2, name: "Pedro Oliveira", product: "Seguro de Vida", date: "2024-01-14", status: "pending", value: 280.00 },
  { id: 3, name: "Ana Costa", product: "Plano de Saúde - Bradesco", date: "2024-01-13", status: "converted", value: 420.00 },
  { id: 4, name: "Lucas Lima", product: "Seguro Auto", date: "2024-01-12", status: "lost", value: 0 },
  { id: 5, name: "Carla Ferreira", product: "Plano de Saúde - SulAmérica", date: "2024-01-11", status: "pending", value: 380.00 },
];

const Dashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const referralLink = `https://rochasalesseguros.com.br/ref/${mockAffiliate.referralCode}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link copiado!",
      description: "Seu link de indicação foi copiado para a área de transferência.",
    });
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
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {mockAffiliate.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium">{mockAffiliate.name}</span>
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
                  <DropdownMenuItem className="text-destructive">
                    <Link to="/" className="flex items-center gap-2 w-full">
                      <LogOut className="w-4 h-4" />
                      Sair
                    </Link>
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
                  {mockAffiliate.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-foreground">{mockAffiliate.name}</p>
                  <p className="text-sm text-muted-foreground">{mockAffiliate.email}</p>
                </div>
              </div>
              <Link to="/perfil" className="text-sm font-medium text-foreground py-2" onClick={() => setIsMobileMenuOpen(false)}>
                Meu Perfil
              </Link>
              <Link to="/financeiro" className="text-sm font-medium text-foreground py-2" onClick={() => setIsMobileMenuOpen(false)}>
                Financeiro
              </Link>
              <Link to="/" className="text-sm font-medium text-destructive py-2" onClick={() => setIsMobileMenuOpen(false)}>
                Sair
              </Link>
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
              Olá, {mockAffiliate.name.split(" ")[0]}! 👋
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
                    {referralLink}
                  </span>
                </div>
                <Button onClick={copyReferralLink} variant="hero" className="flex-shrink-0">
                  <Copy className="w-4 h-4" />
                  Copiar Link
                </Button>
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
              <p className="text-2xl font-heading font-bold text-foreground">{mockStats.totalLeads}</p>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Convertidos</p>
              <p className="text-2xl font-heading font-bold text-foreground">{mockStats.convertedLeads}</p>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Recebido</p>
              <p className="text-2xl font-heading font-bold text-foreground">
                R$ {mockStats.totalEarned.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
                R$ {mockStats.pendingEarnings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Balance Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-foreground">Saldo Disponível</h3>
                <Wallet className="w-5 h-5 text-secondary" />
              </div>
              <p className="text-3xl font-heading font-bold text-foreground mb-4">
                R$ {mockAffiliate.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <Button variant="hero" className="w-full">
                Solicitar Saque
              </Button>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-foreground">Saldo Pendente</h3>
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <p className="text-3xl font-heading font-bold text-foreground mb-4">
                R$ {mockAffiliate.pendingBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-muted-foreground">
                Aguardando efetivação dos contratos
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor Previsto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell className="text-muted-foreground">{lead.product}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(lead.date).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {lead.value > 0 
                          ? `R$ ${lead.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                          : "-"
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
