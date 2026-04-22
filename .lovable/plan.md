

## Igualar `handleShare` ao `handleExport` no `BannerCreator`

Hoje as duas funções já chamam o mesmo `captureBannerCanvas` (que tem o `onclone` convertendo o QR SVG em `<img>` data URL e a validação de dimensões). Mas o `handleShare` ainda diverge em três pontos que podem reintroduzir o bug do QR sumindo no compartilhamento.

### Mudanças em `src/pages/BannerCreator.tsx` (somente `handleShare`)

1. **Validação extra do canvas antes de gerar o blob**
   Adicionar a mesma checagem do `handleExport`:
   ```ts
   const dataUrl = canvas.toDataURL("image/png");
   if (!dataUrl || dataUrl === "data:,") {
     throw new Error("Imagem gerada está vazia.");
   }
   ```
   Isso detecta canvas vazio antes de cair no `toBlob`, igual ao export.

2. **Validação do blob**
   Trocar `if (!blob)` por `if (!blob || blob.size === 0)` para capturar blobs degenerados.

3. **Estado de loading consistente**
   Envolver `handleShare` em `setIsExporting(true)` / `finally { setIsExporting(false) }`, igual ao `handleExport`. Hoje o share não trava o botão, o que permite o usuário disparar uma segunda captura no meio de uma troca de layout — exatamente o cenário que faz o QR sumir.

4. **Nome do arquivo de fallback**
   Usar o mesmo padrão do export (`banner-${nome}.png`) no fallback de download quando `navigator.share` não está disponível, em vez do genérico `banner.png`.

O delay de 200ms e o pipeline `onclone` + overlay do QR já são compartilhados via `captureBannerCanvas`, então não precisam ser duplicados.

### Resultado esperado

- Compartilhar passa pelo mesmo caminho de captura, espera e validação que o download.
- Sem cliques duplicados durante troca de layout (botão desabilitado).
- Mesmo erro visível em toast caso o QR falhe, em vez de blob silenciosamente quebrado.

