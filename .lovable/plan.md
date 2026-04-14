

## Plano: Trocar filtro do hero de dourado para cinza

### Problema
O overlay do hero usa `from-primary/85 via-primary/65 to-primary/50`, que agora é dourado. O usuário quer um tom de cinza para dar contraste.

### Alteração — 1 arquivo

**`src/components/landing/HeroSection.tsx`** (linha 16):

Trocar:
```
from-primary/85 via-primary/65 to-primary/50
```
Por:
```
from-gray-900/85 via-gray-800/65 to-gray-700/50
```

Isso aplica um overlay cinza escuro sobre a imagem de fundo, mantendo o texto legível e dando contraste elegante. O restante (textos, botões, cards flutuantes) permanece inalterado.

### O que NÃO muda
- Nenhuma função, integração ou lógica
- Apenas 1 classe CSS em 1 linha

