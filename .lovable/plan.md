

## Plano: Ajustar imagem de fundo para mostrar melhor as pessoas

### Problema
A imagem está com `object-cover object-top`, o que estica e corta as pessoas. Precisa centralizar melhor o enquadramento.

### Alteração — `src/components/landing/HeroSection.tsx` (linha 13)

Trocar `object-top` por `object-center` para centralizar o enquadramento nas pessoas, em vez de priorizar o topo da imagem.

```
/* Antes */
className="absolute inset-0 w-full h-full object-cover object-top"

/* Depois */
className="absolute inset-0 w-full h-full object-cover object-center"
```

Isso mantém o `object-cover` (sem distorção), mas centraliza o foco da imagem nas pessoas.

