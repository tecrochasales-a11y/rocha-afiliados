

## Plano: Remover fundo preto da logo

### Problema
O arquivo `rocha-sales-logo.png` tem fundo preto na própria imagem (não é PNG transparente). O header exibe a imagem como está, mostrando o quadrado preto.

### Solução
Aplicar `mix-blend-mode: screen` na tag `<img>` da logo no `Header.tsx`. Esse modo de blend faz com que pixels pretos fiquem invisíveis, efetivamente removendo o fundo preto e mantendo os elementos claros (dourado/branco) da logo.

### Alteração — 1 arquivo

**`src/components/layout/Header.tsx`**: Adicionar a classe `mix-blend-screen` (Tailwind) na `<img>` da logo (aprox. linha 88).

Alternativa melhor: se você tiver uma versão da logo com fundo **transparente**, envie-a e substituímos o arquivo — resultado mais limpo.

### O que NÃO muda
- Nenhuma lógica, integração ou layout

