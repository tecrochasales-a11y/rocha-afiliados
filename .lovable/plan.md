
Corrigir definitivamente em `src/pages/BannerCreator.tsx` sem mexer no layout do banner.

### O que realmente está acontecendo
O QR do export ainda falha porque a correção atual depende de um fluxo que continua frágil:

1. `generateExportQrImage` usa `createRoot(...).render(...)` num host offscreen
2. no React 18 esse render não é garantidamente síncrono
3. o código tenta serializar o `<svg>` antes de ele existir de forma confiável
4. quando isso falha, o `.catch(() => null)` silencia o erro
5. o `html2canvas` então exporta só o bloco branco que já veio do preview

Ou seja: o problema agora não é mais o layout, nem o tempo do `QRCodeCanvas` visível. O problema é que a geração “independente” do QR para export ainda não é determinística.

### Correção que vou aplicar
#### 1. Trocar a geração do QR de export por uma versão síncrona e determinística
Substituir a lógica atual de `generateExportQrImage` por uma geração de SVG sem depender de `createRoot` assíncrono.

Implementação prevista:
- gerar o markup do QR em SVG de forma síncrona
- converter esse SVG em `data:image/svg+xml`
- carregar em `Image`
- aguardar `img.decode()` antes de desenhar

Objetivo: o QR do export precisa nascer pronto, não “talvez pronto”.

#### 2. Parar de depender do QR capturado pelo `html2canvas`
No `captureBannerCanvas`:
- instruir o `html2canvas` a ignorar o bloco do QR no snapshot
- depois desenhar manualmente:
  - o fundo branco do bloco
  - o QR gerado de forma determinística

Assim o PNG final nunca mais dependerá do QR que está pintado no preview.

#### 3. Medir a caixa correta do QR em todos os layouts
Hoje a lógica usa o `canvas/svg` interno para medir posição. Vou trocar para uma medição estável do wrapper real do QR:

- medir `qrWrapperRef.current`
- ler padding/radius do wrapper
- calcular a área interna útil do QR
- usar essa mesma caixa para:
  - clássico
  - central
  - lado a lado

Isso elimina diferença de posicionamento entre layouts.

#### 4. Falhar com segurança em vez de exportar PNG quebrado
Se a geração do QR falhar:
- não baixar imagem defeituosa
- mostrar toast de erro
- registrar erro no console

Não vou mais deixar `generateExportQrImage(...).catch(() => null)` mascarar o problema.

#### 5. Manter o restante intacto
Não alterar:
- layouts
- estilos
- tipografia
- cores
- textos
- lógica de templates
- preview geral
- fluxo de compartilhamento

A correção ficará concentrada no pipeline de exportação/compartilhamento do QR.

### Estrutura final da solução
```text
waitForCardAssets(node)
buildQrSvgDataUrl(...)
loadQrImage(...)
captureBannerCanvas()
  -> html2canvas ignorando o QR do preview
  -> mede wrapper do QR
  -> pinta fundo branco do QR
  -> desenha QR definitivo por cima
handleExport()
handleShare()
```

### Resultado esperado
Após a implementação:
- o QR aparece no PNG baixado em todos os layouts
- o QR continua escaneável
- trocar layout imediatamente antes do download não quebra o export
- o app não depende mais de timing frágil do preview

### Validação após aplicar
Testar em `BannerCreator`:
1. layout Clássico
2. layout Central
3. layout Lado a Lado
4. troca rápida entre layouts e download imediato
5. com logo personalizada
6. com fundo personalizado
7. download PNG
8. compartilhamento

Critério de aceite:
- nenhum download pode sair com quadrado branco vazio no lugar do QR
- o QR final precisa bater visualmente com o preview esperado
