
Objetivo: corrigir o export do PNG no `BannerCreator` sem “tentar no escuro”, partindo do motivo real do erro já identificado no código e confirmado pelo comportamento do preview vs. arquivo exportado.

1. Diagnóstico confirmado
- O preview está correto porque o QR é renderizado como `SVG` via `QRCodeSVG`.
- O arquivo exportado falha porque o fluxo atual de captura está substituindo o QR no `onclone` com `qrCanvas.cloneNode(true)`.
- Em `canvas`, `cloneNode(true)` copia o elemento, mas não copia os pixels desenhados. Resultado: o clone fica visualmente em branco.
- Isso bate exatamente com o sintoma do arquivo baixado: aparece a área branca do container do QR, mas sem o conteúdo preto do código.
- O toast de sucesso e a ausência de erro no console mostram que o problema não é falha de exportação geral, e sim perda do bitmap do QR durante a etapa de captura.

2. O que será ajustado no `src/pages/BannerCreator.tsx`
- Manter o delay de 200ms no `handleExport` antes da captura:
  - `await new Promise((r) => setTimeout(r, 200));`
- Corrigir a preparação do QR antes do `html2canvas`:
  - buscar o `svg` em `[data-qr-target="true"] svg`
  - serializar com `XMLSerializer`
  - rasterizar para um `canvas` 220x220 com fundo branco
- Corrigir o `onclone` para não usar `cloneNode(true)` em `canvas` vazio.
- Substituir por uma das duas abordagens seguras:
  - criar um novo `canvas` no clone e desenhar nele com `drawImage(qrCanvas, 0, 0, 220, 220)`, ou
  - usar um `<img src="data:image/png;base64,...">` derivado do canvas rasterizado.
- Remover a dependência de um “overlay corretivo” como mecanismo principal e deixar a captura do clone já sair correta por si só.

3. Ajuste estrutural recomendado
- Simplificar `captureBannerCanvas` para ter uma única fonte de verdade do QR exportado:
  - gerar o QR rasterizado uma vez
  - injetar esse bitmap no DOM clonado
  - capturar com `html2canvas`
- Se o overlay final continuar existindo, ele ficará apenas como fallback visual, não como solução principal.
- Isso evita inconsistência entre:
  - o QR do clone
  - o QR redesenhado depois
  - as medições do layout após troca de template

4. Testes que serão executados após a correção
- Testar export em cada layout:
  - Clássico
  - Central
  - Lado a Lado
- Em cada caso:
  - mudar o layout
  - aguardar o fluxo real do botão
  - baixar o PNG
  - verificar se o QR aparece no arquivo exportado
- Confirmar também:
  - sem canvas vazio
  - sem `data:,`
  - sem regressão no botão de compartilhar, se ele reutiliza a mesma função
  - sem erro visual de escala, recorte ou deslocamento do QR

5. Resultado esperado
- O QR continuará aparecendo normalmente no preview.
- O mesmo QR passará a aparecer no PNG exportado, inclusive logo após trocar o layout.
- O problema deixará de depender do remount do React ou da limitação do `html2canvas` com SVG inline.

Detalhes técnicos
- Arquivo afetado: `src/pages/BannerCreator.tsx`
- Causa raiz: uso incorreto de `HTMLCanvasElement.cloneNode(true)` dentro do `onclone`
- Sintoma produzido: container branco do QR presente no PNG, mas bitmap do QR ausente
- Correção técnica: rasterizar o SVG e reinjetar um bitmap válido no clone antes da captura
