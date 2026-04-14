

## Plano: Corrigir cor primária do modo escuro de laranja para dourado

### Problema
No modo escuro, a variável `--primary` está definida como `24 100% 50%` (laranja). Deveria ser o mesmo dourado da marca (`40 52% 54%`), igual ao modo claro.

### Alteração — `src/index.css` (linha 72)

```css
/* Antes */
--primary: 24 100% 50%;

/* Depois */
--primary: 40 52% 54%;
```

Apenas uma linha. Todos os elementos que usam `text-primary`, `bg-primary`, `border-primary` etc. no modo escuro passarão de laranja para dourado automaticamente.

