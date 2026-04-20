
## Plano: corrigir QR ausente no PNG customizado

### Causa provável
O QR do banner é renderizado como `<img src="data:image/svg+xml;base64,...">`, mas o export atual em `src/pages/BannerCreator.tsx` espera só `80ms` antes de chamar `html2canvas`.  
Quando o usuário altera layout, cores, logo ou fundo e baixa logo em seguida, o card re-renderiza e algumas imagens ainda não terminaram de carregar/decodificar no DOM — principalmente o QR. No preview ele aparece, mas no snapshot pode sair em branco.

### Correção em `src/pages/BannerCreator.tsx`
1. Criar um helper local para aguardar todos os assets visuais do banner antes do export:
   - varrer `cardRef.current.querySelectorAll("img")`
   - aguardar `load` de imagens ainda não concluídas
   - chamar `img.decode()` quando disponível
   - aguardar 1 `requestAnimationFrame` extra após a estabilização visual

2. Aplicar esse helper em ambos:
   - `handleExport`
   - `handleShare`

3. Manter o `QRBlock` como `<img>` com data URL, mas reforçar a estabilidade:
   - preservar o `xmlns` já injetado no SVG
   - manter dependências corretas do `useMemo`
   - adicionar atributos leves no `<img>` do QR (`decoding="sync"` e/ou estilo estável) para reduzir risco de snapshot prematuro

### Verificação da customização do banner
Na mesma revisão, conferir no código do `BannerCreator` se o fluxo de personalização continua consistente após a correção:
1. QR continua atualizando quando muda o link/cor
2. logo personalizada mantém proporção
3. faixa de seguradoras continua sem esticar
4. fundo customizado + overlay não cobre o conteúdo
5. export usa o mesmo estado visual exibido no preview

### Validação após implementar
Testar no preview, no mínimo, estes cenários:
1. banner padrão
2. banner com layout centralizado
3. banner com logo personalizada
4. banner com fundo personalizado
5. banner com seguradoras ativadas/desativadas
6. download PNG logo após alterar personalizações, confirmando que o QR permanece visível

### Arquivo a alterar
- `src/pages/BannerCreator.tsx`
