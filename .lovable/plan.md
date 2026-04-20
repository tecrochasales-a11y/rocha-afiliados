

## Fix: QR code quebrado no preview

### Causa
`renderToStaticMarkup(<QRCodeSVG />)` gera um `<svg>` **sem** o atributo `xmlns="http://www.w3.org/2000/svg"`. Quando esse SVG é embutido em um `data:image/svg+xml;base64,...` e carregado via `<img>`, o browser rejeita (imagem quebrada — exatamente o ícone visto no print). No preview anterior funcionava porque era SVG inline no DOM, onde o xmlns é opcional.

### Correção em `src/pages/BannerCreator.tsx` (linhas 327–339)
Injetar o namespace no SVG string antes do base64, e trocar `btoa(unescape(encodeURIComponent(...)))` por uma codificação segura:

```tsx
const dataUrl = useMemo(() => {
  let svg = renderToStaticMarkup(
    <QRCodeSVG
      value={referralLink || "https://example.com"}
      size={size}
      level="H"
      bgColor={colors.qrBg}
      fgColor="#000000"
      includeMargin={false}
    />
  );
  // Garantir xmlns — obrigatório para <img src="data:image/svg+xml;...">
  if (!svg.includes("xmlns=")) {
    svg = svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
  }
  const encoded = window.btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${encoded}`;
}, [size, referralLink, colors.qrBg]);
```

Também adicionar `referralLink` e `colors.qrBg` nas dependências do `useMemo` (faltando atualmente — o QR não regeneraria ao trocar link/cor).

### Arquivos alterados
- `src/pages/BannerCreator.tsx` (apenas `QRBlock`)

