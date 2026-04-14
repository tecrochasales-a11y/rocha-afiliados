

## Plano: Tornar imagem de fundo mais visível e reduzir fade inferior

### Alterações — `src/components/landing/HeroSection.tsx`

1. **Reduzir opacidade do overlay escuro** (linha 16):
   - De: `from-gray-900/85 via-gray-800/65 to-gray-700/50`
   - Para: `from-gray-900/70 via-gray-800/45 to-gray-700/25`
   - Isso deixa a imagem de fundo mais aparente

2. **Reduzir o fade branco inferior** (linha 137):
   - De: `h-32` para `h-16`
   - De: `from-background` para `from-background/60`
   - Fade mais sutil e menor

### O que NÃO muda
- Conteúdo, botões, cards flutuantes, layout — tudo intacto

