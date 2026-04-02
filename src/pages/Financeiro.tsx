import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Loader2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Wallet,
  Calendar,
  CalendarClock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/useSiteContent";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Commission {
  id: string;
  amount: number;
  percentage: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  installment_number: number | null;
  total_installments: number | null;
  due_date: string | null;
  base_sale_value: number | null;
  lead_id: string | null;
  lead_payment_status?: string | null;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  pix_key: string;
  requested_at: string;
  processed_at: string | null;
  notes: string | null;
}

const Financeiro = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({
    totalEarned: 0,
    pendingEarnings: 0,
    scheduledEarnings: 0,
    totalWithdrawn: 0,
    availableBalance: 0,
  });
  
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { content: commissionContent } = useSiteContent("commission_info");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      fetchFinancialData();
    }
  }, [user, authLoading, navigate]);

  const fetchFinancialData = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Fetch commissions
      const { data: commissionsData, error: commissionsError } = await supabase
        .from("commissions")
        .select("*, leads:lead_id(payment_status)")
        .eq("affiliate_id", user.id)
        .order("created_at", { ascending: false });

      if (commissionsError) {
        console.error("Error fetching commissions:", commissionsError);
      } else {
        const mapped = (commissionsData || []).map((c: any) => ({
          ...c,
          lead_payment_status: c.leads?.payment_status || null,
        }));
        setCommissions(mapped);
      }

      // Fetch withdrawals
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("affiliate_id", user.id)
        .order("requested_at", { ascending: false });

      if (withdrawalsError) {
        console.error("Error fetching withdrawals:", withdrawalsError);
      } else {
        setWithdrawals(withdrawalsData || []);
      }

      // Calculate stats
      if (commissionsData && withdrawalsData) {
        const paidCommissions = commissionsData
          .filter(c => c.status === "paid")
          .reduce((sum, c) => sum + Number(c.amount), 0);
        
        const pendingCommissions = commissionsData
          .filter(c => c.status === "pending")
          .reduce((sum, c) => sum + Number(c.amount), 0);

        const scheduledCommissions = commissionsData
          .filter(c => c.status === "scheduled")
          .reduce((sum, c) => sum + Number(c.amount), 0);

        const paidWithdrawals = withdrawalsData
          .filter(w => w.status === "paid")
          .reduce((sum, w) => sum + Number(w.amount), 0);

        const pendingWithdrawals = withdrawalsData
          .filter(w => w.status === "pending")
          .reduce((sum, w) => sum + Number(w.amount), 0);

        setStats({
          totalEarned: paidCommissions,
          pendingEarnings: pendingCommissions,
          scheduledEarnings: scheduledCommissions,
          totalWithdrawn: paidWithdrawals,
          availableBalance: paidCommissions - paidWithdrawals - pendingWithdrawals,
        });
      }

    } catch (error) {
      console.error("Error fetching financial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCommissionStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
            <CheckCircle className="w-3 h-3" />
            Pago
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
            <Clock className="w-3 h-3" />
            Pendente
          </span>
        );
      case "scheduled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
            <CalendarClock className="w-3 h-3" />
            Agendado
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
            <XCircle className="w-3 h-3" />
            Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  const getWithdrawalStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
            <CheckCircle className="w-3 h-3" />
            Pago
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
            <CheckCircle className="w-3 h-3" />
            Aprovado
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
            <Clock className="w-3 h-3" />
            Pendente
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
            <XCircle className="w-3 h-3" />
            Rejeitado
          </span>
        );
      default:
        return null;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Voltar ao dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <div className="container mx-auto px-4">
          {/* Title */}
          <div className="mb-8">
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
              Financeiro
            </h1>
            <p className="text-muted-foreground">
              Acompanhe suas comissões e saques
            </p>
          </div>

          {commissionContent.length > 0 && commissionContent[0].is_active && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{commissionContent[0].title || "Sistema de Comissões"}</p>
                  <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: commissionContent[0].description || "" }} />
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Recebido</p>
              <p className="text-2xl font-heading font-bold text-foreground">
                R$ {stats.totalEarned.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Pendente</p>
              <p className="text-2xl font-heading font-bold text-foreground">
                R$ {stats.pendingEarnings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <CalendarClock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Agendado</p>
              <p className="text-2xl font-heading font-bold text-foreground">
                R$ {stats.scheduledEarnings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-soft">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Sacado</p>
              <p className="text-2xl font-heading font-bold text-foreground">
                R$ {stats.totalWithdrawn.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-soft col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Saldo Disponível</p>
              <p className="text-2xl font-heading font-bold text-foreground">
                R$ {stats.availableBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="commissions">Comissões</SelectItem>
                <SelectItem value="withdrawals">Saques</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Commissions Table */}
          {(filter === "all" || filter === "commissions") && (
            <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden mb-8">
              <div className="p-6 border-b border-border flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-secondary" />
                <h3 className="font-heading font-semibold text-lg text-foreground">
                  Comissões
                </h3>
              </div>
              <div className="overflow-x-auto">
                {commissions.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Você ainda não tem comissões.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                         <TableHead>Data</TableHead>
                         <TableHead>Parcela</TableHead>
                         <TableHead>Valor</TableHead>
                         <TableHead>Percentual</TableHead>
                         <TableHead>Status</TableHead>
                         <TableHead>Pagamento Cliente</TableHead>
                         <TableHead>Vencimento</TableHead>
                         <TableHead>Data Pagamento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissions.map((commission) => (
                        <TableRow key={commission.id}>
                          <TableCell className="text-muted-foreground">
                            {new Date(commission.created_at).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell>
                            {commission.total_installments && commission.total_installments > 1 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-xs font-medium">
                                {commission.installment_number}/{commission.total_installments}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            R$ {Number(commission.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {Number(commission.percentage).toFixed(1)}%
                          </TableCell>
                          <TableCell>{getCommissionStatusBadge(commission.status)}</TableCell>
                          <TableCell>
                            {commission.lead_payment_status === "pago" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                                <CheckCircle className="w-3 h-3" />
                                Pago
                              </span>
                            ) : commission.lead_payment_status === "cancelado" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                                <XCircle className="w-3 h-3" />
                                Cancelado
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                                <Clock className="w-3 h-3" />
                                Aguardando
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {commission.due_date 
                              ? new Date(commission.due_date).toLocaleDateString("pt-BR")
                              : "-"
                            }
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {commission.paid_at 
                              ? new Date(commission.paid_at).toLocaleDateString("pt-BR")
                              : "-"
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}

          {/* Withdrawals Table */}
          {(filter === "all" || filter === "withdrawals") && (
            <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
              <div className="p-6 border-b border-border flex items-center gap-3">
                <Wallet className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-semibold text-lg text-foreground">
                  Saques
                </h3>
              </div>
              <div className="overflow-x-auto">
                {withdrawals.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Você ainda não fez nenhum saque.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data Solicitação</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Chave PIX</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data Processamento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.map((withdrawal) => (
                        <TableRow key={withdrawal.id}>
                          <TableCell className="text-muted-foreground">
                            {new Date(withdrawal.requested_at).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell className="font-medium">
                            R$ {Number(withdrawal.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {withdrawal.pix_key}
                          </TableCell>
                          <TableCell>{getWithdrawalStatusBadge(withdrawal.status)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {withdrawal.processed_at 
                              ? new Date(withdrawal.processed_at).toLocaleDateString("pt-BR")
                              : "-"
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Financeiro;