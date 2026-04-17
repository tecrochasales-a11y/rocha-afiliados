
## Plano: Faixa de seguradoras igual ao exemplo

A imagem de referência mostra: faixa branca fina, logos coloridas oficiais (Porto azul, SulAmérica laranja, Bradesco vermelho, Amil roxo) bem visíveis, espaçadas uniformemente, ocupando a largura total do banner.

Atualmente já temos os 4 assets corretos (`porto.png`, `sulamerica.jpg`, `bradesco.svg`, `amil.svg`). Falta ajustar a aparência da faixa para combinar exatamente com o exemplo.

### Ajustes em `src/pages/BannerCreator.tsx` (apenas a faixa do rodapé)

1. **Fundo**: branco puro `#FFFFFF` (já está, manter)
2. **Altura das logos**: aumentar de `48px` → `56px` para ficar tão proeminente quanto no exemplo
3. **Distribuição**: usar `justify-content: space-around` em vez de `center` com gap, para distribuir uniformemente na largura
4. **Padding vertical**: reduzir para `12px` (faixa mais fina/elegante como o exemplo)
5. **Padding horizontal**: `24px` para respiro nas bordas
6. **Remover `flex-wrap`**: forçar linha única para sempre ficar como o exemplo (4 logos lado a lado)
7. **`max-width` por logo**: limitar a `22%` cada para evitar que uma fique gigante e quebre o equilíbrio

### Garantias
- Apenas CSS inline da faixa do rodapé é alterado
- Nenhuma lógica, asset, ou estrutura tocada
- Templates salvos continuam funcionando
- Export (html2canvas) preserva o layout

### Arquivo
- **Editado**: `src/pages/BannerCreator.tsx` (apenas o bloco JSX/style do footer de seguradoras)
