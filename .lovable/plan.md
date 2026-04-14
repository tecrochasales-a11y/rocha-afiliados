

## Plano: Alterar fonte do Hero para fonte serifada elegante

### Contexto
A imagem da esquerda (referência) usa uma fonte serifada elegante nos títulos ("Excelência e Exclusividade em Planos de Saúde"). A imagem da direita (atual) usa Poppins (sans-serif). O objetivo é igualar o estilo tipográfico.

### Alterações

**1. `src/index.css`** — Importar fonte serifada (Playfair Display) do Google Fonts, que é a mais próxima do estilo da referência.

**2. `tailwind.config.ts`** — Adicionar `heading: ['Playfair Display', 'serif']` na configuração de `fontFamily`.

**3. `src/index.css`** — Atualizar a regra de `h1-h6` para usar `'Playfair Display', serif`.

### O que NÃO muda
- Corpo de texto continua Inter
- Nenhuma lógica ou layout alterado

