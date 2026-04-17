
## Plano: marca d'água mais visível + posição oposta à logo

### 1. QR Code do banner = QR do questionário ✅
Já está correto — `referralLink = ${origin}/ref/${tracking_code}` é o mesmo usado no Dashboard ("Seu QR Code"), que leva ao questionário do cliente. Sem alteração necessária.

### 2. Marca d'água mais aparente e posicionada de forma oposta à logo

**Hoje:** opacity `0.18`, `mixBlendMode: luminosity`, fixa em `bottom-right`, width `80px`.
**Problema:** muito sutil + pode coincidir com a logo do afiliado (que segue o `textAlign`).

**Mudanças em `src/pages/BannerCreator.tsx` (bloco `<img>` da marca d'água, linhas 785-801):**

- **Visibilidade**:
  - `opacity: 0.45` (mais aparente, ainda discreta)
  - Remover `mixBlendMode: luminosity` (estava dessaturando demais sobre fundos escuros) → usar `mixBlendMode: "normal"`
  - `width: 95px` (um pouco maior)
  - Adicionar `filter: drop-shadow(0 1px 3px rgba(0,0,0,0.35))` para legibilidade em qualquer fundo
  - `bottom: 14, right: 14` mantido como padrão; ver item abaixo para posição dinâmica

- **Posição oposta à logo do afiliado** (baseada em `config.textAlign`):
  - `textAlign === "left"` → logo do afiliado fica à esquerda (topo) → marca d'água em **bottom-right**
  - `textAlign === "right"` → logo do afiliado à direita (topo) → marca d'água em **bottom-left**
  - `textAlign === "center"` → logo centralizada (topo) → marca d'água em **bottom-right** (canto inferior, oposto ao topo, lado padrão)
  - Sem logo (`!config.logoData`) → mantém **bottom-right**
  
  Implementado com objeto de estilo derivado do `config.textAlign`/`logoData`.

### Arquivo
- **Editado**: `src/pages/BannerCreator.tsx` — apenas o `<img>` da marca d'água no preview (sem mexer em DB, QR, lógica de export ou outras seções).

### Garantias
- Marca d'água continua incluída automaticamente no PNG exportado (está dentro de `cardRef`)
- QR Code permanece preto fixo e escaneável, apontando para o questionário do afiliado
- Nenhum impacto nos templates salvos
