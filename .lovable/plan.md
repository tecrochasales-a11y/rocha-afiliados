

## Plano: Painel de Vendas do Gestor

### Análise da Estrutura Existente

O vínculo gestor → afiliados **já existe** e funciona assim:
- `pdv.manager_id` = ID do gestor
- `profiles.pdv_id` = ID do PDV (vincula afiliados ao PDV)
- RLS já permite gestores ver profiles e leads do seu PDV
- **Falta**: RLS na tabela `commissions` para gestores (hoje só admin e afiliado podem ler)

Nenhuma tabela nova é necessária. Nenhuma estrutura existente será alterada.

### Implementação (3 arquivos, 1 migration)

#### 1. Migration — RLS de leitura em `commissions` para gestores

```sql
CREATE POLICY "Gestores can view commissions in their PDV"
ON public.commissions FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'gestor'::app_role)
  AND affiliate_id IN (
    SELECT p.id FROM public.profiles p
    WHERE p.pdv_id IN (
      SELECT pdv.id FROM public.pdv
      WHERE pdv.manager_id = auth.uid()
    )
  )
);
```

Apenas SELECT. Não altera nenhuma policy existente.

#### 2. Novo arquivo `src/pages/gestor/GestorVendas.tsx`

Página dedicada com:
- **Cards de resumo**: total vendido (soma de `sale_value` dos leads convertidos), quantidade de vendas, comissões geradas, taxa de conversão
- **Filtros**: por período (date range), por afiliado (select), por status do lead
- **Tabela de vendas**: nome do lead, afiliado responsável, valor da venda, comissão, status, data
- **Visão por afiliado**: seção colapsável ou tabs mostrando totais por afiliado (nome, total vendas, qtd conversões, comissão total)
- Layout mobile com cards e desktop com tabela (mesmo padrão de GestorLeads)
- Usa `GestorLayout` existente

Dados consultados:
- `profiles` (afiliados do PDV)
- `leads` (vendas/indicações dos afiliados)
- `commissions` (comissões vinculadas)

#### 3. Editar `src/components/gestor/GestorLayout.tsx`

Adicionar item de navegação "Vendas" com ícone `DollarSign` apontando para `/gestor/vendas`.

#### 4. Editar `src/App.tsx`

Adicionar rota `/gestor/vendas` com `ProtectedRoute requireGestor`.

### O que NÃO será alterado

- Nenhuma tabela existente
- Nenhuma função de banco existente
- Nenhuma rota existente
- Nenhuma página existente
- Nenhuma integração (n8n, webhooks)
- Nenhuma lógica de autenticação
- Nenhum componente compartilhado

### Permissões

- Rota protegida por `requireGestor` (redireciona se não autorizado)
- Dados filtrados por `pdv_id` do gestor (mesmo padrão das outras páginas gestor)
- RLS no banco garante que mesmo via URL direta ou API, o gestor só vê dados do seu PDV

### Limitações

- Se um afiliado não tiver `pdv_id` definido, não aparecerá para nenhum gestor
- Dados de comissão dependem de terem sido criados pelo admin ao converter leads
- Filtro por período usa `created_at` do lead (data de cadastro, não de conversão)

