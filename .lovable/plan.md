

## Plano: Corrigir comissão prevista + link cortado no mobile

### Problema 1: Comissão Prevista errada
A função `getProjectedCommissionDisplay` calcula `sale_value * commissionPct / 100`, mas o admin pode definir comissões com valores diferentes do percentual padrão. O lead "Vinicius Sales" tem `sale_value = 1600` e comissão real de R$ 30,00, mas o dashboard mostra `1600 * 30% = R$ 480,00`.

**Correção em `src/pages/Dashboard.tsx`:**
- Buscar as comissões associadas a cada lead (`commissions` table com `lead_id`)
- Na coluna "Comissão Prevista", exibir a soma real das comissões do lead em vez de calcular `sale_value * %`
- Se não houver comissão registrada mas o lead for convertido, mostrar "-" ou "Aguardando"

Tecnicamente:
- Fazer um fetch de `commissions` agrupado por `lead_id` junto com os leads
- Criar um mapa `leadId → totalCommission` 
- Alterar `getProjectedCommissionDisplay` para consultar esse mapa

### Problema 2: Link de indicação cortado no mobile
O card "Seu Link de Indicação" não tem layout responsivo adequado — os botões "Copiar Link" e "Visualizar Link" ficam na mesma linha do título, sem quebra.

**Correção em `src/pages/Dashboard.tsx`:**
- No card do link (linha ~407-441), alterar o layout para empilhar verticalmente em telas pequenas:
  - `flex-col sm:flex-row` no container dos botões
  - Título ocupa linha inteira no mobile
  - Botões ficam abaixo, com largura total (`w-full sm:w-auto`)

### Arquivos alterados
- `src/pages/Dashboard.tsx`

