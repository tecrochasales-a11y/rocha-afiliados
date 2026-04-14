

## Plano: Aplicar fonte e cores do site Rocha Sales

### O que muda
Apenas **2 arquivos** serão editados para trocar fontes e ajustar a paleta de cores. Zero alterações em layout, funções, integrações ou lógica.

### Cores extraídas do site rochasalesseguros.com.br
- **Fundo escuro**: `#181818` (rgb 24,24,24)
- **Accent/CTA**: `#FF6600` (laranja vibrante)
- **Dourado (textos destaque)**: `#C9A84C`
- **Fundo claro**: `#F8F8F8`
- **Texto escuro**: `#181818`
- **Texto muted**: `#666666`

### Fontes extraídas
- **Headings**: Poppins (substituindo Montserrat)
- **Body**: Inter (substituindo Open Sans)

### Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `src/index.css` | Trocar `@import` do Google Fonts para Poppins + Inter. Ajustar variáveis CSS de cor (--primary, --secondary, --accent, gradientes, sombras) para a paleta do site. Trocar `font-family` no body e headings. |
| `tailwind.config.ts` | Trocar `fontFamily.sans` para Inter e `fontFamily.heading` para Poppins. |

### O que NÃO muda
- Nenhum componente TSX
- Nenhum layout ou estrutura
- Nenhuma integração, hook, rota ou banco de dados
- Painel admin e gestor intocados
- Animações existentes permanecem

### Mapeamento de cores

| Token | Valor atual | Novo valor |
|-------|-------------|------------|
| `--primary` | `212 72% 22%` (azul marinho) | `24 100% 50%` (laranja #FF6600) |
| `--secondary` | `152 62% 38%` (verde) | `40 52% 54%` (dourado #C9A84C) |
| `--accent` | `38 92% 50%` (dourado) | `24 100% 50%` (laranja) |
| `--foreground` | `215 30% 12%` | `0 0% 9%` (#181818) |
| `--muted-foreground` | `215 15% 45%` | `0 0% 40%` (#666) |
| `--gradient-hero` | azul marinho | tons de #181818 para laranja sutil |
| `--gradient-cta` | verde | laranja (#FF6600) |
| `--gradient-gold` | dourado | dourado (#C9A84C) |

