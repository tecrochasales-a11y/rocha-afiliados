
Corrigir em `src/pages/BannerCreator.tsx` com uma abordagem determinística para o QR no export.

1. Diagnóstico real
- O problema não é mais apenas “espera insuficiente”.
- Hoje o export ainda depende do QR visível do preview, que é um `<canvas>` interno do `QRCodeCanvas`.
- Ao trocar de layout, esse canvas pode já existir com tamanho válido, mas ainda estar com o bitmap em branco por um instante.
- A lógica atual então redesenha no PNG exatamente esse canvas ainda vazio, por isso o bloco branco aparece sem o QR em alguns layouts.

2. Correção definitiva
- Manter o preview do banner como está visualmente.
- Parar de depender do canvas visível do preview como fonte do export.
- Gerar uma fonte de QR exclusiva para export, baseada em SVG/Imagem estável, usando a mesma biblioteca já presente no projeto.
- No fluxo de exportação:
  - capturar o banner com `html2canvas`
  - localizar a área do QR pelo wrapper do QR, não pelo canvas interno
  - gerar um QR limpo e pronto para desenho
  - desenhar esse QR manualmente no canvas final, na posição e tamanho corretos para cada layout

3. Ajustes de implementação
- Substituir a lógica atual baseada em `waitForQrCanvas` + cópia do canvas visível por um helper único, por exemplo:
  - `generateExportQrImage(size)`
  - `captureBannerCanvas()`
  - `drawQrIntoExportedCanvas(...)`
- Marcar o wrapper do QR com um alvo estável (`ref` ou `data-*`) para medir sempre a caixa correta em:
  - Clássico
  - Central
  - Lado a Lado
- Manter `waitForCardAssets` apenas para imagens reais do banner:
  - logo personalizada
  - fundo personalizado
  - logos das operadoras
- Remover a dependência do `waitBeforeCapture` e da verificação do canvas do preview para o QR, porque isso continua sendo frágil após mudança de layout.
- Garantir remount estável do bloco do QR ao trocar layout/tamanho/link, para evitar estado visual residual no preview.

4. O que não será alterado
- layouts
- estilos
- textos
- paleta visual
- lógica de templates
- fluxo de compartilhamento
- restante do app

5. Validação obrigatória
Testar exportando logo após trocar de layout, sem esperar manualmente:
1. Clássico
2. Central
3. Lado a Lado
4. com logo personalizada
5. com fundo personalizado
6. exportação PNG
7. compartilhamento
8. leitura real do QR

Resultado esperado:
- o QR aparece em todos os layouts
- continua escaneável
- o preview continua com a mesma aparência
- o export deixa de depender do timing do canvas renderizado na tela
