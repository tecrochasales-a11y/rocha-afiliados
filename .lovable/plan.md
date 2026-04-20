
## Plano: aplicar correção mínima no QR do download

### Arquivo correto
Aplicar a alteração em:

```text
src/pages/BannerCreator.tsx
```

O projeto é React + Vite, então não existe `src/app/banner-creator/page.tsx`.

### Mudanças exatas

#### 1. Substituir `waitForCardAssets`
Trocar a função atual por uma versão que aguarda:

- carregamento das imagens
- `img.decode()` quando disponível
- dois ciclos de `requestAnimationFrame`

Isso garante que imagens SVG/data URI usadas no banner estejam decodificadas antes do `html2canvas`.

Função final:

```tsx
const waitForCardAssets = async (node: HTMLElement) => {
  const images = Array.from(node.querySelectorAll("img"));

  await Promise.all(
    images.map((img) => {
      const loaded =
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            });

      return loaded.then(
        () => img.decode?.().catch(() => {}) ?? Promise.resolve()
      );
    })
  );

  await new Promise((r) => requestAnimationFrame(() => r(null)));
  await new Promise((r) => requestAnimationFrame(() => r(null)));
};
```

#### 2. Remover `waitForCanvases`
Remover completamente a função:

```tsx
const waitForCanvases = async (...)
```

Ela não será mais necessária neste fluxo.

#### 3. Remover chamadas de `waitForCanvases`
Remover estas linhas:

```tsx
await waitForCanvases(cardRef.current);
```

Dos dois pontos:

- `handleExport`
- `handleShare`

A sequência final deve ficar apenas:

```tsx
if (document.fonts?.ready) await document.fonts.ready;
await waitForCardAssets(cardRef.current);
const canvas = await html2canvas(...);
```

### O que não será alterado
- Não alterar layout dos banners
- Não alterar estilos
- Não alterar `html2canvas`
- Não alterar `QRCodeCanvas`
- Não alterar lógica de templates
- Não alterar botões ou textos
- Não modificar nenhuma outra funcionalidade

### Validação
Depois de aplicar, testar download PNG nos três layouts:

1. Clássico
2. Central
3. Lado a Lado

Confirmar que o QR aparece no arquivo baixado e continua escaneável.
