
Corrigir em `src/pages/BannerCreator.tsx` com uma abordagem mais robusta para o QR no preview e no PNG exportado.

### Problema real identificado
O QR do preview ainda existe, mas o pipeline atual de exportação continua frágil por dois motivos:

1. o `html2canvas` está ignorando o bloco do QR (`data-qr-target="true"`)
2. a reposição manual depende de gerar um `Image` a partir de SVG/data URL

Na prática, quando essa geração não entra no canvas final como esperado, o resultado exportado fica sem QR nenhum, porque o QR original foi removido do snapshot e o overlay falha silenciosamente no resultado visual.

### Correção proposta
#### 1. Parar de rasterizar o QR via SVG → Image para o export
Substituir o fluxo atual:
- `buildQrSvgDataUrl`
- `loadQrImage`
- `generateExportQrImage`

por um fluxo bitmap determinístico usando a própria lib `qrcode` já instalada:

- criar um canvas offscreen
- usar `QRCode.toCanvas(...)`
- desenhar esse canvas diretamente no canvas final exportado com `drawImage`

Isso elimina a etapa mais frágil do processo: serialização SVG + decode + Image.

#### 2. Manter o `html2canvas` ignorando apenas o QR do preview
O banner continuará sendo capturado normalmente, mas o QR será sempre composto manualmente no final.

Fluxo final:
```text
waitForCardAssets(node)
html2canvas(node, { ignoreElements: qr preview })
generateQrCanvasForExport(size)
measureQrWrapper()
paint wrapper bg on exported canvas
draw qr canvas in inner area
return final canvas
```

#### 3. Medir o wrapper real do QR, não o conteúdo interno
Usar `qrWrapperRef.current` como única fonte de verdade para:
- posição
- largura/altura
- padding
- border radius

Assim a composição funciona igualmente em:
- Clássico
- Central
- Lado a Lado

#### 4. Trocar o preview de `QRCodeCanvas` para `QRCodeSVG`
No preview do banner, substituir:
```tsx
QRCodeCanvas
```
por:
```tsx
QRCodeSVG
```

Motivo:
- o preview passa a ser mais estável visualmente
- evita dependência de canvas React interno durante troca de layout
- reduz discrepância entre o que o usuário vê e o que será exportado

O export, porém, não vai depender do preview: continuará usando o canvas offscreen gerado pela lib.

#### 5. Centralizar tudo em uma única função de exportação
Unificar a lógica em algo como:
- `generateExportQrCanvas(size)`
- `captureBannerCanvas()`

E fazer `handleExport` e `handleShare` consumirem exatamente a mesma saída, para não existir diferença entre baixar e compartilhar.

#### 6. Remover o caminho que hoje causa regressão
Remover a dependência de:
- `buildQrSvgDataUrl`
- `loadQrImage`
- `generateExportQrImage` baseada em `Image`
- qualquer fallback silencioso que permita baixar PNG sem QR

Se a geração do QR falhar, o fluxo deve:
- lançar erro
- mostrar toast de erro
- não baixar imagem quebrada

### Arquivo a alterar
```text
src/pages/BannerCreator.tsx
```

### O que não será alterado
- layout dos banners
- estilos
- cores
- textos
- logos
- lógica de templates
- experiência geral da tela

### Validação após aplicar
Testar no `BannerCreator`:
1. preview com QR visível
2. download PNG no layout Clássico
3. download PNG no layout Central
4. download PNG no layout Lado a Lado
5. troca rápida entre layouts e download imediato
6. com logo personalizada
7. com fundo personalizado
8. compartilhamento
9. leitura real do QR

### Critério de aceite
- o QR aparece no preview
- o QR aparece no PNG baixado
- o QR aparece no compartilhamento
- o QR continua escaneável
- nenhum layout exporta quadrado vazio ou área em branco no lugar do QR
