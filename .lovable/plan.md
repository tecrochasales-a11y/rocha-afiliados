

## Plano: Trocar laranja por dourado

### Problema
O `--primary`, `--accent`, `--ring` e `--sidebar-ring` estão em `24 100% 50%` (laranja #FF6600). O usuário quer tudo em **dourado** (#C9A84C / `40 52% 54%`).

### Alterações — apenas `src/index.css`

Trocar os valores HSL de laranja para dourado nas variáveis CSS:

| Token | Valor atual (laranja) | Novo valor (dourado) |
|-------|----------------------|---------------------|
| `--primary` | `24 100% 50%` | `40 52% 54%` |
| `--accent` | `24 100% 50%` | `40 52% 54%` |
| `--ring` | `24 100% 50%` | `40 52% 54%` |
| `--sidebar-ring` | `24 100% 50%` | `40 52% 54%` |
| `--gradient-hero` (tint final) | `hsl(24 30% 18%)` | `hsl(40 30% 18%)` |
| `--gradient-cta` | `hsl(24 100% 45%)…55%` | `hsl(40 52% 48%)…58%` |
| `--shadow-glow` | `hsl(24 100% 50% / 0.25)` | `hsl(40 52% 54% / 0.25)` |
| Dark mode `--accent` | `24 100% 55%` | `40 52% 58%` |

Também atualizar no `tailwind.config.ts` os keyframes `glow-pulse` que referenciam `hsl(24 100% 50%)`.

### O que NÃO muda
- Nenhum componente, layout, função ou integração
- Apenas substituição de valores de cor em 2 arquivos

