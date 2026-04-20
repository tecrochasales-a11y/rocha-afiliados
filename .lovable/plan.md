
## Plano: corrigir QR ausente no download do banner

### Arquivo correto
O componente do projeto está em:

```text
src/pages/BannerCreator.tsx
```

Não em `src/app/banner-creator/page.tsx`, porque este projeto usa React + Vite, não Next.js.

### Causa
O QR Code é renderizado por `QRCodeCanvas`, que gera um `<canvas>` interno. Mesmo aparecendo no preview, o `html2canvas` pode capturar o card antes do canvas do QR terminar de pintar os pixels, especialmente ao trocar layout para **Central** e baixar logo em seguida.

Resultado: o PNG final captura o espaço branco do QR, mas sem o desenho interno.

### Correção

#### 1. Adicionar `waitForCanvases`
Logo após a função existente `waitForCardAssets`, adicionar uma função para aguardar todos os elementos `<canvas>` dentro do banner:

```tsx
const waitForCanvases = async (node: HTMLElement) => {
  const canvases = Array.from(node.querySelectorAll("canvas"));
  if (canvases.length === 0) return;

  await Promise.all(
    canvases.map(
      (canvas) =>
        new Promise<void>((resolve) => {
          const tryResolve = () => {
            if (canvas.width > 0 && canvas.height > 0) {
              requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
            } else {
              requestAnimationFrame(tryResolve);
            }
          };
          tryResolve();
        })
    )
  );
};
```

#### 2. Usar `waitForCanvases` no download
No `handleExport`, antes do `html2canvas`, manter a espera atual de fontes/imagens e adicionar a espera do QR:

```tsx
if (document.fonts?.ready) await document.fonts.ready;
await waitForCardAssets(cardRef.current);
await waitForCanvases(cardRef.current);

const canvas = await html2canvas(cardRef.current, {
  scale: 2,
  useCORS: true,
  allowTaint: false,
  backgroundColor: null,
  logging: false,
});
```

#### 3. Usar `waitForCanvases` no compartilhamento
Aplicar a mesma espera no `handleShare`, também antes do `html2canvas`:

```tsx
if (document.fonts?.ready) await document.fonts.ready;
await waitForCardAssets(cardRef.current);
await waitForCanvases(cardRef.current);
```

#### 4. Manter a remoção do `composeWithQr`
Não reintroduzir composição manual do QR por cima do canvas. O `QRCodeCanvas` deve ser capturado nativamente pelo `html2canvas`; o problema atual é timing, não formato do arquivo.

#### 5. Verificar se o QR continua estável nos layouts
Confirmar que o `QRBlock` continua usando:

```tsx
<QRCodeCanvas
  value={referralLink || "https://example.com"}
  size={size}
  level="H"
  bgColor={colors.qrBg}
  fgColor="#000000"
  includeMargin={false}
/>
```

### Validação necessária

Depois da alteração, testar o download PNG em:

1. Layout **Clássico**
2. Layout **Central**
3. Layout **Lado a Lado**
4. Trocar para o layout Central e baixar imediatamente
5. Baixar com fundo personalizado
6. Baixar com logo personalizada
7. Confirmar visualmente que o QR aparece no arquivo baixado
8. Confirmar que o QR é escaneável

### Resultado esperado
O preview continua igual, mas o download passa a aguardar o canvas interno do QR terminar de renderizar antes da captura. Assim, o QR Code deve aparecer corretamente no PNG exportado em todos os layouts.
