

## Plano: corrigir QR ausente e logos esticados no PNG exportado

### Bug 1 — QR Code não aparece nos layouts customizados (especialmente "Centralizado")
**Causa:** `html2canvas` falha ao renderizar elementos `<svg>` dentro de containers com flex column + center. Por isso o QR sai em branco no layout centered (visível no print do usuário) e em layouts com background customizado.

**Correção em `src/pages/BannerCreator.tsx` — componente `QRBlock` (linhas 325–329):**
- Renderizar o QR como SVG dentro de um wrapper, **e** gerar uma versão como `data:image/svg+xml;base64,...` exibida via `<img>` quando estiver exportando, ou simplesmente envolver o `<QRCodeSVG>` em um `<div>` com `width`/`height` em pixels fixos (não 100%) e `display: block` no svg, e adicionar `imageRendering: 'pixelated'` para evitar antialias quebrado.

Abordagem escolhida (mais confiável): converter para `<img>` data URL.
```tsx
const QRBlock = ({ size = 130 }: { size?: number }) => {
  const svgString = useMemo(() => {
    // gerar svg como string usando renderToStaticMarkup do QRCodeSVG
  }, [referralLink, size, colors.qrBg]);
  const dataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;
  return (
    <div style={{ background: colors.qrBg, borderRadius: 14, padding: 10, display: "inline-block" }}>
      <img src={dataUrl} width={size} height={size} alt="QR" style={{ display: "block" }} />
    </div>
  );
};
```
Imports adicionais: `useMemo` (já existe), `renderToStaticMarkup` de `react-dom/server`.

### Bug 2 — Logos das seguradoras esticadas no PNG
**Causa:** `html2canvas` ignora `objectFit: "contain"` em `<img>` quando há `height` fixo + `maxWidth` percentual. Estica a imagem para preencher.

**Correção em `InsurerStrip` (linhas 393–397):**
Trocar cada `<img>` por um wrapper `<div>` de altura fixa que centraliza a imagem com `width: auto` e `height: 100%`, removendo `maxWidth` percentual:
```tsx
<div key={ins.key} style={{ 
  flex: 1, 
  height: 56, 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "center", 
  padding: "0 8px" 
}}>
  <img 
    src={ins.logo} 
    alt={ins.name} 
    style={{ maxHeight: 56, maxWidth: "100%", width: "auto", height: "auto", display: "block" }} 
    crossOrigin="anonymous" 
  />
</div>
```

### Verificação geral da customização
Após as correções, validar via inspeção de código nos seguintes pontos do `BannerCreator.tsx`:
1. **Background image custom** (`config.bgImageData`) — confirmar que o overlay (linhas 413–420) não cobre o conteúdo (z-index OK via `position: relative` no wrapper interno).
2. **Logo do afiliado** (`LogoBlock`, linha 336) — aplicar mesmo padrão de wrapper para evitar estiramento.
3. **Cores customizadas de texto** — confirmar que `useCustomTextColors` está sendo aplicado em todos os elementos.
4. **Marca d'água Rocha Sales** — confirmar que continua visível com/sem faixa de seguradoras.

### Arquivos alterados
- `src/pages/BannerCreator.tsx` (somente)

Sem mudanças em dependências, sem migrations.

