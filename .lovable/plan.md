
## Plano: marca d'água fixa no canto inferior esquerdo, acima da faixa branca

Atualmente a marca d'água tem posição dinâmica (esquerda/direita conforme logo). O usuário quer:
- **Fixa** no canto **inferior esquerdo**
- **Acima da faixa branca** (rodapé branco do banner com as logos das seguradoras)

### Investigação
Preciso confirmar em `src/pages/BannerCreator.tsx`:
1. Altura da faixa branca inferior (rodapé das seguradoras) para calcular o `bottom` correto
2. Posição atual da marca d'água

### Mudança
- Remover lógica `watermarkOnLeft` dinâmica
- Fixar `left: 14`
- Ajustar `bottom` para um valor acima da altura da faixa branca (ex.: `bottom: [altura da faixa + 10]px`)

### Arquivo
- `src/pages/BannerCreator.tsx` — bloco `<img>` da marca d'água
