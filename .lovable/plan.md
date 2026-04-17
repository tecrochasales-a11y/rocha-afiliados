
## Plano: Marca d'água fixa + QR Code com linhas pretas fixas

### 1. QR Code — linhas internas sempre pretas
No `QRBlock` (linha 322-326 de `BannerCreator.tsx`), trocar `fgColor={colors.qrFg}` por `fgColor="#000000"` fixo. Mantém o fundo branco (`colors.qrBg`) para contraste e leitura garantida em qualquer tema/cor escolhida.

### 2. Marca d'água fixa da corretora no preview
Adicionar uma marca d'água discreta sobreposta ao banner usando o logo local `src/assets/rocha-sales-logo.png` (regra da memória: uso exclusivo do logo PNG local).

**Características:**
- Posição: canto inferior direito do preview do banner (não conflita com texto/CTA que ficam à esquerda)
- Tamanho: ~80px de largura
- Opacidade: `0.18` (sutil, não compete com o conteúdo)
- `pointer-events: none` e `user-select: none` (não interfere na interação)
- `mix-blend-mode: screen` em banners escuros / `multiply` claros — uso `luminosity` como meio-termo neutro
- **Fixa**: sem controle de edição para o usuário (sempre presente, sempre no mesmo lugar)
- Incluída no export (html2canvas) — renderiza dentro do `bannerRef`, então já é capturada automaticamente

**Implementação:**
- Import: `import rochaLogo from "@/assets/rocha-sales-logo.png"`
- Adicionar `<img>` absoluto dentro do container do preview do banner, logo antes do fechamento:
  ```tsx
  <img src={rochaLogo} alt="" aria-hidden
    style={{
      position: "absolute", bottom: 12, right: 12,
      width: 80, height: "auto", opacity: 0.18,
      pointerEvents: "none", userSelect: "none",
      mixBlendMode: "luminosity"
    }}
  />
  ```

### Arquivo
- **Editado**: `src/pages/BannerCreator.tsx` (1 linha no QRBlock + 1 import + 1 bloco `<img>` no preview)

### Garantias
- Sem mudanças em DB, templates, lógica ou outras seções
- Marca d'água aparece tanto no preview quanto no PNG exportado
- QR Code sempre escaneável (preto sobre branco, independente das cores customizadas)
