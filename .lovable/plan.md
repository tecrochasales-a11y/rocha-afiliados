

## Correção do export do QR no BannerCreator

### Causa raiz confirmada
No `captureBannerCanvas` (src/pages/BannerCreator.tsx, ~linha 366), o `onclone` do `html2canvas` faz `clonedQr.innerHTML = ""` e **só depois** mede `clonedQr.getBoundingClientRect()`. Em layouts flex (Central / Lado a Lado), esvaziar o nó faz o flexbox recalcular e o retângulo medido vira ~0×0 (ou colapsa para o canto), resultando em `cInnerSide` minúsculo ou `cInnerX/Y` errados — por isso o QR “some” no PNG após trocar layout. O preview continua certo porque ele não passa pelo clone.

### Correção
Arquivo único: `src/pages/BannerCreator.tsx`

1. **Em `captureBannerCanvas` (linhas ~420–469)** — remover toda a lógica do `onclone` e do `cloneRect`. Confiar apenas nas coordenadas já calculadas do DOM ao vivo (`x, y, w, h, innerX, innerY, innerSide, qrRadius`), que são estáveis pois o nó vivo não é mutado.

   Após o `html2canvas`, pintar o fundo branco arredondado do QR e desenhar o `qrCanvas` bitmap fresco por cima:
   - `ctx.save()`
   - `ctx.fillStyle = colors.qrBg`
   - `ctx.roundRect(x, y, w, h, qrRadius * SCALE)` + `ctx.fill()` (com fallback `fillRect` se `roundRect` não existir)
   - `ctx.drawImage(qrCanvas, innerX, innerY, innerSide, innerSide)`
   - `ctx.restore()`

   Isso elimina o race condition do clone e garante que o QR fique sempre na posição/tamanho corretos, qualquer que seja o layout. O `html2canvas` continua capturando o SVG original normalmente — o overlay por cima apenas garante nitidez e presença do QR mesmo se o `html2canvas` falhar em rasterizar o SVG.

2. **Em `handleExport` (linha 482) e `handleShare` (linha 514)** — aumentar o delay de estabilização de layout de `500ms` para `1000ms`, dando tempo ao React/flexbox de assentar após troca de layout antes da medição.

### Detalhes técnicos
- Nenhuma nova variável precisa ser declarada — `x, y, w, h, innerX, innerY, innerSide, qrRadius, colors.qrBg, qrCanvas, SCALE` já estão no escopo (calculados nas linhas 374–415).
- O bloco `cloneRect` e o recálculo de `cInnerW/H/X/Y/Side` (linhas 420, 461–469) são removidos — passam a ser desnecessários.
- O `onclone` é totalmente removido da config do `html2canvas`.
- Comportamento do preview não muda (não toca em JSX).

### Resultado esperado
QR Code presente, nítido e na posição correta no PNG exportado em **todos os layouts** (Clássico, Central, Lado a Lado) e alinhamentos.

