
## Plano: corrigir QR code ausente no PNG exportado

### Causa
Em `src/pages/BannerCreator.tsx`, o QR é renderizado com `QRCodeCanvas` (canvas HTML). O `html2canvas` não consegue clonar de forma confiável o conteúdo de elementos `<canvas>` aninhados — o resultado costuma sair em branco (exatamente o quadrado branco visto no banner exportado).

O componente `QRCodeGenerator.tsx` já usa `QRCodeSVG` corretamente — basta aplicar o mesmo no BannerCreator.

### Mudança em `src/pages/BannerCreator.tsx`
1. Trocar import: `QRCodeCanvas` → `QRCodeSVG` (de `qrcode.react`)
2. No componente `QRBlock` (linha 327), substituir `<QRCodeCanvas .../>` por `<QRCodeSVG .../>` mantendo as mesmas props (`value`, `size`, `level="H"`, `bgColor`, `fgColor`, `includeMargin={false}`)

Sem outras alterações — fontes, layout e `html2canvas` permanecem.
