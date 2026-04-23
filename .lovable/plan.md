
Objetivo: corrigir o problema do QR Code que aparece no preview, mas sai em branco no arquivo baixado do banner.

1. Trocar a fonte do QR do export
- Remover a dependência do canvas visível do preview como fonte do QR do download.
- Hoje o export ainda “congela” o QR a partir do DOM visível (`waitForQrCanvasReady` + `toDataURL`), que é a parte mais frágil do fluxo.
- Vou gerar o bitmap do QR especificamente para o download, a partir do `referralLink`, sem depender do preview já renderizado na tela.

2. Unificar preview e export com uma fonte determinística
- Substituir o QR do `BannerCreator` para usar um SVG como fonte estável.
- No download, serializar esse SVG para imagem e desenhá-lo no canvas final.
- Isso evita o cenário em que o preview está correto, mas o bitmap capturado para o PNG sai vazio.

3. Corrigir o pipeline atual do export
- Revisar `renderExportQrCanvas`, porque hoje ele cria um canvas intermediário, desenha o QR nele, mas retorna o `frozenImage` em vez do canvas normalizado.
- Ajustar para que o export use sempre o bitmap final preparado pelo próprio pipeline de exportação, não uma imagem intermediária do preview.
- Manter o overlay manual do QR por cima do `html2canvas`, já que as coordenadas registradas nos logs mostram que a posição está correta.

4. Isolar totalmente o QR do html2canvas
- Marcar o QR visual do card para ser ignorado pelo `html2canvas`.
- Capturar o banner sem o QR e, em seguida, desenhar o QR exportável por cima.
- Assim o resultado final não depende da capacidade do `html2canvas` de rasterizar o QR corretamente.

5. Adicionar verificação real antes de salvar
- Depois de desenhar o QR no canvas final, validar pixels da área do QR para confirmar que existem módulos escuros.
- Se a área ainda estiver branca, disparar retry e falhar com erro explícito em vez de baixar um PNG quebrado.
- Isso evita “download com sucesso” quando o QR saiu vazio.

6. Manter o restante do banner intacto
- Preservar o layout atual, logo personalizada, marca Rocha e faixa de seguradoras.
- Não mexer no preview visual além do necessário para estabilizar a fonte do QR.

Arquivos envolvidos
- `src/pages/BannerCreator.tsx`
- possível reaproveitamento do padrão já usado em `src/components/QRCodeGenerator.tsx` para serialização de SVG

Resultado esperado
- O QR continuará aparecendo normalmente no preview.
- No PNG baixado, o QR passará a sair preenchido e legível também nos layouts Central e Lado a Lado, sem depender do estado visual do preview.

Detalhes técnicos
- Evidência atual: os logs mostram que as coordenadas do overlay estão corretas (`x`, `y`, `innerX`, `innerY`, `innerSide`), então o defeito não está no posicionamento.
- O problema restante está na origem do bitmap usado no download.
- A correção será tornar o QR do export independente do canvas renderizado na UI e validar o resultado final antes de concluir o download.
