

## Plano: Corrigir erros de build (Dashboard.tsx + index.css)

### Problema 1: `index.css` — `@import` fora de ordem
O `@import url('https://fonts.googleapis.com/...')` está na linha 5, depois das diretivas `@tailwind` (linhas 1-3). CSS exige que `@import` venha antes de qualquer outra declaração (exceto `@charset`).

**Correção**: Mover o `@import` para a linha 1, antes dos `@tailwind`.

### Problema 2: `Dashboard.tsx` — Erro de sintaxe JSX
O compilador SWC reporta "Expected '</', got 'jsx text'" na linha 456. Há um problema de nesting de tags JSX — provavelmente uma `div` com fechamento incorreto na área dos stats cards (linhas ~453-465).

**Correção**: Revisar e corrigir o nesting de tags na área dos stats cards do Dashboard.

### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `src/index.css` | Mover `@import` para antes dos `@tailwind` |
| `src/pages/Dashboard.tsx` | Corrigir nesting de tags JSX na área dos stats |

### Segurança
- Zero alterações em lógica, hooks, queries ou integrações
- Apenas correção de sintaxe

