

## Fix: QR não renderiza no layout Central exportado

### Causa real
Em `src/pages/BannerCreator.tsx`, o `composeWithQr` desenha o **fundo branco arredondado** primeiro e depois tenta carregar o QR via `<img src="data:image/svg+xml;base64,...">`. Quando o `targetSize` do QR é maior (no layout Central, `size=150` + `scale: 2` → ~300px), o SVG gerado tem mais nós e a sequência `btoa(unescape(encodeURIComponent(svg)))` pode falhar/produzir data URL inválido em alguns navegadores. O `img.onerror` dispara silenciosamente, o `drawImage` nunca é chamado, e sobra apenas o retângulo branco vazio — exatamente o bug do print.

Além disso há dois problemas estruturais:
1. `QRBlock` é declarado **dentro** do componente `BannerCreator` e recriado a cada render — `qrWrapperRef` aponta para nós que mudam, gerando medições instáveis.
2. `useMemo` do `dataUrl` no `QRBlock` não tem `referralLink` nas dependências (a dep está em `buildQrDataUrl`, mas o memo do componente ignora).

### Correção em `src/pages/BannerCreator.tsx`

**1) Substituir SVG-data-URL pelo canvas nativo do `qrcode`**  
Em vez de `renderToStaticMarkup(<QRCodeSVG/>)` + `btoa`, usar a lib `qrcode` (ou `QRCodeCanvas` do mesmo `qrcode.react`) para gerar um **PNG data URL via canvas off-screen**:

```ts
import QRCode from "qrcode";

const buildQrDataUrl = useCallback(async (size, bgColor, fgColor) => {
  return await QRCode.toDataURL(referralLink || "https://example.com", {
    width: size,
    margin: 0,
    errorCorrectionLevel: "H",
    color: { dark: fgColor, light: bgColor },
  });
}, [referralLink]);
```

PNG data URLs são universalmente carregáveis — elimina o ponto de falha do `<img onerror>`.

**2) Usar `<canvas>` (via `QRCodeCanvas`) no preview**  
Trocar `QRCodeSVG` por `QRCodeCanvas` no `QRBlock`. O `html2canvas` consegue copiar `<canvas>` diretamente, sem o problema do data URL externo. Isso elimina a dependência de `composeWithQr` para o preview funcionar.

**3) Manter `composeWithQr` como fallback robusto**  
Continuar com a sobreposição manual no export, mas:
- usar o novo `buildQrDataUrl` (PNG) 
- mover `QRBlock` para fora do `BannerCreator` OU memoizar com `React.memo` para estabilizar o ref
- desenhar o fundo branco **somente após** o QR carregar com sucesso (evita o "retângulo branco vazio" se algo der errado)
- adicionar `console.warn` no `img.onerror` para diagnóstico futuro

**4) Corrigir dependências do `useMemo` no `QRBlock`**  
Incluir `referralLink` (via `buildQrDataUrl` referência), garantindo que o QR atualize ao mudar o link.

### Verificação adicional
- Confirmar que layouts Clássico, Central e Lado a Lado renderizam o QR no preview
- Confirmar export funcional nos 3 layouts + com fundo customizado + com cores customizadas
- Confirmar que `qrWrapperRef` mede corretamente o wrapper inline-block centralizado

### Arquivo alterado
- `src/pages/BannerCreator.tsx`

### Dependência
- `qrcode` (já é dep transitiva de `qrcode.react`; se faltar, adicionar)

