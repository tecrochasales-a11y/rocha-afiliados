
## Plano: trocar lado da marca d'água

Hoje a marca d'água fica no **canto oposto à logo do afiliado** (logo à direita → marca embaixo à esquerda; caso contrário → embaixo à direita).

O usuário pediu para trocar de lugar. Proposta: **inverter a lógica** para que a marca d'água fique no **mesmo lado vertical da logo** (ou seja, trocar o canto atual).

- `textAlign === "right"` (logo à direita) → marca d'água em **bottom-right**
- `textAlign === "left"` ou `center` ou sem logo → marca d'água em **bottom-left**

### Mudança
Em `src/pages/BannerCreator.tsx`, inverter a condição `watermarkOnLeft`:
```tsx
const watermarkOnLeft = !(!!config.logoData && config.textAlign === "right");
```
(ou simplesmente trocar `left`/`right` no objeto de estilo).

### Arquivo
- `src/pages/BannerCreator.tsx` — 1 linha alterada.
