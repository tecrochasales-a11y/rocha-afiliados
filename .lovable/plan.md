
## Plano: Substituir logo Bradesco pela imagem enviada

Trocar o asset atual `src/assets/insurers/bradesco.svg` pela nova imagem PNG oficial enviada pelo usuário (símbolo + wordmark "bradesco" em vermelho, fundo transparente).

### Passos
1. Copiar `user-uploads://image-107.png` para `src/assets/insurers/bradesco.png`
2. Em `src/pages/BannerCreator.tsx`: alterar o import de `bradesco.svg` para `bradesco.png`
3. Deletar `src/assets/insurers/bradesco.svg` antigo

### Observação sobre layout
A nova logo Bradesco é vertical (símbolo em cima, texto embaixo) — diferente das outras 3 que são horizontais. No rodapé com altura fixa de 56px e `maxWidth: 22%`, ela aparecerá menor proporcionalmente. Mantenho o layout atual; se ficar desbalanceada visualmente, ajusto depois conforme feedback.

### Arquivos
- **Novo**: `src/assets/insurers/bradesco.png`
- **Editado**: `src/pages/BannerCreator.tsx` (1 linha de import)
- **Deletado**: `src/assets/insurers/bradesco.svg`
