
## Plano: Incluir QR Code no PNG exportado

### Problema
Ao exportar o banner como PNG, o QR Code não está aparecendo na imagem final (mesmo estando visível no preview).

### Investigação necessária
Preciso verificar em `src/pages/BannerCreator.tsx`:
1. Onde está o `QRBlock` no DOM — se está dentro do `cardRef` (capturado pelo html2canvas) ou fora
2. Como o `html2canvas` é chamado no `handleExport`
3. Se o `QRCodeSVG` está renderizando como SVG (html2canvas tem problemas com SVGs complexos em alguns casos)

### Causa provável
Duas hipóteses:
- **A**: O QR Code está posicionado fora do container `cardRef` capturado
- **B**: O `html2canvas` não está serializando bem o `<svg>` do `qrcode.react` — solução é converter para canvas/PNG antes da captura, ou usar `QRCodeCanvas` em vez de `QRCodeSVG`

### Solução
1. Trocar `QRCodeSVG` por `QRCodeCanvas` (mesmo pacote `qrcode.react`) — canvas é capturado nativamente pelo html2canvas sem problemas de serialização SVG
2. Garantir que o QRBlock está dentro do `cardRef` (se não estiver, mover)
3. Manter `fgColor="#000000"` fixo e `bgColor` branco (já feito anteriormente)
4. No `handleExport`, antes de chamar `html2canvas`, aguardar `document.fonts.ready` (já está) e adicionar pequeno delay de 50ms para garantir render do canvas do QR

### Arquivo
- **Editado**: `src/pages/BannerCreator.tsx` (troca de import `QRCodeSVG` → `QRCodeCanvas` + ajuste do componente; eventual reposicionamento se estiver fora do cardRef)

### Garantias
- Zero impacto visual no preview (canvas renderiza idêntico ao SVG)
- QR Code aparece no PNG exportado e permanece escaneável
- Sem mudanças em outras seções, DB ou templates salvos
