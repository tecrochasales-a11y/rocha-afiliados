
## Plano: aplicar correção mínima do QR no download

### Escopo
Aplicar somente as 3 mudanças solicitadas no componente correto do projeto:

```text
src/pages/BannerCreator.tsx
```

Observação: o projeto é React + Vite, então não existe `src/app/banner-creator/page.tsx`.

### Mudanças a implementar

1. **Adicionar `waitForCanvases` logo após `waitForCardAssets`**

Adicionar a função no mesmo escopo de `waitForCardAssets`, sem alterar a lógica existente:

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

2. **Atualizar `handleExport`**

Adicionar apenas esta linha logo após:

```tsx
await waitForCardAssets(cardRef.current);
```

Nova sequência:

```tsx
if (document.fonts?.ready) await document.fonts.ready;
await waitForCardAssets(cardRef.current);
await waitForCanvases(cardRef.current);
```

Manter o restante do `handleExport` idêntico.

3. **Atualizar `handleShare`**

Adicionar apenas esta linha logo após:

```tsx
await waitForCardAssets(cardRef.current);
```

Nova sequência:

```tsx
if (document.fonts?.ready) await document.fonts.ready;
await waitForCardAssets(cardRef.current);
await waitForCanvases(cardRef.current);
```

Manter o restante do `handleShare` idêntico.

### O que não será alterado
- Não alterar layout dos banners
- Não alterar `QRCodeCanvas`
- Não alterar estilos
- Não alterar lógica de templates
- Não reintroduzir composição manual do QR
- Não alterar nenhuma outra funcionalidade do app

### Validação após aplicar
Testar o download PNG nos layouts:

1. Clássico
2. Central
3. Lado a Lado

Confirmar que o QR aparece no arquivo baixado e permanece escaneável.
