

## Plano: Centralizar título de boas-vindas no Dashboard

### Alteração — `src/pages/Dashboard.tsx`

Adicionar `text-center` ao `<div className="mb-8">` que envolve o título "Olá, {firstName}! 👋" e o subtítulo, centralizando ambos na tela.

**Linha 378**: `<div className="mb-8">` → `<div className="mb-8 text-center">`

### O que NÃO muda
- Conteúdo, lógica, layout dos cards e tabelas — tudo intacto.

