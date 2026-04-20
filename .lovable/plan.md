

## Fix definitivo: QR ausente em todos os layouts exportados

### Causa raiz
Em `src/pages/BannerCreator.tsx`, depois de migrar de `QRCodeSVG` para `QRCodeCanvas`, o `html2canvas` já captura o QR corretamente (canvas é nativamente suportado pela lib). Mas a função `composeWithQr` continua sendo executada após o snapshot e:

1. Pinta um **retângulo branco arredondado sólido** sobre a área do QR (cobrindo o QR já renderizado)
2. Depois tenta carregar/desenhar um PNG do QR por cima

Se qualquer passo do passo 2 falhar silenciosamente (timing, decode, etc.) — ou mesmo quando funciona, há sobreposição inútil — sobra apenas o retângulo branco. É exatamente o que o print mostra: o fundo branco arredondado intacto, sem o QR.

A “correção manual” virou a causa do bug agora que o preview já é canvas nativo.

### Correção em `src/pages/BannerCreator.tsx`

**1) Remover `composeWithQr` do fluxo de exportação**
- Em `handleExport`: tirar a chamada `await composeWithQr(canvas)` após o `html2canvas`
- Em `handleShare`: idem
- Manter `waitForCardAssets` (continua útil para logos personalizadas e fundo)

**2) Remover a função `composeWithQr` inteira**
Não é mais necessária — o `QRCodeCanvas` é capturado diretamente pelo `html2canvas`.

**3) Garantir que `html2canvas` trate o canvas do QR**
- Manter `useCORS: true`
- Adicionar `allowTaint: false` explicitamente (default seguro)
- O `QRCodeCanvas` já é canvas-element same-origin → captura nativa funciona

**4) Estabilizar `QRBlock`**
- Mover a definição de `QRBlock` para fora do componente `BannerCreator` (recebendo `referralLink` e `colors` por props) OU envolver com `memo`
- Isso evita remount em cada render e garante que o canvas do QR fique pronto antes do export

**5) Manter `buildQrDataUrl` apenas para uso futuro/fallback**
Pode ser removido também, já que ninguém mais o consome. Limpeza opcional.

### Verificação
Após a correção, validar no preview e download:
1. Layout **Clássico** — QR visível e escaneável
2. Layout **Central** — QR visível e escaneável (era o caso quebrado)
3. Layout **Lado a Lado** — QR visível e escaneável
4. Com cores customizadas — QR mantém contraste preto/branco
5. Com fundo personalizado — QR e overlay corretos
6. Logo personalizada não distorce
7. Faixa de seguradoras intacta

### Arquivo alterado
- `src/pages/BannerCreator.tsx`

