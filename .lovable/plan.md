

## Plano: Adicionar seção de afiliados no dialog de edição do PDV

### O que muda
Quando o admin clica para editar um PDV, o dialog de edição passará a incluir uma seção de gerenciamento de afiliados logo abaixo dos campos existentes (Nome, Localização, Gestor).

### Alteração em `src/pages/admin/AdminPDV.tsx`

No dialog de edição (linhas 372-446), **quando `editingPdv` não é null**, adicionar após o campo "Gestor Responsável":

1. Um separador visual
2. Seção "Afiliados Vinculados" reutilizando a mesma lógica do `PDVAffiliatesDialog`:
   - Lista dos afiliados já vinculados ao PDV com botão de desvincular
   - Campo de busca + lista de afiliados disponíveis para vincular
3. Aumentar `max-h` do dialog para acomodar o conteúdo extra

Isso reaproveita 100% da lógica já existente no `PDVAffiliatesDialog` — a diferença é que agora estará embutido no dialog de edição em vez de ser um dialog separado.

### Abordagem técnica

- Extrair a lógica de fetch/link/unlink do `PDVAffiliatesDialog` para um componente inline `PDVAffiliatesSection` que pode ser renderizado dentro do dialog de edição
- Manter o `PDVAffiliatesDialog` separado intacto (para o botão de ações da tabela)
- Nenhuma alteração de banco, RLS ou rotas

### Arquivo alterado
- `src/pages/admin/AdminPDV.tsx` — embutir seção de afiliados no dialog de edição

