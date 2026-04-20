
## Plano: corrigir QR ausente na exportação customizada

### Resposta direta
Não: trocar PNG por JPEG não resolve a causa do bug.

O problema não está no formato final baixado. O QR some antes disso, no momento em que o banner é capturado pelo `html2canvas`. Se o QR já entra em branco no canvas de exportação, salvar como PNG ou JPEG só muda a compressão da imagem final — não recupera o QR.

### O que o código atual já faz
Em `src/pages/BannerCreator.tsx`, o banner já:
- renderiza o QR como `<img src="data:image/svg+xml;base64,...">`
- espera fontes e imagens carregarem com `waitForCardAssets`
- exporta com `html2canvas`

Mesmo assim, o print enviado mostra que o bloco branco do QR está sendo capturado sem o conteúdo interno. Isso indica que a falha continua no processo de rasterização do QR dentro do snapshot do banner.

### Correção recomendada
Aplicar uma abordagem mais robusta no export: não depender do `html2canvas` para “fotografar” o QR.

#### Mudança em `src/pages/BannerCreator.tsx`
1. Manter o QR normal no preview, para continuar visualmente igual ao original.
2. No fluxo de exportação (`handleExport` e `handleShare`):
   - gerar o banner base com `html2canvas`
   - identificar a posição do QR dentro do card
   - desenhar o QR manualmente por cima do canvas final com `CanvasRenderingContext2D.drawImage`
3. Usar a mesma imagem do QR já gerada em `QRBlock`, mas reutilizada de forma explícita no export.

### Como implementar
#### 1) Criar uma referência dedicada para o QR
Adicionar um `qrWrapperRef` no bloco do QR para medir:
- posição (`left`, `top`)
- largura
- altura

Isso permite calcular exatamente onde o QR deve ser redesenhado no canvas exportado.

#### 2) Centralizar a geração da imagem do QR
Extrair a geração do `dataUrl` do QR para um helper reutilizável, algo como:
- `buildQrDataUrl({ value, size, bgColor, fgColor })`

Esse helper será usado:
- no preview
- no export

Assim o QR exportado será exatamente igual ao QR exibido.

#### 3) Desenhar o QR manualmente após o `html2canvas`
Depois que `html2canvas(cardRef.current)` retornar o canvas:
- criar um `Image()`
- carregar o `dataUrl` do QR
- desenhar no canvas final usando as coordenadas medidas do QR
- só então gerar o download PNG / share blob

Isso elimina a dependência do `html2canvas` para renderizar o conteúdo interno do QR.

### Verificação da customização do banner
Na mesma revisão, conferir em `BannerCreator.tsx` os pontos abaixo para garantir consistência visual:
1. `LogoBlock` continua respeitando proporção com logo personalizada
2. `InsurerStrip` mantém logos sem esticar em preview e export
3. `bgImageData` + overlay continuam atrás do conteúdo
4. `textAlign` segue refletindo corretamente nos layouts clássico, central e horizontal
5. `useCustomTextColors` continua aplicando cores em badge, título, subtítulo e rótulo do rodapé
6. o QR continua atualizando ao mudar link, layout e cores

### Validação após implementar
Testar no preview e exportar nestes cenários:
1. banner padrão
2. banner centralizado
3. banner com logo personalizada
4. banner com fundo personalizado
5. banner com seguradoras ativadas
6. banner com algumas seguradoras removidas
7. exportar imediatamente após alterar personalizações
8. confirmar que o QR exportado aparece e pode ser escaneado

### Arquivo a alterar
- `src/pages/BannerCreator.tsx`

### Detalhe técnico
Se necessário, a exportação pode seguir este fluxo:

```text
preview DOM
   -> html2canvas gera canvas base
   -> medir área do QR no DOM
   -> carregar dataUrl do QR
   -> drawImage do QR no canvas final
   -> exportar PNG/JPEG
```

Isso resolve pela origem do problema. JPEG pode até ser oferecido como opção futura, mas não é a correção do bug atual.
