

## Plano: Vincular afiliados a PDVs

### Problema
Os PDVs mostram "0 afiliados" porque não há interface para vincular afiliados existentes a um PDV.

### Solução
Adicionar um dialog de gerenciamento de afiliados ao clicar no ícone de "Afiliados" (coluna Ações) de cada PDV.

### Alterações em `src/pages/admin/AdminPDV.tsx`

1. **Novo botão na coluna Ações**: Ícone `Users` clicável que abre um dialog de afiliados do PDV

2. **Novo dialog "Afiliados do PDV"**:
   - Lista os afiliados já vinculados (profiles com `pdv_id` = PDV selecionado), com botão para desvincular
   - Campo de busca para encontrar afiliados sem PDV (ou de outro PDV)
   - Ao selecionar um afiliado, faz `UPDATE profiles SET pdv_id = <pdv_id> WHERE id = <affiliate_id>`
   - Ao desvincular, faz `UPDATE profiles SET pdv_id = NULL WHERE id = <affiliate_id>`

3. **Layout do dialog**:
   - Seção superior: "Afiliados vinculados" — tabela compacta (nome, email, botão remover)
   - Seção inferior: Input de busca + lista de afiliados disponíveis com botão "Adicionar"

### Técnico
- Busca de afiliados disponíveis: `SELECT * FROM profiles WHERE pdv_id IS NULL OR pdv_id != <current_pdv>` (filtrado por role affiliate via user_roles)
- Update via `supabase.from('profiles').update({ pdv_id }).eq('id', affiliateId)`
- RLS já permite admin atualizar profiles? Não — admin só tem SELECT. Será necessária uma **migration** para adicionar policy de UPDATE para admins na tabela `profiles`

### Migration necessária
```sql
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO public
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
```

### Arquivo alterado
- `src/pages/admin/AdminPDV.tsx` — novo dialog + botão
- Migration para RLS de update em profiles para admins

