
## Correção definitiva do QR no PNG do Banner Creator

### O que realmente está acontecendo
O componente atual usa `QRCodeCanvas` em `src/pages/BannerCreator.tsx`, então o QR não é um `<img>` SVG: ele é um `<canvas>` interno renderizado pela biblioteca.

O preview funciona porque o navegador pinta esse canvas na tela normalmente. O problema acontece na exportação: o `html2canvas` faz um snapshot do DOM e pode copiar o canvas do QR antes de ele estar confiavelmente disponível no clone/capture, resultando exatamente no sintoma que você está vendo: o bloco branco aparece, mas o miolo do QR sai vazio.

As correções aplicadas até agora (`img.decode()` e `setTimeout(500)`) ajudam imagens comuns, mas não resolvem de forma determinística um QR que nasce como canvas. Ou seja: o problema não é “falta de espera de imagem”, e sim “captura não confiável de um canvas filho”.

### Arquivo a alterar
```text
src/pages/BannerCreator.tsx
```

### Correção proposta
#### 1. Manter `waitForCardAssets` apenas para imagens reais
Continuar usando essa função para:
- logo personalizada
- imagem de fundo
- logos das seguradoras

Ela continua útil, mas não será mais a solução principal do QR.

#### 2. Adicionar uma espera específica para o canvas do QR
Criar uma função dedicada para:
- localizar o `<canvas>` dentro de `qrWrapperRef`
- aguardar largura/altura válidas
- aguardar ciclos de `requestAnimationFrame`
- confirmar que o canvas já foi realmente pintado

Objetivo: sincronizar com o ativo real que está falhando, não com `<img>` genéricas.

#### 3. Tornar a exportação definitiva com composição manual do QR
Depois do `html2canvas(cardRef.current)`, redesenhar o QR original por cima do PNG final usando o canvas real do `QRCodeCanvas`.

Fluxo:
1. capturar o banner inteiro com `html2canvas`
2. medir a posição do QR dentro do card com `getBoundingClientRect`
3. converter essa posição para a escala do canvas exportado
4. usar `drawImage` para desenhar o canvas do QR na posição correta

Isso evita depender de o `html2canvas` clonar corretamente o canvas interno do QR. O banner continua sendo exportado pelo mesmo mecanismo, mas o QR passa a ser garantido no resultado final.

#### 4. Aplicar a mesma pipeline em `handleExport` e `handleShare`
Hoje o fluxo de exportação e compartilhamento não está totalmente alinhado. A correção precisa ser centralizada para os dois casos, para não existir:
- PNG baixado com um comportamento
- compartilhamento com outro comportamento

A melhor abordagem é extrair uma função única de geração do canvas final já com o QR recomposto.

### Estrutura da solução
```text
waitForCardAssets(node)          -> espera logos/fundos/imagens
waitForQrCanvas()                -> espera o QR canvas real estar pronto
captureBannerCanvas()            -> faz html2canvas(cardRef)
composeQrOnCapturedCanvas()      -> desenha o QR original no snapshot final
handleExport()                   -> usa o canvas final
handleShare()                    -> usa o mesmo canvas final
```

### O que não será alterado
- layout dos 3 templates
- textos
- estilos
- paletas
- lógica de templates salvos
- comportamento do preview
- biblioteca `html2canvas`
- biblioteca `qrcode.react`

### Por que essa é a correção definitiva
Porque ela para de depender de timing frágil (`decode`, timeout, sorte do clone) e passa a usar diretamente a fonte real do QR no resultado final. Mesmo que o `html2canvas` falhe ao clonar o canvas interno, o QR será desenhado explicitamente no PNG exportado.

### Validação após implementar
Testar obrigatoriamente:
1. layout Clássico
2. layout Central
3. layout Lado a Lado
4. com logo personalizada
5. com fundo personalizado
6. exportação PNG
7. compartilhamento
8. leitura do QR por scanner real

Resultado esperado:
- preview continua igual
- PNG exportado mantém o QR visível
- QR permanece escaneável
- nenhuma outra parte do banner é afetada
