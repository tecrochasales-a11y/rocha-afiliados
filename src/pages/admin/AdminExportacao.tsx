import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, Database, FileJson, FileSpreadsheet, FileCode } from "lucide-react";

const TABLES = [
  "profiles",
  "user_roles",
  "leads",
  "lead_form_questions",
  "commissions",
  "transactions",
  "withdrawals",
  "payment_statuses",
  "pdv",
  "campaigns",
  "products",
  "notifications",
  "testimonials",
  "site_content",
  "site_assets",
  "banner_templates",
  "app_settings",
] as const;

type TableName = (typeof TABLES)[number];
type Row = Record<string, unknown>;

const PAGE_SIZE = 1000;

const downloadBlob = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const toCsv = (rows: Row[]) => {
  if (rows.length === 0) return "";
  const columns = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const escape = (value: unknown) => {
    if (value === null || value === undefined) return "";
    const raw = typeof value === "object" ? JSON.stringify(value) : String(value);
    return `"${raw.replace(/"/g, '""')}"`;
  };
  return [
    columns.join(","),
    ...rows.map((row) => columns.map((c) => escape(row[c])).join(",")),
  ].join("\n");
};

const sqlValue = (value: unknown) => {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  const raw = typeof value === "object" ? JSON.stringify(value) : String(value);
  return `'${raw.replace(/'/g, "''")}'`;
};

const toSql = (table: string, rows: Row[]) => {
  if (rows.length === 0) return `-- ${table}: sem registros\n`;
  const columns = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const lines = rows.map(
    (row) =>
      `INSERT INTO public.${table} (${columns.map((c) => `"${c}"`).join(", ")}) VALUES (${columns
        .map((c) => sqlValue(row[c]))
        .join(", ")}) ON CONFLICT DO NOTHING;`
  );
  return `-- ${table} (${rows.length} registros)\n${lines.join("\n")}\n`;
};

const AdminExportacao = () => {
  const { toast } = useToast();
  const [selected, setSelected] = useState<TableName[]>([...TABLES]);
  const [isWorking, setIsWorking] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [counts, setCounts] = useState<Record<string, number>>({});

  const toggle = (table: TableName) => {
    setSelected((prev) =>
      prev.includes(table) ? prev.filter((t) => t !== table) : [...prev, table]
    );
  };

  const fetchTable = async (table: TableName): Promise<Row[]> => {
    const all: Row[] = [];
    let from = 0;
    // paginated fetch to avoid row limits
    while (true) {
      const { data, error } = await supabase
        .from(table as never)
        .select("*")
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw new Error(`${table}: ${error.message}`);
      const page = (data ?? []) as Row[];
      all.push(...page);
      if (page.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }
    return all;
  };

  const fetchAll = async () => {
    const result: Record<string, Row[]> = {};
    const found: Record<string, number> = {};
    for (const table of selected) {
      setProgress(`Lendo ${table}...`);
      try {
        const rows = await fetchTable(table);
        result[table] = rows;
        found[table] = rows.length;
      } catch (error) {
        console.error(error);
        result[table] = [];
        found[table] = -1;
      }
    }
    setCounts(found);
    return result;
  };

  const run = async (format: "json" | "csv" | "sql") => {
    if (selected.length === 0) {
      toast({ title: "Selecione ao menos uma tabela", variant: "destructive" });
      return;
    }
    setIsWorking(true);
    try {
      const data = await fetchAll();
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

      if (format === "json") {
        downloadBlob(
          JSON.stringify({ exported_at: new Date().toISOString(), data }, null, 2),
          `backup-${stamp}.json`,
          "application/json"
        );
      } else if (format === "sql") {
        const sql = [
          "-- Backup gerado pelo painel administrativo",
          "-- Importe em seu PostgreSQL: psql -f arquivo.sql",
          "BEGIN;",
          ...selected.map((t) => toSql(t, data[t] ?? [])),
          "COMMIT;",
        ].join("\n");
        downloadBlob(sql, `backup-${stamp}.sql`, "text/plain");
      } else {
        for (const table of selected) {
          const rows = data[table] ?? [];
          if (rows.length === 0) continue;
          downloadBlob(toCsv(rows), `${table}-${stamp}.csv`, "text/csv");
        }
      }

      toast({ title: "Exportação concluída", description: "Verifique seus downloads." });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro na exportação",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setProgress("");
      setIsWorking(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Exportar dados</h1>
          <p className="text-muted-foreground">
            Baixe uma cópia completa dos dados para transferir para outro servidor.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Tabelas
            </CardTitle>
            <CardDescription>
              Escolha o que deseja incluir. Por padrão, tudo está selecionado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TABLES.map((table) => (
                <label
                  key={table}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm"
                >
                  <Checkbox
                    checked={selected.includes(table)}
                    onCheckedChange={() => toggle(table)}
                    disabled={isWorking}
                  />
                  <span className="flex-1 font-medium">{table}</span>
                  {counts[table] !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {counts[table] < 0 ? "sem acesso" : `${counts[table]} reg.`}
                    </span>
                  )}
                </label>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelected([...TABLES])} disabled={isWorking}>
                Selecionar tudo
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelected([])} disabled={isWorking}>
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Formato do download
            </CardTitle>
            <CardDescription>
              O arquivo .sql já vem pronto para importar em um banco PostgreSQL próprio.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={() => run("sql")} disabled={isWorking}>
              {isWorking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileCode className="mr-2 h-4 w-4" />}
              Baixar .SQL (migração)
            </Button>
            <Button variant="outline" onClick={() => run("json")} disabled={isWorking}>
              <FileJson className="mr-2 h-4 w-4" />
              Baixar .JSON
            </Button>
            <Button variant="outline" onClick={() => run("csv")} disabled={isWorking}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Baixar .CSV (por tabela)
            </Button>
            {progress && <span className="self-center text-sm text-muted-foreground">{progress}</span>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Contas de acesso (e-mails e senhas) não fazem parte deste arquivo, por segurança.</p>
            <p>• Imagens e vídeos ficam no armazenamento de arquivos e devem ser baixados separadamente.</p>
            <p>• Tabelas marcadas como "sem acesso" dependem de permissões e podem ser ignoradas.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminExportacao;
