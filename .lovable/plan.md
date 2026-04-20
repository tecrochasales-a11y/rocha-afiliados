
## Plano: adicionar espera extra antes do download do banner

### Arquivo
Aplicar somente em:

```text
src/pages/BannerCreator.tsx
```

### Estado atual identificado
A função `waitForCardAssets` já está com a versão que aguarda:

- carregamento das imagens
- `img.decode()`
- dois ciclos de `requestAnimationFrame`

Também não há mais `waitForCanvases` no trecho atual.

### Mudança necessária

#### 1. Adicionar `waitBeforeCapture`
Logo após `waitForCardAssets`, adicionar:

```tsx
const waitBeforeCapture = () =>
  new Promise((r) => setTimeout(r, 500));
```

#### 2. Atualizar `handleExport`
Adicionar a chamada logo depois de:

```tsx
await waitForCardAssets(cardRef.current);
```

Sequência final:

```tsx
if (document.fonts?.ready) await document.fonts.ready;
await waitForCardAssets(cardRef.current);
await waitBeforeCapture();

const canvas = await html2canvas(cardRef.current, {
  scale: 2,
  useCORS: true,
  allowTaint: false,
  backgroundColor: null,
  logging: false,
});
```

### O que não será alterado
- Não alterar layout dos banners
- Não alterar estilos
- Não alterar QR Code
- Não alterar `html2canvas`
- Não alterar lógica de templates
- Não alterar textos ou botões
- Não modificar outras funcionalidades

### Validação
Depois da alteração, testar o download PNG nos três layouts:

1. Clássico
2. Central
3. Lado a Lado

Confirmar que o QR aparece no arquivo baixado e permanece escaneável.
